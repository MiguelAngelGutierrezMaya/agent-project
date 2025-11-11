import { Module } from '@nestjs/common';
import { PostgresModule } from '@src/shared/persistence/postgresql/postgres.module';
import { ProvidersModule } from '../providers/providers.module';
import { ProductsSearchService } from './products/products-search.service';
import { ProductEmbeddingsSearchService } from './products/product-embeddings-search.service';
import { CompanyInfoService } from './company/company-info.service';

/**
 * Tools Module
 *
 * @description
 * Provides AI tools services for the WhatsApp conversation module.
 * Includes product search functionality and company information with PostgreSQL integration.
 *
 * Structure:
 * - products/: Product-related tools and services
 * - company/: Company information tools and services
 *
 * Note: This module imports ProvidersModule to access EmbeddingProviderFactory
 * for semantic product search functionality. No circular dependency because
 * ProvidersModule doesn't depend on ToolsModule.
 */
@Module({
  imports: [PostgresModule, ProvidersModule],
  providers: [
    ProductsSearchService,
    ProductEmbeddingsSearchService,
    CompanyInfoService,
  ],
  exports: [
    ProductsSearchService,
    ProductEmbeddingsSearchService,
    CompanyInfoService,
  ],
})
export class ToolsModule {}
