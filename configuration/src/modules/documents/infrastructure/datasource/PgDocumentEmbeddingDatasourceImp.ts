import { DocumentEmbeddingDatasource } from '@modules/documents/domain/datasource/DocumentEmbeddingDatasource';
import {
  DocumentEmbedding,
  CreateDocumentEmbeddingData,
} from '@modules/documents/domain/models/DocumentEmbedding';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { DocumentEmbeddingDTO } from '@modules/documents/domain/dto/DocumentEmbeddingDTO';

export class PgDocumentEmbeddingDatasourceImp
  implements DocumentEmbeddingDatasource
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

  async createDocumentEmbedding(
    userId: string,
    data: CreateDocumentEmbeddingData
  ): Promise<DocumentEmbedding> {
    try {
      this.logger.info(
        `Creating document embedding for document: ${data.documentId}, user: ${userId}`,
        PgDocumentEmbeddingDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const embeddingResult = await client.query(
          `
            INSERT INTO document_embeddings (
              document_id, content_markdown, embedding_model, embedding_status, metadata
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id, document_id, content_markdown, embedding, embedding_model, 
                     embedding_status, metadata, created_at, updated_at
          `,
          [
            data.documentId,
            data.contentMarkdown,
            data.embeddingModel,
            'pending',
            JSON.stringify(data.metadata || {}),
          ]
        );

        return embeddingResult;
      });

      this.logger.info(
        `Document embedding created successfully for document: ${data.documentId}`,
        PgDocumentEmbeddingDatasourceImp.name
      );

      const row = result.rows[0];
      const [embeddingDTO, error] = DocumentEmbeddingDTO.create({
        id: row.id,
        document_id: row.document_id,
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
        `Failed to create document embedding for document: ${data.documentId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentEmbeddingDatasourceImp.name
      );
      throw error;
    }
  }

  async deleteDocumentEmbeddingByDocumentId(
    userId: string,
    documentId: string
  ): Promise<void> {
    try {
      this.logger.info(
        `Deleting document embedding for document: ${documentId}, user: ${userId}`,
        PgDocumentEmbeddingDatasourceImp.name
      );

      await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const result = await client.query(
          `
            DELETE FROM document_embeddings 
            WHERE document_id = $1
          `,
          [documentId]
        );

        if (result.rowCount === 0) {
          this.logger.warn(
            `No document embedding found to delete for document: ${documentId}`,
            PgDocumentEmbeddingDatasourceImp.name
          );
        }
      });

      this.logger.info(
        `Document embedding deleted successfully for document: ${documentId}`,
        PgDocumentEmbeddingDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete document embedding for document: ${documentId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentEmbeddingDatasourceImp.name
      );
      throw error;
    }
  }
}
