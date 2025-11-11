import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer } from 'sqs-consumer';
import type { Message } from '@aws-sdk/client-sqs';
import type { ConfigNotification } from './domain/models/config-notification.model';
import { ConfigPersistenceService } from './config-persistence.service';

/**
 * Safe message structure extracted from SQS Message
 */
interface SafeMessageData {
  messageId: string;
  body: string;
  approximateReceiveCount: number;
}

/**
 * Error types for classification
 */
enum ErrorType {
  TRANSIENT = 'TRANSIENT', // Network issues, timeouts, temporary failures
  PERMANENT = 'PERMANENT', // Validation errors, malformed data, business logic errors
  UNKNOWN = 'UNKNOWN', // Unclassified errors
}

/**
 * Consumer service for configuration notifications from SQS
 *
 * @description This service uses the sqs-consumer library to listen for
 * configuration change notifications from an SQS queue. It implements:
 * - Automatic long polling
 * - Message acknowledgment (ACK) after successful processing
 * - Error handling and retry logic
 * - Graceful shutdown on module destroy
 *
 * @class ConfigNotificationConsumer
 */
@Injectable()
export class ConfigNotificationConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ConfigNotificationConsumer.name);
  private readonly queueUrl: string;
  private readonly region: string;
  private consumer: Consumer | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly configPersistenceService: ConfigPersistenceService
  ) {
    this.queueUrl =
      this.configService.get<string>('aws.sqs.configNotificationsQueueUrl') ||
      '';
    this.region = this.configService.get<string>('aws.region') ?? '';

    if (!this.region) {
      throw new Error('AWS_REGION is required in environment variables');
    }

    if (!this.queueUrl) {
      throw new Error(
        'CONFIG_NOTIFICATIONS_QUEUE_URL is required in environment variables'
      );
    }

    this.logger.log(`Initialized with queue: ${this.queueUrl}`);
  }

  /**
   * Starts the SQS consumer when the module initializes
   */
  onModuleInit(): void {
    this.logger.log('Starting SQS consumer...');

    this.consumer = Consumer.create({
      queueUrl: this.queueUrl,
      region: this.region,
      handleMessage: async message => {
        await this.handleMessage(message);
        return undefined; // Return undefined to acknowledge message processing
      },
      /* sqs-consumer will create its own SQS client with the region provided */
      batchSize: 10, // Process up to 10 messages at a time
      visibilityTimeout: 300, // 5 minutes
      waitTimeSeconds: 20, // Long polling
    });

    /* Event handlers for monitoring */
    this.consumer.on('error', (error: Error) => {
      this.logger.error('Consumer error', {
        error: error.message,
        stack: error.stack,
      });
    });

    this.consumer.on('processing_error', (error: Error) => {
      this.logger.error('Processing error', {
        error: error.message,
        stack: error.stack,
      });
    });

    this.consumer.on('timeout_error', (error: Error) => {
      this.logger.error('Timeout error', {
        error: error.message,
        stack: error.stack,
      });
    });

    this.consumer.on('message_received', () => {
      this.logger.debug('Message received from queue');
    });

    this.consumer.on('message_processed', () => {
      this.logger.debug('Message processed successfully');
    });

    this.consumer.on('response_processed', () => {
      this.logger.debug('Response processed');
    });

    /* Start consuming messages */
    this.consumer.start();
    this.logger.log('SQS consumer started successfully');
  }

  /**
   * Stops the SQS consumer when the module is destroyed
   */
  onModuleDestroy(): void {
    this.logger.log('Stopping SQS consumer...');

    if (this.consumer) {
      this.consumer.stop();
      this.logger.log('SQS consumer stopped');
    }
  }

  /**
   * Extracts safe message data from SQS Message to avoid unsafe type issues
   *
   * @param message - The SQS message
   * @returns Safe message data with proper types
   */
  private extractMessageData(message: Message): SafeMessageData {
    /* Convert to unknown first to safely access properties */
    const messageData = message as unknown as {
      MessageId?: string;
      Body?: string;
      Attributes?: Record<string, string>;
    };

    const receiveCount = parseInt(
      messageData.Attributes?.['ApproximateReceiveCount'] ?? '1',
      10
    );

    return {
      messageId: messageData.MessageId ?? 'unknown',
      body: messageData.Body ?? '',
      approximateReceiveCount: receiveCount,
    };
  }

  /**
   * Classifies an error to determine retry strategy
   *
   * @param error - The error to classify
   * @returns Error type classification
   */
  private classifyError(error: unknown): ErrorType {
    if (!(error instanceof Error)) {
      return ErrorType.UNKNOWN;
    }

    const errorMessage = error.message.toLowerCase();

    /* Permanent errors - should not retry */
    const permanentPatterns = [
      'validation',
      'invalid',
      'malformed',
      'parse error',
      'syntax error',
      'missing required',
      'must be',
    ];

    if (permanentPatterns.some(pattern => errorMessage.includes(pattern))) {
      return ErrorType.PERMANENT;
    }

    /* Transient errors - safe to retry */
    const transientPatterns = [
      'timeout',
      'network',
      'connection',
      'econnrefused',
      'enotfound',
      'etimedout',
      'temporary',
    ];

    if (transientPatterns.some(pattern => errorMessage.includes(pattern))) {
      return ErrorType.TRANSIENT;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Handles a single SQS message with proper ACK and error handling
   *
   * @param message - The SQS message to process
   * @throws Error if message processing fails (will trigger retry/DLQ)
   *
   * @description
   * ACK Strategy:
   * - SUCCESS: Message is automatically deleted (ACK) by sqs-consumer
   * - TRANSIENT ERROR: Message is NOT deleted, will retry after visibility timeout
   * - PERMANENT ERROR: Message is NOT deleted but logged, will go to DLQ after max retries
   * - MAX RETRIES: Message automatically goes to DLQ (configured in queue settings)
   */
  private async handleMessage(message: Message): Promise<void> {
    /* Extract message data safely including retry count */
    this.logger.log('Handling message', { message });

    const {
      messageId,
      body: messageBody,
      approximateReceiveCount,
    } = this.extractMessageData(message);

    /* Log processing attempt with retry count */
    this.logger.log(
      `Processing message ${messageId} (attempt ${approximateReceiveCount})`
    );

    try {
      /* Step 1: Validate message body exists */
      if (!messageBody || messageBody === '') {
        throw new Error('Message body is empty - PERMANENT ERROR');
      }

      /* Step 2: Parse JSON */
      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(messageBody);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in message body - PERMANENT ERROR: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
      }

      /* Step 3: Validate notification structure */
      const notification = this.validateNotification(parsedBody);

      /* Step 4: Process the notification (business logic) */
      await this.handleConfigNotification(notification);

      /* SUCCESS: Message will be automatically deleted (ACK) */
      this.logger.log(
        `✓ Successfully processed message ${messageId} after ${approximateReceiveCount} attempt(s)`
      );
    } catch (error) {
      /* Classify error type */
      const errorType = this.classifyError(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      /* Log error with classification and retry info */
      this.logger.error(
        `✗ Failed to process message ${messageId} (attempt ${approximateReceiveCount})`,
        {
          errorType,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          messageId,
          receiveCount: approximateReceiveCount,
        }
      );

      /* Handle based on error type */
      if (errorType === ErrorType.PERMANENT) {
        this.logger.warn(
          `⚠️  PERMANENT ERROR detected for message ${messageId}. ` +
            `This message will continue retrying until max attempts and then go to DLQ. ` +
            `Consider implementing dead-letter processing.`
        );
      } else if (errorType === ErrorType.TRANSIENT) {
        this.logger.log(
          `↻ TRANSIENT ERROR for message ${messageId}. Safe to retry.`
        );
      }

      /* Re-throw to let sqs-consumer handle the retry logic
         - Message will NOT be deleted (no ACK)
         - Will become visible again after visibility timeout (5 minutes)
         - After maxReceiveCount (configured in queue), goes to DLQ automatically */
      throw error;
    }
  }

  /**
   * Validates that the parsed message matches the ConfigNotification structure
   *
   * @param data - The parsed JSON data
   * @returns ConfigNotification if valid
   * @throws Error if validation fails
   */
  private validateNotification(data: unknown): ConfigNotification {
    if (!data || typeof data !== 'object') {
      throw new Error('Notification must be an object');
    }

    const notification = data as Record<string, unknown>;

    if (
      typeof notification.eventType !== 'string' ||
      typeof notification.userId !== 'string' ||
      !notification.config ||
      typeof notification.config !== 'object'
    ) {
      throw new Error('Invalid notification structure');
    }

    return notification as unknown as ConfigNotification;
  }

  /**
   * Handles the configuration notification business logic
   *
   * @param notification - The validated notification object
   *
   * @description
   * This method persists the client configuration to both:
   * 1. Public database (client_configs collection) - Global registry
   * 2. Tenant database (config collection) - Client-specific database
   */
  private async handleConfigNotification(
    notification: ConfigNotification
  ): Promise<void> {
    this.logger.log('Processing configuration notification', {
      eventType: notification.eventType,
      userId: notification.userId,
      configId: notification.config.id,
    });

    try {
      /* Validate that schema field exists */
      if (!notification.config.schema) {
        throw new Error(
          `Configuration missing schema field for client ${notification.config.id}`
        );
      }

      /* Persist configuration to both databases */
      await this.configPersistenceService.saveClientConfig(notification.config);

      this.logger.log('Configuration notification processed successfully', {
        eventType: notification.eventType,
        userId: notification.userId,
        configId: notification.config.id,
        schema: notification.config.schema,
      });
    } catch (error) {
      this.logger.error(
        'Failed to process configuration notification',
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
