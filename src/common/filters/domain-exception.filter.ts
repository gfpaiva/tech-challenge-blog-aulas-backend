import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../exceptions/domain.error';
import { EntityNotFoundError } from '../exceptions/entity-not-found.error';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof EntityNotFoundError) {
      const nestException = new NotFoundException(exception.message);
      const status = nestException.getStatus();

      response.status(status).json(nestException.getResponse());
      return;
    }

    if (exception.constructor.name === 'InvalidCredentialsError') {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
        error: 'Unauthorized',
      });
      return;
    }

    if (exception.constructor.name === 'ForbiddenActionException') {
      response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: exception.message,
        error: 'Forbidden',
      });
      return;
    }

    // Default handling for other domain errors (business rule violations)
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
