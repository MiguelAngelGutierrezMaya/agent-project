/**
 * Metadata for configuration notifications.
 *
 * This interface defines additional contextual information
 * that can be attached to configuration notifications.
 *
 * @interface NotificationMetadata
 */
export interface NotificationMetadata {
  /** Source system or service that triggered the notification */
  source?: string;

  /** Action that was performed */
  action?: string;

  /** Additional metadata properties */
  [key: string]: unknown;
}
