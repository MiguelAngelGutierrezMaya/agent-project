import { CompanyRequestRepository } from '@modules/embedding/domain/repositories/CompanyRequestRepository';
import { ProductRepository } from '@modules/embedding/domain/repositories/ProductRepository';
import { DocumentRepository } from '@modules/embedding/domain/repositories/DocumentRepository';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { EmbeddingProviderStrategyFactory } from '@modules/embedding/domain/factories/EmbeddingProviderStrategyFactory';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { LoggerService } from '@src/domain/services/Logger';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';

interface ProcessingEmbedding {
  id: string;
  batchId: string;
  embeddingModel: string;
}

interface CheckResult {
  id: string;
  schemaName: string;
  tableName: string;
  processingEmbeddings: ProcessingEmbedding[];
  embeddingResults: EmbeddingResult[];
}

interface CheckResponse {
  pendingBatchRequests: number;
  requests: CheckResult[];
}

/**
 * Check Batch Embeddings Status Use Case
 *
 * @description
 * This use case retrieves all pending batch requests that need to be checked
 * for completion status from the embedding provider.
 *
 * It will:
 * 1. Query the public.company_requests table for pending requests
 * 2. Return the list of requests with their associated schema and table information
 * 3. This list can then be used to check with the embedding provider if the batch is ready
 */
type EmbeddingEntity = ProductEmbedding | DocumentEmbedding;

export class CheckBatchEmbeddingsStatusUseCase {
  private companyRequestRepository: CompanyRequestRepository;
  private productRepository: ProductRepository;
  private documentRepository: DocumentRepository;
  private embeddingProviderFactory: EmbeddingProviderStrategyFactory;
  private logger: LoggerService;

  constructor(
    companyRequestRepository: CompanyRequestRepository,
    productRepository: ProductRepository,
    documentRepository: DocumentRepository,
    embeddingProviderFactory: EmbeddingProviderStrategyFactory,
    logger: LoggerService
  ) {
    this.companyRequestRepository = companyRequestRepository;
    this.productRepository = productRepository;
    this.documentRepository = documentRepository;
    this.embeddingProviderFactory = embeddingProviderFactory;
    this.logger = logger;
  }

