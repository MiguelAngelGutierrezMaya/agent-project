/**
 * Product Search Types
 *
 * @description
 * Type definitions for product search operations in the chat service.
 * These types represent database query results and are used for
 * transforming raw database rows into domain models.
 */

/**
 * Database row type for basic product queries
 *
 * @description
 * Represents a single row from a database query that joins
 * products with their categories (without product details).
 * Used for featured products and general product listings.
 */
export type ProductRow = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  description?: string;
  imageUrl?: string;
  isEmbedded: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string;
  categoryDescription?: string;
  categoryCreatedAt: Date;
  categoryUpdatedAt: Date;
};

/**
 * Database row type for detailed product queries
 *
 * @description
 * Represents a single row from a database query that joins
 * products with their categories AND product details.
 * Used for getting complete product information including pricing.
 */
export type ProductDetailRow = {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  description?: string;
  imageUrl?: string;
  isEmbedded: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string;
  categoryDescription?: string;
  categoryCreatedAt: Date;
  categoryUpdatedAt: Date;
  detailId: string;
  price: number;
  currency: string;
  detailedDescription?: string;
  detailCreatedAt: Date;
  detailUpdatedAt: Date;
};
