import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@common/types';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@infra/database/schema';

export class TestAuthHelper {
  private static jwtService: JwtService | undefined;

  static init() {
    if (!this.jwtService) {
      // Secret must match the one in Jest Global Setup/Env
      this.jwtService = new JwtService({
        secret: process.env.JWT_SECRET || 'test-secret',
        signOptions: { expiresIn: '1d' },
      });
    }
  }

  static async createAuthenticatedUser(
    db: PostgresJsDatabase<typeof schema>,
    role: UserRole = 'ALUNO',
    password = 'password123',
  ) {
    this.init();

    const id = uuidv4();
    const name = `Test User ${id.substring(0, 8)}`;
    const email = `test.${id}@example.com`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into DB using drizzle
    await db.insert(schema.users).values({
      id,
      name,
      email,
      passwordHash,
      role,
    });

    const payload = { sub: id, id, role };
    const accessToken = this.jwtService!.sign(payload);

    return {
      user: { id, name, email, role },
      accessToken,
      authorizationHeader: { Authorization: `Bearer ${accessToken}` },
      password, // Return raw password if needed for login tests
    };
  }
}
