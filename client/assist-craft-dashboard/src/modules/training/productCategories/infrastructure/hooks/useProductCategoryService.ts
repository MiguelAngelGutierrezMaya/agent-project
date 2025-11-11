import { useAuth } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';

import type { GetProductCategoriesRequest } from '@/modules/training/productCategories/domain/datasource/ProductCategoryDatasource';
import { ProductCategoryService } from '@/modules/training/productCategories/infrastructure/service/ProductCategoryService';

const API_BASE_URL: string = String(
  import.meta.env.VITE_CONFIG_API_BASE_URL || ''
);
const STAGE: string = String(import.meta.env.VITE_STAGE || '');

/**
 * Custom hook to get ProductCategoryService instance with authentication
 */
export function useProductCategoryService() {
  const { userId, getToken } = useAuth();
  const productCategoryService = useMemo(() => {
    const apiBaseUrl = `${API_BASE_URL}/${STAGE}`;
    return new ProductCategoryService(apiBaseUrl);
  }, []);

  const getProductCategories = useCallback(
    async (
      limit?: number,
      offset?: number
    ): Promise<GetProductCategoriesRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        limit,
        offset,
      };
    },
    [userId, getToken]
  );

  return {
    productCategoryService,
    getProductCategories,
    userId,
  };
}
