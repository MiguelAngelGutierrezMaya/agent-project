import type { ConfigNotification } from '@modules/config/domain/models/ConfigNotification';

/**
 * Interface for notification repository operations
 *
 * @description Defines contracts for notification-related business operations.
 * This repository abstracts the notification mechanism at the domain level.
 *
 * @interface NotificationRepository
 */
export interface NotificationRepository {
  /**
   * Sends a configuration change notification
   *
   * @param notification - The notification payload to send
   * @returns Promise that resolves when the notification is sent successfully
   * @throws Error if the notification fails to send
   */
  sendConfigNotification(notification: ConfigNotification): Promise<void>;
}
