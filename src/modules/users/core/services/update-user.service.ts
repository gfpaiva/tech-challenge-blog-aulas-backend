import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { ILoggerPort } from '@common/ports/logger.port';
import { User } from '../entities/user.entity';
import { UserRole } from '@common/types';
import { UserNotFoundError } from '../exceptions/user-not-found.error';
import { EmailAlreadyExistsError } from '../exceptions/email-already-exists.error';

interface UpdateUserCommand {
  id: string;
  expectedRole: UserRole;
  name?: string;
  email?: string;
}

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.id);

    if (!user || user.role !== command.expectedRole) {
      throw new UserNotFoundError(command.id);
    }

    if (command.email && command.email !== user.email) {
      const emailTaken = await this.userRepository.findByEmail(command.email);
      if (emailTaken) {
        throw new EmailAlreadyExistsError(command.email);
      }
    }

    const updated = await this.userRepository.update(command.id, {
      name: command.name,
      email: command.email,
    });

    this.logger.log(`User updated: ${updated.id}`, 'UpdateUserService');

    return updated;
  }
}
