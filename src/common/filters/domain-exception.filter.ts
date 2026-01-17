import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '@common/exceptions/domain.error';
import { EntityNotFoundError } from '@common/exceptions/entity-not-found.error';
import { InvalidCredentialsError } from '@modules/auth/core/exceptions/invalid-credentials.error';
import { ForbiddenActionException } from '@modules/posts/core/exceptions/forbidden-action.exception';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorName = exception.constructor?.name;

    // EntityNotFoundError -> 404
    if (
      exception instanceof EntityNotFoundError ||
      errorName === 'EntityNotFoundError'
    ) {
      const nestException = new NotFoundException(exception.message);
      const status = nestException.getStatus();

      response.status(status).json(nestException.getResponse());
      return;
    }

    // InvalidCredentialsError -> 401
    if (
      exception instanceof InvalidCredentialsError ||
      errorName === 'InvalidCredentialsError'
    ) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
        error: 'Unauthorized',
      });
      return;
    }

    // ForbiddenActionException -> 403
    if (
      exception instanceof ForbiddenActionException ||
      errorName === 'ForbiddenActionException'
    ) {
      response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: exception.message,
        error: 'Forbidden',
      });
      return;
    }

    // Default DomainError -> 400
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
