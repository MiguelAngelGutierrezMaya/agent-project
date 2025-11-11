import type { CreateProductRequest } from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { Product } from '@/modules/training/products/domain/models/Product';
import type { ProductRepository } from '@/modules/training/products/domain/repositories/ProductRepository';

/**
 * Create Product Use Case
 */
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest): Promise<Product> {
    return this.productRepository.createProduct(request);
  }
}
