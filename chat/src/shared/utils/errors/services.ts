import { HTTP_STATUS_CODES } from '@shared/utils/constants';
import { ModuleError } from './modules';

/**
 * HTTP status codes used throughout the application.
 * Provides type-safe access to common HTTP status codes.
 */
const CODES = HTTP_STATUS_CODES;

/**
 * Error thrown when a service is not implemented.
 * Extends ModuleError with a specific message and code.
 */
export class ServiceNotImplementedError extends ModuleError {
  /**
   * Constructor for ServiceNotImplementedError.
   */
  constructor(cause?: unknown) {
    super({ message: 'Service not implemented', cause }, CODES.NOT_IMPLEMENTED);
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
 * Error thrown when a service validation is invalid.
 * Extends ModuleError with a specific message and code.
 */
export class ServiceValidationError extends ModuleError {
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, CODES.BAD_REQUEST);
  }

  getMessage(): string {
    return this.params.message as string;
  }

  getCode(): number {
    return this.code;
  }
}

/**
 * Error thrown when a service error occurs.
 * Extends ModuleError with a specific message and code.
 */
export class ServiceError extends ModuleError {
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, CODES.INTERNAL_SERVER_ERROR);
  }

  getMessage(): string {
    return this.params.message as string;
  }

  getCode(): number {
    return this.code;
  }
}
