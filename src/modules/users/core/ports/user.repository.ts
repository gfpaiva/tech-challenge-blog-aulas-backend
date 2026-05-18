import { UserRole } from '@common/types';
import { User } from '../entities/user.entity';

export interface FindAllUsersParams {
  role: UserRole;
  page: number;
  limit: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export abstract class IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findAll(
    params: FindAllUsersParams,
  ): Promise<{ data: User[]; total: number }>;
  abstract create(data: CreateUserData): Promise<User>;
  abstract update(id: string, data: UpdateUserData): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
