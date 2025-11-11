import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import type { EmbeddingProvider } from '@src/modules/conversation/whatsapp/domain/models/EmbeddingProvider';

/**
 * OpenAI Text Embedding 3 Small Provider
 *
 * @description
 * Embedding provider using OpenAI's text-embedding-3-small model.
 * This provider generates embeddings for semantic search queries.
 *
 * Configuration required:
 * - OPENAI_API_KEY environment variable
 *
 * Model details:
 * - Model: text-embedding-3-small
 * - Dimensions: 1536 (default, can be reduced if needed)
 * - Cost-effective and fast for semantic search
 */
@Injectable()
export class OpenAITextEmbeddingSmallProvider implements EmbeddingProvider {
  private readonly logger = new Logger(OpenAITextEmbeddingSmallProvider.name);
  readonly providerName = 'openai';
  readonly modelName = 'text-embedding-3-small';
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey: string =
      this.configService.get<string>('openai.apiKey') ?? '';

    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate embedding vector for text using OpenAI
   *
   * @param text Text to generate embedding for
   * @returns Embedding vector array or null if generation fails
   *
   * @description
   * Uses OpenAI API to generate embeddings for the given text.
   * Returns the embedding vector that can be used for semantic search.
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      if (!text || text.trim().length === 0) {
        this.logger.warn('Empty text provided for embedding generation');
        return null;
      }

      this.logger.debug(
        `Generating embedding for text: "${text.substring(0, 50)}..."`
      );

      const response: Awaited<
        ReturnType<typeof this.openai.embeddings.create>
      > = await this.openai.embeddings.create({
        model: this.modelName,
        input: text,
        encoding_format: 'float',
      });

      const firstDataItem = response.data[0];

      if (!firstDataItem || !('embedding' in firstDataItem)) {
        this.logger.error(`Failed to generate embedding for text: "${text}"`);
        return null;
      }

      const embedding = firstDataItem.embedding;

      if (!Array.isArray(embedding)) {
        this.logger.error(
          `Invalid embedding format for text: "${text}". Expected array.`
        );
        return null;
      }

      // Ensure all values are numbers
      const embeddingVector: number[] = embedding.map(val =>
        typeof val === 'number' ? val : Number(val)
      );

      this.logger.debug(
        `Successfully generated embedding with ${embeddingVector.length} dimensions`
      );

      return embeddingVector;
    } catch (error) {
      this.logger.error(
        `Error generating embedding: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return null;
    }
  }
}
