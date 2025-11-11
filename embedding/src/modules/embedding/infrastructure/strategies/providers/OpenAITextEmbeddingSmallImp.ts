import { EmbeddingProviderStrategy } from '@modules/embedding/domain/strategies/EmbeddingProviderStrategy';
import { EmbeddingModelName } from '@modules/embedding/domain/models/EmbeddingModelName';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';
import OpenAI from 'openai';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { randomUUID } from 'crypto';

/**
 * OpenAI Batch Status Enum
 *
 * @description
 * Possible status values for OpenAI Batch API
 */
enum OpenAIBatchStatus {
  /** Batch is being validated */
  VALIDATING = 'validating',
  /** Batch is in progress */
  IN_PROGRESS = 'in_progress',
  /** Batch completed successfully */
  COMPLETED = 'completed',
  /** Batch failed */
  FAILED = 'failed',
  /** Batch was cancelled */
  CANCELLED = 'cancelled',
  /** Batch has expired */
  EXPIRED = 'expired',
}

/**
 * OpenAI Text Embedding 3 Small Provider Strategy
 *
 * @description
 * Implementation of OpenAI's text-embedding-3-small model
 */
export class OpenAITextEmbeddingSmall implements EmbeddingProviderStrategy {
  readonly providerName = 'openai';
  readonly modelName = EmbeddingModelName.OPENAI_TEXT_EMBEDDING_3_SMALL;
  private readonly openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new DomainValidationError(
        'OPENAI_API_KEY environment variable is not set'
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate embeddings for multiple items using direct processing (parallel)
   *
   * @param items - Array of processing items with markdown and entity context
   * @returns Array of embedding results with vectors and metadata
   */
  async generateEmbeddings(
    items: EmbeddingProcessingItem[]
  ): Promise<EmbeddingResult[]> {
    // Create all API request promises in parallel
    // Note: items.map() creates all promises synchronously, starting all requests immediately
    const embeddingPromises = items.map(item =>
      this.openai.embeddings.create({
        model: this.modelName,
        input: item.markdown,
        encoding_format: 'float',
      })
    );

    // Wait for all parallel requests to complete, then map results
    const responses = await Promise.all(embeddingPromises);

    // Map responses to EmbeddingResult format
    return responses.map((response, index) => ({
      embedding: response.data[0]?.embedding || null,
      originalText: items[index].markdown,
      entityId: items[index].entityId,
      entityType: items[index].entityType,
      schemaName: items[index].schemaName,
    }));
  }

  /**
   * Generate embeddings for multiple items using OpenAI's Batch API
   * Creates a JSONL file with custom_ids and submits it to OpenAI Batch API
   *
   * @param items - Array of processing items with markdown and entity context
   * @returns Array of embedding results with vectors and metadata
   */
  async generateBatchEmbeddings(
    items: EmbeddingProcessingItem[]
  ): Promise<EmbeddingResult[]> {
    if (items.length === 0) {
      return [];
    }

    // Create JSONL content with custom_ids for tracking
    const jsonlContent = items
      .map(item => {
        return JSON.stringify({
          custom_id: item.entityId,
          method: 'POST',
          url: '/v1/embeddings',
          body: {
            model: this.modelName,
            input: item.markdown,
            encoding_format: 'float',
          },
        });
      })
      .join('\n');

    // Convert JSONL string to File for upload
    const file = new File([jsonlContent], `batch_${randomUUID()}.jsonl`, {
      type: 'application/jsonl',
    });

    // Upload the file to OpenAI
    const uploadedFile = await this.openai.files.create({
      file,
      purpose: 'batch',
    });

    // Create the batch with the uploaded file
    const batch = await this.openai.batches.create({
      input_file_id: uploadedFile.id,
      endpoint: '/v1/embeddings',
      completion_window: '24h',
    });

    // Return results with empty embeddings since they will be processed asynchronously
    // The batch_id will be stored in the database to track the batch operation
    const results: EmbeddingResult[] = items.map(item => ({
      embedding: null,
      originalText: item.markdown,
      entityId: item.entityId,
      entityType: item.entityType,
      schemaName: item.schemaName,
      batchId: batch.id, // Store the OpenAI batch ID
    }));

    return results;
  }

  supportsBatchProcessing(): boolean {
    // OpenAI supports batch processing natively
    return true;
  }

  /**
   * Retrieve embeddings for a batch that was previously submitted
   *
   * @param batchId - The batch ID from OpenAI
   * @param itemIds - Array of entity IDs that belong to this batch
   * @param schemaName - Schema name where the entities exist
   * @param entityType - Entity type (table name: product_embeddings or document_embeddings)
   * @returns Promise with array of embedding results containing vectors and metadata
   */
  async getBatchEmbeddings(
    batchId: string,
    itemIds: string[],
    schemaName: string,
    entityType: string
  ): Promise<EmbeddingResult[]> {
    if (!batchId) {
      throw new DomainValidationError('Batch ID is required');
    }

    if (!itemIds || itemIds.length === 0) {
      throw new DomainValidationError('Item IDs are required');
    }

    // 1. Check the batch status
    const batch = await this.openai.batches.retrieve(batchId);

    // Check if batch is still processing
    if (
      batch.status === OpenAIBatchStatus.VALIDATING ||
      batch.status === OpenAIBatchStatus.IN_PROGRESS
    ) {
      // Batch is still processing, return empty results (no embeddings yet)
      return itemIds.map(itemId => ({
        embedding: null,
        originalText: '',
        entityId: itemId,
        entityType,
        schemaName,
        batchId,
      }));
    }

    // Check if batch failed or was cancelled
    if (
      batch.status === OpenAIBatchStatus.FAILED ||
      batch.status === OpenAIBatchStatus.CANCELLED
    ) {
      throw new DomainValidationError(
        `Batch ${batchId} failed with status: ${batch.status}. Error: ${batch.errors?.data?.[0]?.message || 'Unknown error'}`
      );
    }

    // If batch is not completed, throw error
    if (batch.status !== OpenAIBatchStatus.COMPLETED) {
      throw new DomainValidationError(
        `Batch ${batchId} is in unexpected status: ${batch.status}`
      );
    }

    // 2. Retrieve the output file ID
    if (!batch.output_file_id) {
      throw new DomainValidationError(
        `Batch ${batchId} is completed but has no output file`
      );
    }

    // 3. Download and parse the JSONL file
    const outputFileId = batch.output_file_id;

    // Get the file content
    const fileContent = await this.openai.files.content(outputFileId);
    const textContent = await fileContent.text();

    // Parse JSONL (each line is a JSON object)
    const lines = textContent.trim().split('\n');
    const batchResults = new Map<string, any>();

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const result = JSON.parse(line);

        if (!result.custom_id) {
          continue;
        }

        // Handle successful responses
        // The response structure from OpenAI batch API for success:
        // { "custom_id": "...", "response": { "body": { "data": [{ "embedding": [...] }] } } }
        if (result.response?.body?.data?.[0]?.embedding) {
          batchResults.set(result.custom_id, {
            embedding: result.response.body.data[0].embedding,
            // Note: originalText is not available in batch response,
            // it's stored in the database and can be retrieved separately if needed
            originalText: '',
          });
        } else if (result.response?.error) {
          // Handle error responses from OpenAI
          // Structure: { "custom_id": "...", "response": { "error": { "message": "..." } } }
          console.error(
            `Item ${result.custom_id} failed in batch:`,
            result.response.error.message || 'Unknown error'
          );
          // Store null embedding for failed items
          batchResults.set(result.custom_id, {
            embedding: null,
            originalText: '',
          });
        }
      } catch (parseError) {
        // Log parsing error but continue processing other lines
        console.error(`Failed to parse JSONL line: ${line}`, parseError);
      }
    }

    // 4. Map the results to EmbeddingResult[] format matching itemIds
    const embeddingResults: EmbeddingResult[] = itemIds.map(itemId => {
      const batchResult = batchResults.get(itemId);

      return {
        embedding: batchResult?.embedding || null,
        originalText: batchResult?.originalText || '',
        entityId: itemId,
        entityType,
        schemaName,
        batchId,
      };
    });

    return embeddingResults;
  }
}
