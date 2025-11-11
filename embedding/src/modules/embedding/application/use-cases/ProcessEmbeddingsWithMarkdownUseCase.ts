import { CompanyModificationRepository } from '@modules/embedding/domain/repositories/CompanyModificationRepository';
import { CompanyRequestRepository } from '@modules/embedding/domain/repositories/CompanyRequestRepository';
import { ProductRepository } from '@modules/embedding/domain/repositories/ProductRepository';
import { DocumentRepository } from '@modules/embedding/domain/repositories/DocumentRepository';
import { MarkdownGenerationStrategyFactory } from '@modules/embedding/domain/factories/MarkdownGenerationStrategyFactory';
import { EmbeddingProviderStrategyFactory } from '@modules/embedding/domain/factories/EmbeddingProviderStrategyFactory';
import { EmbeddingProcessingModeStrategyFactory } from '@modules/embedding/domain/factories/EmbeddingProcessingModeStrategyFactory';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { EmbeddingProcessingMode } from '@modules/embedding/domain/models/EmbeddingProcessingMode';
import { EmbeddingProcessingItem } from '@modules/embedding/domain/models/EmbeddingProcessingItem';
import { LoggerService } from '@src/domain/services/Logger';
import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

type EmbeddingEntity = ProductEmbedding | DocumentEmbedding;

interface ModificationResult {
  schema: string;
  table: string;
  model: string;
  batchMode: boolean;
  vectorDimensions: number;
  markdownCount: number;
}

interface ProcessResponse {
  pendingModifications: number;
  processedModifications: number;
  markdownGenerated: number;
  modifications: ModificationResult[];
}

/**
 * Process Embeddings with Markdown Generation Use Case
 *
 * @description
 * Main orchestrator use case that processes pending modifications and generates markdown.
 * Uses the Factory pattern to avoid if/else statements.
 *
 * This use case only receives repositories and data, not other use cases.
 */
export class ProcessEmbeddingsWithMarkdownUseCase {
  private companyModificationRepository: CompanyModificationRepository;
  private companyRequestRepository: CompanyRequestRepository;
  private productRepository: ProductRepository;
  private documentRepository: DocumentRepository;
  private markdownStrategyFactory: MarkdownGenerationStrategyFactory<EmbeddingEntity>;
  private embeddingProviderFactory: EmbeddingProviderStrategyFactory;
  private embeddingProcessingModeFactory: EmbeddingProcessingModeStrategyFactory;
  private logger: LoggerService;

  constructor(
    companyModificationRepository: CompanyModificationRepository,
    companyRequestRepository: CompanyRequestRepository,
    productRepository: ProductRepository,
    documentRepository: DocumentRepository,
    markdownStrategyFactory: MarkdownGenerationStrategyFactory<EmbeddingEntity>,
    embeddingProviderFactory: EmbeddingProviderStrategyFactory,
    embeddingProcessingModeFactory: EmbeddingProcessingModeStrategyFactory,
    logger: LoggerService
  ) {
    this.companyModificationRepository = companyModificationRepository;
    this.companyRequestRepository = companyRequestRepository;
    this.productRepository = productRepository;
    this.documentRepository = documentRepository;
    this.markdownStrategyFactory = markdownStrategyFactory;
    this.embeddingProviderFactory = embeddingProviderFactory;
    this.embeddingProcessingModeFactory = embeddingProcessingModeFactory;
    this.logger = logger;
  }

