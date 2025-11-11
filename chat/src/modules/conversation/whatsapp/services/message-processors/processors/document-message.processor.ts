import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappDocumentMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Document Message Processor
 *
 * @description
 * Handles incoming document messages from WhatsApp users.
 * Documents include PDFs, Word files, Excel spreadsheets, etc.
 *
 * Responsibilities:
 * - Extract document metadata (id, filename, mime_type, sha256)
 * - Extract optional caption
 * - Store message reference in database
 * - TODO: Download and store document file (future enhancement)
 * - TODO: Extract text from documents for AI context (future enhancement)
 */
@Injectable()
export class DocumentMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(DocumentMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.DOCUMENT;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const documentMessage = message as WhatsappDocumentMessage;

      /* Extract document metadata */
      const { id, filename, mime_type, sha256, caption } =
        documentMessage.document;

      this.logger.debug(
        `Document message - ID: ${id}, Filename: ${filename}, Type: ${mime_type}, SHA256: ${sha256}${caption ? `, Caption: "${caption}"` : ''}`
      );

      /* Process and store the document message */
      const storedMessageId = await this.storeDocumentMessage(
        documentMessage,
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
   * Store document message in database
   *
   * @param message Document message from WhatsApp
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the document message to the tenant's messages collection.
   * Documents can be important for context - consider extracting
   * text content for AI to understand user requests better.
   */
  private async storeDocumentMessage(
    message: WhatsappDocumentMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    const { filename } = message.document;

    this.logger.log(
      `Storing document message (${filename}) in ${clientConfig.schema} database for conversation ${conversationId}`
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
        type: WhatsappMessageType.DOCUMENT,
        content: {
          document: {
            id: message.document.id,
            filename: message.document.filename,
            mime_type: message.document.mime_type,
            sha256: message.document.sha256,
            caption: message.document.caption,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Document message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
