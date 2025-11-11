/**
 * Product type enum
 */
export enum ProductEnum {
  PRODUCT = 'product',
  SERVICE = 'service',
}
/**
 * Product type type
 */
export type ProductType = (typeof ProductEnum)[keyof typeof ProductEnum];

/**
 * Product currency enum
 */
export enum ProductCurrencyEnum {
  USD = 'USD',
  COP = 'COP',
}

/**
 * Product currency type
 */
export type ProductCurrencyType =
  (typeof ProductCurrencyEnum)[keyof typeof ProductCurrencyEnum];

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
  type: ProductType;
  /** Optional description of the product */
  description?: string;
  /** Optional image URL for the product */
  imageUrl?: string | null;
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
 * Reflects the actual API response structure with data attribute
 */
export interface ProductsResponse {
  /** Array of products */
  data: Product[];
  /** Total number of products */
  total: number;
  /** Current page limit */
  limit: number;
  /** Current page offset */
  offset: number;
}
