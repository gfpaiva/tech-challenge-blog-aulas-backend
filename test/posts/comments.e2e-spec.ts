import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestAuthHelper } from '../utils/test-auth.helper';
import { DatabaseCleaner } from '../utils/database-cleaner';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import * as schema from '@infra/database/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DomainExceptionFilter } from '../../src/common/filters/domain-exception.filter';

describe('CommentsModule (e2e)', () => {
  let app: INestApplication;
  let db: PostgresJsDatabase<typeof schema>;
  let categoryId: number;
  let postId: string;

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
      .values({ name: 'Comment Test Cat', description: '...' })
      .returning();
    categoryId = category.id;

    // Create a fresh post for each test to avoid comment clutter
    const { user } = await TestAuthHelper.createAuthenticatedUser(
      db,
      'PROFESSOR',
    );
    const [post] = await db
      .insert(schema.posts)
      .values({
        title: 'Post for Comments',
        content: 'Content',
        categoryId: categoryId,
        authorId: user.id,
      })
      .returning();
    postId = post.id;
  });

  describe('/posts/:id/comments', () => {
    it('POST - should add a comment to a post', async () => {
      const { authorizationHeader, user } =
        await TestAuthHelper.createAuthenticatedUser(db, 'ALUNO');

      const commentDto = { content: 'This is a comment' };

      const res = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set(authorizationHeader)
        .send(commentDto)
        .expect(201);

      const body = res.body as {
        id: string;
        content: string;
        author: { id: string };
      };
      expect(body).toHaveProperty('id');
      expect(body.content).toBe(commentDto.content);
      expect(body.author.id).toBe(user.id);
    });

    it('POST - should return 400 if validation fails', async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'ALUNO');

      const invalidDto = { content: '' };

      const res = await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set(authorizationHeader)
        .send(invalidDto)
        .expect(400);

      expect((res.body as { message: string | string[] }).message).toContain(
        'content should not be empty',
      );
    });

    it('POST - should return 404 if post does not exist', async () => {
      const { authorizationHeader } =
        await TestAuthHelper.createAuthenticatedUser(db, 'ALUNO');
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .post(`/posts/${fakeId}/comments`)
        .set(authorizationHeader)
        .send({ content: 'Nice post!' })
        .expect(404);
    });

    it('POST - should return 401 if unauthenticated', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({ content: 'Nice post!' })
        .expect(401);
    });

    it('GET - should list comments for a post', async () => {
      // Add a comment first
      const { user } = await TestAuthHelper.createAuthenticatedUser(
        db,
        'ALUNO',
      );
      await db.insert(schema.comments).values({
        content: 'Existing Comment',
        postId: postId,
        authorId: user.id,
      });

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      const body = res.body as { content: string }[];
      expect(body).toBeInstanceOf(Array);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0].content).toBe('Existing Comment');
    });

    it('GET - should return 404 if post does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/posts/${fakeId}/comments`)
        .expect(404);
    });
  });
});
