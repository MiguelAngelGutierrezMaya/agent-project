import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConnectionService } from '@shared/persistence/mongo/database-connection.service';
import type { Collection } from 'mongoose';
import {
  type Message,
  type MessageContent,
  type MessageAIMetadata,
  type MessageContext,
  type InteractiveDetails,
  MessageDirection,
  MessageSender,
  MessageStatus,
} from '@src/modules/conversation/whatsapp/domain/models/Message';
import { type WhatsappMessageType } from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';

/**
 * DTO for creating a message
 */
export interface CreateMessageDTO {
  messageId: string;
  conversationId: string;
  type: WhatsappMessageType;
  content: MessageContent;
  timestamp: Date;
  context?: MessageContext;
  interactiveDetails?: InteractiveDetails;
}

/**
 * DTO for creating an outbound message
 */
export interface CreateOutboundMessageDTO {
  conversationId: string;
  type: WhatsappMessageType;
  content: MessageContent;
  timestamp: Date;
  messageId?: string;
  sender?: MessageSender;
  whatsappMessageId?: string;
  aiMetadata?: MessageAIMetadata;
}

/**
 * Message Storage Service
 *
 * @description
 * Manages message persistence in tenant-specific MongoDB databases.
 * Uses DatabaseConnectionService to connect to the correct tenant database.
 */
@Injectable()
export class MessageStorageService {
  private readonly logger = new Logger(MessageStorageService.name);
  private readonly COLLECTION_NAME = 'messages';

  constructor(
    private readonly dbConnectionService: DatabaseConnectionService
  ) {}