  /**
   * Execute the use case to check batch embeddings status
   * @returns Promise with list of pending batch requests and their details
   */
  async execute(): Promise<CheckResponse> {
    try {
      this.logger.info(
        'Starting check batch embeddings status use case',
        CheckBatchEmbeddingsStatusUseCase.name
      );

      // Get all pending batch requests
      const pendingRequests =
        await this.companyRequestRepository.getPendingBatchRequests();

      this.logger.info(
        `Found ${pendingRequests.length} pending batch requests`,
        CheckBatchEmbeddingsStatusUseCase.name
      );

      // Process each request to get processing embeddings
      const requests: CheckResult[] = [];

      for (const request of pendingRequests) {
        const schemaName = request.modificationRequest.schemaName;
        const tableName = request.modificationRequest.tableName;

        this.logger.info(
          `Checking processing embeddings for ${tableName} in schema ${schemaName}`,
          CheckBatchEmbeddingsStatusUseCase.name
        );

        try {
          // Get processing embeddings using the strategy pattern
          const processingEmbeddings = await this.getProcessingEmbeddings(
            schemaName,
            tableName
          );

          // Transform embeddings to the expected format
          const processingEmbeddingData: ProcessingEmbedding[] =
            processingEmbeddings.map((embedding: EmbeddingEntity) => ({
              id: embedding.id,
              batchId: embedding.batchId || '',
              embeddingModel: embedding.embeddingModel || '',
            }));

          // Process batch embeddings
          const embeddingResults = await this.processBatchEmbeddings(
            processingEmbeddings,
            schemaName,
            tableName
          );

          // Filter embeddings that are not null before storing
          const completedEmbeddings = embeddingResults.filter(
            result =>
              result.embedding !== null && result.embedding !== undefined
          );

          // Store completed embeddings in database if any
          if (completedEmbeddings.length > 0) {
            // Get embedding model from the first processing embedding (all should have the same model)
            const embeddingModel =
              processingEmbeddings[0]?.embeddingModel ||
              processingEmbeddingData[0]?.embeddingModel ||
              '';

            if (!embeddingModel) {
              this.logger.warn(
                `Cannot store embeddings: embedding model not found for ${tableName} in schema ${schemaName}`,
                CheckBatchEmbeddingsStatusUseCase.name
              );
            } else {
              await this.storeEmbeddings(
                completedEmbeddings,
                schemaName,
                tableName,
                embeddingModel
              );
            }
          }

          // Mark as reviewed after processing
          await this.companyRequestRepository.markAsReviewed(request.id);

          requests.push({
            id: request.id,
            schemaName,
            tableName,
            processingEmbeddings: processingEmbeddingData,
            embeddingResults,
          });

          this.logger.info(
            `Found ${processingEmbeddingData.length} processing embeddings, retrieved ${embeddingResults.length} embedding results, and stored ${completedEmbeddings.length} completed embeddings for ${tableName} in schema ${schemaName}`,
            CheckBatchEmbeddingsStatusUseCase.name
          );
        } catch (error) {
          this.logger.error(
            `Failed to get processing embeddings for ${tableName} in schema ${schemaName}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            CheckBatchEmbeddingsStatusUseCase.name
          );

          // Add request with empty processing embeddings on error
          requests.push({
            id: request.id,
            schemaName,
            tableName,
            processingEmbeddings: [],
            embeddingResults: [],
          });
        }
      }

      this.logger.info(
        `Successfully retrieved ${requests.length} batch requests with processing embeddings`,
        CheckBatchEmbeddingsStatusUseCase.name
      );

      return {
        pendingBatchRequests: requests.length,
        requests,
      };
    } catch (error) {
      this.logger.error(
        `Failed to check batch embeddings status. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        CheckBatchEmbeddingsStatusUseCase.name
      );
      throw error;
    }
  }

  /**
   * Get processing embeddings based on table name using repositories
   * @param schemaName - Schema name
   * @param tableName - Table name
   * @returns Promise<EmbeddingEntity[]> - Processing embeddings
   * @private
   */
  private async getProcessingEmbeddings(
    schemaName: string,
    tableName: string
  ): Promise<EmbeddingEntity[]> {
    const mapping: Record<
      string,
      (schemaName: string) => Promise<EmbeddingEntity[]>
    > = {
      product_embeddings: (schemaName: string) =>
        this.productRepository.getProcessingEmbeddingsWithBatchId(schemaName),
      document_embeddings: (schemaName: string) =>
        this.documentRepository.getProcessingEmbeddingsWithBatchId(schemaName),
    };

    if (!mapping[tableName]) {
      throw new DomainValidationError(`Unsupported table name: ${tableName}`);
    }

    this.logger.info(
      `Getting processing embeddings for ${tableName} in schema ${schemaName}`,
      CheckBatchEmbeddingsStatusUseCase.name
    );

    return await mapping[tableName](schemaName);
  }

  /**
   * Process batch embeddings by grouping them by batchId and embeddingModel,
   * then retrieving embeddings from the provider
   * @param processingEmbeddings - Array of processing embeddings
   * @param schemaName - Schema name
   * @param tableName - Table name
   * @returns Promise<EmbeddingResult[]> - Array of embedding results
   * @private
   */
  private async processBatchEmbeddings(
    processingEmbeddings: EmbeddingEntity[],
    schemaName: string,
    tableName: string
  ): Promise<EmbeddingResult[]> {
    if (processingEmbeddings.length === 0) {
      this.logger.info(
        'No processing embeddings to process',
        CheckBatchEmbeddingsStatusUseCase.name
      );
      return [];
    }

    this.logger.info(
      `Processing ${processingEmbeddings.length} batch embeddings for ${tableName} in schema ${schemaName}`,
      CheckBatchEmbeddingsStatusUseCase.name
    );

    // Group embeddings by batchId and embeddingModel
    const groupedEmbeddings = new Map<
      string,
      { batchId: string; model: string; embeddings: EmbeddingEntity[] }
    >();

    for (const embedding of processingEmbeddings) {
      const batchId = embedding.batchId || '';
      const model = embedding.embeddingModel || '';

      if (!batchId || !model) {
        this.logger.warn(
          `Skipping embedding ${embedding.id} - missing batchId or embeddingModel`,
          CheckBatchEmbeddingsStatusUseCase.name
        );
        continue;
      }

      const key = `${batchId}_${model}`;
      if (!groupedEmbeddings.has(key)) {
        groupedEmbeddings.set(key, {
          batchId,
          model,
          embeddings: [],
        });
      }

      groupedEmbeddings.get(key)?.embeddings.push(embedding);
    }

    this.logger.info(
      `Grouped embeddings into ${groupedEmbeddings.size} batches`,
      CheckBatchEmbeddingsStatusUseCase.name
    );

    // Process each batch group
    const allEmbeddingResults: EmbeddingResult[] = [];

    for (const [, group] of groupedEmbeddings) {
      try {
        this.logger.info(
          `Processing batch ${group.batchId} with model ${group.model} containing ${group.embeddings.length} items`,
          CheckBatchEmbeddingsStatusUseCase.name
        );

        // Get the provider strategy for this model
        const provider = this.embeddingProviderFactory.getProviderStrategy(
          group.model
        );

        // Extract entity IDs from the embeddings
        const itemIds = group.embeddings.map(embedding => embedding.id);

        // Retrieve embeddings from the provider
        const batchResults = await provider.getBatchEmbeddings(
          group.batchId,
          itemIds,
          schemaName,
          tableName
        );

        this.logger.info(
          `Retrieved ${batchResults.length} embedding results for batch ${group.batchId}`,
          CheckBatchEmbeddingsStatusUseCase.name
        );

        allEmbeddingResults.push(...batchResults);
      } catch (error) {
        this.logger.error(
          `Failed to process batch ${group.batchId} with model ${group.model}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          CheckBatchEmbeddingsStatusUseCase.name
        );
        // Continue processing other batches even if one fails
      }
    }

    this.logger.info(
      `Successfully processed ${allEmbeddingResults.length} embedding results from ${groupedEmbeddings.size} batches`,
      CheckBatchEmbeddingsStatusUseCase.name
    );

    return allEmbeddingResults;
  }

  /**
   * Update completed embeddings in the database
   * Only updates embedding vector, status, and updated_at (preserves content_markdown)
   * @param embeddings - Embedding results to update (filtered to only include non-null embeddings)
   * @param schemaName - Schema name where the entities exist
   * @param tableName - Table name to determine which repository to use
   * @param embeddingModel - Model name used for the embedding
   * @returns Promise<void>
   * @private
   */
  private async storeEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    tableName: string,
    embeddingModel: string
  ): Promise<void> {
    const mapping: Record<
      string,
      (
        embeddings: EmbeddingResult[],
        schemaName: string,
        embeddingModel: string
      ) => Promise<void>
    > = {
      product_embeddings: (
        embeddings: EmbeddingResult[],
        schemaName: string,
        embeddingModel: string
      ) =>
        this.productRepository.updateCompletedEmbeddings(
          embeddings,
          schemaName,
          embeddingModel
        ),
      document_embeddings: (
        embeddings: EmbeddingResult[],
        schemaName: string,
        embeddingModel: string
      ) =>
        this.documentRepository.updateCompletedEmbeddings(
          embeddings,
          schemaName,
          embeddingModel
        ),
    };

    if (!mapping[tableName]) {
      throw new DomainValidationError(`Unsupported table name: ${tableName}`);
    }

    this.logger.info(
      `Updating ${embeddings.length} completed embeddings for ${tableName} in schema ${schemaName}`,
      CheckBatchEmbeddingsStatusUseCase.name
    );

    return await mapping[tableName](embeddings, schemaName, embeddingModel);
  }
}
