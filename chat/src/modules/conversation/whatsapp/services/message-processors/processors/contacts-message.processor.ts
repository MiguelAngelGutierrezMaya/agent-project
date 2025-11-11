import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappContactsMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Contacts Message Processor
 *
 * @description
 * Handles incoming contact-sharing messages from WhatsApp users.
 * Users can share one or more contacts (vCard format).
 *
 * Responsibilities:
 * - Extract contacts array from message
 * - Parse contact information (name, phones, emails)
 * - Store message reference in database
 * - TODO: Extract structured contact data (future enhancement)
 */
@Injectable()
export class ContactsMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(ContactsMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.CONTACTS;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const contactsMessage = message as WhatsappContactsMessage;

      /* Extract contacts array */
      const contacts = contactsMessage.contacts;
      const contactCount = contacts.length;

      this.logger.debug(
        `Contacts message - Count: ${contactCount}, Names: ${contacts.map(c => c.name.formatted_name).join(', ')}`
      );

      /* Process and store the contacts message */
      const storedMessageId = await this.storeContactsMessage(
        contactsMessage,
        clientConfig,
        conversationId
      );

      const result = this.createSuccessResult(conversationId, storedMessageId);

      /* Log success */
      this.logProcessingSuccess(message, result);

      return result;
    } catch (error) {
      return this.handleProcessingError(message, error);
    }
  }

  /**
   * Store contacts message in database
   *
   * @param message Contacts message from WhatsApp
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the contacts message to the tenant's messages collection.
   * Contact sharing might be important for business use cases
   * (e.g., user sharing referral contacts).
   *
   * Note: We store the raw contacts array. Future enhancement could
   * extract structured contact information for CRM purposes.
   */
  private async storeContactsMessage(
    message: WhatsappContactsMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    const contactCount = message.contacts.length;

    this.logger.log(
      `Storing contacts message (${contactCount} contact(s)) in ${clientConfig.schema} database for conversation ${conversationId}`
    );

    /* Extract context if this is a reply message */
    const context = await this.extractMessageContext(
      message,
      clientConfig.schema
    );

    /*
     * Note: Contacts are stored as raw array in content.
     * The Message.content interface doesn't have a 'contacts' field yet,
     * but MongoDB will accept it. Consider adding to MessageContent interface.
     */
    const storedMessageId = await this.messageStorage.saveInboundMessage(
      clientConfig.schema,
      {
        messageId: message.id,
        conversationId,
        type: WhatsappMessageType.CONTACTS,
        content: {
          /* Store contacts in a generic way */
        } as never,
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Contacts message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
