import { useAuth } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';

import type {
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductRequest,
  CreateProductDetail,
  UpdateProductDetail,
} from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { ProductType } from '@/modules/training/products/domain/models/Product';
import { ProductService } from '@/modules/training/products/infrastructure/service/ProductService';

const API_BASE_URL: string = String(
  import.meta.env.VITE_CONFIG_API_BASE_URL || ''
);
const STAGE: string = String(import.meta.env.VITE_STAGE || '');

/**
 * Custom hook to get ProductService instance with authentication
 */
export function useProductService() {
  const { userId, getToken } = useAuth();
  const productService = useMemo(() => {
    const apiBaseUrl = `${API_BASE_URL}/${STAGE}`;
    return new ProductService(apiBaseUrl);
  }, []);

  const getProducts = useCallback(
    async (limit?: number, offset?: number): Promise<GetProductsRequest> => {
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

  const createProduct = useCallback(
    async (
      categoryId: string,
      name: string,
      type: ProductType,
      details: CreateProductDetail,
      description?: string,
      imageUrl?: string,
      isEmbedded?: boolean,
      isFeatured?: boolean
    ): Promise<CreateProductRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        categoryId,
        name,
        type,
        description,
        imageUrl,
        isEmbedded,
        isFeatured,
        details,
      };
    },
    [userId, getToken]
  );

  const updateProduct = useCallback(
    async (
      id: string,
      categoryId?: string,
      name?: string,
      type?: ProductType,
      description?: string,
      imageUrl?: string,
      isEmbedded?: boolean,
      isFeatured?: boolean,
      details?: UpdateProductDetail
    ): Promise<UpdateProductRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        id,
        categoryId,
        name,
        type,
        description,
        imageUrl,
        isEmbedded,
        isFeatured,
        details,
      };
    },
    [userId, getToken]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<DeleteProductRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        id,
      };
    },
    [userId, getToken]
  );

  return {
    productService,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    userId,
  };
}
