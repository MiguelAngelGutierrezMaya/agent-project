import { ProductDatasource } from '@modules/products/domain/datasource/ProductDatasource';
import {
  Product,
  ProductsResponse,
} from '@modules/products/domain/models/Product';
import { CreateProductDTO } from '@modules/products/domain/dto/CreateProductDTO';
import { UpdateProductDTO } from '@modules/products/domain/dto/UpdateProductDTO';
import { DeleteProductDTO } from '@modules/products/domain/dto/DeleteProductDTO';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import {
  DataNotFoundError,
  DomainValidationError,
} from '@src/infrastructure/shared/utils/errors/domain';
import { ProductDTO } from '@modules/products/domain/dto/ProductDTO';
import { ProductDetailDTO } from '@modules/products/domain/dto/ProductDetailDTO';
import { PgProductEmbeddingDatasourceImp } from './PgProductEmbeddingDatasourceImp';
import { PgCompanyModificationDatasourceImp } from '@modules/shared/infrastructure/datasource/PgCompanyModificationDatasourceImp';

export class PgProductDatasourceImp implements ProductDatasource {
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;
  private productEmbeddingDatasource: PgProductEmbeddingDatasourceImp;
  private companyModificationDatasource: PgCompanyModificationDatasourceImp;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
    this.productEmbeddingDatasource = new PgProductEmbeddingDatasourceImp(
      logger
    );
    this.companyModificationDatasource = new PgCompanyModificationDatasourceImp(
      logger
    );
  }

  /**
   * Get the schema query for a specific user
   * @param clerkUserId - Clerk user ID
   * @returns string - Schema query
   */
  private getSchemaQuery(clerkUserId: string): string {
    const escapedUserId = clerkUserId.replace(/'/g, "''");

    return `
            DO $$
            DECLARE
                user_schema VARCHAR(100);
            BEGIN
                SELECT brand_schema INTO user_schema
                FROM public.user_brand_mapping
                WHERE clerk_user_id = '${escapedUserId}'
                AND status = 'active'
                AND deleted_at IS NULL;

                IF user_schema IS NULL THEN
                    RAISE EXCEPTION 'User not found in any brand schema';
                END IF;

                EXECUTE format('SET search_path TO %I, public', user_schema);
                
                RAISE NOTICE 'Search path set to: %', user_schema;
            END $$;
        `;
  }

  async getProducts(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ProductsResponse> {
    try {
      this.logger.info(
        `Getting products for user: ${userId}`,
        PgProductDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get total count
        const countResult = await client.query(`
          SELECT COUNT(*) as total
          FROM products p
          WHERE p.deleted_at IS NULL
        `);

        const total = parseInt(countResult.rows[0].total);

        // Get paginated data with product details
        let query = `
          SELECT 
            p.id,
            p.category_id,
            p.name,
            p.type,
            p.description,
            p.image_url,
            p.is_embedded,
            p.is_featured,
            p.created_at,
            p.updated_at,
            pd.id as detail_id,
            pd.price,
            pd.currency,
            pd.detailed_description,
            pd.created_at as detail_created_at,
            pd.updated_at as detail_updated_at
          FROM products p
          LEFT JOIN product_details pd ON p.id = pd.product_id AND pd.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
          ORDER BY p.created_at DESC
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (limit) {
          query += ` LIMIT $${paramIndex}`;
          params.push(limit);
          paramIndex++;
        }

        if (offset) {
          query += ` OFFSET $${paramIndex}`;
          params.push(offset);
          paramIndex++;
        }

        const dataResult = await client.query(query, params);

        return {
          rows: dataResult.rows,
          total,
        };
      });

      this.logger.info(
        `Products retrieved successfully for User: ${userId}`,
        PgProductDatasourceImp.name
      );

      const products = result.rows.map(row => {
        // Create ProductDetailDTO from existing data
        if (!row.detail_id) {
          throw new DomainValidationError(
            `Product ${row.id} does not have details. All products must have details.`
          );
        }

        const [detailDTO, detailError] = ProductDetailDTO.create({
          id: row.detail_id,
          price: parseFloat(row.price),
          currency: row.currency,
          detailedDescription: row.detailed_description,
          createdAt: new Date(row.detail_created_at),
          updatedAt: new Date(row.detail_updated_at),
        });

        if (detailError) {
          throw detailError;
        }

        const details = detailDTO!;

        const [productDTO, error] = ProductDTO.create({
          id: row.id,
          categoryId: row.category_id,
          name: row.name,
          type: row.type,
          details,
          description: row.description,
          imageUrl: row.image_url,
          isEmbedded: row.is_embedded,
          isFeatured: row.is_featured,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });

        if (error) {
          throw error;
        }

        return productDTO!.toDomain();
      });

      return {
        data: products,
        total: result.total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get products for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async createProduct(
    userId: string,
    productData: CreateProductDTO
  ): Promise<Product> {
    try {
      this.logger.info(
        `Creating product for user: ${userId}`,
        PgProductDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get AI config to determine embedding model
        const aiConfigResult = await client.query(
          `
            SELECT ai.embedding_model
            FROM config c
            LEFT JOIN ai_config ai ON c.ai_config_uuid = ai.id AND ai.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
            ORDER BY c.created_at DESC
            LIMIT 1
          `
        );

        const embeddingModel =
          aiConfigResult.rows.length > 0
            ? aiConfigResult.rows[0].embedding_model
            : '';

        // Insert product
        const productResult = await client.query(
          `
            INSERT INTO products (
              category_id, name, type, description, image_url, is_embedded, is_featured
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, category_id, name, type, description, image_url, is_embedded, is_featured, created_at, updated_at
          `,
          [
            productData.categoryId,
            productData.name,
            productData.type,
            productData.description,
            productData.imageUrl,
            productData.isEmbedded,
            productData.isFeatured,
          ]
        );

        const product = productResult.rows[0];

        // Insert product details (always required)
        await client.query(
          `
            INSERT INTO product_details (
              product_id, price, currency, detailed_description
            ) VALUES ($1, $2, $3, $4)
          `,
          [
            product.id,
            productData.details.price,
            productData.details.currency,
            productData.details.detailedDescription,
          ]
        );

        return { productResult, embeddingModel };
      });

      this.logger.info(
        `Product created successfully for User: ${userId}`,
        PgProductDatasourceImp.name
      );

      const row = result.productResult.rows[0];
      const embeddingModel = result.embeddingModel;

      // Get product details (always created)
      const detailsResult = await this.postgresConnection.transaction(
        async client => {
          await client.query(this.getSchemaQuery(userId));
          return await client.query(
            `SELECT id, price, currency, detailed_description, created_at, updated_at 
           FROM product_details 
           WHERE product_id = $1 AND deleted_at IS NULL`,
            [row.id]
          );
        }
      );

      if (detailsResult.rows.length === 0) {
        throw new DomainValidationError(
          `Failed to create product details for product ${row.id}`
        );
      }

      const detailRow = detailsResult.rows[0];
      const [detailDTO, detailError] = ProductDetailDTO.create({
        id: detailRow.id,
        price: parseFloat(detailRow.price),
        currency: detailRow.currency,
        detailedDescription: detailRow.detailed_description,
        createdAt: new Date(detailRow.created_at),
        updatedAt: new Date(detailRow.updated_at),
      });

      if (detailError) {
        throw detailError;
      }

      const details = detailDTO!;

      const [productDTO, error] = ProductDTO.create({
        id: row.id,
        categoryId: row.category_id,
        name: row.name,
        type: row.type,
        details,
        description: row.description,
        imageUrl: row.image_url,
        isEmbedded: row.is_embedded,
        isFeatured: row.is_featured,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      const product = productDTO!.toDomain();

      // Create product embedding
      try {
        await this.productEmbeddingDatasource.createProductEmbedding(userId, {
          productId: product.id,
          contentMarkdown: '', // Empty - will be generated by embedding service
          embeddingModel: embeddingModel,
          metadata: {
            productName: product.name,
            productType: product.type,
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
            createdAt: product.createdAt.toISOString(),
          },
        });

        // Record modification in company_modifications table
        await this.companyModificationDatasource.recordModification(
          userId,
          'product_embeddings'
        );

        this.logger.info(
          `Product embedding created and modification recorded for product: ${product.id}`,
          PgProductDatasourceImp.name
        );
      } catch (embeddingError) {
        this.logger.error(
          `Failed to create product embedding for product: ${product.id}, Error: ${embeddingError instanceof Error ? embeddingError.message : 'Unknown error'}`,
          PgProductDatasourceImp.name
        );
        // Don't throw error here - product creation should succeed even if embedding fails
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create product for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async updateProduct(
    userId: string,
    productData: UpdateProductDTO
  ): Promise<Product> {
    try {
      this.logger.info(
        `Updating product: ${productData.id} for user: ${userId}`,
        PgProductDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (productData.categoryId) {
          updateFields.push(`category_id = $${paramIndex}`);
          values.push(productData.categoryId);
          paramIndex++;
        }

        if (productData.name) {
          updateFields.push(`name = $${paramIndex}`);
          values.push(productData.name);
          paramIndex++;
        }

        if (productData.type) {
          updateFields.push(`type = $${paramIndex}`);
          values.push(productData.type);
          paramIndex++;
        }

        if (productData.description !== undefined) {
          updateFields.push(`description = $${paramIndex}`);
          values.push(productData.description);
          paramIndex++;
        }

        if (productData.imageUrl !== undefined) {
          updateFields.push(`image_url = $${paramIndex}`);
          values.push(productData.imageUrl);
          paramIndex++;
        }

        if (productData.isEmbedded !== undefined) {
          updateFields.push(`is_embedded = $${paramIndex}`);
          values.push(productData.isEmbedded);
          paramIndex++;
        }

        if (productData.isFeatured !== undefined) {
          updateFields.push(`is_featured = $${paramIndex}`);
          values.push(productData.isFeatured);
          paramIndex++;
        }

        if (updateFields.length === 0) {
          throw new DomainValidationError('No fields to update');
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(productData.id);

        const query = `
          UPDATE products 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex} AND deleted_at IS NULL
          RETURNING id, category_id, name, type, description, image_url, is_embedded, is_featured, created_at, updated_at
        `;

        // Update product
        const productResult = await client.query(query, values);

        // Update product details (only if provided and has fields to update)
        if (productData.details && productData.details.hasAnyField()) {
          const detailUpdateFields: string[] = [];
          const detailValues: any[] = [];
          let detailParamIndex = 1;

          if (productData.details.price !== undefined) {
            detailUpdateFields.push(`price = $${detailParamIndex}`);
            detailValues.push(productData.details.price);
            detailParamIndex++;
          }

          if (productData.details.currency !== undefined) {
            detailUpdateFields.push(`currency = $${detailParamIndex}`);
            detailValues.push(productData.details.currency);
            detailParamIndex++;
          }

          if (productData.details.detailedDescription !== undefined) {
            detailUpdateFields.push(
              `detailed_description = $${detailParamIndex}`
            );
            detailValues.push(productData.details.detailedDescription);
            detailParamIndex++;
          }

          if (detailUpdateFields.length > 0) {
            detailUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            detailValues.push(productData.id);

            const detailQuery = `
              UPDATE product_details 
              SET ${detailUpdateFields.join(', ')}
              WHERE product_id = $${detailParamIndex} AND deleted_at IS NULL
            `;

            await client.query(detailQuery, detailValues);
          }
        }

        // TODO: Delete embedding because we need to recreate it again

        return productResult;
      });

      if (result.rows.length === 0) {
        throw new DataNotFoundError('Product not found');
      }

      this.logger.info(
        `Product updated successfully for User: ${userId}`,
        PgProductDatasourceImp.name
      );

      const row = result.rows[0];

      // Get updated product details
      const detailsResult = await this.postgresConnection.transaction(
        async client => {
          await client.query(this.getSchemaQuery(userId));
          return await client.query(
            `SELECT id, price, currency, detailed_description, created_at, updated_at 
           FROM product_details 
           WHERE product_id = $1 AND deleted_at IS NULL`,
            [row.id]
          );
        }
      );

      if (detailsResult.rows.length === 0) {
        throw new DomainValidationError(
          `Product details not found for product ${row.id}`
        );
      }

      const detailRow = detailsResult.rows[0];
      const [detailDTO, detailError] = ProductDetailDTO.create({
        id: detailRow.id,
        price: parseFloat(detailRow.price),
        currency: detailRow.currency,
        detailedDescription: detailRow.detailed_description,
        createdAt: new Date(detailRow.created_at),
        updatedAt: new Date(detailRow.updated_at),
      });

      if (detailError) {
        throw detailError;
      }

      const details = detailDTO!;

      const [productDTO, error] = ProductDTO.create({
        id: row.id,
        categoryId: row.category_id,
        name: row.name,
        type: row.type,
        details,
        description: row.description,
        imageUrl: row.image_url,
        isEmbedded: row.is_embedded,
        isFeatured: row.is_featured,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      const product = productDTO!.toDomain();

      // Update product embedding
      try {
        // Get AI config to determine embedding model
        const aiConfigResult = await this.postgresConnection.transaction(
          async client => {
            await client.query(this.getSchemaQuery(userId));
            return await client.query(
              `
              SELECT ai.embedding_model
              FROM config c
              LEFT JOIN ai_config ai ON c.ai_config_uuid = ai.id AND ai.deleted_at IS NULL
              WHERE c.deleted_at IS NULL
              ORDER BY c.created_at DESC
              LIMIT 1
            `
            );
          }
        );

        const embeddingModel =
          aiConfigResult.rows.length > 0
            ? aiConfigResult.rows[0].embedding_model
            : '';

        // Upsert product embedding (update if exists, create if not)
        await this.productEmbeddingDatasource.upsertProductEmbedding(userId, {
          productId: product.id,
          contentMarkdown: '', // Empty - will be regenerated by embedding service
          embeddingModel: embeddingModel,
          metadata: {
            productName: product.name,
            productType: product.type,
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
            updatedAt: product.updatedAt.toISOString(),
          },
        });

        // Record modification in company_modifications table
        await this.companyModificationDatasource.recordModification(
          userId,
          'product_embeddings'
        );

        this.logger.info(
          `Product embedding updated and modification recorded for product: ${product.id}`,
          PgProductDatasourceImp.name
        );
      } catch (embeddingError) {
        this.logger.error(
          `Failed to update product embedding for product: ${product.id}, Error: ${embeddingError instanceof Error ? embeddingError.message : 'Unknown error'}`,
          PgProductDatasourceImp.name
        );
        // Don't throw error here - product update should succeed even if embedding fails
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to update product for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async deleteProduct(
    userId: string,
    productData: DeleteProductDTO
  ): Promise<void> {
    try {
      this.logger.info(
        `Deleting product: ${productData.id} for user: ${userId}`,
        PgProductDatasourceImp.name
      );

      await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Soft delete product details first
        await client.query(
          `
            UPDATE product_details 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE product_id = $1 AND deleted_at IS NULL
          `,
          [productData.id]
        );

        // Soft delete product
        const result = await client.query(
          `
            UPDATE products 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
          `,
          [productData.id]
        );

        if (result.rowCount === 0) {
          throw new DataNotFoundError('Product not found');
        }
      });

      // Delete product embedding
      try {
        await this.productEmbeddingDatasource.deleteProductEmbeddingByProductId(
          userId,
          productData.id
        );
        this.logger.info(
          `Product embedding deleted successfully for product: ${productData.id}`,
          PgProductDatasourceImp.name
        );
      } catch (embeddingError) {
        this.logger.error(
          `Failed to delete product embedding for product: ${productData.id}, Error: ${embeddingError instanceof Error ? embeddingError.message : 'Unknown error'}`,
          PgProductDatasourceImp.name
        );
        // Don't throw error here - product deletion should succeed even if embedding deletion fails
      }

      this.logger.info(
        `Product deleted successfully for User: ${userId}`,
        PgProductDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete product for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }
}
