import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import { users } from '@infra/database/schema';
import { User } from '../../core/entities/user.entity';
import {
  CreateUserData,
  FindAllUsersParams,
  IUserRepository,
  UpdateUserData,
} from '../../core/ports/user.repository';
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

  async findAll(
    params: FindAllUsersParams,
  ): Promise<{ data: User[]; total: number }> {
    const offset = (params.page - 1) * params.limit;

    const [rows, [{ value: total }]] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(eq(users.role, params.role))
        .limit(params.limit)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(users)
        .where(eq(users.role, params.role)),
    ]);

    return {
      data: rows.map((row) => UserMapper.toDomain(row)),
      total: Number(total),
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const [result] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
      })
      .returning();

    return UserMapper.toDomain(result);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const [result] = await this.db
      .update(users)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
      })
      .where(eq(users.id, id))
      .returning();

    return UserMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
