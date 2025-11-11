import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappStickerMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Sticker Message Processor
 *
 * @description
 * Handles incoming sticker messages from WhatsApp users.
 * Stickers are a form of visual communication.
 *
 * Responsibilities:
 * - Extract sticker metadata (id, mime_type, sha256, animated)
 * - Store message reference in database
 * - Detect if sticker is animated
 *
 * Note: Stickers typically don't need to be understood by AI,
 * but they should still be logged for conversation completeness.
 */
@Injectable()
export class StickerMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(StickerMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.STICKER;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const stickerMessage = message as WhatsappStickerMessage;

      /* Extract sticker metadata */
      const { id, mime_type, sha256, animated } = stickerMessage.sticker;

      this.logger.debug(
        `Sticker message - ID: ${id}, Type: ${mime_type}, SHA256: ${sha256}, Animated: ${animated}`
      );

      /* Process and store the sticker message */
      const storedMessageId = await this.storeStickerMessage(
        stickerMessage,
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
   * Store sticker message in database
   *
   * @param message Sticker message from WhatsApp
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the sticker message to the tenant's messages collection.
   * Stickers don't typically need AI processing, but should
   * be stored for conversation history completeness.
   */
  private async storeStickerMessage(
    message: WhatsappStickerMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    this.logger.log(
      `Storing sticker message in ${clientConfig.schema} database for conversation ${conversationId}`
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
        type: WhatsappMessageType.STICKER,
        content: {
          sticker: {
            id: message.sticker.id,
            mime_type: message.sticker.mime_type,
            sha256: message.sticker.sha256,
            animated: message.sticker.animated,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Sticker message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
