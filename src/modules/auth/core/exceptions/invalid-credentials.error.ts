import { DomainError } from '@common/exceptions/domain.error';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials');
  }
}
