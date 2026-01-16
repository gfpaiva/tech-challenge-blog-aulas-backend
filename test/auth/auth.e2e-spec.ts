import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestAuthHelper } from '../utils/test-auth.helper';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import * as schema from '@infra/database/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DomainExceptionFilter } from '@common/filters/domain-exception.filter';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let db: PostgresJsDatabase<typeof schema>;

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return 200 and access token with valid credentials', async () => {
      const password = 'securePassword123';
      const { user } = await TestAuthHelper.createAuthenticatedUser(
        db,
        'ALUNO',
        password,
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: password,
        })
        .expect(200);

      const body = response.body as { access_token: string };
      expect(body).toHaveProperty('access_token');
      expect(typeof body.access_token).toBe('string');
    });

    it('should return 401 with invalid credentials', async () => {
      // Create user so it exists
      const { user } = await TestAuthHelper.createAuthenticatedUser(
        db,
        'ALUNO',
        'password123',
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'WRONG_PASSWORD',
        })
        .expect(401);
    });
  });
});
