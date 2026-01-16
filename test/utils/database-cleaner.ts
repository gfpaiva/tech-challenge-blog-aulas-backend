import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@infra/database/schema';

export class DatabaseCleaner {
  private static db: PostgresJsDatabase<typeof schema> | undefined;

  static setDb(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  static async clean() {
    if (!this.db) {
      return;
    }

    try {
      const result = await this.db.execute(sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename != '_migrations'
          AND tablename != '__drizzle_migrations';
      `);

      if (result.length > 0) {
        const tables = (result as unknown as { tablename: string }[])
          .map((row) => `"${row.tablename}"`)
          .join(', ');
        await this.db.execute(sql.raw(`TRUNCATE TABLE ${tables} CASCADE;`));
      }
    } catch (error) {
      console.error('DatabaseCleaner Error:', error);
    }
  }
}
