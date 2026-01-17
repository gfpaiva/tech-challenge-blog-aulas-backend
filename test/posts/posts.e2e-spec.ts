import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestAuthHelper } from '../utils/test-auth.helper';
import { DatabaseCleaner } from '../utils/database-cleaner';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import * as schema from '@infra/database/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';

describe('PostsModule (e2e)', () => {
  let app: INestApplication;
  let db: PostgresJsDatabase<typeof schema>;
  let categoryId: number;

  beforeAll(async () => {
    TestAuthHelper.init();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    db = moduleFixture.get(DRIZZLE);
    DatabaseCleaner.setDb(db);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Seed Category
    const [category] = await db
      .insert(schema.categories)
      .values({
        name: 'Test Category',
        description: 'Category for e2e tests',
      })
      .returning();
    categoryId = category.id;
  });

  describe('/posts', () => {
    it('POST /posts - should create a new post (Authenticated)', async () => {
      const { authorizationHeader, user } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');

      const createDto = {
        title: 'New E2E Post',
        content: 'Content of E2E post',
        categoryId: categoryId,
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set(authorizationHeader)
        .send(createDto)
        .expect(201);

      const body = response.body as {
        id: string;
        title: string;
        author: { id: string };
      };
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(createDto.title);
      expect(body.author).toBeDefined();
      expect(body.author.id).toBe(user.id);

      // Verify persistence
      const [persisted] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, (response.body as { id: string }).id));

      expect(persisted).toBeDefined();
      expect(persisted.title).toBe(createDto.title);
    });

    it('POST /posts - should return 400 if validation fails', async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');

      const invalidDto = {
        title: '', // Empty title
        content: 'Content of E2E post',
        categoryId: categoryId,
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set(authorizationHeader)
        .send(invalidDto)
        .expect(400);

      expect(
        (response.body as { message: string | string[] }).message,
      ).toContain('title should not be empty');
    });

    it('POST /posts - should return 401 if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({ title: 'Title', content: '...', categoryId })
        .expect(401);
    });

    it('POST /posts - should return 403 if user is not a professor', async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'ALUNO');

      await request(app.getHttpServer())
        .post('/posts')
        .set(authorizationHeader)
        .send({
          title: 'Forbidden Post',
          content: 'Should not work',
          categoryId: categoryId,
        })
        .expect(403);
    });

    it('GET /posts - should return paginated posts', async () => {
      // Create a few posts
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');

      await request(app.getHttpServer())
        .post('/posts')
        .set(authorizationHeader)
        .send({ title: 'Post 1', content: '...', categoryId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/posts')
        .query({ page: 1, limit: 10 })
        .expect(200);

      const body = response.body as { data: any[]; meta: { total: number } };
      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /posts - should return 400 if pagination is invalid', async () => {
      await request(app.getHttpServer())
        .get('/posts')
        .query({ page: 0 })
        .expect(400);
    });
  });

  describe('/posts/:id', () => {
    let postId: string;
    let authHeader: Record<string, string>;

    beforeEach(async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');
      authHeader = authorizationHeader;

      const res = await request(app.getHttpServer())
        .post('/posts')
        .set(authHeader)
        .send({ title: 'Post to Update', content: 'Original', categoryId })
        .expect(201);
      postId = (res.body as { id: string }).id;
    });

    it('GET /posts/:id - should return post details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200);

      const body = res.body as { id: string; title: string };
      expect(body.id).toBe(postId);
      expect(body.title).toBe('Post to Update');
    });

    it('GET /posts/:id - should return 404 for non-existent post', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/posts/${fakeId}`).expect(404);
    });

    it('GET /posts/:id - should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).get('/posts/not-a-uuid').expect(400);
    });

    it('PUT /posts/:id - should update post', async () => {
      const updateDto = { title: 'Updated Title', content: 'Updated Content' };

      const res = await request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set(authHeader)
        .send(updateDto)
        .expect(200);

      expect((res.body as { title: string }).title).toBe(updateDto.title);

      // Verify DB
      const [persisted] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.id, postId));
      expect(persisted.title).toBe(updateDto.title);
    });

    it('PUT /posts/:id - should return 404 when updating non-existent post', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .put(`/posts/${fakeId}`)
        .set(authHeader)
        .send({ title: 'New Title' })
        .expect(404);
    });

    it('PUT /posts/:id - should return 401 if unauthenticated', async () => {
      await request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .send({ title: 'New Title' })
        .expect(401);
    });

    it('PUT /posts/:id - should return 403 if user is not the owner', async () => {
      // Create another professor user
      const { authorizationHeader: otherUserHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');

      await request(app.getHttpServer())
        .put(`/posts/${postId}`)
        .set(otherUserHeader)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });

    it('DELETE /posts/:id - should delete post', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set(authHeader)
        .expect(204);

      // Verify Gone
      await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
    });

    it('DELETE /posts/:id - should return 404 when deleting non-existent post', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/posts/${fakeId}`)
        .set(authHeader)
        .expect(404);
    });

    it('DELETE /posts/:id - should return 401 if unauthenticated', async () => {
      await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(401);
    });

    it('DELETE /posts/:id - should return 403 if user is not the owner', async () => {
      // Create another professor user
      const { authorizationHeader: otherUserHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');

      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set(otherUserHeader)
        .expect(403);
    });
  });

  describe('GET /posts/search', () => {
    it('should search posts by title', async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'PROFESSOR');
      await request(app.getHttpServer())
        .post('/posts')
        .set(authorizationHeader)
        .send({ title: 'UniqueSearchTerm', content: '...', categoryId });

      const res = await request(app.getHttpServer())
        .get('/posts/search')
        .query({ q: 'UniqueSearchTerm' })
        .expect(200);

      // API returns an object or array? Controller says plain array or object with data?
      // Controller: returns PostResponseDto fromDomain(posts, length, 1, 50).
      // PostResponseDto usually has { data: [], total, ... }

      const body = res.body as { data: { title: string }[] };
      expect(body.data).toBeInstanceOf(Array);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].title).toBe('UniqueSearchTerm');
    });

    it('should return 400 if search term is too short', async () => {
      await request(app.getHttpServer())
        .get('/posts/search')
        .query({ q: 'ab' })
        .expect(400);
    });
  });
});
