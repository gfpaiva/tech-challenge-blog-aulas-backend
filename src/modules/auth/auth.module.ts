import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './api/controllers/auth.controller';
import { AuthService } from './core/services/auth.service';
import { IPasswordService } from './core/ports/password.service';
import { BcryptPasswordService } from './infra/adapters/bcrypt-password.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    {
      provide: IPasswordService,
      useClass: BcryptPasswordService,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
