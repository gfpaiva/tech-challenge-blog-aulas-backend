import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export default async () => {
  const postgresContainer = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  const redisContainer = await new RedisContainer('redis:7-alpine').start();

  const dbHost = postgresContainer.getHost();
  const dbPort = postgresContainer.getPort();
  const databaseUrl = `postgresql://test_user:test_password@${dbHost}:${dbPort}/test_db`;

  const redisHost = redisContainer.getHost();
  const redisPort = redisContainer.getPort();

  // Expose to global for teardown
  (global as unknown as Record<string, any>).__POSTGRES_CONTAINER__ =
    postgresContainer;
  (global as unknown as Record<string, any>).__REDIS_CONTAINER__ =
    redisContainer;

  // Set env vars for migration
  process.env.DATABASE_URL = databaseUrl;
  process.env.REDIS_HOST = redisHost;
  process.env.REDIS_PORT = redisPort.toString();

  console.log('🔹 Running Migrations...');
  try {
    execSync('pnpm db:migrate', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    });
    console.log('✅ Migrations applied.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }

  // Write env vars to a temp file for setup.ts to read
  const envConfig = {
    DATABASE_URL: databaseUrl,
    REDIS_HOST: redisHost,
    REDIS_PORT: redisPort,
    JWT_SECRET: 'test-secret', // Hardcoded for tests
    JWT_EXPIRATION: '1d',
  };

  fs.writeFileSync(
    path.join(__dirname, '.e2e-env.json'),
    JSON.stringify(envConfig, null, 2),
  );
};
