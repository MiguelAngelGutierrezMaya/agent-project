import { HttpStatus } from '@nestjs/common';

/**
 * Type for HTTP status codes.
 */
export type HTTP_STATUS_CODES =
  | 'SUCCESS'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'NOT_IMPLEMENTED'
  | 'INTERNAL_SERVER_ERROR';

/**
 * HTTP status codes used throughout the application.
 * Provides type-safe access to common HTTP status codes.
 */
export const HTTP_STATUS_CODES: Record<HTTP_STATUS_CODES, number> = {
  SUCCESS: HttpStatus.OK,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  NOT_IMPLEMENTED: HttpStatus.NOT_IMPLEMENTED,
  INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
} satisfies Record<HTTP_STATUS_CODES, number>;
