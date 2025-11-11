/**
 * Product Category interface
 */
export interface ProductCategory {
  /** Unique category identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Category creation timestamp */
  createdAt: Date;
  /** Category last update timestamp */
  updatedAt: Date;
}

/**
 * Paginated response interface for product category collections
 * Reflects the actual API response structure with data attribute
 */
export interface ProductCategoriesResponse {
  /** Array of product categories */
  data: ProductCategory[];
  /** Total number of categories */
  total: number;
  /** Current page limit */
  limit: number;
  /** Current page offset */
  offset: number;
}
