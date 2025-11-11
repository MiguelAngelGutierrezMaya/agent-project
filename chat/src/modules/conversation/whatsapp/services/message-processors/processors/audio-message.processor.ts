import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '@src/modules/conversation/whatsapp/services/message-processors/base-message.processor';
import {
  type WhatsappMessage,
  type WhatsappAudioMessage,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';

/**
 * Audio Message Processor
 *
 * @description
 * Handles incoming audio messages from WhatsApp users.
 * This includes both regular audio files and voice notes.
 *
 * Responsibilities:
 * - Extract audio metadata (id, mime_type, sha256)
 * - Detect if it's a voice note (voice: true)
 * - Store message reference in database
 * - TODO: Download and store audio file (future enhancement)
 * - TODO: Transcribe voice notes for AI context (future enhancement)
 */
@Injectable()
export class AudioMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(AudioMessageProcessor.name, messageStorage);
  }

  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.AUDIO;
  }

  async process(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    try {
      /* Log processing start */
      this.logProcessingStart(message, clientConfig);

      const audioMessage = message as WhatsappAudioMessage;

      /* Extract audio metadata */
      const { id, mime_type, sha256, voice } = audioMessage.audio;
      const isVoiceNote = voice ?? false;

      this.logger.debug(
        `Audio message - ID: ${id}, Type: ${mime_type}, SHA256: ${sha256}, Voice Note: ${isVoiceNote}`
      );

      /* Process and store the audio message */
      const storedMessageId = await this.storeAudioMessage(
        audioMessage,
        isVoiceNote,
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
   * Store audio message in database
   *
   * @param message Audio message from WhatsApp
   * @param isVoiceNote Whether this is a voice note
   * @param clientConfig Complete client configuration
   * @param conversationId Conversation ID
   * @returns Stored message ID
   * @private
   *
   * @description
   * Saves the audio message to the tenant's messages collection.
   * Voice notes are particularly important for AI bots as they
   * may need transcription to understand user intent.
   */
  private async storeAudioMessage(
    message: WhatsappAudioMessage,
    isVoiceNote: boolean,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<string> {
    this.logger.log(
      `Storing ${isVoiceNote ? 'voice note' : 'audio'} message in ${clientConfig.schema} database for conversation ${conversationId}`
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
        type: WhatsappMessageType.AUDIO,
        content: {
          audio: {
            id: message.audio.id,
            mime_type: message.audio.mime_type,
            sha256: message.audio.sha256,
            voice: isVoiceNote,
          },
        },
        timestamp: new Date(Number(message.timestamp) * 1000),
        context,
      }
    );

    this.logger.debug(`Audio message stored with ID: ${storedMessageId}`);

    return storedMessageId;
  }
}
