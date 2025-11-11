import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Audio Message Extractor
 *
 * @description
 * Extracts text content from audio messages.
 * Distinguishes between voice notes and regular audio.
 */
export class AudioMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.AUDIO
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.AUDIO;
  }

  /**
   * Extract text from a WhatsApp audio message
   *
   * @param message WhatsApp message from webhook
   * @returns null (audio messages don't have text content)
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.AUDIO) {
      return null;
    }

    // Audio messages don't have text content
    return null;
  }

  /**
   * Extract text from a stored audio message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Voice note or audio placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);
    const isVoice = message.content.audio?.voice ? 'voice note' : 'audio';

    const baseText = this.createPlaceholder(isVoice, senderRole);

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
