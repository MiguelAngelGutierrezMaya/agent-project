import { HTTP_STATUS_CODES } from '@shared/utils/constants';
import { ModuleError } from './modules';
import { LoggerService } from '@src/domain/services/Logger';

export class ErrorHandler {
  static handle(error: unknown, logger: LoggerService) {
    if (error instanceof ModuleError) {
      logger.error(
        `message: ${error.getMessage()}, cause: ${error.cause}, code: ${error.getCode()}`,
        ErrorHandler.name
      );
      return {
        statusCode: error.getCode(),
        body: JSON.stringify({ message: error.getMessage() }),
      };
    }

    if (error instanceof Error) {
      logger.error(
        `message: ${error.message}, cause: ${error.cause}, code: ${HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR}`,
        ErrorHandler.name
      );
      return {
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ message: error.message }),
      };
    }

    logger.error(JSON.stringify(error), ErrorHandler.name);

    return {
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
