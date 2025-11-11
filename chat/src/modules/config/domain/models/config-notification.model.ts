import type { ConfigNotificationEventType } from './config-notification-event-type.enum';
import type { ConfigWithSchema } from './config.model';
import type { NotificationMetadata } from './notification-metadata.model';

/**
 * Configuration notification message structure.
 *
 * This interface represents a complete notification message
 * that is sent when configuration changes occur in the system.
 *
 * @interface ConfigNotification
 */
export interface ConfigNotification {
  /** Type of event that occurred */
  eventType: ConfigNotificationEventType;

  /** ID of the user who triggered the event */
  userId: string;

  /** Configuration data that was affected */
  config: ConfigWithSchema;

  /** ISO 8601 timestamp when the event occurred */
  timestamp: string;

  /** Optional metadata with additional context */
  metadata?: NotificationMetadata;
}
