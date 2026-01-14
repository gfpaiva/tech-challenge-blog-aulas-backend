import { EntityNotFoundError } from '@common/exceptions/entity-not-found.error';

export class CategoryNotFoundError extends EntityNotFoundError {
  constructor(id: number) {
    super(`Category with ID ${id} not found`);
  }
}
