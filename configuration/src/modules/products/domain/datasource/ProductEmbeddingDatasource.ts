import {
  ProductEmbedding,
  CreateProductEmbeddingData,
} from '@modules/products/domain/models/ProductEmbedding';

/**
 * Product Embedding Datasource Interface
 *
 * @description
 * Defines the contract for product embedding data operations.
 * Handles CRUD operations for product embeddings.
 */
export interface ProductEmbeddingDatasource {
  /**
   * Create a new product embedding record
   * @param userId - Clerk user ID
   * @param data - Product embedding data
   * @returns Promise<ProductEmbedding> - Created product embedding
   */
  createProductEmbedding(
    userId: string,
    data: CreateProductEmbeddingData
  ): Promise<ProductEmbedding>;

  /**
   * Delete product embedding by product ID
   * @param userId - Clerk user ID
   * @param productId - Product identifier
   * @returns Promise<void>
   */
  deleteProductEmbeddingByProductId(
    userId: string,
    productId: string
  ): Promise<void>;

  /**
   * Update or create product embedding (upsert)
   * @param userId - Clerk user ID
   * @param data - Product embedding data
   * @returns Promise<ProductEmbedding> - Updated or created product embedding
   */
  upsertProductEmbedding(
    userId: string,
    data: CreateProductEmbeddingData
  ): Promise<ProductEmbedding>;
}
