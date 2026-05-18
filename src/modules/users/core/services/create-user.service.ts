import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { IPasswordService } from '@modules/auth/core/ports/password.service';
import { ILoggerPort } from '@common/ports/logger.port';
import { User } from '../entities/user.entity';
import { UserRole } from '@common/types';
import { EmailAlreadyExistsError } from '../exceptions/email-already-exists.error';

interface CreateUserCommand {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const existing = await this.userRepository.findByEmail(command.email);

    if (existing) {
      throw new EmailAlreadyExistsError(command.email);
    }

    const passwordHash = await this.passwordService.hash(command.password);

    const user = await this.userRepository.create({
      name: command.name,
      email: command.email,
      passwordHash,
      role: command.role,
    });

    this.logger.log(
      `User created: ${user.id} (${user.role})`,
      'CreateUserService',
    );

    return user;
  }
}
