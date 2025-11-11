import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';

/**
 * Product Category Storage Repository Interface
 * Defines the contract for product category cache storage operations
 */
export interface ProductCategoryStorageRepository {
  /**
   * Retrieve cached product categories if still valid
   * @returns Cached product categories response or null if expired/missing
   */
  getCachedCategories(): ProductCategoriesResponse | null;

  /**
   * Save product categories to cache with timestamp
   * @param categories - Product categories response to cache
   */
  saveToCache(categories: ProductCategoriesResponse): void;

  /**
   * Check if cached product categories is still valid (not older than 1 minute)
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(): boolean;

  /**
   * Clear cached product categories
   */
  clearCache(): void;
}
