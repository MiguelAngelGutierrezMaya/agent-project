import { DocumentDatasource } from '@modules/documents/domain/datasource/DocumentDatasource';
import {
  Document,
  DocumentsResponse,
} from '@modules/documents/domain/models/Document';
import { DocumentData } from '@modules/documents/domain/models/Document';
import { PostgresConnection } from '@src/infrastructure/shared/persistence/postgresql/PostgresConnection';
import { LoggerService } from '@src/domain/services/Logger';
import { DataNotFoundError } from '@src/infrastructure/shared/utils/errors/domain';
import { DocumentDTO } from '@modules/documents/domain/dto/DocumentDTO';
import { PgDocumentEmbeddingDatasourceImp } from '@modules/documents/infrastructure/datasource/PgDocumentEmbeddingDatasourceImp';
import { PgCompanyModificationDatasourceImp } from '@modules/shared/infrastructure/datasource/PgCompanyModificationDatasourceImp';

export class PgDocumentDatasourceImp implements DocumentDatasource {
  private postgresConnection: PostgresConnection;
  private logger: LoggerService;
  private documentEmbeddingDatasource: PgDocumentEmbeddingDatasourceImp;
  private companyModificationDatasource: PgCompanyModificationDatasourceImp;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.postgresConnection = PostgresConnection.getInstance(logger);
    this.documentEmbeddingDatasource = new PgDocumentEmbeddingDatasourceImp(
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

  async getDocuments(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<DocumentsResponse> {
    try {
      this.logger.info(
        `Getting documents for user: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get total count
        const countResult = await client.query(`
          SELECT COUNT(*) as total
          FROM documents d
          WHERE d.deleted_at IS NULL
        `);

        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        let query = `
          SELECT 
            d.id,
            d.name,
            d.type,
            d.url,
            d.is_embedded,
            d.created_at,
            d.updated_at
          FROM documents d
          WHERE d.deleted_at IS NULL
          ORDER BY d.created_at DESC
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
        `Documents retrieved successfully for User: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const documents = result.rows.map(row => {
        const [documentDTO, error] = DocumentDTO.create({
          id: row.id,
          name: row.name,
          type: row.type,
          url: row.url,
          isEmbedded: row.is_embedded,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });

        if (error) {
          throw error;
        }

        return documentDTO!.toDomain();
      });

      return {
        data: documents,
        total: result.total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get documents for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }

  async createDocument(
    userId: string,
    documentData: DocumentData
  ): Promise<Document> {
    try {
      this.logger.info(
        `Creating document for user: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get embedding model from ai_config
        const aiConfigResult = await client.query(
          `SELECT embedding_model FROM ai_config WHERE deleted_at IS NULL LIMIT 1`
        );

        if (aiConfigResult.rows.length === 0) {
          throw new Error('AI configuration not found');
        }

        const embeddingModel = aiConfigResult.rows[0].embedding_model;

        const documentResult = await client.query(
          `
            INSERT INTO documents (
              name, type, url, is_embedded
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, name, type, url, is_embedded, created_at, updated_at
          `,
          [
            documentData.name,
            documentData.type,
            documentData.url,
            documentData.isEmbedded,
          ]
        );

        const document = documentResult.rows[0];

        // Create document embedding record with empty markdown (will be generated by embedding service)
        await this.documentEmbeddingDatasource.createDocumentEmbedding(userId, {
          documentId: document.id,
          contentMarkdown: '', // Empty - will be generated by embedding service
          embeddingModel: embeddingModel,
          metadata: {
            documentType: document.type,
            documentUrl: document.url,
            isEmbedded: document.is_embedded,
          },
        });

        // Record modification in company_modifications
        await this.companyModificationDatasource.recordModification(
          userId,
          'document_embeddings',
          'pending'
        );

        return documentResult;
      });

      this.logger.info(
        `Document created successfully for User: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const row = result.rows[0];
      const [documentDTO, error] = DocumentDTO.create({
        id: row.id,
        name: row.name,
        type: row.type,
        url: row.url,
        isEmbedded: row.is_embedded,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      return documentDTO!.toDomain();
    } catch (error) {
      this.logger.error(
        `Failed to create document for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }

  async updateDocument(
    userId: string,
    documentData: Document
  ): Promise<Document> {
    try {
      this.logger.info(
        `Updating document: ${documentData.id} for user: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const result = await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        // Get embedding model from ai_config
        const aiConfigResult = await client.query(
          `SELECT embedding_model FROM ai_config WHERE deleted_at IS NULL LIMIT 1`
        );

        if (aiConfigResult.rows.length === 0) {
          throw new Error('AI configuration not found');
        }

        const embeddingModel = aiConfigResult.rows[0].embedding_model;

        // Build dynamic update query
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (documentData.name) {
          updateFields.push(`name = $${paramIndex}`);
          values.push(documentData.name);
          paramIndex++;
        }

        if (documentData.type) {
          updateFields.push(`type = $${paramIndex}`);
          values.push(documentData.type);
          paramIndex++;
        }

        if (documentData.url) {
          updateFields.push(`url = $${paramIndex}`);
          values.push(documentData.url);
          paramIndex++;
        }

        if (documentData.isEmbedded !== undefined) {
          updateFields.push(`is_embedded = $${paramIndex}`);
          values.push(documentData.isEmbedded);
          paramIndex++;
        }

        if (updateFields.length === 0) {
          throw new Error('No fields to update');
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(documentData.id);

        const query = `
          UPDATE documents 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex} AND deleted_at IS NULL
          RETURNING id, name, type, url, is_embedded, created_at, updated_at
        `;

        const documentResult = await client.query(query, values);

        if (documentResult.rows.length === 0) {
          throw new DataNotFoundError('Document not found');
        }

        const document = documentResult.rows[0];

        // Delete all existing document embeddings for this document (in case there are multiple chunks)
        await this.documentEmbeddingDatasource.deleteDocumentEmbeddingByDocumentId(
          userId,
          document.id
        );

        // Create new document embedding record with empty markdown (will be regenerated by embedding service)
        await this.documentEmbeddingDatasource.createDocumentEmbedding(userId, {
          documentId: document.id,
          contentMarkdown: '', // Empty - will be regenerated by embedding service
          embeddingModel: embeddingModel,
          metadata: {
            documentType: document.type,
            documentUrl: document.url,
            isEmbedded: document.is_embedded,
          },
        });

        // Record modification in company_modifications
        await this.companyModificationDatasource.recordModification(
          userId,
          'document_embeddings',
          'pending'
        );

        return documentResult;
      });

      this.logger.info(
        `Document updated successfully for User: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      const row = result.rows[0];
      const [documentDTO, error] = DocumentDTO.create({
        id: row.id,
        name: row.name,
        type: row.type,
        url: row.url,
        isEmbedded: row.is_embedded,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });

      if (error) {
        throw error;
      }

      return documentDTO!.toDomain();
    } catch (error) {
      this.logger.error(
        `Failed to update document for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      this.logger.info(
        `Deleting document: ${documentId} for user: ${userId}`,
        PgDocumentDatasourceImp.name
      );

      await this.postgresConnection.transaction(async client => {
        await client.query(this.getSchemaQuery(userId));

        const result = await client.query(
          `
            UPDATE documents 
            SET deleted_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND deleted_at IS NULL
          `,
          [documentId]
        );

        if (result.rowCount === 0) {
          throw new DataNotFoundError('Document not found');
        }

        // Delete document embedding record
        await this.documentEmbeddingDatasource.deleteDocumentEmbeddingByDocumentId(
          userId,
          documentId
        );
      });

      this.logger.info(
        `Document deleted successfully for User: ${userId}`,
        PgDocumentDatasourceImp.name
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete document for User: ${userId}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        PgDocumentDatasourceImp.name
      );
      throw error;
    }
  }
}
