import type { ConfigWithSchema } from '@modules/config/domain/models/Config';

/**
 * Configuration notification event types
 *
 * @description Defines the types of events that can trigger notifications
 */
export enum ConfigNotificationEventType {
  /** Configuration was updated */
  CONFIG_UPDATED = 'CONFIG_UPDATED',
  /** Configuration was created */
  CONFIG_CREATED = 'CONFIG_CREATED',
  /** Configuration was deleted */
  CONFIG_DELETED = 'CONFIG_DELETED',
}

/**
 * Configuration notification payload
 *
 * @description Contains the data to be sent in configuration change notifications
 *
 * @interface ConfigNotification
 */
export interface ConfigNotification {
  /** Type of event that triggered the notification */
  eventType: ConfigNotificationEventType;
  /** User ID associated with the configuration */
  userId: string;
  /** The configuration data */
  config: ConfigWithSchema;
  /** Timestamp when the event occurred */
  timestamp: Date;
  /** Optional metadata for the notification */
  metadata?: Record<string, unknown>;
}
