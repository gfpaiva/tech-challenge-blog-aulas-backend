import { DomainError } from './domain.error';

export abstract class EntityNotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
