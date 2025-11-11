import { BaseMessageExtractor } from '../base-message.extractor';
import type { Message } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { InteractiveMessageType } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { MessageExtractor } from '../message-extractor.interface';

/**
 * Type for interactive content with sections
 */
type InteractiveContentWithSections = {
  action?: {
    sections?: Array<{
      title: string;
      rows: Array<{
        title: string;
      }>;
    }>;
  };
};

/**
 * Interactive Message Extractor
 *
 * @description
 * Extracts text content from interactive messages (list replies, button replies).
 * Handles user selections and provides detailed context.
 */
export class InteractiveMessageExtractor extends BaseMessageExtractor {
  constructor(factory: {
    getExtractor: (type: WhatsappMessageType) => MessageExtractor;
  }) {
    super(factory);
  }

  /**
   * Get the message type this extractor supports
   *
   * @returns WhatsappMessageType.INTERACTIVE
   */
  getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.INTERACTIVE;
  }

  /**
   * Extract text from a WhatsApp interactive message
   *
   * @param message WhatsApp message from webhook
   * @returns Selection details or placeholder
   */
  extractFromWhatsappMessage(message: WhatsappMessage): string | null {
    if (message.type !== WhatsappMessageType.INTERACTIVE) {
      return null;
    }

    const interactiveMessage = message as {
      interactive: {
        type: string;
        list_reply?: { id: string; title: string; description?: string };
        button_reply?: { id: string; title: string };
      };
    };

    const { interactive } = interactiveMessage;

    if (interactive.list_reply) {
      return `Selected: ${interactive.list_reply.title} (ID: ${interactive.list_reply.id})`;
    }

    if (interactive.button_reply) {
      return `Pressed: ${interactive.button_reply.title} (ID: ${interactive.button_reply.id})`;
    }

    return '[Selection made]';
  }

  /**
   * Extract text from a stored interactive message
   *
   * @param message Stored message from database
   * @param schema Optional schema for context extraction
   * @returns Selection details or placeholder
   */
  async extractFromStoredMessage(message: Message): Promise<string> {
    const senderRole = this.getSenderRole(message);

    let baseText: string;
    if (message.interactiveDetails) {
      const { type, selectedItem } = message.interactiveDetails;
      const typeText =
        type === InteractiveMessageType.LIST_REPLY ? 'list' : 'button';
      baseText = `[${senderRole} selected: "${selectedItem.title}" (ID: ${selectedItem.id}) from ${typeText}]`;
    } else if (message.content.interactive?.body?.text) {
      baseText = `[${senderRole} sent interactive list: ${message.content.interactive.body.text}]`;

      const interactiveContent = message.content
        .interactive as InteractiveContentWithSections;

      if (interactiveContent.action?.sections) {
        const optionsText = interactiveContent.action.sections
          .flatMap(section => section.rows.map(row => row.title))
          .join(', ');

        baseText += ` (Options: ${optionsText})`;
      }
    } else {
      baseText = this.createPlaceholder('interactive list', senderRole);
    }

    // Add context if available and schema is provided
    if (message.context) {
      const contextInfo = await this.extractContextInfo(message);
      return contextInfo ? `${baseText} ${contextInfo}` : baseText;
    }

    return baseText;
  }
}
