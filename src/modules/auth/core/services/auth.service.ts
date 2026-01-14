import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../../users/core/ports/user.repository';
import { IPasswordService } from '../ports/password.service';
import { LoginDto } from '../../api/dtos/login.dto';
import { InvalidCredentialsError } from '../exceptions/invalid-credentials.error';

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = { sub: user.id, id: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
