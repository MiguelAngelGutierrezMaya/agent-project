import type { UpdateProductRequest } from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { Product } from '@/modules/training/products/domain/models/Product';
import type { ProductRepository } from '@/modules/training/products/domain/repositories/ProductRepository';

/**
 * Update Product Use Case
 */
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: UpdateProductRequest): Promise<Product> {
    return this.productRepository.updateProduct(request);
  }
}
