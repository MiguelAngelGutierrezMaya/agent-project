import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type {
  ProductEmbedding,
  DatabaseProductEmbeddingData,
} from '@modules/embedding/domain/models/Product';
import { ProductType } from '@modules/embedding/domain/models/Product';
import { ProductDTO } from '@modules/embedding/domain/dto/ProductDTO';

/**
 * Product Embedding DTO
 *
 * @description
 * Data Transfer Object for product embedding data including the product information.
 * This is the main DTO for embedding operations.
 */
export class ProductEmbeddingDTO {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly markdownContent: string,
    public readonly embeddingStatus: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly product: ProductDTO,
    public readonly embedding?: number[],
    public readonly embeddingModel?: string,
    public readonly batchId?: string
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: DatabaseProductEmbeddingData
  ): [ProductEmbeddingDTO?, DomainValidationError?] {
    const id = data.id;
    const productId = data.product_id;
    const markdownContent = data.content_markdown;
    const embeddingStatus = data.embedding_status;
    const embedding = data.embedding;
    const embeddingModel = data.embedding_model;
    const batchId = data.batch_id;

    // Parse dates with validation
    const createdAt = new Date(data.created_at);
    const updatedAt = new Date(data.updated_at);

    /* Validate ONLY required fields from database schema */
    if (!id || !productId || !embeddingStatus) {
      return [
        undefined,
        new DomainValidationError(
          `Invalid product embedding data: missing required fields - id: ${id}, productId: ${productId}, embeddingStatus: ${embeddingStatus}`
        ),
      ];
    }

    /* Validate dates are valid */
    if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid product embedding data: invalid date values'
        ),
      ];
    }

    // Build product DTO (REQUIRED)
    const [productDTO, productError] = ProductDTO.create({
      id: productId,
      name: data.product_name || '',
      type: data.product_type as ProductType,
      description: data.product_description,
      image_url: data.product_image_url,
      is_embedded: data.product_is_embedded || false,
      is_featured: data.product_is_featured || false,
      created_at: data.product_created_at
        ? new Date(data.product_created_at)
        : new Date(),
      updated_at: data.product_updated_at
        ? new Date(data.product_updated_at)
        : new Date(),
      category_id: data.category_id || '',
      details: data.product_details_id
        ? {
            id: data.product_details_id,
            price: data.product_details_price || 0,
            currency: data.product_details_currency || 'USD',
            detailed_description: data.product_details_detailed_description,
            created_at: data.product_details_created_at
              ? new Date(data.product_details_created_at)
              : new Date(),
            updated_at: data.product_details_updated_at
              ? new Date(data.product_details_updated_at)
              : new Date(),
          }
        : undefined,
      category: data.category_id
        ? {
            id: data.category_id,
            name: data.category_name || '',
            description: data.category_description,
            created_at: data.category_created_at
              ? new Date(data.category_created_at)
              : new Date(),
            updated_at: data.category_updated_at
              ? new Date(data.category_updated_at)
              : new Date(),
          }
        : undefined,
    });

    if (productError || !productDTO) {
      return [
        undefined,
        productError ||
          new DomainValidationError('Failed to create product DTO'),
      ];
    }

    return [
      new ProductEmbeddingDTO(
        id,
        productId,
        markdownContent,
        embeddingStatus,
        createdAt,
        updatedAt,
        productDTO,
        embedding,
        embeddingModel,
        batchId
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns ProductEmbedding domain model
   */
  public toDomain(): ProductEmbedding {
    return {
      id: this.id,
      product: this.product.toDomain(),
      markdown: this.markdownContent,
      embeddingModel: this.embeddingModel,
      batchId: this.batchId,
      embeddingStatus: this.embeddingStatus,
    };
  }
}
