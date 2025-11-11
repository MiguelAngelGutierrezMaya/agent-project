import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Video Message Extractor
 *
 * @description
 * Extracts text content from video messages.
 * Handles captions and provides appropriate placeholders.
 */
export class VideoMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.VIDEO
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.VIDEO;
  }

  /**
   * Extract text from a WhatsApp video message
   *
   * @param message WhatsApp message from webhook
   * @returns Video caption or null if no caption
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.VIDEO) {
      return null;
    }

    const videoMessage = message as { video: { caption?: string } };
    return videoMessage.video.caption ?? null;
  }

  /**
   * Extract text from a stored video message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Caption text or placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);

    let baseText: string;
    if (message.content.video?.caption) {
      baseText = `[${senderRole} sent a video with caption: ${message.content.video.caption}]`;
    } else {
      baseText = this.createPlaceholder('video', senderRole);
    }

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
