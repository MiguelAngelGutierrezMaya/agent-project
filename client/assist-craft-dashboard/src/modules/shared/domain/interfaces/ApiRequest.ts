/**
 * Base API Request interface
 * Contains common properties for all API requests
 */
export interface BaseApiRequest {
  /** Authentication token */
  token: string;
}

/**
 * Request with user identifier
 */
export interface UserApiRequest extends BaseApiRequest {
  /** User identifier */
  userId: string;
}
