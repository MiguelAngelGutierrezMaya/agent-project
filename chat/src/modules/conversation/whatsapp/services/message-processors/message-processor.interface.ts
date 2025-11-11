import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';

/**
 * Result of message processing
 *
 * @description
 * Contains information about the processing result,
 * including whether the message should be marked as read.
 */
export interface MessageProcessingResult {
  /** Whether the processing was successful */
  success: boolean;

  /** Whether the message should be marked as read in WhatsApp */
  shouldMarkAsRead: boolean;

  /** Optional error message if processing failed */
  error?: string;

  /** ID of the stored message in database (if applicable) */
  storedMessageId?: string;

  /** ID of the conversation this message belongs to */
  conversationId?: string;
}

/**
 * Message Processor Interface
 *
 * @description
 * Defines the contract for all message type processors.
 * Each message type (text, image, audio, etc.) has its own processor
 * implementing this interface.
 *
 * Benefits:
 * - Single Responsibility: Each processor handles one message type
 * - Open/Closed Principle: Add new types without modifying existing code
 * - Testability: Easy to mock and unit test individual processors
 */
export interface MessageProcessor {
  /**
   * Process an incoming WhatsApp message
   *
   * @param message WhatsApp message from webhook
   * @param clientConfig Complete client configuration (schema, AI config, social config, etc.)
   * @param conversationId ID of the conversation this message belongs to
   * @returns Processing result with success status and metadata
   *
   * @description
   * This method should:
   * 1. Extract relevant data from the message
   * 2. Store the message in the client's tenant database (using schema from clientConfig)
   * 3. Return processing result
   *
   * Note: The conversation is already created/updated before this method is called.
   *
   * @throws Should NOT throw errors - return error in result instead
   */
  process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult>;

  /**
   * Check if this processor can handle the given message type
   *
   * @param message WhatsApp message to check
   * @returns true if this processor can handle the message
   *
   * @description
   * Used by the factory to determine which processor to use.
   * Should check the message.type field.
   */
  canProcess(message: WhatsappMessage): boolean;
}
