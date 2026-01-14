import { EntityNotFoundError } from '@common/exceptions/entity-not-found.error';

export class PostNotFoundError extends EntityNotFoundError {
  constructor(id: string) {
    super(`Post with ID ${id} not found`);
  }
}
