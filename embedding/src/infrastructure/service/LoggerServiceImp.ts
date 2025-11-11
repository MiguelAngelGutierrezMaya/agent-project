import { createLogger, format, transports } from 'winston';
import { LoggerService } from '@src/domain/services/Logger';

enum Level {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warn',
}

export class LoggerServiceImplementation implements LoggerService {
  private readonly loggerInfo = createLogger({
    level: Level.INFO,
    format: format.json(),
    transports: [new transports.Console()],
  });
  private readonly loggerError = createLogger({
    level: Level.ERROR,
    format: format.json(),
    transports: [new transports.Console()],
  });
  private readonly loggerWarn = createLogger({
    level: Level.WARN,
    format: format.json(),
    transports: [new transports.Console()],
  });

  constructor() {}

  error(message: string, trace: string): void {
    this.loggerError.error({
      message: `${trace}: ${message}`,
    });
  }

  info(message: string, trace: string): void {
    this.loggerInfo.info({
      message: `${trace}: ${message}`,
    });
  }

  warn(message: string, trace: string): void {
    this.loggerWarn.warn({
      message: `${trace}: ${message}`,
    });
  }
}
