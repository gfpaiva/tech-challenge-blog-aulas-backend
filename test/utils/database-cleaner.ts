import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from '@infra/database/schema';

export class DatabaseCleaner {
  private static db: PostgresJsDatabase<typeof schema> | undefined;

  static setDatabase(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  static async clean() {
    if (!this.db) {
      throw new Error('Database instance not set. Call setDatabase() first.');
    }

    const result = await this.db.execute<{ tablename: string }>(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename != '_migrations'
    `);

    if (result.length > 0) {
      const tables = result.map((row) => `"${row.tablename}"`).join(', ');
      await this.db.execute(sql.raw(`TRUNCATE TABLE ${tables} CASCADE`));
    }
  }

  static reset() {
    this.db = undefined;
  }
}
