import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Text Message Extractor
 *
 * @description
 * Extracts text content from text messages.
 * Handles both incoming WhatsApp messages and stored database messages.
 */
export class TextMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.TEXT
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.TEXT;
  }

  /**
   * Extract text from a WhatsApp text message
   *
   * @param message WhatsApp message from webhook
   * @returns Text body or null if not a text message
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.TEXT) {
      return null;
    }

    const textMessage = message as { text: { body: string } };
    return textMessage.text.body;
  }

  /**
   * Extract text from a stored text message
   *
   * @param message Stored message from database
   * @returns Text body with context or placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const textBody = message.content.text?.body;

    if (!textBody) {
      return '[Empty text message]';
    }

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${textBody} ${contextInfo}` : textBody;
    }

    return textBody;
  }
}
