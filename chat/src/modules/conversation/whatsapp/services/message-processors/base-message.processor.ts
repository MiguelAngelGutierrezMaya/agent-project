import { Logger } from '@nestjs/common';
import {
  type MessageProcessor,
  type MessageProcessingResult,
} from './message-processor.interface';
import type {
  WhatsappMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import { ServiceError } from '@src/shared/utils/errors/services';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';
import type { MessageContext } from '@src/modules/conversation/whatsapp/domain/models/Message';

/**
 * Base Message Processor
 *
 * @description
 * Abstract base class that provides common helper methods for all message processors.
 * Each subclass must implement the process() method directly.
 *
 * Subclasses must implement:
 * - getSupportedType(): Return the WhatsappMessageType they handle
 * - process(): Handle the complete message processing logic
 * - canProcess(): Check if the processor can handle a message type
 */
export abstract class BaseMessageProcessor implements MessageProcessor {
  protected readonly logger: Logger;
  protected readonly messageStorage: MessageStorageService;

  constructor(loggerContext: string, messageStorage: MessageStorageService) {
    this.logger = new Logger(loggerContext);
    this.messageStorage = messageStorage;
  }

  /**
   * Get the message type this processor supports
   *
   * @returns WhatsappMessageType enum value
   */
  protected abstract getSupportedType(): WhatsappMessageType;

  /**
   * Check if this processor can handle the message
   *
   * @param message WhatsApp message to check
   * @returns true if this processor can handle the message
   */
  canProcess(message: WhatsappMessage): boolean {
    return message.type === this.getSupportedType();
  }

  /**
   * Process the message
   *
   * @param message WhatsApp message
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Processing result
   *
   * @description
   * This method MUST be implemented by each subclass.
   * Throws ServiceError if not implemented.
   */
  process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    throw new ServiceError(
      `Method process() not implemented in ${this.constructor.name} for message type: ${message.type} in client: ${clientConfig.id} (schema: ${clientConfig.schema}), conversationId: ${conversationId}`
    );
  }

  /**
   * Log the start of message processing
   *
   * @param message WhatsApp message being processed
   * @param clientConfig Complete client configuration
   * @protected
   */
  protected logProcessingStart(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema
  ): void {
    this.logger.log(
      `Processing ${message.type} message ID: ${message.id} for client: ${clientConfig.id} (schema: ${clientConfig.schema})`
    );
  }

  /**
   * Log successful processing
   *
   * @param message WhatsApp message that was processed
   * @param result Processing result
   * @protected
   */
  protected logProcessingSuccess(
    message: WhatsappMessage,
    result: MessageProcessingResult
  ): void {
    this.logger.log(
      `Successfully processed ${message.type} message ID: ${message.id}` +
        (result.conversationId
          ? ` (conversation: ${result.conversationId})`
          : '')
    );
  }

  /**
   * Log processing failure
   *
   * @param message WhatsApp message that failed
   * @param result Processing result with error
   * @protected
   */
  protected logProcessingFailure(
    message: WhatsappMessage,
    result: MessageProcessingResult
  ): void {
    this.logger.warn(
      `Failed to process ${message.type} message ID: ${message.id}: ${result.error ?? 'Unknown error'}`
    );
  }

  /**
   * Handle unexpected errors during processing
   *
   * @param message WhatsApp message being processed
   * @param error Error that occurred
   * @returns Failed processing result
   * @protected
   */
  protected handleProcessingError(
    message: WhatsappMessage,
    error: unknown
  ): MessageProcessingResult {
    this.logger.error(
      `Unexpected error processing ${message.type} message ID: ${message.id}`,
      error instanceof Error ? error.stack : String(error)
    );

    return {
      success: false,
      shouldMarkAsRead: false,
      error:
        error instanceof Error ? error.message : 'Unexpected processing error',
    };
  }

  /**
   * Create a successful processing result
   *
   * @param conversationId ID of the conversation
   * @param storedMessageId ID of the stored message
   * @returns Success result
   */
  protected createSuccessResult(
    conversationId?: string,
    storedMessageId?: string
  ): MessageProcessingResult {
    return {
      success: true,
      shouldMarkAsRead: true,
      conversationId,
      storedMessageId,
    };
  }

  /**
   * Create a failed processing result
   *
   * @param error Error message
   * @param shouldMarkAsRead Whether to still mark as read (default: false)
   * @returns Failed result
   */
  protected createFailedResult(
    error: string,
    shouldMarkAsRead = false
  ): MessageProcessingResult {
    return {
      success: false,
      shouldMarkAsRead,
      error,
    };
  }

  /**
   * Extract context information from message if it's a reply with complete replied message
   *
   * @param message WhatsApp message
   * @param schema Tenant schema for database query
   * @returns Context information with replied message or undefined if not a reply
   * @protected
   */
  protected async extractMessageContext(
    message: WhatsappMessage,
    schema: string
  ): Promise<MessageContext | undefined> {
    this.logger.debug(
      `Extracting context for message ${message.id} - Has context: ${!!message.context}`
    );

    if (!message.context) {
      return undefined;
    }

    try {
      // Query the complete replied message from database
      const repliedMessage = await this.messageStorage.getMessageByWhatsAppId(
        message.context.id,
        schema
      );

      return {
        messageId: message.context.id,
        from: message.context.from,
        repliedMessage: repliedMessage || undefined,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to fetch replied message ${message.context.id}: ${error instanceof Error ? error.message : String(error)}`
      );

      // Return context without replied message if query fails
      return {
        messageId: message.context.id,
        from: message.context.from,
      };
    }
  }
}