  /**
   * Execute the main use case to process embeddings with markdown generation
   * @returns Promise<object> Processing results with markdown generation
   */
  async execute(): Promise<ProcessResponse> {
    try {
      this.logger.info(
        'Starting process embeddings with markdown generation use case',
        ProcessEmbeddingsWithMarkdownUseCase.name
      );

      // Get pending modifications with their configurations
      const pendingModifications =
        await this.companyModificationRepository.getPendingModificationsWithConfig();

      let processedCount = 0;
      let markdownGeneratedCount = 0;

      const results: Array<ModificationResult> = [];

      // Process each modification using Factory pattern
      for (const item of pendingModifications) {
        const schemaName = item.modification.modificationRequest.schemaName;
        const tableName = item.modification.modificationRequest.tableName;

        this.logger.info(
          `Processing ${tableName} in schema ${schemaName} ` +
            `with model ${item.config.embeddingModel} (batch: ${item.config.batchEmbedding})`,
          ProcessEmbeddingsWithMarkdownUseCase.name
        );

        try {
          // Process entities directly using repositories and factory pattern
          const processedEntities = await this.processEntitiesForEmbedding(
            schemaName,
            tableName
          );

          const markdownCount = processedEntities.length;
          markdownGeneratedCount += markdownCount;

          // Process embeddings for the generated markdowns
          const embeddings = await this.processEmbeddings(
            processedEntities,
            item.config.embeddingModel,
            item.config.batchEmbedding,
            schemaName,
            tableName
          );

          // Store embeddings in database
          await this.storeEmbeddings(
            embeddings,
            schemaName,
            tableName,
            item.config.embeddingModel
          );

          this.logger.info(
            `Generated ${markdownCount} markdowns and stored embeddings for ${tableName} in schema ${schemaName}`,
            ProcessEmbeddingsWithMarkdownUseCase.name
          );

          // Mark as reviewed after processing
          await this.companyModificationRepository.markAsReviewed(
            item.modification.id
          );

          // If batch processing, create a company request
          if (item.config.batchEmbedding) {
            const companyRequestId =
              await this.companyRequestRepository.createCompanyRequest(
                schemaName,
                tableName
              );
            this.logger.info(
              `Created company request with ID: ${companyRequestId} for batch processing in schema ${schemaName}, table ${tableName}`,
              ProcessEmbeddingsWithMarkdownUseCase.name
            );
          }

          processedCount++;

          results.push({
            schema: schemaName,
            table: tableName,
            model: item.config.embeddingModel,
            batchMode: item.config.batchEmbedding,
            vectorDimensions: item.config.vectorDimensions,
            markdownCount,
          });
        } catch (error) {
          this.logger.error(
            `Failed to process ${tableName} for schema ${schemaName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ProcessEmbeddingsWithMarkdownUseCase.name
          );
        }
      }

      this.logger.info(
        `Completed processing: ${processedCount} modifications processed, ${markdownGeneratedCount} markdowns generated`,
        ProcessEmbeddingsWithMarkdownUseCase.name
      );

      return {
        pendingModifications: pendingModifications.length,
        processedModifications: processedCount,
        markdownGenerated: markdownGeneratedCount,
        modifications: results,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process embeddings with markdown generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ProcessEmbeddingsWithMarkdownUseCase.name
      );
      throw error;
    }
  }

  /**
   * Process entities for embedding using repositories and factory pattern
   * @param schemaName - Schema name
   * @param tableName - Table name ('product_embeddings' or 'document_embeddings')
   * @returns Promise<Array<{entity: Product | Document, markdown: string}>> - Processed entities with markdown
   * @private
   */
  private async processEntitiesForEmbedding(
    schemaName: string,
    tableName: string
  ): Promise<{ entity: EmbeddingEntity; markdown: string }[]> {
    this.logger.info(
      `Processing entities for embedding in schema: ${schemaName}, table: ${tableName}`,
      ProcessEmbeddingsWithMarkdownUseCase.name
    );

    // Validate table name
    if (!this.markdownStrategyFactory.isTableSupported(tableName)) {
      throw new DomainValidationError(`Unsupported table name: ${tableName}`);
    }

    // Get entities based on table name using repositories
    const entities = await this.getEntities(schemaName, tableName);

    this.logger.info(
      `Found ${entities.length} entities to process for embedding`,
      ProcessEmbeddingsWithMarkdownUseCase.name
    );

    // Get the appropriate strategy using factory pattern
    const strategy = this.markdownStrategyFactory.getStrategy(tableName);

    const processedEntities: { entity: EmbeddingEntity; markdown: string }[] =
      [];

    // Generate markdown for each entity
    for (const entity of entities) {
      try {
        this.logger.info(
          `Generating markdown for ${tableName} entity: ${JSON.stringify(entity)}`,
          ProcessEmbeddingsWithMarkdownUseCase.name
        );

        const markdown = await strategy.generateMarkdown(entity);

        processedEntities.push({
          entity,
          markdown,
        });

        this.logger.info(
          `Generated markdown for ${tableName} entity: ${'product' in entity ? entity.product.id : entity.document.id}`,
          ProcessEmbeddingsWithMarkdownUseCase.name
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate markdown for ${tableName} entity ${'product' in entity ? entity.product.id : entity.document.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ProcessEmbeddingsWithMarkdownUseCase.name
        );
      }
    }

    this.logger.info(
      `Successfully processed ${processedEntities.length} entities for embedding`,
      ProcessEmbeddingsWithMarkdownUseCase.name
    );

    return processedEntities;
  }

  /**
   * Get entities based on table name using repositories
   * @param schemaName - Schema name
   * @param tableName - Table name
   * @returns Promise<any[]> - Entities to process
   * @private
   */
  private async getEntities(
    schemaName: string,
    tableName: string
  ): Promise<EmbeddingEntity[]> {
    const mapping: Record<
      string,
      (schemaName: string) => Promise<EmbeddingEntity[]>
    > = {
      product_embeddings: (schemaName: string) =>
        this.productRepository.getPendingEmbeddings(schemaName),
      document_embeddings: (schemaName: string) =>
        this.documentRepository.getPendingEmbeddings(schemaName),
    };

    if (!mapping[tableName]) {
      throw new DomainValidationError(`Unsupported table name: ${tableName}`);
    }

    this.logger.info(
      `Mapping for ${tableName} is ${mapping[tableName]}`,
      ProcessEmbeddingsWithMarkdownUseCase.name
    );

    return await mapping[tableName](schemaName);
  }

  /**
   * Store embeddings in the database
   * @param embeddings - Embedding results to store
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
        this.productRepository.storeEmbeddings(
          embeddings,
          schemaName,
          embeddingModel
        ),
      document_embeddings: (
        embeddings: EmbeddingResult[],
        schemaName: string,
        embeddingModel: string
      ) =>
        this.documentRepository.storeEmbeddings(
          embeddings,
          schemaName,
          embeddingModel
        ),
    };

    if (!mapping[tableName]) {
      throw new DomainValidationError(`Unsupported table name: ${tableName}`);
    }

    this.logger.info(
      `Mapping for ${tableName} is ${mapping[tableName]}`,
      ProcessEmbeddingsWithMarkdownUseCase.name
    );

    return await mapping[tableName](embeddings, schemaName, embeddingModel);
  }

  private async processEmbeddings(
    processedEntities: { entity: EmbeddingEntity; markdown: string }[],
    modelName: string,
    useBatchMode: boolean,
    schemaName: string,
    tableName: string
  ): Promise<EmbeddingResult[]> {
    try {
      this.logger.info(
        `Processing embeddings for ${processedEntities.length} entities using model: ${modelName}, batch mode: ${useBatchMode}`,
        ProcessEmbeddingsWithMarkdownUseCase.name
      );

      // Get the appropriate provider strategy
      const provider =
        this.embeddingProviderFactory.getProviderStrategy(modelName);

      // Determine processing mode
      const processingMode = useBatchMode
        ? EmbeddingProcessingMode.BATCH
        : EmbeddingProcessingMode.DIRECT;
      const processingModeStrategy =
        this.embeddingProcessingModeFactory.getProcessingModeStrategy(
          processingMode
        );

      // Validate that the processing mode is supported for this provider
      if (!processingModeStrategy.isSupportedForProvider(provider)) {
        throw new DomainValidationError(
          `Processing mode '${processingMode}' is not supported for provider '${provider.providerName}' with model '${modelName}'`
        );
      }

      // Create processing items with all necessary context
      const processingItems: EmbeddingProcessingItem[] = processedEntities.map(
        item => {
          // The entity is already a ProductEmbedding or DocumentEmbedding
          // We need to extract the embedding ID from the entity
          const embeddingId = item.entity.id;

          return {
            markdown: item.markdown,
            entityId: embeddingId,
            entityType: tableName,
            schemaName,
            embeddingData: item.entity,
          };
        }
      );

      // Process embeddings using the selected strategies
      const embeddings = await processingModeStrategy.processEmbeddings(
        processingItems,
        provider
      );

      this.logger.info(
        `Successfully generated ${embeddings.length} embeddings using ${provider.providerName}:${provider.modelName} in ${processingMode} mode`,
        ProcessEmbeddingsWithMarkdownUseCase.name
      );

      return embeddings;
    } catch (error) {
      this.logger.error(
        `Failed to process embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ProcessEmbeddingsWithMarkdownUseCase.name
      );
      throw error;
    }
  }
}
