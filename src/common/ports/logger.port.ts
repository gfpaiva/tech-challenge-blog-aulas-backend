export abstract class ILoggerPort {
  abstract log(
    message: string,
    context?: string,
    meta?: Record<string, any>,
  ): void;
  abstract error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, any>,
  ): void;
  abstract warn(
    message: string,
    context?: string,
    meta?: Record<string, any>,
  ): void;
  abstract debug(
    message: string,
    context?: string,
    meta?: Record<string, any>,
  ): void;
}
