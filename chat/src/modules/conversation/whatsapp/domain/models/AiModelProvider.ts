/**
 * AI Model Provider Interface
 *
 * @description
 * Defines the contract for all AI model providers (Azure OpenAI, OpenAI, Claude, etc.).
 * Each provider implements this interface to handle chat completions.
 *
 * Benefits:
 * - Single Responsibility: Each provider handles one AI service
 * - Open/Closed Principle: Add new providers without modifying existing code
 * - Testability: Easy to mock and unit test individual providers
 */

/**
 * AI Message Role Enumeration
 *
 * @description
 * Defines the possible roles for messages in a conversation.
 * - USER: Messages from the end user
 * - ASSISTANT: Messages from the AI assistant
 * - SYSTEM: System instructions/prompts that guide the AI behavior
 */
export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * Message in conversation history for AI context
 */
export interface AIMessage {
  /** Message role */
  role: AIMessageRole;

  /** Message content */
  content: string;

  /** Optional timestamp */
  timestamp?: Date;
}

/**
 * AI generation request
 */
export interface AIGenerationRequest {
  /** User's current message */
  userMessage: string;

  /** Conversation history (for context) */
  conversationHistory: AIMessage[];

  /** System prompt (with conversation summary already injected) */
  systemPrompt?: string;

  /** Existing conversation summary (for progressive summarization) */
  existingSummary?: string;

  /** Client's database schema (for multi-tenancy) */
  schema: string;

  /** Max tokens to generate */
  maxTokens?: number;

  /** Temperature (0-1) */
  temperature?: number;
}

/**
 * Tool call result from AI
 *
 * @description
 * Represents a tool that the AI wants to invoke.
 * For example, if the user asks about products, the AI might call the "search_products" tool.
 */
export interface AIToolCall {
  /** Tool identifier (e.g., 'search_products', 'search_services') */
  toolName: string;

  /** Tool call ID from LangChain (required for ReAct pattern) */
  id: string;

  /** Arguments to pass to the tool (parsed from AI's JSON response) */
  arguments: Record<string, unknown>;
}

/**
 * AI generation response
 */
export interface AIGenerationResponse {
  /** Generated text response */
  text: string;

  /** Model used for generation */
  model: string;

  /** Conversation summary generated alongside the response */
  summary: string;

  /** Tool calls requested by the AI (if any) */
  toolCalls?: AIToolCall[];

  /** Tool execution results (if tools were called and executed) */
  toolResults?: Record<string, unknown>;

  /** Tokens used for response generation */
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };

  /** Tokens used for summary generation (if applicable) */
  summaryTokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };

  /** Generation time in milliseconds */
  generationTime: number;

  /** Whether the generation was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;
}

/**
 * AI Model Provider Interface
 */
export interface AIModelProvider {
  /**
   * Get the provider name
   *
   * @returns Provider identifier (e.g., 'azure-openai', 'openai', 'claude')
   */
  getProviderName(): string;

  /**
   * Generate a chat completion with conversation summary
   *
   * @param request Generation request with message and context
   * @returns AI response with generated text, summary, and metadata
   *
   * @description
   * Generates a response using the AI model.
   * Also generates a conversation summary using LangChain memory utilities.
   * The summary helps maintain context for long conversations efficiently.
   *
   * Should handle errors gracefully and return them in the response.
   */
  generateResponse(request: AIGenerationRequest): Promise<AIGenerationResponse>;
}
