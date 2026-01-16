import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ILoggerPort } from '@common/ports/logger.port';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: ILoggerPort) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Record<string, string> = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, 'HttpLogger');

    return next.handle().pipe(
      tap({
        next: () => {
          const response: Record<string, string> = context
            .switchToHttp()
            .getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          this.logger.log(
            `Request Completed: ${method} ${url} ${statusCode} - ${duration}ms`,
            'HttpLogger',
            { statusCode, duration },
          );
        },
        error: (error: Record<string, unknown>) => {
          const duration = Date.now() - startTime;
          const statusCode: number = (error.status as number) || 500;
          this.logger.error(
            `Request Failed: ${method} ${url} ${statusCode} - ${duration}ms`,
            error.stack as string,
            'HttpLogger',
            { statusCode, duration },
          );
        },
      }),
    );
  }
}
