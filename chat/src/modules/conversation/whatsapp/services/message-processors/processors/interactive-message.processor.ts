import { Injectable } from '@nestjs/common';
import { BaseMessageProcessor } from '../base-message.processor';
import {
  WhatsappMessageType,
  WhatsappInteractiveType,
  type WhatsappInteractiveMessage,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { InteractiveMessageType } from '@src/modules/conversation/whatsapp/domain/models/Message';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';
import type { MessageProcessingResult } from '@src/modules/conversation/whatsapp/services/message-processors/message-processor.interface';

/**
 * Interactive Message Processor
 *
 * @description
 * Processes interactive messages from WhatsApp (list replies, button replies).
 * These messages occur when users interact with interactive elements sent by the bot.
 *
 * Examples:
 * - User selects an option from a list (list_reply)
 * - User clicks a button (button_reply)
 */
@Injectable()
export class InteractiveMessageProcessor extends BaseMessageProcessor {
  constructor(messageStorage: MessageStorageService) {
    super(InteractiveMessageProcessor.name, messageStorage);
  }

  /**
   * Get the message type this processor supports
   *
   * @returns WhatsappMessageType enum value
   */
  protected getSupportedType(): WhatsappMessageType {
    return WhatsappMessageType.INTERACTIVE;
  }

  /**
   * Process interactive message
   *
   * @param message Interactive message from user
   * @param clientConfig Client configuration
   * @param conversationId Conversation ID
   * @returns Processing result
   */
  async process(
    message: WhatsappInteractiveMessage,
    clientConfig: ConfigWithSchema,
    conversationId: string
  ): Promise<MessageProcessingResult> {
    /* Log processing start */
    this.logProcessingStart(message, clientConfig);

    try {
      /* Extract interaction details */
      const interactionType = message.interactive.type;
      const interactionDetails = this.extractInteractionDetails(message);
      const context = await this.extractMessageContext(
        message,
        clientConfig.schema
      );

      this.logger.debug(
        `Interactive message type: ${interactionType}, Details: ${JSON.stringify(interactionDetails)}`
      );

      /* Store the interactive message with complete details */
      const storedMessageId = await this.messageStorage.saveInboundMessage(
        clientConfig.schema,
        {
          conversationId,
          type: WhatsappMessageType.INTERACTIVE,
          content: {
            text: {
              body: `Selected: ${interactionDetails.selectedItem.title}`,
            },
          },
          timestamp: new Date(Number(message.timestamp) * 1000),
          messageId: message.id,
          context,
          interactiveDetails: interactionDetails,
        }
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
   * Extract interaction details for AI processing
   *
   * @param message Interactive message
   * @returns Extracted interaction details
   * @private
   *
   * @description
   * Uses extractor map pattern for better scalability and maintainability.
   * Each interactive type has its own extractor function.
   */
  private extractInteractionDetails(message: WhatsappInteractiveMessage) {
    const { interactive } = message;

    /* Interaction extractors by WhatsApp interactive type */
    const interactionExtractors: Record<
      WhatsappInteractiveType,
      (interactive: WhatsappInteractiveMessage['interactive']) => {
        type: InteractiveMessageType;
        selectedItem: {
          id: string;
          title: string;
          description?: string;
        };
      }
    > = {
      [WhatsappInteractiveType.LIST_REPLY]: interactive => ({
        type: InteractiveMessageType.LIST_REPLY,
        selectedItem: {
          id: interactive.list_reply?.id || '',
          title: interactive.list_reply?.title || '',
          description: interactive.list_reply?.description,
        },
      }),

      [WhatsappInteractiveType.BUTTON_REPLY]: interactive => ({
        type: InteractiveMessageType.BUTTON_REPLY,
        selectedItem: {
          id: interactive.button_reply?.id || '',
          title: interactive.button_reply?.title || '',
        },
      }),
    };

    /* Get extractor for interactive type */
    const extractor = interactionExtractors[interactive.type];

    if (!extractor) {
      this.logger.warn(
        `No interaction extractor found for type: ${interactive.type}`
      );
      return {
        type: InteractiveMessageType.LIST_REPLY,
        selectedItem: {
          id: 'unknown',
          title: 'Unknown selection',
        },
      };
    }

    return extractor(interactive);
  }
}
