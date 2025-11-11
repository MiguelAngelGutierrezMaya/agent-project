import { CreateDocumentUseCase } from '@/modules/training/documents/application/useCases/CreateDocumentUseCase';
import { DeleteDocumentUseCase } from '@/modules/training/documents/application/useCases/DeleteDocumentUseCase';
import { GetDocumentsUseCase } from '@/modules/training/documents/application/useCases/GetDocumentsUseCase';
import { UpdateDocumentUseCase } from '@/modules/training/documents/application/useCases/UpdateDocumentUseCase';
import type {
  GetDocumentsRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import { HttpDocumentDatasourceImp } from '@/modules/training/documents/infrastructure/datasource/HttpDocumentDatasourceImp';
import { DocumentRepositoryImp } from '@/modules/training/documents/infrastructure/repositories/DocumentRepositoryImp';

/**
 * Document Service
 * Orchestrates document operations using use cases
 */
export class DocumentService {
  private getDocumentsUseCase: GetDocumentsUseCase;
  private createDocumentUseCase: CreateDocumentUseCase;
  private updateDocumentUseCase: UpdateDocumentUseCase;
  private deleteDocumentUseCase: DeleteDocumentUseCase;

  /**
   * Creates a new DocumentService instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    /* Initialize datasource */
    const documentDatasource = new HttpDocumentDatasourceImp(apiBaseUrl);

    /* Initialize repository */
    const documentRepository = new DocumentRepositoryImp(documentDatasource);

    /* Initialize use cases */
    this.getDocumentsUseCase = new GetDocumentsUseCase(documentRepository);
    this.createDocumentUseCase = new CreateDocumentUseCase(documentRepository);
    this.updateDocumentUseCase = new UpdateDocumentUseCase(documentRepository);
    this.deleteDocumentUseCase = new DeleteDocumentUseCase(documentRepository);
  }

  /**
   * Get documents for a user
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  async getDocuments(request: GetDocumentsRequest) {
    return this.getDocumentsUseCase.execute(request);
  }

  /**
   * Create a new document for a user
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  async createDocument(request: CreateDocumentRequest) {
    return this.createDocumentUseCase.execute(request);
  }

  /**
   * Update a document for a user
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  async updateDocument(request: UpdateDocumentRequest) {
    return this.updateDocumentUseCase.execute(request);
  }

  /**
   * Delete a document for a user
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  async deleteDocument(request: DeleteDocumentRequest) {
    return this.deleteDocumentUseCase.execute(request);
  }
}
