export abstract class LoggerService {
  abstract info(message: string, trace: string): void;

  abstract error(message: string, trace: string): void;

  abstract warn(message: string, trace: string): void;
}
