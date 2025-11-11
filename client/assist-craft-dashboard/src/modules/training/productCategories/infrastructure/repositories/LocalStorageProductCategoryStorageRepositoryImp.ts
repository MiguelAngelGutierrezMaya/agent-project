import type { ProductCategoriesResponse } from '@/modules/training/productCategories/domain/models/ProductCategory';
import type { ProductCategoryStorageRepository } from '@/modules/training/productCategories/domain/repositories/ProductCategoryStorageRepository';

/**
 * Storage key for product category cache
 */
const CATEGORIES_CACHE_KEY = 'product_categories_cache';
const CATEGORIES_CACHE_TIMESTAMP_KEY = 'product_categories_cache_timestamp';
const CACHE_DURATION_MS = 1 * 60 * 1000; // 1 minute

/**
 * LocalStorage Product Category Storage Repository Implementation
 * Implements the repository pattern for product category cache operations
 */
export class LocalStorageProductCategoryStorageRepositoryImp
  implements ProductCategoryStorageRepository
{
  /**
   * Retrieve cached product categories if still valid
   * @returns Cached product categories response or null if expired/missing
   */
  getCachedCategories(): ProductCategoriesResponse | null {
    if (!this.isCacheValid()) {
      this.clearCache();
      return null;
    }

    const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
    if (!cached) {
      return null;
    }

    try {
      const categories = JSON.parse(cached) as ProductCategoriesResponse;
      /* Convert date strings back to Date objects */
      return this.parseDates(categories);
    } catch (error) {
      console.error(
        '[LocalStorageProductCategoryStorage] Error parsing cached categories:',
        error
      );
      this.clearCache();
      return null;
    }
  }

  /**
   * Save product categories to cache with timestamp
   * @param categories - Product categories response to cache
   */
  saveToCache(categories: ProductCategoriesResponse): void {
    try {
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
      localStorage.setItem(
        CATEGORIES_CACHE_TIMESTAMP_KEY,
        Date.now().toString()
      );
    } catch (error) {
      console.error(
        '[LocalStorageProductCategoryStorage] Error saving categories to cache:',
        error
      );
    }
  }

  /**
   * Check if cached product categories is still valid (not older than 1 minute)
   * @returns true if cache is valid, false otherwise
   */
  isCacheValid(): boolean {
    const timestamp = localStorage.getItem(CATEGORIES_CACHE_TIMESTAMP_KEY);
    if (!timestamp) {
      return false;
    }

    const timestampMs = Number.parseInt(timestamp, 10);
    if (Number.isNaN(timestampMs)) {
      return false;
    }

    const now = Date.now();
    const age = now - timestampMs;
    return age < CACHE_DURATION_MS;
  }

  /**
   * Clear cached product categories
   */
  clearCache(): void {
    localStorage.removeItem(CATEGORIES_CACHE_KEY);
    localStorage.removeItem(CATEGORIES_CACHE_TIMESTAMP_KEY);
  }

  /**
   * Parse date strings in product categories to Date objects
   * @param categories - Product categories response with date strings
   * @returns Product categories response with Date objects
   */
  private parseDates(
    categories: ProductCategoriesResponse
  ): ProductCategoriesResponse {
    return {
      ...categories,
      data: categories.data.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })),
    };
  }
}
