import { HTTP_STATUS_CODES } from '@shared/utils/constants';
import { ModuleError } from './modules';

/**
 * HTTP status codes used throughout the application.
 * Provides type-safe access to common HTTP status codes.
 */
const CODES = HTTP_STATUS_CODES;

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
      CODES.INTERNAL_SERVER_ERROR
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
 * Error thrown when the domain validation fails.
 * Extends ModuleError with a specific message and code.
 */
export class DomainValidationError extends ModuleError {
  /**
   * Constructor for DomainValidationError.
   * @param {string} message - The error message
   * @param {unknown} cause - The cause of the error
   */
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, CODES.BAD_REQUEST);
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
 * Error thrown when a parameter is required.
 * Extends ModuleError with a specific message and code.
 */
export class ParamRequiredError extends ModuleError {
  /**
   * Constructor for ParamRequiredError.
   * @param {string} message - The error message
   * @param {unknown} cause - The cause of the error
   */
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, CODES.BAD_REQUEST);
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
 * Error thrown when data is not found.
 * Extends ModuleError with a specific message and code.
 */
export class DataNotFoundError extends ModuleError {
  /**
   * Constructor for DataNotFoundError.
   * @param {string} message - The error message
   * @param {unknown} cause - The cause of the error
   */
  constructor(message: string, cause?: unknown) {
    super({ message, cause }, CODES.NOT_FOUND);
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
