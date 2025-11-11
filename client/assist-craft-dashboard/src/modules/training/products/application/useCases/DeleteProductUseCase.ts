import type { DeleteProductRequest } from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { ProductRepository } from '@/modules/training/products/domain/repositories/ProductRepository';

/**
 * Delete Product Use Case
 */
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: DeleteProductRequest): Promise<void> {
    return this.productRepository.deleteProduct(request);
  }
}
