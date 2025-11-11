import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConnectionService } from '@shared/persistence/mongo/database-connection.service';
import type { Collection } from 'mongoose';
import { Types } from 'mongoose';
import {
  type Conversation,
  type ConversationParticipant,
  type ConversationMetadata,
  ConversationStatus,
  WhatsAppWindowStatus,
} from '@src/modules/conversation/whatsapp/domain/models/Conversation';

/**
 * Conversation Storage Service
 *
 * @description
 * Manages conversation persistence in tenant-specific MongoDB databases.
 * Uses DatabaseConnectionService to connect to the correct tenant database.
 */
@Injectable()
export class ConversationStorageService {
  private readonly logger = new Logger(ConversationStorageService.name);
  private readonly COLLECTION_NAME = 'conversations';

  constructor(
    private readonly dbConnectionService: DatabaseConnectionService
  ) {}

  /**
   * Find or create a conversation for a user (using UPSERT)
   *
   * @param schema Tenant database schema
   * @param clientId Client ID
   * @param user User participant info
   * @param metadata Conversation metadata
   * @returns Conversation document
   *
   * @description
   * Uses MongoDB upsert operation to find or create conversation in a single query.
   * If conversation exists: Updates lastActivityAt and WhatsApp window.
   * If conversation doesn't exist: Creates it with initial state.
   *
   * This approach is more efficient than separate find + insert/update queries.
   */
  async findOrCreateConversation(
    schema: string,
    clientId: string,
    user: ConversationParticipant,
    metadata: ConversationMetadata
  ): Promise<Conversation> {
    this.logger.log(
      `Finding or creating conversation for user ${user.phoneNumber} in schema: ${schema}`
    );

    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const conversationsCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const now = new Date();
      const windowExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      /*
       * UPSERT operation (single query instead of find + insert/update)
       *
       * If exists: Updates lastActivityAt, WhatsApp window, and user name (if provided)
       * If not exists: Creates new conversation with $setOnInsert values
       */

      /* Build $set object dynamically to include user.name only if provided */
      const setFields: Record<string, unknown> = {
        lastActivityAt: now,
        'whatsappWindow.status': WhatsAppWindowStatus.OPEN,
        'whatsappWindow.expiresAt': windowExpiresAt,
        'whatsappWindow.lastUserMessageAt': now,
        updatedAt: now,
      };

      /* Update user.name if provided (from webhook contacts) */
      if (user.name) {
        setFields['user.name'] = user.name;
      }

      const result = await conversationsCollection.findOneAndUpdate(
        /* Query: Find by user phone number */
        { 'user.phoneNumber': user.phoneNumber },

        /* Update operations */
        {
          /* Always update these fields on every message */
          $set: setFields,

          /* Only set these fields on INSERT (first time) */
          $setOnInsert: {
            schema,
            clientId,
            'user.phoneNumber': user.phoneNumber,
            status: ConversationStatus.WITH_BOT,
            aiContext: {
              summary: '',
              turns: 0,
              lastSummaryAt: now,
              messagesSinceLastSummary: 0,
            },
            metadata,
            /* Initialize whatsappWindow fields that won't be in $set */
            'whatsappWindow.templateMessageSent': false,
            'whatsappWindow.templateSentAt': null,
            'whatsappWindow.templateMessageId': null,
            createdAt: now,
          },
        },

        /* Options */
        {
          upsert: true, // Create if doesn't exist
          returnDocument: 'after', // Return the updated/created document
        }
      );

      if (!result) {
        throw new Error(
          `Failed to upsert conversation for user ${user.phoneNumber}`
        );
      }

      const conversationId = String(result._id);
      const wasCreated = !result.lastModifiedCount;

      this.logger.log(
        wasCreated
          ? `Created new conversation with ID: ${conversationId}`
          : `Updated existing conversation: ${conversationId}`
      );

      return this.mapToConversation(result);
    } catch (error) {
      this.logger.error(
        `Error finding/creating conversation for user ${user.phoneNumber} in schema ${schema}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Update conversation after bot response
   *
   * @param schema Tenant database schema
   * @param conversationId Conversation ID
   * @param summary Generated conversation summary
   *
   * @description
   * Single atomic update that handles all post-response updates:
   * - Increments AI turns counter
   * - Updates conversation summary
   * - Updates summary timestamp
   * - Updates last activity timestamp
   *
   * This replaces multiple individual update operations, reducing:
   * - Database round trips (1 query instead of 2-3)
   * - Network latency
   * - Database load
   * - Transaction complexity
   */
  async updateConversationAfterBotResponse(
    schema: string,
    conversationId: string,
    summary: string
  ): Promise<void> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const conversationsCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const now = new Date();

      await conversationsCollection.updateOne(
        { _id: new Types.ObjectId(conversationId) },
        {
          $inc: {
            'aiContext.turns': 1,
          },
          $set: {
            'aiContext.summary': summary,
            'aiContext.lastSummaryAt': now,
            lastActivityAt: now,
            updatedAt: now,
          },
        }
      );

      this.logger.log(
        `Conversation ${conversationId} updated after bot response in schema ${schema}`
      );
    } catch (error) {
      this.logger.error(
        `Error updating conversation ${conversationId} after bot response`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Transfer conversation to human advisor
   *
   * @param schema Tenant database schema
   * @param conversationId Conversation identifier
   * @param reason Optional reason provided by AI for the handoff
   */
  async transferConversationToHuman(
    schema: string,
    conversationId: string
  ): Promise<void> {
    try {
      const tenantDb = this.dbConnectionService.getDatabase(schema);
      const conversationsCollection: Collection = tenantDb.collection(
        this.COLLECTION_NAME
      );

      const now = new Date();

      const updateResult = await conversationsCollection.updateOne(
        { _id: new Types.ObjectId(conversationId) },
        {
          $set: {
            status: ConversationStatus.WITH_HUMAN,
            updatedAt: now,
            lastActivityAt: now,
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        throw new Error(
          `Conversation ${conversationId} not found for transfer in schema ${schema}`
        );
      }

      this.logger.log(
        `Conversation ${conversationId} transferred to human in schema ${schema}`
      );
    } catch (error) {
      this.logger.error(
        `Error transferring conversation ${conversationId} to human`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Map MongoDB document to Conversation domain model
   *
   * @param doc MongoDB document
   * @returns Conversation domain object
   * @private
   */
  private mapToConversation(doc: Record<string, unknown>): Conversation {
    return {
      conversationId: String(doc._id),
      schema: doc.schema as string,
      clientId: doc.clientId as string,
      user: doc.user as ConversationParticipant,
      status: doc.status as ConversationStatus,
      aiContext: doc.aiContext as Conversation['aiContext'],
      metadata: doc.metadata as ConversationMetadata,
      whatsappWindow: doc.whatsappWindow as Conversation['whatsappWindow'],
      createdAt: doc.createdAt as Date,
      lastActivityAt: doc.lastActivityAt as Date,
      closedAt: doc.closedAt as Date | undefined,
    };
  }
}
