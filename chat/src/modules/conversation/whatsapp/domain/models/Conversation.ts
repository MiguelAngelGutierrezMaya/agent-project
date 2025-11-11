/**
 * Conversation domain model
 *
 * Represents a conversation thread between a user and the bot.
 * Each conversation tracks the interaction history and current state.
 */

/**
 * Participant information in a conversation
 */
export interface ConversationParticipant {
  /** WhatsApp ID (phone number) */
  phoneNumber: string;

  /** User's display name from WhatsApp profile */
  name?: string;
}

/**
 * Current conversation status
 */
export enum ConversationStatus {
  /** Conversation being handled by the bot */
  WITH_BOT = 'with_bot',

  /** Conversation transferred to human agent */
  WITH_HUMAN = 'with_human',

  /** Conversation closed/completed */
  CLOSED = 'closed',

  /** User is inactive (no response in X time) */
  INACTIVE = 'inactive',
}

/**
 * WhatsApp 24-hour messaging window status
 *
 * @description
 * WhatsApp only allows businesses to send messages within a 24-hour window
 * after the user's last message. After that, only template messages are allowed.
 */
export enum WhatsAppWindowStatus {
  /** Window is open, bot can send free-form messages */
  OPEN = 'open',

  /** Window is closed, only template messages allowed */
  CLOSED = 'closed',

  /** Template message sent, awaiting user response to reopen window */
  AWAITING_RESPONSE = 'awaiting_response',
}

/**
 * Basic AI context for conversation tracking
 *
 * @description
 * Stores minimal AI context to avoid regenerating summaries frequently.
 * Can be expanded with more fields as needed (intent, sentiment, etc.)
 */
export interface ConversationAIContext {
  /** Brief summary of the conversation so far */
  summary: string;

  /** Number of message turns in this conversation */
  turns: number;

  /** When the summary was last updated */
  lastSummaryAt: Date;

  /** Number of messages since last summary update */
  messagesSinceLastSummary: number;

  // 🔮 Future fields (commented for reference):
  // intent?: string;
  // sentiment?: string;
  // topics?: string[];
  // extractedInfo?: Record<string, unknown>;
}

/**
 * Metadata about the conversation
 */
export interface ConversationMetadata {
  /** WhatsApp Business phone number ID that received the message */
  businessPhoneNumberId: string;

  /** Display phone number from metadata */
  displayPhoneNumber: string;

  /** Device info if available */
  deviceInfo?: string;
}

/**
 * WhatsApp 24-hour messaging window tracking
 *
 * @description
 * WhatsApp enforces a 24-hour messaging window. After a user's last message,
 * the business has 24 hours to send free-form messages. After that window closes,
 * only approved template messages can be sent until the user responds.
 *
 * @see https://developers.facebook.com/docs/whatsapp/pricing#conversations
 */
export interface WhatsAppWindow {
  /** Current window status */
  status: WhatsAppWindowStatus;

  /**
   * When the current window expires
   *
   * @description
   * Set to 24 hours after the user's last message.
   * If null, window is closed or never opened.
   */
  expiresAt: Date | null;

  /**
   * When the user last sent a message
   *
   * @description
   * This timestamp is used to calculate the 24-hour window.
   * Updated every time the user sends a message.
   */
  lastUserMessageAt: Date | null;

  /**
   * Whether a template message was sent to reopen the window
   */
  templateMessageSent: boolean;

  /**
   * Timestamp when template message was sent (if applicable)
   */
  templateSentAt: Date | null;

  /**
   * Template message ID that was sent
   */
  templateMessageId: string | null;
}

/**
 * Main conversation interface
 *
 * @description
 * Represents a single conversation thread with a user.
 * Tracks the current state, participants, AI context, and WhatsApp window status.
 */
export interface Conversation {
  /**
   * Unique conversation identifier
   *
   * @description
   * MongoDB ObjectId (as string). Does not contain user information
   * for privacy and security reasons.
   *
   * @example "507f1f77bcf86cd799439011"
   */
  conversationId: string;

  /** Client's database schema (for multi-tenancy) */
  schema: string;

  /** Client ID from config */
  clientId: string;

  /** User participating in this conversation */
  user: ConversationParticipant;

  /** Current conversation status */
  status: ConversationStatus;

  /** AI context and summary */
  aiContext: ConversationAIContext;

  /** Metadata about the conversation */
  metadata: ConversationMetadata;

  /**
   * WhatsApp 24-hour messaging window tracking
   *
   * @description
   * Critical for knowing when the bot can send free-form messages
   * vs. when only template messages are allowed.
   */
  whatsappWindow: WhatsAppWindow;

  /** When the conversation started */
  createdAt: Date;

  /** Last activity timestamp (any message, from user or bot) */
  lastActivityAt: Date;

  /** When the conversation was closed (if applicable) */
  closedAt?: Date;

  // 🔮 Future fields (commented for reference):
  // conversationFlow?: {
  //   currentFlow: string;
  //   currentStep: string;
  //   activeOptions?: unknown;
  // };
}

/**
 * DTO for creating a new conversation
 */
export interface CreateConversationDTO {
  schema: string;
  clientId: string;
  user: ConversationParticipant;
  metadata: ConversationMetadata;
}
