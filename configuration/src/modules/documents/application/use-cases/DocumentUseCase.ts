import { DocumentRepository } from '@modules/documents/domain/repositories/DocumentRepository';
import {
  Document,
  DocumentsResponse,
  DocumentData,
} from '@modules/documents/domain/models/Document';

/**
 * Use case for retrieving documents
 * Orchestrates the document retrieval business logic
 */
export class GetDocumentsUseCase {
  /**
   * Creates a new GetDocumentsUseCase instance
   * @param documentRepository - The repository for document operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Executes the document retrieval use case
   * @param userId - User identifier for document retrieval
   * @param limit - Maximum number of documents to return
   * @param offset - Number of documents to skip for pagination
   * @returns Promise that resolves to paginated documents response
   */
  async execute(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<DocumentsResponse> {
    return this.documentRepository.getDocuments(userId, limit, offset);
  }
}

/**
 * Use case for creating documents
 * Orchestrates the document creation business logic
 */
export class CreateDocumentUseCase {
  /**
   * Creates a new CreateDocumentUseCase instance
   * @param documentRepository - The repository for document operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Executes the document creation use case
   * @param userId - User identifier for document creation
   * @param documentData - Document data to create
   * @returns Promise that resolves to the created document
   */
  async execute(userId: string, documentData: DocumentData): Promise<Document> {
    return this.documentRepository.createDocument(userId, documentData);
  }
}

/**
 * Use case for updating documents
 * Orchestrates the document update business logic
 */
export class UpdateDocumentUseCase {
  /**
   * Creates a new UpdateDocumentUseCase instance
   * @param documentRepository - The repository for document operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Executes the document update use case
   * @param userId - User identifier for document update
   * @param documentData - Document data to update
   * @returns Promise that resolves to the updated document
   */
  async execute(userId: string, documentData: Document): Promise<Document> {
    return this.documentRepository.updateDocument(userId, documentData);
  }
}

/**
 * Use case for deleting documents
 * Orchestrates the document deletion business logic
 */
export class DeleteDocumentUseCase {
  /**
   * Creates a new DeleteDocumentUseCase instance
   * @param documentRepository - The repository for document operations
   */
  constructor(private readonly documentRepository: DocumentRepository) {}

  /**
   * Executes the document deletion use case
   * @param userId - User identifier for document deletion
   * @param documentId - Document identifier to delete
   * @returns Promise that resolves when deletion is complete
   */
  async execute(userId: string, documentId: string): Promise<void> {
    return this.documentRepository.deleteDocument(userId, documentId);
  }
}
