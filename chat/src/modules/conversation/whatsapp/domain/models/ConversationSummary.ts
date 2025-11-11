/**
 * Conversation Summary domain model
 *
 * Stores periodic summaries of conversations to reduce token usage
 * and improve AI context retrieval.
 *
 * @description
 * Instead of sending all messages to the AI, we can send:
 * - Recent messages (last 10-20)
 * - Conversation summary (for older messages)
 *
 * This reduces tokens significantly while maintaining context quality.
 */

/**
 * Summary statistics
 */
export interface SummaryStats {
  /** Total messages in conversation when summary was created */
  totalMessages: number;

  /** Number of messages from user */
  userMessages: number;

  /** Number of messages from bot */
  botMessages: number;

  /** Total tokens used across all messages */
  totalTokens: number;
}

/**
 * Conversation summary interface
 *
 * @description
 * Contains a summary of conversation history up to a certain point.
 * Used to provide context to AI without sending all messages.
 */
export interface ConversationSummary {
  /** Unique summary identifier */
  summaryId: string;

  /** Conversation this summary belongs to */
  conversationId: string;

  /** Brief summary (1-2 sentences) */
  shortSummary: string;

  /**
   * Detailed summary (multiple paragraphs)
   *
   * @description
   * Should include:
   * - What the user is asking about
   * - Key information provided by the bot
   * - Current state of the conversation
   * - Any pending actions or questions
   */
  detailedSummary: string;

  /**
   * Key points extracted from conversation
   *
   * @example
   * [
   *   "User is looking for a gaming laptop with RTX 4060",
   *   "Budget is around $1,500",
   *   "Prefers ASUS or MSI brands"
   * ]
   */
  keyPoints: string[];

  /**
   * ID of the last message included in this summary
   *
   * @description
   * Messages after this ID are not included in the summary
   * and should be sent separately to the AI.
   */
  lastMessageId: string;

  /** Summary statistics */
  stats: SummaryStats;

  /** When this summary was created */
  createdAt: Date;

  /** AI model used to generate this summary */
  generatedBy: string;

  /** Tokens used to generate this summary */
  tokensUsedInGeneration: number;

  // 🔮 Future fields:
  // topics?: string[];
  // sentiment?: string;
  // extractedEntities?: Record<string, unknown>;
  // decisions?: string[];
  // pendingQuestions?: string[];
}

/**
 * DTO for creating a conversation summary
 */
export interface CreateConversationSummaryDTO {
  conversationId: string;
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
  lastMessageId: string;
  stats: SummaryStats;
  generatedBy: string;
  tokensUsedInGeneration: number;
}

/**
 * Options for generating a summary
 */
export interface GenerateSummaryOptions {
  /** Whether to include key points extraction */
  includeKeyPoints?: boolean;

  /** Maximum length for detailed summary (in words) */
  maxDetailedLength?: number;

  /** AI model to use for generation */
  model?: string;
}
