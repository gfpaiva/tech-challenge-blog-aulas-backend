import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { ILoggerPort } from '@common/ports/logger.port';
import { UserRole } from '@common/types';
import { UserNotFoundError } from '../exceptions/user-not-found.error';

interface DeleteUserCommand {
  id: string;
  expectedRole: UserRole;
}

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.userRepository.findById(command.id);

    if (!user || user.role !== command.expectedRole) {
      throw new UserNotFoundError(command.id);
    }

    await this.userRepository.delete(command.id);

    this.logger.log(`User deleted: ${command.id}`, 'DeleteUserService');
  }
}
