import {
  DEFAULT_SYSTEM_PROMPT_TEMPLATE,
  MESSAGE_TYPE_PLACEHOLDERS,
} from '@src/modules/conversation/whatsapp/services/ai-providers/constants/system-prompts';

/**
 * Prompt Builder Utilities
 *
 * @description
 * Utility functions for building and composing AI prompts.
 * These functions handle prompt template injection and formatting.
 */

/**
 * Build system prompt with conversation summary
 *
 * @param conversationSummary Summary of the conversation (optional)
 * @returns Complete system prompt with injected summary
 *
 * @description
 * Injects the conversation summary into the system prompt template.
 * If no summary is provided, indicates that no previous context exists.
 *
 * This approach:
 * - Provides context from previous conversation
 * - Reduces token usage (summary instead of full history)
 * - Maintains consistency across providers
 * - Uses XML-style tags for clear separation
 *
 * @example
 * const prompt = buildSystemPromptWithSummary("User asked about products");
 * // Returns full prompt with summary injected in <conversation_summary> tag
 */
export function buildSystemPromptWithSummary(
  conversationSummary?: string
): string {
  const summary =
    conversationSummary && conversationSummary.trim()
      ? conversationSummary
      : 'No previous conversation context available. This is a new conversation.';

  return DEFAULT_SYSTEM_PROMPT_TEMPLATE.replace(
    '{conversation_summary}',
    summary
  );
}

/**
 * Get placeholder message for message type
 *
 * @param messageType Type of message (audio, sticker, etc.)
 * @returns Placeholder to send to AI
 *
 * @description
 * Returns a placeholder that the AI will use to generate a contextual response.
 * Uses object mapping for clean, maintainable code.
 *
 * @example
 * const placeholder = getMessageTypePlaceholder('audio');
 * // Returns: "[User sent a voice note]"
 */
export function getMessageTypePlaceholder(messageType: string): string {
  return (
    MESSAGE_TYPE_PLACEHOLDERS[messageType] ??
    MESSAGE_TYPE_PLACEHOLDERS.unsupported
  );
}
