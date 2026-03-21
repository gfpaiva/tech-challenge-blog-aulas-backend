import { Module, Global } from '@nestjs/common';
import { ICachePort } from '@common/ports/cache.port';
// RedisCacheAdapter is kept in the project but not wired — swap useClass below to re-enable Redis
import { InMemoryCacheAdapter } from './in-memory-cache.adapter';

// NOTE: Redis client (CACHE_CLIENT) is intentionally disabled while InMemoryCacheAdapter is active.
// To re-enable Redis:
//   1. Import ConfigService, Redis, and CACHE_CLIENT
//   2. Add the CACHE_CLIENT provider back to the providers/exports arrays
//   3. Swap useClass to RedisCacheAdapter

@Global()
@Module({
  providers: [
    {
      provide: ICachePort,
      useClass: InMemoryCacheAdapter,
    },
  ],
  exports: [ICachePort],
})
export class CacheModule {}
