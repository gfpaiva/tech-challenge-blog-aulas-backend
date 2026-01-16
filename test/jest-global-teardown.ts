import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRedisContainer } from '@testcontainers/redis';
import * as fs from 'fs';
import * as path from 'path';

export default async () => {
  const postgresContainer = (global as unknown as Record<string, any>)
    .__POSTGRES_CONTAINER__ as StartedPostgreSqlContainer;
  const redisContainer = (global as unknown as Record<string, any>)
    .__REDIS_CONTAINER__ as StartedRedisContainer;

  if (postgresContainer) {
    await postgresContainer.stop();
  }

  if (redisContainer) {
    await redisContainer.stop();
  }

  // clean up env file
  const envPath = path.join(__dirname, '.e2e-env.json');
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
};
