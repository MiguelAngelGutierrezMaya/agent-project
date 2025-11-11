import { HTTP_STATUS_CODES } from '../constants';
import { ModuleError } from './modules';

/**
 * Error thrown when domain validation fails.
 * Extends ModuleError with a specific message and code.
 */
export class DomainValidationError extends ModuleError {
  /**
   * Constructor for DomainValidationError.
   * @param message - The validation error message
   * @param cause - Optional cause of the error
   */
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, HTTP_STATUS_CODES.BAD_REQUEST);
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
 * Error thrown when the domain name is required.
 * Extends ModuleError with a specific message and code.
 */
export class DomainNameRequiredError extends ModuleError {
  /**
   * Constructor for DomainNameRequiredError.
   */
  constructor(cause?: unknown) {
    super(
      { message: 'Domain name is required', cause },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
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
