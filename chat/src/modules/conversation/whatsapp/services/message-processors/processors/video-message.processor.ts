import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappVideoMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Video Message Processor
 *
 * @description
 * Handles incoming video messages from WhatsApp users.
 *
 * Responsibilities:
 * - Extract video metadata (id, mime_type, sha256)
 * - Extract optional caption
 * - Store message reference in database
 * - TODO: Download and store video file (future enhancement)
 */
@Injectable()
export class VideoMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(VideoMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.VIDEO;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const videoMessage = message as WhatsappVideoMessage;

      /* Extract video metadata */
      const { id, mime_type, sha256, caption } = videoMessage.video;

      this.logger.debug(
        `Video message - ID: ${id}, Type: ${mime_type}, SHA256: ${sha256}${caption ? `, Caption: "${caption}"` : ''}`
      );

      /* Process and store the video message */
      const storedMessageId = await this.storeVideoMessage(
        videoMessage,
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
   * Store video message in database
   *
   * @param message Video message from WhatsApp
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the video message to the tenant's messages collection.
   */
  private async storeVideoMessage(
    message: WhatsappVideoMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    this.logger.log(
      `Storing video message in ${clientConfig.schema} database for conversation ${conversationId}`
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
        type: WhatsappMessageType.VIDEO,
        content: {
          video: {
            id: message.video.id,
            mime_type: message.video.mime_type,
            sha256: message.video.sha256,
            caption: message.video.caption,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Video message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
