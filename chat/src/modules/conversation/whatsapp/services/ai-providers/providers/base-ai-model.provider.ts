import { Logger } from '@nestjs/common';
import type {
  AIModelProvider,
  AIGenerationRequest,
  AIGenerationResponse,
} from '@src/modules/conversation/whatsapp/domain/models/AiModelProvider';

/**
 * Base AI Model Provider
 *
 * @description
 * Abstract base class that provides common helper methods for all AI providers.
 * Each subclass must implement the provider-specific methods.
 *
 * Subclasses must implement:
 * - getProviderName(): Return the provider identifier
 * - generateResponse(): Generate AI response using their specific API
 */
export abstract class BaseAIModelProvider implements AIModelProvider {
  protected readonly logger: Logger;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Get the provider name
   */
  abstract getProviderName(): string;

  /**
   * Generate a chat completion
   */
  abstract generateResponse(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse>;

  /**
   * Create a successful response
   *
   * @param text Generated text
   * @param model Model identifier
   * @param summary Conversation summary
   * @param generationTime Time taken in ms
   * @param tokensUsed Token usage info
   * @param summaryTokensUsed Summary token usage info
   * @returns Success response
   * @protected
   */
  protected createSuccessResponse(
    text: string,
    model: string,
    summary: string,
    generationTime: number,
    tokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    },
    summaryTokensUsed?: {
      prompt: number;
      completion: number;
      total: number;
    }
  ): AIGenerationResponse {
    return {
      text,
      model,
      summary,
      generationTime,
      tokensUsed,
      summaryTokensUsed,
      success: true,
    };
  }

  /**
   * Create a failed response
   *
   * @param error Error message
   * @param model Model identifier
   * @param generationTime Time taken in ms
   * @returns Failed response
   * @protected
   */
  protected createFailedResponse(
    error: string,
    model: string,
    generationTime: number
  ): AIGenerationResponse {
    return {
      text: '',
      model,
      summary: '',
      generationTime,
      success: false,
      error,
    };
  }

  /**
   * Log generation start
   *
   * @param request Generation request
   * @protected
   */
  protected logGenerationStart(request: AIGenerationRequest): void {
    this.logger.log(
      `Generating response with ${this.getProviderName()} for message: "${request.userMessage.substring(0, 50)}..."`
    );
  }

  /**
   * Log generation success
   *
   * @param response Generation response
   * @protected
   */
  protected logGenerationSuccess(response: AIGenerationResponse): void {
    this.logger.log(
      `Successfully generated response with ${response.model} in ${response.generationTime}ms` +
        (response.tokensUsed ? ` (${response.tokensUsed.total} tokens)` : '')
    );
  }

  /**
   * Log generation failure
   *
   * @param error Error message
   * @protected
   */
  protected logGenerationFailure(error: string): void {
    this.logger.error(`Failed to generate response: ${error}`);
  }
}
