import { DomainError } from '@common/exceptions/domain.error';

export class ForbiddenActionException extends DomainError {
  constructor(message = 'You are not allowed to perform this action') {
    super(message);
  }
}
