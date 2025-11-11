import { HTTP_STATUS_CODES } from '@shared/utils/constants';
import { ModuleError } from './modules';
import { Logger } from '@nestjs/common';

export interface ErrorHandlerResponse {
  statusCode: number;
  body: string;
}

export class ErrorHandler {
  static handle(error: unknown, logger: Logger): ErrorHandlerResponse {
    if (error instanceof ModuleError) {
      logger.error(
        `message: ${error.getMessage()}, cause: ${String(error.cause)}, code: ${error.getCode()}`,
        ErrorHandler.name
      );
      return {
        statusCode: error.getCode(),
        body: JSON.stringify({ message: error.getMessage() }),
      };
    }

    if (error instanceof Error) {
      logger.error(
        `message: ${error.message}, cause: ${String(error.cause)}, code: ${HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR}`,
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
