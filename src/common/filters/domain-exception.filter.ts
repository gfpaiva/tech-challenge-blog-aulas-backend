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

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const error = exception as {
      message?: string;
      constructor?: { name?: string };
    };

    // Check if it's a DomainError or specific error we care about (handling import mismatch)
    const isDomainError = exception instanceof DomainError;
    const isInvalidCredentials =
      error?.constructor?.name === 'InvalidCredentialsError';

    if (!isDomainError && !isInvalidCredentials) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof EntityNotFoundError) {
      const nestException = new NotFoundException(exception.message);
      const status = nestException.getStatus();

      response.status(status).json(nestException.getResponse());
      return;
    }

    if (error?.constructor?.name === 'InvalidCredentialsError') {
      response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: error.message,
        error: 'Unauthorized',
      });
      return;
    }

    if (error?.constructor?.name === 'ForbiddenActionException') {
      response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: error.message,
        error: 'Forbidden',
      });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
      error: 'Bad Request',
    });
  }
}
