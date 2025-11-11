import { Injectable, Logger } from '@nestjs/common';
import { WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { MessageExtractor } from './message-extractor.interface';

/* Import all extractors */
import { TextMessageExtractor } from './extractors/text-message.extractor';
import { ImageMessageExtractor } from './extractors/image-message.extractor';
import { VideoMessageExtractor } from './extractors/video-message.extractor';
import { DocumentMessageExtractor } from './extractors/document-message.extractor';
import { AudioMessageExtractor } from './extractors/audio-message.extractor';
import { StickerMessageExtractor } from './extractors/sticker-message.extractor';
import { InteractiveMessageExtractor } from './extractors/interactive-message.extractor';
import { ContactsMessageExtractor } from './extractors/contacts-message.extractor';
import { UnsupportedMessageExtractor } from './extractors/unsupported-message.extractor';

/**
 * Message Extractor Factory
 *
 * @description
 * Factory pattern implementation for message extractors.
 * Manages and provides the appropriate extractor for each message type.
 *
 * Responsibilities:
 * - Register all available extractors
 * - Provide extractor instances based on message type
 * - Handle fallback for unknown message types
 * - Ensure single instance per extractor type (singleton pattern)
 */
@Injectable()
export class MessageExtractorFactory {
  private readonly logger = new Logger(MessageExtractorFactory.name);

  /* Extractors registry - singleton instances */
  private readonly extractors: Map<WhatsappMessageType, MessageExtractor> =
    new Map();

  constructor() {
    this.initializeExtractors();
  }

  /**
   * Initialize all available extractors
   *
   * @private
   * @description
   * Registers all message extractors in the factory.
   * Each extractor is instantiated once and reused.
   */
  private initializeExtractors(): void {
    const extractorInstances: MessageExtractor[] = [
      new TextMessageExtractor(this),
      new ImageMessageExtractor(this),
      new VideoMessageExtractor(this),
      new DocumentMessageExtractor(this),
      new AudioMessageExtractor(this),
      new StickerMessageExtractor(this),
      new InteractiveMessageExtractor(this),
      new ContactsMessageExtractor(this),
      new UnsupportedMessageExtractor(this),
    ];

    /* Register each extractor */
    for (const extractor of extractorInstances) {
      const messageType = extractor.getSupportedType();
      this.extractors.set(messageType, extractor);

      this.logger.debug(
        `Registered extractor for message type: ${messageType}`
      );
    }

    this.logger.log(`Initialized ${this.extractors.size} message extractors`);
  }

  /**
   * Get extractor for a specific message type
   *
   * @param messageType WhatsApp message type
   * @returns Message extractor instance
   *
   * @description
   * Returns the appropriate extractor for the given message type.
   * Falls back to UnsupportedMessageExtractor if type is not found.
   *
   * @example
   * const extractor = factory.getExtractor(WhatsappMessageType.TEXT);
   * const text = extractor.extractFromWhatsappMessage(message);
   */
  getExtractor(messageType: WhatsappMessageType): MessageExtractor {
    const extractor = this.extractors.get(messageType);

    if (!extractor) {
      this.logger.warn(
        `No extractor found for message type: ${messageType}, using fallback`
      );
      return this.extractors.get(WhatsappMessageType.UNSUPPORTED)!;
    }

    return extractor;
  }

  /**
   * Get all available extractors
   *
   * @returns Map of all registered extractors
   *
   * @description
   * Returns a copy of the extractors registry for debugging or inspection.
   */
  getAllExtractors(): Map<WhatsappMessageType, MessageExtractor> {
    return new Map(this.extractors);
  }

  /**
   * Check if extractor exists for message type
   *
   * @param messageType WhatsApp message type
   * @returns true if extractor exists, false otherwise
   */
  hasExtractor(messageType: WhatsappMessageType): boolean {
    return this.extractors.has(messageType);
  }
}
