import { PaginatedResponse } from '@src/infrastructure/shared/models/PaginatedResponse';

export interface ProductCategoryData {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory extends ProductCategoryData {
  id: string;
}

export interface ProductCategoriesResponse
  extends PaginatedResponse<ProductCategory> {}
