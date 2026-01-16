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
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_drizzle_%'
        AND tablename != '_migrations'
    `);

    if (result.length > 0) {
      // Build SQL with properly quoted identifiers
      const [first, ...rest] = result.map((row) =>
        sql.identifier(row.tablename),
      );
      const tableIdentifiers = rest.reduce(
        (acc, identifier) => sql`${acc}, ${identifier}`,
        first,
      );
      await this.db.execute(sql`TRUNCATE TABLE ${tableIdentifiers} CASCADE`);
    }
  }

  static reset() {
    this.db = undefined;
  }
}
