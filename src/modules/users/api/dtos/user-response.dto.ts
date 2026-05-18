import { User } from '@modules/users/core/entities/user.entity';
import { UserRole } from '@common/types';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: UserRole;

  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export interface ListUsersResponseDto {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}
