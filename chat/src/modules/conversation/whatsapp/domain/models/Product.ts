/**
 * Product type enumeration
 *
 * @description
 * Defines the possible types of products/services in the system.
 */
export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

/**
 * Product details domain model
 *
 * @description
 * Represents detailed information about a product including pricing.
 */
export interface ProductDetail {
  /** Unique identifier */
  id: string;

  /** Product price */
  price: number;

  /** Currency code (ISO 4217) */
  currency: string;

  /** Detailed product description */
  detailedDescription?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Product domain model
 *
 * @description
 * Represents a product or service in the system.
 * Synchronized with configuration service models.
 */
export interface Product {
  /** Unique identifier */
  id: string;

  /** Category identifier */
  categoryId: string;

  /** Product name */
  name: string;

  /** Product type (physical product or service) */
  type: ProductType;

  /** Product description */
  description?: string;

  /** Product image URL */
  imageUrl?: string;

  /** Whether the product is embedded in the system */
  isEmbedded: boolean;

  /** Whether the product is featured */
  isFeatured: boolean;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Complete category information (from JOIN) */
  category: ProductCategory;

  /** Product details (pricing, detailed description) */
  details?: ProductDetail;
}

/**
 * Product category domain model
 *
 * @description
 * Represents a product category for grouping products.
 * Synchronized with configuration service models.
 */
export interface ProductCategory {
  /** Unique identifier */
  id: string;

  /** Category name */
  name: string;

  /** Category description */
  description?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
