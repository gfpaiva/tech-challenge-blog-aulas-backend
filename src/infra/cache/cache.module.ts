import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICachePort } from '@common/ports/cache.port';
// RedisCacheAdapter is kept in the project but not wired — swap useClass below to re-enable Redis
import { InMemoryCacheAdapter } from './in-memory-cache.adapter';
import { CACHE_CLIENT } from './cache.constants';

@Global()
@Module({
  providers: [
    {
      provide: CACHE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          ...(process.env.NODE_ENV === 'production'
            ? {
                password: config.get('REDIS_PASSWORD'),
                tls: {
                  servername: config.get('REDIS_HOST'),
                },
              }
            : {}),
        });
      },
    },
    {
      provide: ICachePort,
      useClass: InMemoryCacheAdapter,
    },
  ],
  exports: [CACHE_CLIENT, ICachePort],
})
export class CacheModule {}
