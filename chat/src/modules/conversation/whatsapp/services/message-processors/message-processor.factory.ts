import { Injectable, Logger } from '@nestjs/common';
import type { MessageProcessor } from './message-processor.interface';
import type { WhatsappMessage } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import { MessageStorageService } from '@src/modules/conversation/whatsapp/services/message-storage.service';
import { TextMessageProcessor } from './processors/text-message.processor';
import { ImageMessageProcessor } from './processors/image-message.processor';
import { AudioMessageProcessor } from './processors/audio-message.processor';
import { VideoMessageProcessor } from './processors/video-message.processor';
import { DocumentMessageProcessor } from './processors/document-message.processor';
import { StickerMessageProcessor } from './processors/sticker-message.processor';
import { ContactsMessageProcessor } from './processors/contacts-message.processor';
import { InteractiveMessageProcessor } from './processors/interactive-message.processor';
import { ServiceError } from '@src/shared/utils/errors/services';

/**
 * Message Processor Factory
 *
 * @description
 * Factory that creates and returns the appropriate message processor
 * based on the message type. Implements the Factory Method pattern.
 *
 * Benefits:
 * - Centralized processor creation logic
 * - Lazy initialization (processors created only when needed)
 * - Easy to add new processors without modifying existing code
 * - Provides fallback for unknown message types
 *
 * Usage:
 * ```typescript
 * const processor = this.factory.getProcessor(message);
 * const result = await processor.process(message, clientInfo);
 * ```
 */
@Injectable()
export class MessageProcessorFactory {
  private readonly logger = new Logger(MessageProcessorFactory.name);
  private readonly processors: MessageProcessor[];

  constructor(private readonly messageStorage: MessageStorageService) {
    /* Initialize processors with injected dependencies */
    this.processors = [
      new TextMessageProcessor(messageStorage),
      new ImageMessageProcessor(messageStorage),
      new AudioMessageProcessor(messageStorage),
      new VideoMessageProcessor(messageStorage),
      new DocumentMessageProcessor(messageStorage),
      new StickerMessageProcessor(messageStorage),
      new ContactsMessageProcessor(messageStorage),
      new InteractiveMessageProcessor(messageStorage),
    ];

    this.logger.log(
      `Initialized MessageProcessorFactory with ${this.processors.length} processors`
    );
  }

  /**
   * Get the appropriate processor for a message
   *
   * @param message WhatsApp message to process
   * @returns MessageProcessor that can handle this message type
   * @throws Error if no processor found for message type
   *
   * @description
   * Iterates through registered processors and returns the first one
   * that can handle the message type (via canProcess() method).
   *
   * If no processor is found, throws an error. This should never happen
   * if all message types have corresponding processors.
   */
  getProcessor(message: WhatsappMessage): MessageProcessor {
    /* Find processor that can handle this message type */
    const processor = this.processors.find(p => p.canProcess(message));

    if (!processor) {
      this.logger.error(
        `No processor found for message type: ${message.type}, Message ID: ${message.id}`
      );
      throw new ServiceError(
        `No processor available for message type: ${message.type}`
      );
    }

    this.logger.debug(
      `Selected ${processor.constructor.name} for message type: ${message.type}`
    );

    return processor;
  }

  /**
   * Check if a processor exists for a message type
   *
   * @param message WhatsApp message to check
   * @returns true if a processor can handle this message
   *
   * @description
   * Useful for validation before attempting to process a message.
   */
  hasProcessor(message: WhatsappMessage): boolean {
    return this.processors.some(p => p.canProcess(message));
  }

  /**
   * Get all registered processors
   *
   * @returns Array of all registered processors
   *
   * @description
   * Useful for testing and debugging.
   */
  getAllProcessors(): MessageProcessor[] {
    return [...this.processors];
  }
}
