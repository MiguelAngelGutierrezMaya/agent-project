import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Verify } from '@src/modules/conversation/whatsapp/domain/models/Verify';
import {
  type WhatsappWebhookChange,
  type WhatsappMessage,
  type WhatsappUnsupportedMessage,
  type WhatsappContact,
  type WhatsappMessageStatus,
  WhatsappMessageType,
} from '@src/modules/conversation/whatsapp/domain/models/WhatsappWebhook';
import type { ConfigWithSchema } from '@src/modules/config/domain/models/config.model';
import {
  type Conversation,
  ConversationStatus,
} from '@src/modules/conversation/whatsapp/domain/models/Conversation';
import { MessageStatus } from '@src/modules/conversation/whatsapp/domain/models/Message';
import { ServiceValidationError } from '@src/shared/utils/errors/services';
import { WhatsAppApiService } from './whatsapp-api.service';
import { ClientSchemaResolverService } from './client-schema-resolver.service';
import { MessageProcessorFactory } from './message-processors/message-processor.factory';
import { ConversationStorageService } from './conversation-storage.service';
import { BotInteractionService } from './bot-interaction.service';
import { MessageStorageService } from './message-storage.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly whatsappApi: WhatsAppApiService,
    private readonly configService: ConfigService,
    private readonly clientSchemaResolver: ClientSchemaResolverService,
    private readonly messageProcessorFactory: MessageProcessorFactory,
    private readonly conversationStorage: ConversationStorageService,
    private readonly botInteraction: BotInteractionService,
    private readonly messageStorage: MessageStorageService
  ) {}

  /**
   * Process incoming webhook change from WhatsApp
   *
   * @param change Webhook change object
   * @description
   * Processes incoming webhook notifications from WhatsApp Business API.
   * Handles two types of webhooks:
   *
   * 1. MESSAGE WEBHOOKS (user sends message):
   *    - Process and store the message
   *    - Generate bot response if needed
   *    - Mark message as read
   *
   * 2. STATUS WEBHOOKS (our message status changes):
   *    - Update message delivery status (sent → delivered → read)
   *    - Track message lifecycle
   *    - Monitor delivery failures
   *
   * Steps:
   * 1. Extract WhatsApp Business phone number from metadata
   * 2. Check if webhook contains statuses (process and return)
   * 3. Check if webhook contains messages (process normally)
   * 4. Resolve client schema from public database
   * 5. Process messages and store in client's database
   */
  async processChange(change: WhatsappWebhookChange): Promise<void> {
    this.logger.log(
      `Processing webhook change: ${JSON.stringify(change)}`,
      WhatsappService.name
    );

    const { value } = change;
    const { metadata, messages, contacts, statuses } = value;

    /* Step 1: Get WhatsApp Business phone number from metadata */
    const whatsappNumber = metadata.display_phone_number;

    if (!whatsappNumber) {
      this.logger.error(
        'Missing display_phone_number in webhook metadata',
        WhatsappService.name
      );
      throw new ServiceValidationError(
        'Missing display_phone_number in webhook metadata'
      );
    }

    /* Step 2: Handle status updates (if present) */
    if (statuses && statuses.length > 0) {
      this.logger.log(
        `Processing ${statuses.length} message status update(s)`,
        WhatsappService.name
      );

      /* Resolve client config for status updates */
      const clientConfig =
        await this.clientSchemaResolver.getClientConfigByWhatsappNumber(
          whatsappNumber
        );

      await this.processMessageStatuses(statuses, clientConfig);
      return; // Status updates don't need further processing
    }

    /* Step 3: Handle incoming messages (if present) */
    if (!messages || messages.length === 0) {
      this.logger.debug(
        'No messages or statuses in webhook change',
        WhatsappService.name
      );
      return;
    }

    /* Step 4: Resolve complete client configuration from WhatsApp number */
    this.logger.log(
      `Resolving client configuration for WhatsApp number: ${whatsappNumber}`,
      WhatsappService.name
    );

    const clientConfig =
      await this.clientSchemaResolver.getClientConfigByWhatsappNumber(
        whatsappNumber
      );

    this.logger.log(
      `Resolved client - Schema: ${clientConfig.schema}, ID: ${clientConfig.id}`,
      WhatsappService.name
    );

    /* Step 5: Process each message */
    const message = messages[0];

    /* Extract user info from contacts (if available) */
    const userContact = contacts && contacts.length > 0 ? contacts[0] : null;

    /* Check if message is supported */
    if (this.isUnsupportedMessage(message) || this.hasErrors(message)) {
      this.logger.warn(
        `Received unsupported message type: ${message.type}, Message ID: ${message.id}`,
        WhatsappService.name
      );

      if (message.errors) {
        this.logger.warn(
          `Message errors: ${JSON.stringify(message.errors)}`,
          WhatsappService.name
        );
      }

      /* Do NOT mark unsupported messages as read - Facebook API returns error */
      return;
    }

    /* Step 6: Find or create conversation BEFORE processing message */
    const conversation = await this.findOrCreateConversation(
      message,
      clientConfig,
      userContact
    );

    /* Step 7: Process supported message with conversation context */
    await this.processMessage(message, clientConfig, conversation);
  }

  /**
   * Process message status updates from WhatsApp
   *
   * @param statuses Array of status updates
   * @param clientConfig Client configuration
   * @private
   *
   * @description
   * Processes status updates for messages we sent.
   * Updates the delivery status in the database using the whatsappMessageId.
   *
   * Status lifecycle:
   * - sent: WhatsApp received the message
   * - delivered: Message reached user's device
   * - read: User opened the message
   * - failed: Message failed to send
   *
   * Each status update uses the indexed whatsappMessageId for fast lookup.
   */
  private async processMessageStatuses(
    statuses: WhatsappMessageStatus[],
    clientConfig: ConfigWithSchema
  ): Promise<void> {
    this.logger.log(
      `Processing ${statuses.length} status update(s) for client ${clientConfig.id}`,
      WhatsappService.name
    );

    for (const statusUpdate of statuses) {
      try {
        this.logger.debug(
          `Status update - wamid: ${statusUpdate.id.substring(0, 30)}..., status: ${statusUpdate.status}, recipient: ${statusUpdate.recipient_id}`
        );

        /* Map WhatsApp status to our MessageStatus enum */
        const messageStatus = this.mapWhatsappStatusToMessageStatus(
          statusUpdate.status
        );

        /* Update message status in database */
        const updated = await this.messageStorage.updateMessageDeliveryStatus(
          clientConfig.schema,
          statusUpdate.id,
          messageStatus
        );

        if (updated) {
          this.logger.log(
            `Message status updated to ${messageStatus} for wamid: ${statusUpdate.id.substring(0, 30)}...`
          );
        } else {
          this.logger.warn(
            `Message not found for status update - wamid: ${statusUpdate.id.substring(0, 30)}...`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error processing status update for wamid ${statusUpdate.id}`,
          error instanceof Error ? error.stack : String(error)
        );
        /* Don't throw - continue processing other statuses */
      }
    }
  }

  /**
   * Map WhatsApp status to MessageStatus enum
   *
   * @param whatsappStatus Status from WhatsApp webhook
   * @returns MessageStatus enum value
   * @private
   */
  private mapWhatsappStatusToMessageStatus(
    whatsappStatus: 'sent' | 'delivered' | 'read' | 'failed'
  ): MessageStatus {
    const statusMap: Record<string, MessageStatus> = {
      sent: MessageStatus.SENT,
      delivered: MessageStatus.DELIVERED,
      read: MessageStatus.READ,
      failed: MessageStatus.FAILED,
    };

    return statusMap[whatsappStatus] ?? MessageStatus.SENT;
  }

  /**
   * Verify the token
   *
   * @param verify Verify object
   * @returns the challenge
   */
  verify(verify: Verify): Promise<string | Error> {
    this.logger.log(JSON.stringify(verify), WhatsappService.name);

    const { mode, token, challenge } = verify;

    const verifyToken = this.configService.get<string>('whatsapp.verifyToken');

    if (mode === 'subscribe' && token === verifyToken) {
      return Promise.resolve(challenge);
    }

    throw new ServiceValidationError('Invalid token');
  }

  /**
   * Find or create conversation for the user
   *
   * @param message WhatsApp message
   * @param clientConfig Complete client configuration
   * @param userContact Contact info from webhook (if available)
   * @returns Conversation document
   * @private
   */
  private async findOrCreateConversation(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    userContact: WhatsappContact | null
  ): Promise<Conversation> {
    this.logger.log(
      `Finding or creating conversation for user ${message.from}`,
      WhatsappService.name
    );

    /* Extract user name from contacts array (if provided in webhook) */
    const userName = userContact?.profile?.name;

    if (userName) {
      this.logger.debug(`User name from webhook contacts: ${userName}`);
    }

    const conversation =
      await this.conversationStorage.findOrCreateConversation(
        clientConfig.schema,
        clientConfig.id,
        {
          phoneNumber: message.from,
          name: userName,
        },
        {
          businessPhoneNumberId:
            clientConfig.socialConfig.whatsappBusinessPhoneId,
          displayPhoneNumber: clientConfig.socialConfig.whatsappDisplayPhone,
          deviceInfo: undefined,
        }
      );

    this.logger.log(
      `Conversation ID: ${conversation.conversationId}, Status: ${conversation.status}, User: ${conversation.user.name ?? 'Unknown'}`,
      WhatsappService.name
    );

    return conversation;
  }

  /**
   * Process a supported message using Strategy Pattern
   *
   * @param message WhatsApp message
   * @param clientConfig Complete client configuration (schema, AI config, social config, etc.)
   * @param conversation Conversation context
   * @description
   * Delegates message processing to the appropriate processor based on message type.
   * Uses the Factory pattern to get the correct processor, which then handles
   * the specific message type logic (Strategy pattern).
   *
   * Each processor receives the conversationId and stores the message in the tenant database.
   *
   * Benefits of this approach:
   * - Each message type has its own dedicated processor class
   * - Easy to add new message types without modifying this service
   * - Better testability (can test each processor independently)
   * - Follows Open/Closed Principle (open for extension, closed for modification)
   */
  private async processMessage(
    message: WhatsappMessage,
    clientConfig: ConfigWithSchema,
    conversation: Conversation
  ): Promise<void> {
    this.logger.log(
      `Processing ${message.type} message from ${message.from} for client ${clientConfig.id} (schema: ${clientConfig.schema}), Message ID: ${message.id}, Conversation ID: ${conversation.conversationId}`,
      WhatsappService.name
    );

    try {
      /* Check if message already exists in database to prevent duplicate processing */
      const existingMessage = await this.messageStorage.getMessageByWhatsAppId(
        message.id,
        clientConfig.schema
      );

      if (existingMessage) {
        this.logger.log(
          `Message ${message.id} already exists in database - skipping processing`
        );
        return;
      }
      /* Get the appropriate processor for this message type (Factory Pattern) */
      const processor = this.messageProcessorFactory.getProcessor(message);

      /* Process the message using the selected processor (Strategy Pattern) */
      const result = await processor.process(
        message,
        clientConfig,
        conversation.conversationId
      );

      /* Handle processing result */
      if (!result.success) {
        this.logger.warn(
          `Message processing failed for ${message.id}: ${result.error ?? 'Unknown error'}`,
          WhatsappService.name
        );

        /* If processing failed but we should still mark as read, do it */
        if (result.shouldMarkAsRead) {
          await this.markMessageAsRead(
            message.id,
            clientConfig.socialConfig,
            'after processing failure'
          );
        }

        return;
      }

      /* Success - generate bot response BEFORE marking as read */
      if (result.shouldMarkAsRead) {
        /* Only interact with bot if conversation status is WITH_BOT */
        if (conversation.status === ConversationStatus.WITH_BOT) {
          this.logger.debug(
            `Conversation ${conversation.conversationId} is WITH_BOT, generating AI response`
          );

          /* Generate and send bot response */
          await this.botInteraction.processUserMessage(
            message,
            clientConfig,
            conversation
          );
        } else {
          this.logger.debug(
            `Conversation ${conversation.conversationId} status is ${conversation.status}, skipping bot interaction`
          );
        }

        /* Mark as read */
        await this.markMessageAsRead(message.id, clientConfig.socialConfig);

        this.logger.log(
          `Message ${message.id} processed and marked as read successfully (stored as: ${result.storedMessageId ?? 'N/A'})`,
          WhatsappService.name
        );
      } else {
        this.logger.log(
          `Message ${message.id} processed successfully (not marked as read)`,
          WhatsappService.name
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing message ${message.id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  /**
   * Mark a message as read with error handling
   *
   * @param messageId WhatsApp message ID
   * @param socialConfig Client's social configuration
   * @param context Additional context for logging (e.g., "after processing failure")
   * @private
   *
   * @description
   * Centralized method to mark messages as read with consistent error handling.
   * Used in multiple places where messages need to be marked as read.
   */
  private async markMessageAsRead(
    messageId: string,
    socialConfig: ConfigWithSchema['socialConfig'],
    context?: string
  ): Promise<void> {
    try {
      await this.whatsappApi.markAsRead(messageId, socialConfig);
      const contextText = context ? ` (${context})` : '';
      this.logger.log(
        `Message ${messageId} marked as read successfully${contextText}`
      );
    } catch (error) {
      const contextText = context ? ` (${context})` : '';
      this.logger.error(
        `Failed to mark message ${messageId} as read${contextText}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Type guard to check if a message is unsupported
   *
   * @param message WhatsApp message to check
   * @returns true if the message is unsupported
   */
  private isUnsupportedMessage(
    message: WhatsappMessage
  ): message is WhatsappUnsupportedMessage {
    return message.type === WhatsappMessageType.UNSUPPORTED || !!message.errors;
  }

  /**
   * Type guard to check if a message has errors
   *
   * @param message WhatsApp message to check
   * @returns true if the message has errors
   */
  private hasErrors(message: WhatsappMessage): boolean {
    return !!message.errors && message.errors.length > 0;
  }
}
