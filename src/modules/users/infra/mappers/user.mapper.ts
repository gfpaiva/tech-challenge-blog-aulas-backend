import { User } from '../../core/entities/user.entity';
import { users } from '@infra/database/schema';
import { InferSelectModel } from 'drizzle-orm';
import { UserRole } from '@common/types';

type UserSchema = InferSelectModel<typeof users>;

export class UserMapper {
  static toDomain(raw: UserSchema): User {
    return new User(
      raw.id,
      raw.name,
      raw.email,
      raw.role as UserRole,
      raw.passwordHash,
    );
  }
}
