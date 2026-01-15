import { User } from './user.entity';
import { UserRole } from '@common/types';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User(
      'user-1',
      'User One',
      'user@example.com',
      'ALUNO' as UserRole,
      'hashed-password',
    );

    expect(user.id).toBe('user-1');
    expect(user.name).toBe('User One');
    expect(user.email).toBe('user@example.com');
    expect(user.role).toBe('ALUNO');
    expect(user.passwordHash).toBe('hashed-password');
  });
});
