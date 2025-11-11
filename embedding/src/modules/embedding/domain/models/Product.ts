/**
 * Product Type Enum
 *
 * @description
 * Defines the types of products
 */
export enum ProductType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

/**
 * Product Detail Interface
 *
 * @description
 * Represents product pricing and detailed information
 */
export interface ProductDetail {
  id: string;
  price: number;
  currency: string;
  detailedDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Interface
 *
 * @description
 * Represents product category information
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Metadata Type
 *
 * @description
 * Defines the structure for product metadata
 */
export type ProductMetadata = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Database Product Data Type
 *
 * @description
 * Type for product data coming from database
 */
export interface DatabaseProductData {
  id: string;
  category_id: string;
  name: string;
  type: string;
  description?: string;
  image_url?: string;
  is_embedded?: boolean;
  is_featured?: boolean;
  metadata?: ProductMetadata;
  created_at: string | Date;
  updated_at: string | Date;
  details?: DatabaseProductDetails;
  category?: DatabaseCategory;
}

/**
 * Database Product Details Type
 *
 * @description
 * Type for product details data coming from database
 */
export interface DatabaseProductDetails {
  id: string;
  price: number;
  currency: string;
  detailed_description?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Database Category Type
 *
 * @description
 * Type for category data coming from database
 */
export interface DatabaseCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

/**
 * Database Product Embedding Data Type
 *
 * @description
 * Type for product embedding data coming from database
 */
export interface DatabaseProductEmbeddingData {
  id: string;
  product_id: string;
  content_markdown: string;
  embedding_status: string;
  embedding_model?: string;
  batch_id?: string;
  embedding?: number[];
  created_at: string | Date;
  updated_at: string | Date;
  // Product data from JOIN
  product_name?: string;
  product_type?: string;
  product_description?: string;
  product_image_url?: string;
  product_is_embedded?: boolean;
  product_is_featured?: boolean;
  product_created_at?: string | Date;
  product_updated_at?: string | Date;
  // Product details from JOIN
  product_details_id?: string;
  product_details_price?: number;
  product_details_currency?: string;
  product_details_detailed_description?: string;
  product_details_created_at?: string | Date;
  product_details_updated_at?: string | Date;
  // Category data from JOIN
  category_id?: string;
  category_name?: string;
  category_description?: string;
  category_created_at?: string | Date;
  category_updated_at?: string | Date;
}

/**
 * Product Model
 *
 * @description
 * Represents a product with all its related information
 */
export interface Product {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Product type */
  type: ProductType;
  /** Product description */
  description?: string;
  /** Product image URL */
  imageUrl?: string;
  /** Whether product is embedded */
  isEmbedded: boolean;
  /** Whether product is featured */
  isFeatured: boolean;
  /** Product creation date */
  createdAt: Date;
  /** Product update date */
  updatedAt: Date;
  /** Product details */
  details: ProductDetail;
  /** Product category */
  category: Category;
  /** Product metadata */
  metadata?: ProductMetadata;
}

/**
 * Product Embedding Model
 *
 * @description
 * Represents a product with its embedding data and related information
 */
export interface ProductEmbedding {
  /** The embedding table ID */
  id: string;
  /** The product object with all its data */
  product: Product;
  /** Generated markdown content */
  markdown: string;
  /** Embedding model used */
  embeddingModel?: string;
  /** Batch ID for batch processing */
  batchId?: string;
  /** Embedding status */
  embeddingStatus?: string;
}
