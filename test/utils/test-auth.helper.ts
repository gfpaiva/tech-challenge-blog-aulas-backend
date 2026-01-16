import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@common/types';

export class TestAuthHelper {
  private static pool: Pool | undefined;
  private static jwtService: JwtService | undefined;

  static init() {
    if (!this.pool) {
      if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
      this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
      this.pool.on('error', (err) =>
        console.error('TestAuthHelper Pool Error:', err),
      );
    }
    if (!this.jwtService) {
      // Secret must match the one in Jest Global Setup/Env
      this.jwtService = new JwtService({
        secret: process.env.JWT_SECRET || 'test-secret',
        signOptions: { expiresIn: '1d' },
      });
    }
  }

  static async createAuthenticatedUser(
    role: UserRole = 'ALUNO',
    password = 'password123',
  ) {
    this.init();

    const id = uuidv4();
    const name = `Test User ${id.substring(0, 8)}`;
    const email = `test.${id}@example.com`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into DB
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
      password, // Return raw password if needed for login tests
    };
  }

  static async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }
}
