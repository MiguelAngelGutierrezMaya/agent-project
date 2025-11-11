import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappImageMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Image Message Processor
 *
 * @description
 * Handles incoming image messages from WhatsApp users.
 *
 * Responsibilities:
 * - Extract image metadata (id, mime_type, sha256)
 * - Extract optional caption
 * - Store message reference in database
 * - TODO: Download and store image file (future enhancement)
 */
@Injectable()
export class ImageMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(ImageMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.IMAGE;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const imageMessage = message as WhatsappImageMessage;

      /* Extract image metadata */
      const { id, mime_type, sha256, caption } = imageMessage.image;

      this.logger.debug(
        `Image message - ID: ${id}, Type: ${mime_type}, SHA256: ${sha256}${caption ? `, Caption: "${caption}"` : ''}`
      );

      /* Process and store the image message */
      const storedMessageId = await this.storeImageMessage(
        imageMessage,
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
   * Store image message in database
   *
   * @param message Image message from WhatsApp
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the image message to the tenant's messages collection.
   * Note: The image 'id' from WhatsApp can be used to download the file
   * via the WhatsApp Business API media endpoint.
   */
  private async storeImageMessage(
    message: WhatsappImageMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    this.logger.log(
      `Storing image message in ${clientConfig.schema} database for conversation ${conversationId}`
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
        type: WhatsappMessageType.IMAGE,
        content: {
          image: {
            id: message.image.id,
            mime_type: message.image.mime_type,
            sha256: message.image.sha256,
            caption: message.image.caption,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Image message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
