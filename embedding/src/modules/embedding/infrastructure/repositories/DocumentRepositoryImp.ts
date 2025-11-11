import { DocumentRepository } from '@modules/embedding/domain/repositories/DocumentRepository';
import { DocumentEmbedding } from '@modules/embedding/domain/models/Document';
import { DocumentDatasource } from '@modules/embedding/domain/datasource/DocumentDatasource';
import { EmbeddingResult } from '@modules/embedding/domain/models/EmbeddingResult';

/**
 * Implementation of the DocumentRepository interface
 * Delegates document embedding operations to the datasource layer
 */
export class DocumentRepositoryImp implements DocumentRepository {
  /**
   * Creates a new DocumentRepositoryImp instance
   * @param documentDatasource - The datasource implementation for document embedding operations
   */
  constructor(private readonly documentDatasource: DocumentDatasource) {}

  /**
   * Get document embeddings that need embedding processing
   * @param schemaName - Schema name to query
   * @returns Promise<DocumentEmbedding[]> - List of document embeddings
   */
  async getPendingEmbeddings(schemaName: string): Promise<DocumentEmbedding[]> {
    return this.documentDatasource.getPendingEmbeddings(schemaName);
  }

  async storeEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    return this.documentDatasource.storeEmbeddings(
      embeddings,
      schemaName,
      embeddingModel
    );
  }

  async getProcessingEmbeddingsWithBatchId(
    schemaName: string
  ): Promise<DocumentEmbedding[]> {
    return this.documentDatasource.getProcessingEmbeddingsWithBatchId(
      schemaName
    );
  }

  async updateCompletedEmbeddings(
    embeddings: EmbeddingResult[],
    schemaName: string,
    embeddingModel: string
  ): Promise<void> {
    return this.documentDatasource.updateCompletedEmbeddings(
      embeddings,
      schemaName,
      embeddingModel
    );
  }
}
