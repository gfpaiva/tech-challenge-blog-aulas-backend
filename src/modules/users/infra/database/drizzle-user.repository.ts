import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import { users } from '@infra/database/schema';
import { User } from '../../core/entities/user.entity';
import { IUserRepository } from '../../core/ports/user.repository';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<
      typeof import('@infra/database/schema')
    >,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!result) return null;

    return UserMapper.toDomain(result);
  }

  async findById(id: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!result) return null;

    return UserMapper.toDomain(result);
  }
}
