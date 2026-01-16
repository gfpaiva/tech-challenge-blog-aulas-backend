import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../../users/core/ports/user.repository';
import { IPasswordService } from '../ports/password.service';
import { LoginDto } from '../../api/dtos/login.dto';
import { InvalidCredentialsError } from '../exceptions/invalid-credentials.error';
import { ILoggerPort } from '@common/ports/logger.port';

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    private readonly jwtService: JwtService,
    private readonly logger: ILoggerPort,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(
        `Failed login attempt (user not found) for email: ${loginDto.email}`,
        'AuthService',
      );
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Failed login attempt (invalid password) for email: ${loginDto.email}`,
        'AuthService',
      );
      throw new InvalidCredentialsError();
    }

    const payload = { sub: user.id, id: user.id, role: user.role };

    this.logger.log(`User logged in successfully: ${user.id}`, 'AuthService');

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
