import { ProductDatasource } from '@modules/embedding/domain/datasource/ProductDatasource';
import { ProductEmbedding } from '@modules/embedding/domain/models/Product';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { PoolClient } from 'pg';
import { ProductEmbeddingDTO } from '@modules/embedding/domain/dto/ProductEmbeddingDTO';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingStatus } from '@modules/embedding/domain/models/EmbeddingStatus';

export class PgProductDatasourceImp implements ProductDatasource {
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
  }

  /**
   * Get the schema query for setting schema context
   * @param schema - Database schema name
   * @returns string - Schema query
   */
  private getSchemaQuery(schema: string): string {
    const escapedSchema = schema.replace(/'/g, "''");

    return `
      DO $$
      DECLARE
          user_schema VARCHAR(100);
      BEGIN
          user_schema := '${escapedSchema}';

          EXECUTE format('SET search_path TO %I, public', user_schema);
          
          RAISE NOTICE 'Search path set to: %', user_schema;
      END $$;
    `;
  }

  async getPendingEmbeddings(schemaName: string): Promise<ProductEmbedding[]> {
    try {
      this.logger.info(
        `Fetching product embeddings for processing in schema: ${schemaName}`,
        PgProductDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          await client.query(this.getSchemaQuery(schemaName));

          return await client.query(
            `
            SELECT 
              -- Product embedding data
              pe.id,
              pe.product_id,
              pe.content_markdown,
              pe.embedding_status,
              pe.embedding,
              pe.created_at,
              pe.updated_at,
              -- Product data
              p.name as product_name,
              p.type as product_type,
              p.description as product_description,
              p.image_url as product_image_url,
              p.is_embedded as product_is_embedded,
              p.is_featured as product_is_featured,
              p.created_at as product_created_at,
              p.updated_at as product_updated_at,
              -- Product details
              pd.id as product_details_id,
              pd.price as product_details_price,
              pd.currency as product_details_currency,
              pd.detailed_description as product_details_detailed_description,
              pd.created_at as product_details_created_at,
              pd.updated_at as product_details_updated_at,
              -- Category data
              c.id as category_id,
              c.name as category_name,
              c.description as category_description,
              c.created_at as category_created_at,
              c.updated_at as category_updated_at
            FROM product_embeddings pe
            INNER JOIN products p ON pe.product_id = p.id
            LEFT JOIN product_details pd ON p.id = pd.product_id
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE pe.embedding_status = $1
              AND pe.batch_id IS NULL
              AND p.is_embedded = false
              AND p.deleted_at IS NULL
            ORDER BY pe.created_at ASC
            `,
            [EmbeddingStatus.PENDING]
          );
        }
      );

      const productEmbeddings: ProductEmbedding[] = [];

      for (const row of result.rows) {
        const [dto, error] = ProductEmbeddingDTO.create({
          id: row.id,
          product_id: row.product_id,
          content_markdown: row.content_markdown,
          embedding_status: row.embedding_status,
          embedding: row.embedding,
          created_at: row.created_at,
          updated_at: row.updated_at,
          // Product data from JOIN
          product_name: row.product_name,
          product_type: row.product_type,
          product_description: row.product_description,
          product_image_url: row.product_image_url,
          product_is_embedded: row.product_is_embedded,
          product_is_featured: row.product_is_featured,
          product_created_at: row.product_created_at,
          product_updated_at: row.product_updated_at,
          // Product details from JOIN
          product_details_id: row.product_details_id,
          product_details_price: row.product_details_price,
          product_details_currency: row.product_details_currency,
          product_details_detailed_description:
            row.product_details_detailed_description,
          product_details_created_at: row.product_details_created_at,
          product_details_updated_at: row.product_details_updated_at,
          // Category data from JOIN
          category_id: row.category_id,
          category_name: row.category_name,
          category_description: row.category_description,
          category_created_at: row.category_created_at,
          category_updated_at: row.category_updated_at,
        });

        if (error) {
          this.logger.error(
            `Failed to create product embedding DTO for ${row.embedding_id}: ${error.message}`,
            PgProductDatasourceImp.name
          );
          continue;
        }

        productEmbeddings.push(dto!.toDomain());
      }

      this.logger.info(
        `Found ${productEmbeddings.length} product embeddings for processing`,
        PgProductDatasourceImp.name
      );

      return productEmbeddings;
    } catch (error) {
      this.logger.error(
        `Failed to fetch product embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async storeEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    try {
      this.logger.info(
        `Storing ${embeddings.length} product embeddings in ${schemaName} using model ${embeddingModel}`,
        PgProductDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        await client.query(this.getSchemaQuery(schemaName));

        for (const embedding of embeddings) {
          const batchId = embedding.batchId || null;

          if (embedding.embedding) {
            // If embedding exists, update all fields including the vector and content_markdown
            const embeddingVector = JSON.stringify(embedding.embedding);

            await client.query(
              `UPDATE product_embeddings
               SET 
                 embedding = $1::vector,
                 embedding_model = $2,
                 embedding_status = $3,
                 batch_id = $4,
                 content_markdown = $5,
                 updated_at = CURRENT_TIMESTAMP
               WHERE id = $6`,
              [
                embeddingVector,
                embeddingModel,
                EmbeddingStatus.COMPLETED,
                batchId,
                embedding.originalText || null,
                embedding.entityId,
              ]
            );

            // Update the products table to mark as embedded
            const productResult = await client.query(
              `
              SELECT product_id
              FROM product_embeddings
              WHERE id = $1
            `,
              [embedding.entityId]
            );

            if (productResult.rows.length > 0) {
              const productId = productResult.rows[0].product_id;

              await client.query(
                `
                UPDATE products
                SET is_embedded = true, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
              `,
                [productId]
              );
            }
          } else {
            // If embedding is null (batch processing), update status, batch_id, and content_markdown
            await client.query(
              `UPDATE product_embeddings
               SET 
                 embedding = NULL,
                 embedding_model = $1,
                 embedding_status = $2,
                 batch_id = $3,
                 content_markdown = $4,
                 updated_at = CURRENT_TIMESTAMP
               WHERE id = $5`,
              [
                embeddingModel,
                embedding.batchId
                  ? EmbeddingStatus.PROCESSING
                  : EmbeddingStatus.PENDING,
                batchId,
                embedding.originalText || null,
                embedding.entityId,
              ]
            );
          }
        }

        this.logger.info(
          `Successfully stored ${embeddings.length} product embeddings`,
          PgProductDatasourceImp.name
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to store product embeddings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<ProductEmbedding[]> {
    try {
      this.logger.info(
        `Getting processing product embeddings with batch_id for schema: ${schemaName}`,
        PgProductDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          await client.query(this.getSchemaQuery(schemaName));

          return await client.query(
            `
            SELECT 
              -- Product embedding data
              pe.id,
              pe.product_id,
              pe.content_markdown,
              pe.embedding,
              pe.embedding_model,
              pe.embedding_status,
              pe.batch_id,
              pe.created_at,
              pe.updated_at,
              -- Product data
              p.name as product_name,
              p.type as product_type,
              p.description as product_description,
              p.image_url as product_image_url,
              p.is_embedded as product_is_embedded,
              p.is_featured as product_is_featured,
              p.created_at as product_created_at,
              p.updated_at as product_updated_at,
              -- Product details
              pd.id as product_details_id,
              pd.price as product_details_price,
              pd.currency as product_details_currency,
              pd.detailed_description as product_details_detailed_description,
              pd.created_at as product_details_created_at,
              pd.updated_at as product_details_updated_at,
              -- Category data
              c.id as category_id,
              c.name as category_name,
              c.description as category_description,
              c.created_at as category_created_at,
              c.updated_at as category_updated_at
            FROM product_embeddings pe
            INNER JOIN products p ON pe.product_id = p.id
            LEFT JOIN product_details pd ON p.id = pd.product_id
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE pe.embedding_status = $1 
              AND pe.embedding IS NULL 
              AND pe.batch_id IS NOT NULL
            ORDER BY pe.created_at ASC
            `,
            [EmbeddingStatus.PROCESSING]
          );
        }
      );

      const embeddings: ProductEmbedding[] = [];

      for (const row of result.rows) {
        const [dto, error] = ProductEmbeddingDTO.create({
          id: row.id,
          product_id: row.product_id,
          content_markdown: row.content_markdown,
          embedding: row.embedding,
          embedding_model: row.embedding_model,
          embedding_status: row.embedding_status,
          batch_id: row.batch_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          // Product data from JOIN
          product_name: row.product_name,
          product_type: row.product_type,
          product_description: row.product_description,
          product_image_url: row.product_image_url,
          product_is_embedded: row.product_is_embedded,
          product_is_featured: row.product_is_featured,
          product_created_at: row.product_created_at,
          product_updated_at: row.product_updated_at,
          // Product details from JOIN
          product_details_id: row.product_details_id,
          product_details_price: row.product_details_price,
          product_details_currency: row.product_details_currency,
          product_details_detailed_description:
            row.product_details_detailed_description,
          product_details_created_at: row.product_details_created_at,
          product_details_updated_at: row.product_details_updated_at,
          // Category data from JOIN
          category_id: row.category_id,
          category_name: row.category_name,
          category_description: row.category_description,
          category_created_at: row.category_created_at,
          category_updated_at: row.category_updated_at,
        });

        if (error || !dto) {
          this.logger.error(
            `Failed to create product embedding DTO for ${row.id}: ${error?.message || 'Unknown error'}`,
            PgProductDatasourceImp.name
          );
          continue;
        }

        embeddings.push(dto.toDomain());
      }

      this.logger.info(
        `Retrieved ${embeddings.length} processing product embeddings with batch_id for schema: ${schemaName}`,
        PgProductDatasourceImp.name
      );

      return embeddings;
    } catch (error) {
      this.logger.error(
        `Failed to get processing product embeddings with batch_id for schema: ${schemaName}. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }

  async updateCompletedEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    try {
      this.logger.info(
        `Updating ${embeddings.length} completed product embeddings in ${schemaName} using model ${embeddingModel}`,
        PgProductDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        await client.query(this.getSchemaQuery(schemaName));

        for (const embedding of embeddings) {
          // Only update embedding, status, and updated_at (preserve content_markdown)
          if (!embedding.embedding) {
            this.logger.warn(
              `Skipping embedding ${embedding.entityId} - embedding is null`,
              PgProductDatasourceImp.name
            );
            continue;
          }

          const embeddingVector = JSON.stringify(embedding.embedding);
          const batchId = embedding.batchId || null;

          await client.query(
            `UPDATE product_embeddings
             SET 
               embedding = $1::vector,
               embedding_model = $2,
               embedding_status = $3,
               batch_id = $4,
               updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [
              embeddingVector,
              embeddingModel,
              EmbeddingStatus.COMPLETED,
              batchId,
              embedding.entityId,
            ]
          );

          // Update the products table to mark as embedded
          const productResult = await client.query(
            `
            SELECT product_id
            FROM product_embeddings
            WHERE id = $1
          `,
            [embedding.entityId]
          );

          if (productResult.rows.length > 0) {
            const productId = productResult.rows[0].product_id;

            await client.query(
              `
              UPDATE products
              SET is_embedded = true, updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `,
              [productId]
            );
          }
        }

        this.logger.info(
          `Successfully updated ${embeddings.length} completed product embeddings`,
          PgProductDatasourceImp.name
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to update completed product embeddings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgProductDatasourceImp.name
      );
      throw error;
    }
  }
}
