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
    try {
      await postgresContainer.stop();
    } catch (error) {
      console.error('Error while stopping PostgreSQL test container during global teardown:', error);
    }
  }

  if (redisContainer) {
    try {
      await redisContainer.stop();
    } catch (error) {
      console.error('Error while stopping Redis test container during global teardown:', error);
    }
  }

  // clean up env file
  const envPath = path.join(__dirname, '.e2e-env.json');
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
};
