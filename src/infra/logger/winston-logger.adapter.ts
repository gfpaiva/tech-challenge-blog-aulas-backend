import { Injectable } from '@nestjs/common';
import { ILoggerPort } from '@common/ports/logger.port';
import { ClsService } from 'nestjs-cls';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerAdapter implements ILoggerPort {
  private logger: winston.Logger;

  constructor(private readonly cls: ClsService) {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || 'info';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(
                ({ timestamp, level, message, context, traceId, ...meta }) => {
                  return `${timestamp as string} [${(context as string) || 'App'}] ${level}: ${message as string} ${traceId ? `[TraceID: ${traceId as string}]` : ''} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
                },
              ),
            ),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private getTraceId(): string | undefined {
    return this.cls.getId();
  }

  log(message: string, context?: string, meta?: Record<string, any>): void {
    const traceId = this.getTraceId();
    this.logger.info(message, { context, traceId, ...meta });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, any>,
  ): void {
    const traceId = this.getTraceId();
    this.logger.error(message, { trace, context, traceId, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, any>): void {
    const traceId = this.getTraceId();
    this.logger.warn(message, { context, traceId, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, any>): void {
    const traceId = this.getTraceId();
    this.logger.debug(message, { context, traceId, ...meta });
  }
}
