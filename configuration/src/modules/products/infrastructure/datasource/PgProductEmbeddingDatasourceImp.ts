import { ProductEmbeddingDatasource } from '@modules/products/domain/datasource/ProductEmbeddingDatasource';
import {
  ProductEmbedding,
  CreateProductEmbeddingData,
} from '@modules/products/domain/models/ProductEmbedding';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { ProductEmbeddingDTO } from '@modules/products/domain/dto/ProductEmbeddingDTO';

export class PgProductEmbeddingDatasourceImp
  implements ProductEmbeddingDatasource
{
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
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

  async createProductEmbedding(
    userId: string,
    data: CreateProductEmbeddingData
  ): Promise<ProductEmbedding> {
    try {
      this.logger.info(
        `Creating product embedding for product: ${data.productId}, user: ${userId}`,
        PgProductEmbeddingDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const embeddingResult = await client.query(
          `
            INSERT INTO product_embeddings (
              product_id, content_markdown, embedding_model, embedding_status, metadata
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id, product_id, content_markdown, embedding, embedding_model, 
                     embedding_status, metadata, created_at, updated_at
          `,
          [
            data.productId,
            data.contentMarkdown,
            data.embeddingModel,
            'pending',
            JSON.stringify(data.metadata || {}),
          ]
        );

        return embeddingResult;
      });

      this.logger.info(
        `Product embedding created successfully for product: ${data.productId}`,
        PgProductEmbeddingDatasourceImp.name
      );

      const row = result.rows[0];
      const [embeddingDTO, error] = ProductEmbeddingDTO.create({
        id: row.id,
        product_id: row.product_id,
        content_markdown: row.content_markdown,
        embedding: row.embedding,
        embedding_model: row.embedding_model,
        embedding_status: row.embedding_status,
        metadata: row.metadata || {},
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      return embeddingDTO!.toDomain();
    } catch (error) {
      this.logger.error(
        `Failed to create product embedding for product: ${data.productId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductEmbeddingDatasourceImp.name
      );
      throw error;
    }
  }

  async deleteProductEmbeddingByProductId(
    userId: string,
    productId: string
  ): Promise<void> {
    try {
      this.logger.info(
        `Deleting product embedding for product: ${productId}, user: ${userId}`,
        PgProductEmbeddingDatasourceImp.name
      );

      await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const result = await client.query(
          `
            DELETE FROM product_embeddings 
            WHERE product_id = $1
          `,
          [productId]
        );

        if (result.rowCount === 0) {
          this.logger.warn(
            `No product embedding found to delete for product: ${productId}`,
            PgProductEmbeddingDatasourceImp.name
          );
        }
      });

      this.logger.info(
        `Product embedding deleted successfully for product: ${productId}`,
        PgProductEmbeddingDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete product embedding for product: ${productId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductEmbeddingDatasourceImp.name
      );
      throw error;
    }
  }

  async upsertProductEmbedding(
    userId: string,
    data: CreateProductEmbeddingData
  ): Promise<ProductEmbedding> {
    try {
      this.logger.info(
        `Upserting product embedding for product: ${data.productId}, user: ${userId}`,
        PgProductEmbeddingDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const embeddingResult = await client.query(
          `
            INSERT INTO product_embeddings (
              product_id, content_markdown, embedding_model, embedding_status, metadata
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (product_id) 
            DO UPDATE SET 
              content_markdown = EXCLUDED.content_markdown,
              embedding = NULL,
              embedding_model = EXCLUDED.embedding_model,
              embedding_status = 'pending',
              batch_id = NULL,
              metadata = EXCLUDED.metadata,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id, product_id, content_markdown, embedding, embedding_model, 
                     embedding_status, metadata, created_at, updated_at
          `,
          [
            data.productId,
            data.contentMarkdown,
            data.embeddingModel,
            'pending',
            JSON.stringify(data.metadata || {}),
          ]
        );

        return embeddingResult;
      });

      this.logger.info(
        `Product embedding upserted successfully for product: ${data.productId} (embedding reset to null for regeneration)`,
        PgProductEmbeddingDatasourceImp.name
      );

      const row = result.rows[0];
      const [embeddingDTO, error] = ProductEmbeddingDTO.create({
        id: row.id,
        product_id: row.product_id,
        content_markdown: row.content_markdown,
        embedding: row.embedding,
        embedding_model: row.embedding_model,
        embedding_status: row.embedding_status,
        metadata: row.metadata || {},
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      return embeddingDTO!.toDomain();
    } catch (error) {
      this.logger.error(
        `Failed to upsert product embedding for product: ${data.productId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductEmbeddingDatasourceImp.name
      );
      throw error;
    }
  }
}
