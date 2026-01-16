import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { IUserRepository } from '../../../users/core/ports/user.repository';
import { IPasswordService } from '../ports/password.service';
import { InvalidCredentialsError } from '../exceptions/invalid-credentials.error';
import { UserRole } from '@common/types';
import { ILoggerPort } from '@common/ports/logger.port';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let jwtService: jest.Mocked<JwtService>;
  let logger: jest.Mocked<ILoggerPort>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as any;

    passwordService = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;

    service = new AuthService(
      userRepository,
      passwordService,
      jwtService,
      logger,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ALUNO' as UserRole,
      passwordHash: 'hashed-password',
    };

    it('should throw InvalidCredentialsError if user is not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw InvalidCredentialsError if password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsError,
      );
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
    });

    it('should return an access token if credentials are valid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'mock-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        id: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});
