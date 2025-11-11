import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import type { NotificationDatasource } from '@modules/config/domain/datasource/NotificationDatasource';
import type { ConfigNotification } from '@modules/config/domain/models/ConfigNotification';
import type { LoggerService } from '@src/domain/services/Logger';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

/**
 * SQS implementation of the notification datasource
 *
 * @description Implements the NotificationDatasource interface using AWS SQS
 * as the messaging service. This adapter allows sending configuration change
 * notifications to an SQS queue.
 *
 * @class SqsNotificationDatasourceImp
 * @implements {NotificationDatasource}
 */
export class SqsNotificationDatasourceImp implements NotificationDatasource {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  /**
   * Creates a new SqsNotificationDatasourceImp instance
   *
   * @param logger - Logger service instance for logging
   * @param queueUrl - The SQS queue URL to send messages to
   * @param region - AWS region where the queue is located (defaults to env var)
   */
  constructor(private readonly logger: LoggerService) {
    if (!process.env.CONFIG_NOTIFICATIONS_QUEUE_URL) {
      throw new DomainValidationError(
        'SQS Queue URL is required. Set CONFIG_NOTIFICATIONS_QUEUE_URL environment variable.'
      );
    }

    if (!process.env.REGION) {
      throw new DomainValidationError(
        'AWS region is required. Set REGION environment variable.'
      );
    }

    this.queueUrl = process.env.CONFIG_NOTIFICATIONS_QUEUE_URL;

    this.sqsClient = new SQSClient({
      region: process.env.REGION,
    });

    this.logger.info(
      `SQS Notification Datasource initialized - Queue: ${this.queueUrl}`,
      SqsNotificationDatasourceImp.name
    );
  }

  /**
   * Sends a configuration change notification to SQS
   *
   * @param notification - The notification payload to send
   * @returns Promise that resolves when the message is sent successfully
   * @throws Error if the message fails to send
   */
  async sendNotification(notification: ConfigNotification): Promise<void> {
    try {
      this.logger.info(
        `Sending notification - Event: ${notification.eventType}, User: ${notification.userId}, Config: ${notification.config.id}`,
        SqsNotificationDatasourceImp.name
      );

      const messageBody = JSON.stringify({
        ...notification,
        timestamp: notification.timestamp.toISOString(),
      });

      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: messageBody,
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: notification.eventType,
          },
          userId: {
            DataType: 'String',
            StringValue: notification.userId,
          },
          configId: {
            DataType: 'String',
            StringValue: notification.config.id,
          },
        },
      });

      const response = await this.sqsClient.send(command);

      this.logger.info(
        `Notification sent - MessageId: ${response.MessageId}, Event: ${notification.eventType}`,
        SqsNotificationDatasourceImp.name
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to send notification - Error: ${errorMessage}, Event: ${notification.eventType}, User: ${notification.userId}`,
        SqsNotificationDatasourceImp.name
      );

      throw error;
    }
  }
}
