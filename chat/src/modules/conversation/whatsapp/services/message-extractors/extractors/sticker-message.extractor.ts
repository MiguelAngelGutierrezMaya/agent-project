import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Sticker Message Extractor
 *
 * @description
 * Extracts text content from sticker messages.
 * Provides appropriate placeholders for non-text content.
 */
export class StickerMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.STICKER
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.STICKER;
  }

  /**
   * Extract text from a WhatsApp sticker message
   *
   * @param message WhatsApp message from webhook
   * @returns null (sticker messages don't have text content)
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.STICKER) {
      return null;
    }

    // Sticker messages don't have text content
    return null;
  }

  /**
   * Extract text from a stored sticker message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Sticker placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);
    const baseText = this.createPlaceholder('sticker', senderRole);

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
