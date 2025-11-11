import { DomainValidationError } from '@src/infrastructure/shared/utils/errors/domain';
import type {
  Product,
  ProductDetail,
  Category,
  ProductMetadata,
  DatabaseProductData,
} from '@modules/embedding/domain/models/Product';
import { ProductType } from '@modules/embedding/domain/models/Product';

/**
 * Product DTO
 *
 * @description
 * Data Transfer Object for comprehensive product data including details and category.
 * Validates data from database before converting to domain model.
 */
export class ProductDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: ProductType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly isEmbedded?: boolean,
    public readonly isFeatured?: boolean,
    public readonly metadata?: ProductMetadata,
    public readonly details?: ProductDetail,
    public readonly category?: Category
  ) {}

  /**
   * Create DTO from database record
   *
   * @param data Raw data from database
   * @returns Tuple of [DTO?, Error?]
   */
  static create(
    data: DatabaseProductData
  ): [ProductDTO?, DomainValidationError?] {
    const id = data.id;
    const name = data.name as string;
    const type = data.type as ProductType;
    const description = data.description as string | undefined;
    const imageUrl = data.image_url as string | undefined;
    const isEmbedded = data.is_embedded as boolean | undefined;
    const isFeatured = data.is_featured as boolean | undefined;
    const metadata = data.metadata as ProductMetadata | undefined;

    // Parse dates with validation
    const createdAt = new Date(data.created_at);
    const updatedAt = new Date(data.updated_at);

    // Product details
    const details: ProductDetail | undefined = data.details
      ? {
          id: data.details.id,
          price: data.details.price || 0,
          currency: data.details.currency,
          detailedDescription: data.details.detailed_description,
          createdAt: new Date(data.details.created_at),
          updatedAt: new Date(data.details.updated_at),
        }
      : undefined;

    // Category information
    const category: Category | undefined = data.category
      ? {
          id: data.category.id,
          name: data.category.name,
          description: data.category.description,
          createdAt: new Date(data.category.created_at),
          updatedAt: new Date(data.category.updated_at),
        }
      : undefined;

    /* Validate ONLY required fields from database schema */
    if (!id || !name || !type) {
      return [
        undefined,
        new DomainValidationError(
          'Invalid product data: missing required fields (id, name, type)'
        ),
      ];
    }

    /* Validate dates are valid */
    if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      return [
        undefined,
        new DomainValidationError('Invalid product data: invalid date values'),
      ];
    }

    return [
      new ProductDTO(
        id as string,
        name,
        type,
        createdAt as Date,
        updatedAt as Date,
        description,
        imageUrl,
        isEmbedded,
        isFeatured,
        metadata,
        details,
        category
      ),
      undefined,
    ];
  }

  /**
   * Convert DTO to domain model
   *
   * @returns Product domain model
   */
  public toDomain(): Product {
    if (!this.details || !this.category) {
      throw new DomainValidationError(
        'Product details and category are required for domain conversion'
      );
    }

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      imageUrl: this.imageUrl,
      isEmbedded: this.isEmbedded || false,
      isFeatured: this.isFeatured || false,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      details: this.details,
      category: this.category,
      metadata: this.metadata,
    };
  }
}
