import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { AIMessage } from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';

/**
 * Message Extractor Interface
 *
 * @description
 * Defines the contract for extracting AI messages from different message types.
 * Each message type has its own specialized extractor implementation.
 *
 * Strategy Pattern: Each extractor encapsulates the extraction logic for a specific message type.
 */
export interface MessageExtractor {
  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType enum value
   */
  getSupportedType(): WhatsappMessageType;

  /**
   * Extract text from a WhatsApp message (incoming)
   *
   * @param message WhatsApp message from webhook
   * @returns Extracted text or null if no text content
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null;

  /**
   * Extract text from a stored message (from database)
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Extracted text or placeholder
   */
  extractFromStoredMessage(message: Message, schema?: string): Promise<string>;

  /**
   * Create AI message from stored message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Complete AI message object with role, content, and timestamp
   */
  createAIMessage(message: Message, schema?: string): Promise<AIMessage>;
}
