import type { GetProductsRequest } from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { ProductsResponse } from '@/modules/training/products/domain/models/Product';
import type { ProductRepository } from '@/modules/training/products/domain/repositories/ProductRepository';

/**
 * Get Products Use Case
 */
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: GetProductsRequest): Promise<ProductsResponse> {
    return this.productRepository.getProducts(request);
  }
}
