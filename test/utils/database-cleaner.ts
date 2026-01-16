import { Pool } from 'pg';

export class DatabaseCleaner {
  private static pool: Pool | undefined;

  static async clean() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }

    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      this.pool.on('error', (err) =>
        console.error('DatabaseCleaner Pool Error:', err),
      );
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename != '_migrations';
      `);

      if (result.rows.length > 0) {
        const tables = (result.rows as { tablename: string }[])
          .map((row) => `"${row.tablename}"`)
          .join(', ');
        await client.query(`TRUNCATE TABLE ${tables} CASCADE;`);
      }
    } finally {
      client.release();
    }
  }

  static async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }
}
