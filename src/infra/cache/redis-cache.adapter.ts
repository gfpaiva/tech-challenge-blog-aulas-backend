import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ICachePort } from '@common/ports/cache.port';
import { CACHE_CLIENT } from './cache.constants';

@Injectable()
export class RedisCacheAdapter implements ICachePort {
  constructor(@Inject(CACHE_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
