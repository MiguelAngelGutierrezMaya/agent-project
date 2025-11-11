import type { NotificationRepository } from '@modules/config/domain/repositories/NotificationRepository';
import type { ConfigNotification } from '@modules/config/domain/models/ConfigNotification';

/**
 * Use case for sending configuration change notifications
 *
 * @description Orchestrates the process of sending notifications when
 * configuration changes occur. This use case is independent of the
 * notification mechanism (SQS, SNS, etc.).
 *
 * @class SendConfigNotificationUseCase
 */
export class SendConfigNotificationUseCase {
  /**
   * Creates a new SendConfigNotificationUseCase instance
   *
   * @param notificationRepository - The notification repository implementation
   */
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  /**
   * Executes the notification sending use case
   *
   * @param notification - The notification payload to send
   * @returns Promise that resolves when the notification is sent
   * @throws Error if the notification fails to send
   */
  async execute(notification: ConfigNotification): Promise<void> {
    await this.notificationRepository.sendConfigNotification(notification);
  }
}
