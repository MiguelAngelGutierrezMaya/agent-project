import { Service } from '@modules/infrastructure/presentation/service';
import { Application } from '@src/infrastructure/presentation/application';
import { HTTP_STATUS_CODES } from '@src/infrastructure/shared/utils/constants';
import { ProcessEmbeddingsWithMarkdownUseCase } from '@modules/embedding/application/use-cases/ProcessEmbeddingsWithMarkdownUseCase';
import { CheckBatchEmbeddingsStatusUseCase } from '@modules/embedding/application/use-cases/CheckBatchEmbeddingsStatusUseCase';
import { CompanyModificationRepositoryImp } from '@modules/embedding/infrastructure/repositories/CompanyModificationRepositoryImp';
import { CompanyRequestRepositoryImp } from '@modules/embedding/infrastructure/repositories/CompanyRequestRepositoryImp';
import { ProductRepositoryImp } from '@modules/embedding/infrastructure/repositories/ProductRepositoryImp';
import { DocumentRepositoryImp } from '@modules/embedding/infrastructure/repositories/DocumentRepositoryImp';
import { PgCompanyModificationDatasourceImp } from '@modules/embedding/infrastructure/datasource/PgCompanyModificationDatasourceImp';
import { PgCompanyRequestDatasourceImp } from '@modules/embedding/infrastructure/datasource/PgCompanyRequestDatasourceImp';
import { PgProductDatasourceImp } from '@modules/embedding/infrastructure/datasource/PgProductDatasourceImp';
import { PgDocumentDatasourceImp } from '@modules/embedding/infrastructure/datasource/PgDocumentDatasourceImp';
import { EmbeddingAction } from '@lib/domain/interfaces/EmbeddingEvent';
import { MarkdownGenerationStrategyFactoryImp } from '@modules/embedding/infrastructure/factories/MarkdownGenerationStrategyFactoryImp';
import { EmbeddingProviderStrategyFactoryImp } from '@modules/embedding/infrastructure/factories/EmbeddingProviderStrategyFactoryImp';
import { EmbeddingProcessingModeStrategyFactoryImp } from '@modules/embedding/infrastructure/factories/EmbeddingProcessingModeStrategyFactoryImp';

export class EmbeddingService extends Service {
  private processEmbeddingsWithMarkdownUseCase: ProcessEmbeddingsWithMarkdownUseCase;

  /**
   * Constructor for the EmbeddingService
   * @param {Application} app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    // Initialize datasources
    const companyModificationDatasource =
      new PgCompanyModificationDatasourceImp(this.app.logger);
    const companyRequestDatasource = new PgCompanyRequestDatasourceImp(
      this.app.logger
    );
    const productDatasource = new PgProductDatasourceImp(this.app.logger);
    const documentDatasource = new PgDocumentDatasourceImp(this.app.logger);

    // Initialize repositories
    const companyModificationRepository = new CompanyModificationRepositoryImp(
      companyModificationDatasource
    );
    const companyRequestRepository = new CompanyRequestRepositoryImp(
      companyRequestDatasource
    );
    const productRepository = new ProductRepositoryImp(productDatasource);
    const documentRepository = new DocumentRepositoryImp(documentDatasource);

    const markdownStrategyFactory = new MarkdownGenerationStrategyFactoryImp();
    const embeddingProviderFactory = new EmbeddingProviderStrategyFactoryImp();
    const embeddingProcessingModeFactory =
      new EmbeddingProcessingModeStrategyFactoryImp();

    // Initialize the main use case with repositories and factories
    this.processEmbeddingsWithMarkdownUseCase =
      new ProcessEmbeddingsWithMarkdownUseCase(
        companyModificationRepository,
        companyRequestRepository,
        productRepository,
        documentRepository,
        markdownStrategyFactory,
        embeddingProviderFactory,
        embeddingProcessingModeFactory,
        this.app.logger
      );
  }

  /**
   * Execute the embedding service POST
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async executePOST(): Promise<Response> {
    this.app.logger.info('Executing POST request', EmbeddingService.name);

    return this.processEmbeddings('Embedding processing initiated');
  }

  /**
   * Execute the embedding service EVENT_BRIDGE
   * @returns {Promise<Response>} The response from the embedding service
   */
  override async executeEVENT_BRIDGE(): Promise<Response> {
    this.app.logger.info(
      'Executing EVENT_BRIDGE request',
      EmbeddingService.name
    );

    return this.processEmbeddings(
      'Embedding processing initiated via EventBridge'
    );
  }

  private async processEmbeddings(message: string): Promise<Response> {
    const result = await this.processEmbeddingsWithMarkdownUseCase.execute();

    return new Response(
      JSON.stringify({
        success: true,
        message,
        operation: EmbeddingAction.GENERATE_EMBEDDINGS,
        ...result,
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}

export class EmbeddingStatusService extends Service {
  private checkBatchEmbeddingsStatusUseCase: CheckBatchEmbeddingsStatusUseCase;

  /**
   * Constructor for the EmbeddingStatusService
   * @param {Application} app - The application instance
   */
  constructor(public readonly app: Application) {
    super(app);

    // Initialize datasources
    const companyRequestDatasource = new PgCompanyRequestDatasourceImp(
      this.app.logger
    );
    const productDatasource = new PgProductDatasourceImp(this.app.logger);
    const documentDatasource = new PgDocumentDatasourceImp(this.app.logger);

    // Initialize repositories
    const companyRequestRepository = new CompanyRequestRepositoryImp(
      companyRequestDatasource
    );
    const productRepository = new ProductRepositoryImp(productDatasource);
    const documentRepository = new DocumentRepositoryImp(documentDatasource);

    // Initialize embedding provider factory
    const embeddingProviderFactory = new EmbeddingProviderStrategyFactoryImp();

    // Initialize the use case
    this.checkBatchEmbeddingsStatusUseCase =
      new CheckBatchEmbeddingsStatusUseCase(
        companyRequestRepository,
        productRepository,
        documentRepository,
        embeddingProviderFactory,
        this.app.logger
      );
  }

  /**
   * Execute the embedding status service POST
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async executePOST(): Promise<Response> {
    this.app.logger.info('Executing POST request', EmbeddingStatusService.name);

    return this.checkEmbeddingStatus('Embedding status check completed');
  }

  /**
   * Execute the embedding status service EVENT_BRIDGE
   * @returns {Promise<Response>} The response from the embedding status service
   */
  override async executeEVENT_BRIDGE(): Promise<Response> {
    this.app.logger.info(
      'Executing EVENT_BRIDGE request',
      EmbeddingStatusService.name
    );

    return this.checkEmbeddingStatus(
      'Embedding status check completed via EventBridge'
    );
  }

  private async checkEmbeddingStatus(message: string): Promise<Response> {
    const result = await this.checkBatchEmbeddingsStatusUseCase.execute();

    return new Response(
      JSON.stringify({
        success: true,
        message,
        operation: EmbeddingAction.CHECK_EMBEDDING_STATUS,
        ...result,
      }),
      {
        status: HTTP_STATUS_CODES.SUCCESS,
      }
    );
  }
}
