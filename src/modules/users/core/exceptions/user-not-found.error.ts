import { EntityNotFoundError } from '@common/exceptions/entity-not-found.error';

export class UserNotFoundError extends EntityNotFoundError {
  constructor(id: string) {
    super(`User with id "${id}" not found`);
  }
}
