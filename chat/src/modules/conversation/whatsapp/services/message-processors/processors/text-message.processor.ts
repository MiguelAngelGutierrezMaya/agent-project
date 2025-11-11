import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappTextMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Text Message Processor
 *
 * @description
 * Handles incoming text messages from WhatsApp users.
 * This is the most common message type.
 *
 * Responsibilities:
 * - Extract text body from message
 * - Store message in tenant database
 * - Update/create conversation
 * - Update WhatsApp window expiration
 */
@Injectable()
export class TextMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(TextMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.TEXT;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const textMessage = message as WhatsappTextMessage;

      /* Extract text content */
      const textBody = textMessage.text.body;

      this.logger.debug(
        `Text message content: "${textBody.substring(0, 100)}${textBody.length > 100 ? '...' : ''}"`
      );

      /* Process and store the text message */
      const storedMessageId = await this.storeTextMessage(
        textMessage,
        textBody,
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
   * Store text message in database
   *
   * @param message Text message from WhatsApp
   * @param textBody Extracted text content
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the text message to the tenant's messages collection.
   */
  private async storeTextMessage(
    message: WhatsappTextMessage,
    textBody: string,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    this.logger.log(
      `Storing text message in ${clientConfig.schema} database for conversation ${conversationId}`
    );

    /* Extract context if this is a reply message */
    const context = await this.extractMessageContext(
      message,
      clientConfig.schema
    );

    const storedMessageId = await this.messageStorage.saveInboundMessage(
      clientConfig.schema,
      {
        messageId: message.id,
        conversationId,
        type: WhatsappMessageType.TEXT,
        content: {
          text: {
            body: textBody,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Text message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
