import { CreateProductUseCase } from '@/modules/training/products/application/useCases/CreateProductUseCase';
import { DeleteProductUseCase } from '@/modules/training/products/application/useCases/DeleteProductUseCase';
import { GetProductsUseCase } from '@/modules/training/products/application/useCases/GetProductsUseCase';
import { UpdateProductUseCase } from '@/modules/training/products/application/useCases/UpdateProductUseCase';
import type {
  GetProductsRequest,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductRequest,
} from '@/modules/training/products/domain/datasource/ProductDatasource';
import { HttpProductDatasourceImp } from '@/modules/training/products/infrastructure/datasource/HttpProductDatasourceImp';
import { ProductRepositoryImp } from '@/modules/training/products/infrastructure/repositories/ProductRepositoryImp';

/**
 * Product Service
 */
export class ProductService {
  private getProductsUseCase: GetProductsUseCase;
  private createProductUseCase: CreateProductUseCase;
  private updateProductUseCase: UpdateProductUseCase;
  private deleteProductUseCase: DeleteProductUseCase;

  constructor(apiBaseUrl: string) {
    const productDatasource = new HttpProductDatasourceImp(apiBaseUrl);
    const productRepository = new ProductRepositoryImp(productDatasource);

    this.getProductsUseCase = new GetProductsUseCase(productRepository);
    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository);
  }

  async getProducts(request: GetProductsRequest) {
    return this.getProductsUseCase.execute(request);
  }

  async createProduct(request: CreateProductRequest) {
    return this.createProductUseCase.execute(request);
  }

  async updateProduct(request: UpdateProductRequest) {
    return this.updateProductUseCase.execute(request);
  }

  async deleteProduct(request: DeleteProductRequest) {
    return this.deleteProductUseCase.execute(request);
  }
}
