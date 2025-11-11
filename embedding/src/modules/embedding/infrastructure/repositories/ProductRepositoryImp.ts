import { ProductRepository } from '@modules/embedding/domain/repositories/ProductRepository';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { ProductDatasource } from '@modules/embedding/domain/datasource/ProductDatasource';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

/**
 * Implementation of the ProductRepository interface
 * Delegates product embedding operations to the datasource layer
 */
export class ProductRepositoryImp implements ProductRepository {
  /**
   * Creates a new ProductRepositoryImp instance
   * @param productDatasource - The datasource implementation for product embedding operations
   */
  constructor(private readonly productDatasource: ProductDatasource) {}

  /**
   * Get product embeddings that need embedding processing
   * @param schemaName - Schema name to query
   * @returns Promise<ProductEmbedding[]> - List of product embeddings
   */
  async getPendingEmbeddings(schemaName: string): Promise<ProductEmbedding[]> {
    return this.productDatasource.getPendingEmbeddings(schemaName);
  }

  async storeEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    return this.productDatasource.storeEmbeddings(
      embeddings,
      schemaName,
      embeddingModel
    );
  }

  async getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<ProductEmbedding[]> {
    return this.productDatasource.getProcessingEmbeddingsWithBatchId(
      schemaName
    );
  }

  async updateCompletedEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    return this.productDatasource.updateCompletedEmbeddings(
      embeddings,
      schemaName,
      embeddingModel
    );
  }
}
