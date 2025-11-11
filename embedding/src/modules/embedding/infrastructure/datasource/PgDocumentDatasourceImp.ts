import { DocumentDatasource } from '@modules/embedding/domain/datasource/DocumentDatasource';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { PoolClient } from 'pg';
import { DocumentEmbeddingDTO } from '@modules/embedding/domain/dto/DocumentEmbeddingDTO';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';
import { EmbeddingStatus } from '@modules/embedding/domain/models/EmbeddingStatus';

export class PgDocumentDatasourceImp implements DocumentDatasource {
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

  async getPendingEmbeddings(schemaName: string): Promise<DocumentEmbedding[]> {
    try {
      this.logger.info(
        `Fetching document embeddings for processing in schema: ${schemaName}`,
        PgDocumentDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          await client.query(this.getSchemaQuery(schemaName));

          return await client.query(
            `
            SELECT 
              -- Document embedding data
              de.id,
              de.document_id,
              de.content_markdown,
              de.embedding_status,
              de.embedding,
              de.created_at,
              de.updated_at,
              -- Document data
              d.name as document_name,
              d.url as document_url,
              d.type as document_type,
              d.is_embedded as document_is_embedded,
              d.created_at as document_created_at,
              d.updated_at as document_updated_at
            FROM document_embeddings de
            INNER JOIN documents d ON de.document_id = d.id
            WHERE de.embedding_status = $1
              AND de.batch_id IS NULL
              AND d.is_embedded = false
              AND d.deleted_at IS NULL
            ORDER BY de.created_at ASC
            `,
            [EmbeddingStatus.PENDING]
          );
        }
      );

      const documentEmbeddings: DocumentEmbedding[] = [];

      for (const row of result.rows) {
        const [dto, error] = DocumentEmbeddingDTO.create({
          id: row.id,
          document_id: row.document_id,
          content_markdown: row.content_markdown,
          embedding_status: row.embedding_status,
          embedding: row.embedding,
          created_at: row.created_at,
          updated_at: row.updated_at,
          // Document data from JOIN
          document_name: row.document_name,
          document_url: row.document_url,
          document_type: row.document_type,
          document_is_embedded: row.document_is_embedded,
          document_created_at: row.document_created_at,
          document_updated_at: row.document_updated_at,
        });

        if (error) {
          this.logger.error(
            `Failed to create document embedding DTO for ${row.id}: ${error.message}`,
            PgDocumentDatasourceImp.name
          );
          continue;
        }

        documentEmbeddings.push(dto!.toDomain());
      }

      this.logger.info(
        `Found ${documentEmbeddings.length} document embeddings for processing`,
        PgDocumentDatasourceImp.name
      );

      return documentEmbeddings;
    } catch (error) {
      this.logger.error(
        `Failed to fetch document embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentDatasourceImp.name
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
        `Storing ${embeddings.length} document embeddings in ${schemaName} using model ${embeddingModel}`,
        PgDocumentDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        await client.query(this.getSchemaQuery(schemaName));

        for (const embedding of embeddings) {
          const batchId = embedding.batchId || null;

          if (embedding.embedding) {
            // If embedding exists, update all fields including the vector and content_markdown
            const embeddingVector = JSON.stringify(embedding.embedding);

            await client.query(
              `UPDATE document_embeddings
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

            // Update the documents table to mark as embedded
            const documentResult = await client.query(
              `
              SELECT document_id
              FROM document_embeddings
              WHERE id = $1
            `,
              [embedding.entityId]
            );

            if (documentResult.rows.length > 0) {
              const documentId = documentResult.rows[0].document_id;

              await client.query(
                `
                UPDATE documents
                SET is_embedded = true, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
              `,
                [documentId]
              );
            }
          } else {
            // If embedding is null (batch processing), update status, batch_id, and content_markdown
            await client.query(
              `UPDATE document_embeddings
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
          `Successfully stored ${embeddings.length} document embeddings`,
          PgDocumentDatasourceImp.name
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to store document embeddings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }

  async getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<DocumentEmbedding[]> {
    try {
      this.logger.info(
        `Getting processing document embeddings with batch_id for schema: ${schemaName}`,
        PgDocumentDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(
        async (client: PoolClient) => {
          await client.query(this.getSchemaQuery(schemaName));

          return await client.query(
            `SELECT 
             de.id,
             de.document_id,
             de.content_markdown,
             de.embedding,
             de.embedding_model,
             de.embedding_status,
             de.batch_id,
             de.created_at,
             de.updated_at,
             d.name as document_name,
             d.type as document_type,
             d.url as document_url,
             d.is_embedded as document_is_embedded,
             d.created_at as document_created_at,
             d.updated_at as document_updated_at
           FROM document_embeddings de
           INNER JOIN documents d ON de.document_id = d.id
           WHERE de.embedding_status = $1 
             AND de.embedding IS NULL 
             AND de.batch_id IS NOT NULL
           ORDER BY de.created_at ASC`,
            [EmbeddingStatus.PROCESSING]
          );
        }
      );

      const embeddings: DocumentEmbedding[] = [];

      for (const row of result.rows) {
        const [dto, error] = DocumentEmbeddingDTO.create({
          id: row.id,
          document_id: row.document_id,
          content_markdown: row.content_markdown,
          embedding: row.embedding,
          embedding_model: row.embedding_model,
          embedding_status: row.embedding_status,
          batch_id: row.batch_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          document_name: row.document_name,
          document_type: row.document_type,
          document_url: row.document_url,
          document_is_embedded: row.document_is_embedded,
          document_created_at: row.document_created_at,
          document_updated_at: row.document_updated_at,
        });

        if (error || !dto) {
          this.logger.error(
            `Failed to create document embedding DTO for ${row.id}: ${error?.message || 'Unknown error'}`,
            PgDocumentDatasourceImp.name
          );
          continue;
        }

        embeddings.push(dto.toDomain());
      }

      this.logger.info(
        `Retrieved ${embeddings.length} processing document embeddings with batch_id for schema: ${schemaName}`,
        PgDocumentDatasourceImp.name
      );

      return embeddings;
    } catch (error) {
      this.logger.error(
        `Failed to get processing document embeddings with batch_id for schema: ${schemaName}. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgDocumentDatasourceImp.name
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
        `Updating ${embeddings.length} completed document embeddings in ${schemaName} using model ${embeddingModel}`,
        PgDocumentDatasourceImp.name
      );

      await this.postgresConnection.transaction(async (client: PoolClient) => {
        await client.query(this.getSchemaQuery(schemaName));

        for (const embedding of embeddings) {
          // Only update embedding, status, and updated_at (preserve content_markdown)
          if (!embedding.embedding) {
            this.logger.warn(
              `Skipping embedding ${embedding.entityId} - embedding is null`,
              PgDocumentDatasourceImp.name
            );
            continue;
          }

          const embeddingVector = JSON.stringify(embedding.embedding);
          const batchId = embedding.batchId || null;

          await client.query(
            `UPDATE document_embeddings
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

          // Update the documents table to mark as embedded
          const documentResult = await client.query(
            `
            SELECT document_id
            FROM document_embeddings
            WHERE id = $1
          `,
            [embedding.entityId]
          );

          if (documentResult.rows.length > 0) {
            const documentId = documentResult.rows[0].document_id;

            await client.query(
              `
              UPDATE documents
              SET is_embedded = true, updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
            `,
              [documentId]
            );
          }
        }

        this.logger.info(
          `Successfully updated ${embeddings.length} completed document embeddings`,
          PgDocumentDatasourceImp.name
        );
      });
    } catch (error) {
      this.logger.error(
        `Failed to update completed document embeddings: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }
}