  /**
   * Save an inbound message from a user
   *
   * @param schema Tenant database schema
   * @param dto Message data
   * @returns Stored message ID
   *
   * @description
   * Stores a user message in the tenant's messages collection using upsert.
   * Automatically sets direction=inbound and sender=user.
   * Follows the Message domain model structure exactly.
   */
  async saveInboundMessage(
    schema: string,
    dto: CreateMessageDTO
  ): Promise<string> {
    this.logger.log(
      `Saving inbound message ${dto.messageId} to schema: ${schema}`
    );

    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      // Generate internal message ID for consistency
      const internalMessageId = `${MessageSender.USER}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const whatsappMessageId = dto.messageId; // The dto.messageId is actually the WhatsApp ID

      /*
       * UPSERT operation (single query)
       * Prevents duplicates and handles race conditions atomically
       */
      const result = await messagesCollection.findOneAndUpdate(
        /* Query: Find by WhatsApp message ID */
        { whatsappMessageId: whatsappMessageId },

        /* Update operations */
        {
          /* Only set these fields on INSERT (prevents overwriting existing) */
          $setOnInsert: {
            messageId: internalMessageId,
            whatsappMessageId: whatsappMessageId,
            conversationId: dto.conversationId,
            direction: MessageDirection.INBOUND,
            sender: MessageSender.USER,
            type: dto.type,
            content: dto.content,
            timestamp: dto.timestamp,
            context: dto.context,
            interactiveDetails: dto.interactiveDetails,
            /* Initialize optional fields as per Message model */
            status: undefined,
            aiMetadata: undefined,
            error: undefined,
            readAt: undefined,
          },
        },

        /* Options */
        {
          upsert: true, // Create if doesn't exist
          returnDocument: 'after', // Return the document
        }
      );

      if (!result) {
        throw new Error(`Failed to upsert message ${dto.messageId}`);
      }

      const wasCreated = !result.lastModifiedCount;

      this.logger.log(
        wasCreated
          ? `Created inbound message with ID: ${internalMessageId}`
          : `Message ${whatsappMessageId} already exists, returning existing ID: ${internalMessageId}`
      );

      return internalMessageId;
    } catch (error) {
      this.logger.error(
        `Error saving inbound message ${dto.messageId} to schema ${schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Save an outbound message
   *
   * @param schema Tenant database schema
   * @param dto Message data
   * @returns Stored message ID
   *
   * @description
   * Stores an outbound message (from bot, human agent, or system).
   * Automatically sets direction=outbound.
   * Sender defaults to BOT if not specified.
   * Follows the Message domain model structure exactly.
   */
  async saveOutboundMessage(
    schema: string,
    dto: CreateOutboundMessageDTO
  ): Promise<string> {
    const sender = dto.sender ?? MessageSender.BOT;

    this.logger.log(
      `Saving outbound message (sender: ${sender}) to schema: ${schema}`
    );

    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const generatedMessageId = `${sender}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      /* Create message document following Message domain model */
      const messageDoc: Partial<Message> = {
        messageId: generatedMessageId,
        conversationId: dto.conversationId,
        direction: MessageDirection.OUTBOUND,
        sender,
        type: dto.type,
        content: dto.content,
        timestamp: dto.timestamp,
        /* WhatsApp message ID (wamid) from Meta API */
        whatsappMessageId: dto.whatsappMessageId,
        /* Initial status for outbound messages */
        status: dto.whatsappMessageId
          ? MessageStatus.SENT
          : MessageStatus.SENDING,
        /* AI metadata for bot-generated messages */
        aiMetadata: dto.aiMetadata,
        /* Optional fields */
        error: undefined,
        readAt: undefined,
      };

      const result = await messagesCollection.insertOne(messageDoc);

      if (!result.insertedId) {
        throw new Error(
          `Failed to save outbound message ${generatedMessageId}`
        );
      }

      this.logger.log(
        `Saved outbound message (${sender}) with ID: ${generatedMessageId}${dto.whatsappMessageId ? ` | wamid: ${dto.whatsappMessageId}` : ''}`
      );

      return generatedMessageId;
    } catch (error) {
      this.logger.error(
        `Error saving outbound message to schema ${schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Update message delivery status by WhatsApp message ID
   *
   * @param schema Tenant database schema
   * @param whatsappMessageId WhatsApp message ID (wamid)
   * @param status New delivery status
   *
   * @description
   * Updates the delivery status of an outbound message when we receive
   * a status webhook from WhatsApp.
   *
   * Uses the whatsappMessageId index for fast lookup.
   * Only updates outbound messages (inbound messages don't have wamid).
   *
   * @example
   * await messageStorage.updateMessageDeliveryStatus(
   *   'client_acme',
   *   'wamid.HBgMNTczMTEzMjMwMDMz...',
   *   MessageStatus.DELIVERED
   * );
   */
  async updateMessageDeliveryStatus(
    schema: string,
    whatsappMessageId: string,
    status: MessageStatus
  ): Promise<boolean> {
    this.logger.log(
      `Updating message status to ${status} for wamid: ${whatsappMessageId.substring(0, 30)}... in schema: ${schema}`
    );

    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const result = await messagesCollection.updateOne(
        { whatsappMessageId },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        this.logger.warn(
          `No message found with whatsappMessageId: ${whatsappMessageId.substring(0, 30)}... in schema: ${schema}`
        );
        return false;
      }

      this.logger.log(
        `Message status updated successfully to ${status} for wamid: ${whatsappMessageId.substring(0, 30)}...`
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error updating message status for wamid ${whatsappMessageId.substring(0, 30)}... in schema ${schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Get recent messages for a conversation
   *
   * @param schema Tenant database schema
   * @param conversationId Conversation ID
   * @param limit Number of messages to retrieve (default: 50)
   * @returns Array of messages (newest first)
   *
   * @description
   * Retrieves recent messages for building AI context.
   * Returns messages in reverse chronological order.
   */
  async getRecentMessages(
    schema: string,
    conversationId: string,
    limit = 50
  ): Promise<Message[]> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const messages = await messagesCollection
        .find({ conversationId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return messages.map(doc => this.mapToMessage(doc));
    } catch (error) {
      this.logger.error(
        `Error getting recent messages for conversation ${conversationId}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Mark a message as read
   *
   * @param schema Tenant database schema
   * @param messageId Message ID
   */
  async markAsRead(schema: string, messageId: string): Promise<void> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      await messagesCollection.updateOne(
        { messageId },
        {
          $set: {
            readAt: new Date(),
          },
        }
      );

      this.logger.debug(`Marked message ${messageId} as read`);
    } catch (error) {
      this.logger.error(
        `Error marking message ${messageId} as read`,
        error instanceof Error ? error.stack : String(error)
      );
      /* Don't throw - marking as read is not critical */
    }
  }

  /**
   * Map MongoDB document to Message domain model
   *
   * @param doc MongoDB document
   * @returns Message domain object
   * @private
   */
  private mapToMessage(doc: Record<string, unknown>): Message {
    return {
      messageId: doc.messageId as string,
      conversationId: doc.conversationId as string,
      direction: doc.direction as MessageDirection,
      sender: doc.sender as MessageSender,
      type: doc.type as WhatsappMessageType,
      content: doc.content as MessageContent,
      status: doc.status as Message['status'],
      aiMetadata: doc.aiMetadata as Message['aiMetadata'],
      error: doc.error as Message['error'],
      timestamp: doc.timestamp as Date,
      readAt: doc.readAt as Date | undefined,
      context: doc.context as Message['context'],
      interactiveDetails:
        doc.interactiveDetails as Message['interactiveDetails'],
      whatsappMessageId: doc.whatsappMessageId as Message['whatsappMessageId'],
    };
  }

  /**
   * Get a message by its WhatsApp message ID
   *
   * @param messageId WhatsApp message ID
   * @param schema Tenant database schema
   * @returns Message if found, null otherwise
   *
   * @description
   * Retrieves a message by its WhatsApp message ID to check if it already exists.
   * Used to prevent duplicate processing of the same message.
   */
  /**
   * Get message by internal message ID
   *
   * @param messageId Internal message ID
   * @param schema Tenant schema
   * @returns Message or null if not found
   */
  async getMessageById(
    messageId: string,
    schema: string
  ): Promise<Message | null> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      this.logger.debug(`Searching by messageId: ${messageId}`);
      const doc = await messagesCollection.findOne({ messageId: messageId });

      if (!doc) {
        this.logger.debug(`Message not found - messageId: ${messageId}`);
        return null;
      }

      this.logger.debug(
        `Message found - messageId: ${messageId}, doc.messageId: ${doc.messageId}`
      );
      return this.mapToMessage(doc);
    } catch (error: unknown) {
      this.logger.error(
        `Error getting message by ID ${messageId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        MessageStorageService.name
      );
      throw error;
    }
  }

  /**
   * Get message by WhatsApp message ID (wamid)
   *
   * @param whatsappMessageId WhatsApp message ID (starts with 'wamid.')
   * @param schema Tenant schema
   * @returns Message or null if not found
   */
  async getMessageByWhatsAppId(
    whatsappMessageId: string,
    schema: string
  ): Promise<Message | null> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const messagesCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      this.logger.debug(`Searching by whatsappMessageId: ${whatsappMessageId}`);
      const doc = await messagesCollection.findOne({
        whatsappMessageId: whatsappMessageId,
      });

      if (!doc) {
        this.logger.debug(
          `Message not found - whatsappMessageId: ${whatsappMessageId}`
        );
        return null;
      }

      this.logger.debug(
        `Message found - whatsappMessageId: ${whatsappMessageId}, doc.messageId: ${doc.messageId}`
      );
      return this.mapToMessage(doc);
    } catch (error: unknown) {
      this.logger.error(
        `Error getting message by WhatsApp ID ${whatsappMessageId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        MessageStorageService.name
      );
      throw error;
    }
  }
}
