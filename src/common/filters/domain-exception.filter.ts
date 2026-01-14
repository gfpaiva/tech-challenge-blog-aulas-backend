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

    // Default handling for other DomainErrors (fallback to 500 or specific mapping if needed)
    // For now, let's treat unknown domain errors as internal server errors or just BadRequest if they imply validation failure (though validation usually goes via class-validator)
    // Adjusting to generic 500 for unhandled domain errors for safety, or rethrow.
    // But usually DomainErrors are "Bad Request" (400) or "Unprocessable Entity" (422) if not Not Found.
    // Let's default to 400 Bad Request for generic DomainErrors for now, assuming they are business rule violations.

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
