import { HTTP_STATUS_CODES } from '@shared/utils/constants';
import { ModuleError } from './modules';

/**
 * Error thrown when a service is not implemented.
 * Extends ModuleError with a specific message and code.
 */
export class ServiceNotImplementedError extends ModuleError {
  /**
   * Constructor for ServiceNotImplementedError.
   */
  constructor(cause?: unknown) {
    super(
      { message: 'Service not implemented', cause },
      HTTP_STATUS_CODES.NOT_IMPLEMENTED
    );
  }

  /**
   * Get the error message.
   * @returns {string} The error message
   */
  getMessage(): string {
    return this.params.message as string;
  }

  /**
   * Get the HTTP status code.
   * @returns {number} The HTTP status code
   */
  getCode(): number {
    return this.code;
  }
}

/**
 * Error thrown when data is not defined.
 * Extends ModuleError with a specific message and code.
 */
export class DataNotDefinedError extends ModuleError {
  /**
   * Constructor for DataNotDefinedError.
   */
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  /**
   * Get the error message.
   * @returns {string} The error message
   */
  getMessage(): string {
    return this.params.message as string;
  }

  /**
   * Get the HTTP status code.
   * @returns {number} The HTTP status code
   */
  getCode(): number {
    return this.code;
  }
}

/**
 * Error thrown when a request is unauthorized.
 * Extends ModuleError with a specific message and code.
 */
export class UnauthorizedError extends ModuleError {
  /**
   * Constructor for UnauthorizedError.
   */
  constructor(cause?: unknown) {
    super({ message: 'Unauthorized', cause }, HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  /**
   * Get the error message.
   * @returns {string} The error message
   */
  getMessage(): string {
    return this.params.message as string;
  }

  /**
   * Get the HTTP status code.
   * @returns {number} The HTTP status code
   */
  getCode(): number {
    return this.code;
  }
}
