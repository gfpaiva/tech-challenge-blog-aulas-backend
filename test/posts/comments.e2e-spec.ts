import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDatabaseHelper } from '../utils/test-database.helper';
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
    TestDatabaseHelper.init();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    db = moduleFixture.get(DRIZZLE);
    await app.init();
  });

  afterAll(async () => {
    await TestDatabaseHelper.close();
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
    const { user } =
      await TestDatabaseHelper.createAuthenticatedUser('PROFESSOR');
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
        await TestDatabaseHelper.createAuthenticatedUser('ALUNO');

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

    it('GET - should list comments for a post', async () => {
      // Add a comment first
      const { user } =
        await TestDatabaseHelper.createAuthenticatedUser('ALUNO');
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
  });
});
