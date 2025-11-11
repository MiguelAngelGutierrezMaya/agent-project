import type { NotificationRepository } from '@modules/config/domain/repositories/NotificationRepository';
import type { NotificationDatasource } from '@modules/config/domain/datasource/NotificationDatasource';
import type { ConfigNotification } from '@modules/config/domain/models/ConfigNotification';

/**
 * Implementation of the notification repository
 *
 * @description Implements the NotificationRepository interface by delegating
 * to a NotificationDatasource. This layer handles business logic related to
 * notifications while delegating the actual sending mechanism to the datasource.
 *
 * @class NotificationRepositoryImp
 * @implements {NotificationRepository}
 */
export class NotificationRepositoryImp implements NotificationRepository {
  /**
   * Creates a new NotificationRepositoryImp instance
   *
   * @param notificationDatasource - The notification datasource implementation
   */
  constructor(
    private readonly notificationDatasource: NotificationDatasource
  ) {}

  /**
   * Sends a configuration change notification
   *
   * @param notification - The notification payload to send
   * @returns Promise that resolves when the notification is sent successfully
   * @throws Error if the notification fails to send
   */
  async sendConfigNotification(
    notification: ConfigNotification
  ): Promise<void> {
    await this.notificationDatasource.sendNotification(notification);
  }
}
