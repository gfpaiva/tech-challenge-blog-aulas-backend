import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { User } from '../entities/user.entity';
import { UserRole } from '@common/types';

interface ListUsersCommand {
  role: UserRole;
  page: number;
  limit: number;
}

export interface ListUsersResult {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListUsersService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ListUsersCommand): Promise<ListUsersResult> {
    const { data, total } = await this.userRepository.findAll({
      role: command.role,
      page: command.page,
      limit: command.limit,
    });

    return { data, total, page: command.page, limit: command.limit };
  }
}
