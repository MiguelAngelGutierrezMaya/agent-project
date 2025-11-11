import { Logger } from '@nestjs/common';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { MessageSender } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { MessageExtractor } from './message-extractor.interface';
import type { AIMessage } from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';
import { AIMessageRole } from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';

/**
 * Base Message Extractor
 *
 * @description
 * Abstract base class for message extractors.
 * Provides common functionality and enforces the Strategy pattern.
 *
 * Each concrete extractor should:
 * 1. Extend this base class
 * 2. Implement getSupportedType()
 * 3. Implement extractFromWhatsappMessage()
 * 4. Implement extractFromStoredMessage()
 */
export abstract class BaseMessageExtractor implements MessageExtractor {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly factory: {
      getExtractor: (type: WhatsappMessageType) => MessageExtractor;
    }
  ) {}

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType enum value
   * @abstract
   */
  abstract getSupportedType(): WhatsappMessageType;

  /**
   * Extract text from a WhatsApp message (incoming)
   *
   * @param message WhatsApp message from webhook
   * @returns Extracted text or null if no text content
   * @abstract
   */
  abstract extractFromWhatsappMessage(message: WhatsappMessage): string | null;

  /**
   * Extract text from a stored message (from database)
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Extracted text or placeholder
   * @abstract
   */
  abstract extractFromStoredMessage(
    message: Message,
    schema?: string
  ): Promise<string>;

  /**
   * Determine if the message sender is a user or bot
   *
   * @param message Stored message from database
   * @returns true if sender is user, false if bot
   * @protected
   */
  protected isUserSender(message: Message): boolean {
    return message.sender === MessageSender.USER;
  }

  /**
   * Get sender role for context
   *
   * @param message Stored message from database
   * @returns "User" or "Bot" string
   * @protected
   */
  protected getSenderRole(message: Message): string {
    return this.isUserSender(message) ? 'User' : 'Bot';
  }

  /**
   * Create a placeholder text for non-text message types
   *
   * @param messageType Message type
   * @param senderRole Sender role (User/Bot)
   * @param additionalInfo Additional information to include
   * @returns Formatted placeholder text
   * @protected
   */
  protected createPlaceholder(
    messageType: string,
    senderRole: string,
    additionalInfo?: string
  ): string {
    const info = additionalInfo ? ` (${additionalInfo})` : '';
    return `[${senderRole} sent a ${messageType}${info}]`;
  }

  /**
   * Create AI message from stored message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Complete AI message object with role, content, and timestamp
   * @description
   * Common implementation for creating AI messages.
   * Determines role based on sender and delegates content extraction to subclasses.
   */
  async createAIMessage(message: Message, schema?: string): Promise<AIMessage> {
    const role = this.isUserSender(message)
      ? AIMessageRole.USER
      : AIMessageRole.ASSISTANT;

    const content = await this.extractFromStoredMessage(message, schema);

    return {
      role,
      content,
      timestamp: message.timestamp,
    };
  }

  /**
   * Extract context information from a message with reply context
   *
   * @param message Stored message from database
   * @param schema Tenant schema
   * @returns Context text or null if no context
   * @protected
   * @description
   * If the message has a context with repliedMessage, extracts its text for context.
   * No database query needed as repliedMessage is already loaded by the processor.
   */
  protected async extractContextInfo(message: Message): Promise<string | null> {
    if (!message.context?.repliedMessage) {
      return null;
    }

    try {
      // Use the same extractor pattern to get text from replied message
      const contextExtractor = this.factory.getExtractor(
        message.context.repliedMessage.type
      );
      const contextText = await contextExtractor.extractFromStoredMessage(
        message.context.repliedMessage
      );

      return `(replying to: ${contextText})`;
    } catch (error) {
      this.logger.error(
        `Error extracting context for message ${message.messageId}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }
}
