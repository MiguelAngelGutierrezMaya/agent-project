import type { ConfigNotification } from '@modules/config/domain/models/ConfigNotification';

/**
 * Interface for notification data source operations
 *
 * @description Defines contracts for sending configuration change notifications.
 * This interface abstracts the notification mechanism, allowing for different
 * implementations (SQS, SNS, RabbitMQ, etc.) without affecting business logic.
 *
 * @interface NotificationDatasource
 */
export interface NotificationDatasource {
  /**
   * Sends a configuration change notification
   *
   * @param notification - The notification payload to send
   * @returns Promise that resolves when the notification is sent successfully
   * @throws Error if the notification fails to send
   */
  sendNotification(notification: ConfigNotification): Promise<void>;
}
