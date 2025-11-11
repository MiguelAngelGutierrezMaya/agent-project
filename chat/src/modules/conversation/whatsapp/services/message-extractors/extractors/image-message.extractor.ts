import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Image Message Extractor
 *
 * @description
 * Extracts text content from image messages.
 * Handles captions and provides appropriate placeholders.
 */
export class ImageMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.IMAGE
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.IMAGE;
  }

  /**
   * Extract text from a WhatsApp image message
   *
   * @param message WhatsApp message from webhook
   * @returns Image caption or null if no caption
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.IMAGE) {
      return null;
    }

    const imageMessage = message as { image: { caption?: string } };
    return imageMessage.image.caption ?? null;
  }

  /**
   * Extract text from a stored image message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Caption text or placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);

    let baseText: string;
    if (message.content.image?.caption) {
      baseText = `[${senderRole} sent an image with caption: ${message.content.image.caption}]`;
    } else {
      baseText = this.createPlaceholder('image', senderRole);
    }

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
