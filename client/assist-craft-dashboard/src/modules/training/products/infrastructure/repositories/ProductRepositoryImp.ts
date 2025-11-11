import type {
  ProductDatasource,
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductRequest,
} from '@/modules/training/products/domain/datasource/ProductDatasource';
import type { ProductRepository } from '@/modules/training/products/domain/repositories/ProductRepository';

/**
 * Product Repository Implementation
 */
export class ProductRepositoryImp implements ProductRepository {
  constructor(private readonly productDatasource: ProductDatasource) {}

  async getProducts(request: GetProductsRequest) {
    return this.productDatasource.getProducts(request);
  }

  async createProduct(request: CreateProductRequest) {
    return this.productDatasource.createProduct(request);
  }

  async updateProduct(request: UpdateProductRequest) {
    return this.productDatasource.updateProduct(request);
  }

  async deleteProduct(request: DeleteProductRequest) {
    return this.productDatasource.deleteProduct(request);
  }
}
