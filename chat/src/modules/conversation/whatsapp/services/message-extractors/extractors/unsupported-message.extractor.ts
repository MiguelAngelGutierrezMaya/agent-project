import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Unsupported Message Extractor
 *
 * @description
 * Handles unsupported message types.
 * Provides fallback placeholders for unknown message types.
 */
export class UnsupportedMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.UNSUPPORTED
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.UNSUPPORTED;
  }

  /**
   * Extract text from a WhatsApp unsupported message
   *
   * @param message WhatsApp message from webhook
   * @returns null (unsupported messages don't have text content)
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.UNSUPPORTED) {
      return null;
    }

    // Unsupported messages don't have text content
    return null;
  }

  /**
   * Extract text from a stored unsupported message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Unsupported message placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);
    const baseText = this.createPlaceholder('unsupported message', senderRole);

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
