import { PaginatedResponse } from '@src/infrastructure/shared/models/PaginatedResponse';

/**
 * Product details interface containing pricing and detailed information
 */
export interface ProductDetail {
  /** Unique product detail identifier */
  id: string;
  /** Product price (must be >= 0) */
  price: number;
  /** Currency code (ISO 4217, e.g., USD, EUR, MXN) */
  currency: string;
  /** Detailed product description with specifications and features */
  detailedDescription?: string;
  /** Product detail creation timestamp */
  createdAt: Date;
  /** Product detail last update timestamp */
  updatedAt: Date;
}

/**
 * Base product data interface containing product properties
 */
export interface ProductData {
  /** Category identifier this product belongs to */
  categoryId: string;
  /** Name of the product */
  name: string;
  /** Type of product (physical product or service) */
  type: 'product' | 'service';
  /** Optional description of the product */
  description?: string;
  /** Optional image URL for the product */
  imageUrl?: string;
  /** Whether the product is embedded in the system */
  isEmbedded: boolean;
  /** Whether the product is featured/highlighted for display in interactive lists */
  isFeatured: boolean;
  /** Product creation timestamp */
  createdAt: Date;
  /** Product last update timestamp */
  updatedAt: Date;
  /** Product details (pricing and detailed information) */
  details: ProductDetail;
}

/**
 * Complete product interface including unique identifier
 */
export interface Product extends ProductData {
  /** Unique product identifier */
  id: string;
}

/**
 * Paginated response interface for product collections
 */
export interface ProductsResponse extends PaginatedResponse<Product> {}
