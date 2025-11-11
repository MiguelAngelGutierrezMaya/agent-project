import { Injectable, Logger } from '@nestjs/common';
import { PostgresConnectionService } from '@src/shared/persistence/postgresql/postgres-connection.service';
import {
  Product,
  ProductType,
} from '@src/modules/conversation/whatsapp/domain/models/Product';
import { ProductRow, ProductDetailRow } from './product-search-types';

/**
 * Products Search Service
 *
 * @description
 * Injectable NestJS service for searching and retrieving products/services.
 * Currently provides method to get featured products, with search functionality to be added later.
 *
 * Features:
 * - Get featured products (is_featured = true)
 * - Excludes deleted products
 * - Orders by creation date descending (newest first)
 * - Supports multi-tenant schema switching
 * - Single optimized query with JOIN for category name
 */
@Injectable()
export class ProductsSearchService {
  private readonly logger = new Logger(ProductsSearchService.name);

  constructor(private readonly postgresConnection: PostgresConnectionService) {}

  /**
   * Get featured products
   *
   * @param schema Client's database schema (for multi-tenancy)
   * @returns Array of featured products
   *
   * @description
   * Gets the 10 most recent featured products/services for a client.
   * Queries PostgreSQL database directly using the schema for multi-tenancy.
   *
   * SQL Query:
   * - Sets search path to tenant schema
   * - Gets products with category names (only featured products)
   * - Excludes deleted products
   * - Orders by creation date descending
   * - Limits to 10 results
   */
  async getFeaturedProducts(schema: string): Promise<Product[]> {
    try {
      this.logger.log(`Getting featured products - Schema: ${schema}`);

      const result = await this.postgresConnection.transaction(async client => {
        // Set schema context for multi-tenancy
        await client.query(this.postgresConnection.getSchemaQuery(schema));

        // Single optimized query for featured products with complete category information
        const query = `
          SELECT
            p.id,
            p.category_id AS "categoryId",
            p.name,
            p.type,
            p.description,
            p.image_url AS "imageUrl",
            p.is_embedded AS "isEmbedded",
            p.is_featured AS "isFeatured",
            p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            c.name AS "categoryName",
            c.description AS "categoryDescription",
            c.created_at AS "categoryCreatedAt",
            c.updated_at AS "categoryUpdatedAt"
          FROM products p
          LEFT JOIN product_categories c ON p.category_id = c.id
          WHERE p.deleted_at IS NULL
            AND c.deleted_at IS NULL
            AND p.is_featured = true
          ORDER BY p.created_at DESC
          LIMIT 10
        `;

        // Execute the single query
        const productsResult = await client.query(query);

        // Transform database rows to Product models
        const products = productsResult.rows.map(row =>
          this.transformRowToProduct(row as ProductRow)
        );

        return products;
      });

      this.logger.debug(`Found ${result.length} featured products`);

      return result;
    } catch (error) {
      this.logger.error(
        `Featured products error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return [];
    }
  }

  /**
   * Get product details by ID
   *
   * @param schema Client's database schema (for multi-tenancy)
   * @param productId Product ID to search for
   * @returns Product with details or null if not found
   *
   * @description
   * Gets detailed information about a specific product including pricing and detailed description.
   * Queries PostgreSQL database directly using the schema for multi-tenancy.
   *
   * SQL Query:
   * - Sets search path to tenant schema
   * - Gets product with category and details information
   * - Excludes deleted products and details
   * - Returns complete product information with pricing
   */
  async getProductDetails(
    schema: string,
    productId: string
  ): Promise<Product | null> {
    try {
      this.logger.log(
        `Getting product details - Schema: ${schema}, Product ID: ${productId}`
      );

      const result = await this.postgresConnection.transaction(async client => {
        // Set schema context for multi-tenancy
        await client.query(this.postgresConnection.getSchemaQuery(schema));

        // Single optimized query for product with complete details
        const query = `
          SELECT
            p.id,
            p.category_id AS "categoryId",
            p.name,
            p.type,
            p.description,
            p.image_url AS "imageUrl",
            p.is_embedded AS "isEmbedded",
            p.is_featured AS "isFeatured",
            p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            c.name AS "categoryName",
            c.description AS "categoryDescription",
            c.created_at AS "categoryCreatedAt",
            c.updated_at AS "categoryUpdatedAt",
            pd.id AS "detailId",
            pd.price,
            pd.currency,
            pd.detailed_description AS "detailedDescription",
            pd.created_at AS "detailCreatedAt",
            pd.updated_at AS "detailUpdatedAt"
          FROM products p
          LEFT JOIN product_categories c ON p.category_id = c.id
          LEFT JOIN product_details pd ON p.id = pd.product_id AND pd.deleted_at IS NULL
          WHERE p.id = $1 
            AND p.deleted_at IS NULL
            AND c.deleted_at IS NULL
        `;

        // Execute the query
        const productResult = await client.query(query, [productId]);

        if (productResult.rows.length === 0) {
          return null;
        }

        // Transform database row to Product model with details
        const product = this.transformDetailRowToProduct(
          productResult.rows[0] as ProductDetailRow
        );

        return product;
      });

      if (result) {
        this.logger.debug(
          `Product details found - Schema: ${schema}, Product ID: ${productId}`
        );
      } else {
        this.logger.debug(
          `Product not found - Schema: ${schema}, Product ID: ${productId}`
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Product details error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return null;
    }
  }

  /**
   * Transform database row to Product model
   *
   * @param row Database query result row
   * @returns Product model
   * @private
   */
  private transformRowToProduct(row: ProductRow): Product {
    return {
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      type: row.type as ProductType,
      description: row.description,
      imageUrl: row.imageUrl,
      isEmbedded: row.isEmbedded,
      isFeatured: row.isFeatured,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt,
      },
    };
  }

  /**
   * Transform database row with details to Product model
   *
   * @param row Database query result row with product details
   * @returns Product model with details
   * @private
   */
  private transformDetailRowToProduct(row: ProductDetailRow): Product {
    return {
      id: row.id,
      categoryId: row.categoryId,
      name: row.name,
      type: row.type as ProductType,
      description: row.description,
      imageUrl: row.imageUrl,
      isEmbedded: row.isEmbedded,
      isFeatured: row.isFeatured,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: {
        id: row.categoryId,
        name: row.categoryName,
        description: row.categoryDescription,
        createdAt: row.categoryCreatedAt,
        updatedAt: row.categoryUpdatedAt,
      },
      details: {
        id: row.detailId,
        price: row.price,
        currency: row.currency,
        detailedDescription: row.detailedDescription,
        createdAt: row.detailCreatedAt,
        updatedAt: row.detailUpdatedAt,
      },
    };
  }
}
