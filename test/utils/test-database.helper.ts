import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@common/types';

/**
 * Unified test database helper that manages a single connection pool
 * for all database operations during E2E tests.
 *
 * This consolidates the functionality of DatabaseCleaner and TestAuthHelper
 * to avoid having multiple separate connection pools.
 */
export class TestDatabaseHelper {
  private static pool: Pool | undefined;
  private static jwtService: JwtService | undefined;

  /**
   * Initialize the shared connection pool and JWT service
   */
  static init() {
    if (!this.pool) {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
      }
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      this.pool.on('error', (err) =>
        console.error('TestDatabaseHelper Pool Error:', err),
      );
    }
    if (!this.jwtService) {
      this.jwtService = new JwtService({
        secret: process.env.JWT_SECRET || 'test-secret',
        signOptions: { expiresIn: '1d' },
      });
    }
  }

  /**
   * Clean all tables in the database except migrations
   */
  static async clean() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }

    if (!this.pool) {
      this.init();
    }

    const client = await this.pool!.connect();
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

  /**
   * Create an authenticated user for testing
   */
  static async createAuthenticatedUser(
    role: UserRole = 'ALUNO',
    password = 'password123',
  ) {
    this.init();

    const id = uuidv4();
    const name = `Test User ${id.substring(0, 8)}`;
    const email = `test.${id}@example.com`;
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await this.pool!.connect();
    try {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)`,
        [id, name, email, passwordHash, role],
      );
    } finally {
      client.release();
    }

    const payload = { sub: id, id, role };
    const accessToken = this.jwtService!.sign(payload);

    return {
      user: { id, name, email, role },
      accessToken,
      authorizationHeader: { Authorization: `Bearer ${accessToken}` },
      password,
    };
  }

  /**
   * Close the shared connection pool
   */
  static async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }
}
