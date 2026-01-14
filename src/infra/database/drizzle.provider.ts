import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE_CONNECTION';

export const drizzleProvider: FactoryProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL')!;
    const client = postgres(databaseUrl);
    return drizzle(client, {
      schema,
      logger: process.env.NODE_ENV !== 'production',
    });
  },
};
