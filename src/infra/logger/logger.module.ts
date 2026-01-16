import { Global, Module } from '@nestjs/common';
import { ILoggerPort } from '@common/ports/logger.port';
import { WinstonLoggerAdapter } from './winston-logger.adapter';

@Global()
@Module({
  providers: [
    {
      provide: ILoggerPort,
      useClass: WinstonLoggerAdapter,
    },
  ],
  exports: [ILoggerPort],
})
export class LoggerModule {}
