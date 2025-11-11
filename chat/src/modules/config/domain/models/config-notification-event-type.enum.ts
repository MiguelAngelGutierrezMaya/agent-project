/**
 * Event types for configuration notifications.
 *
 * This enum defines the possible types of events that can occur
 * when configuration changes are made.
 *
 * @enum {string}
 */
export enum ConfigNotificationEventType {
  /** Configuration has been updated */
  CONFIG_UPDATED = 'CONFIG_UPDATED',

  /** New configuration has been created */
  CONFIG_CREATED = 'CONFIG_CREATED',

  /** Configuration has been deleted */
  CONFIG_DELETED = 'CONFIG_DELETED',
}
