import { Product } from '@modules/embedding/domain/models/Product';

/**
 * Product Embedding Model
 *
 * @description
 * Represents a product with its embedding data and related information
 */
export interface ProductEmbedding {
  /** The product object with all its data */
  product: Product;
  /** Generated markdown content */
  markdown: string;
  /** Schema name where the product exists */
  schemaName: string;
}
