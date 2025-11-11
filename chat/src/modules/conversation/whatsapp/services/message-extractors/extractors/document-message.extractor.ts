import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Document Message Extractor
 *
 * @description
 * Extracts text content from document messages.
 * Handles captions and filenames for better context.
 */
export class DocumentMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.DOCUMENT
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.DOCUMENT;
  }

  /**
   * Extract text from a WhatsApp document message
   *
   * @param message WhatsApp message from webhook
   * @returns Document caption or null if no caption
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.DOCUMENT) {
      return null;
    }

    const documentMessage = message as { document: { caption?: string } };
    return documentMessage.document.caption ?? null;
  }

  /**
   * Extract text from a stored document message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Caption text or filename placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);

    let baseText: string;
    if (message.content.document?.caption) {
      baseText = `[${senderRole} sent a document with caption: ${message.content.document.caption}]`;
    } else {
      const filename = message.content.document?.filename ?? 'file';
      baseText = this.createPlaceholder('document', senderRole, filename);
    }

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
