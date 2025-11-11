import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Contacts Message Extractor
 *
 * @description
 * Extracts text content from contacts messages.
 * Provides appropriate placeholders for contact information.
 */
export class ContactsMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.CONTACTS
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.CONTACTS;
  }

  /**
   * Extract text from a WhatsApp contacts message
   *
   * @param message WhatsApp message from webhook
   * @returns null (contacts messages don't have text content)
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.CONTACTS) {
      return null;
    }

    // Contacts messages don't have text content
    return null;
  }

  /**
   * Extract text from a stored contacts message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Contacts placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);
    const baseText = this.createPlaceholder('contact', senderRole);

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
