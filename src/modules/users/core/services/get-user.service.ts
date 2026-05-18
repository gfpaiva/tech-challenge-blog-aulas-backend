import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { ILoggerPort } from '@common/ports/logger.port';
import { User } from '../entities/user.entity';
import { UserRole } from '@common/types';
import { UserNotFoundError } from '../exceptions/user-not-found.error';

interface GetUserCommand {
  id: string;
  expectedRole: UserRole;
}

@Injectable()
export class GetUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(command: GetUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.id);

    if (!user || user.role !== command.expectedRole) {
      throw new UserNotFoundError(command.id);
    }

    this.logger.debug(`User fetched: ${user.id}`, 'GetUserService');

    return user;
  }
}
