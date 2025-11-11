import type {
  DocumentDatasource,
  GetDocumentsRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type {
  Document,
  DocumentsResponse,
} from '@/modules/training/documents/domain/models/Document';

/**
 * API Response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP Document Datasource Implementation
 * Communicates with the documents service via REST API
 */
export class HttpDocumentDatasourceImp implements DocumentDatasource {
  private readonly apiBaseUrl: string;

  /**
   * Creates a new HTTP Document Datasource instance
   * @param apiBaseUrl - Base URL for the configuration API
   */
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get authorization headers with token
   * @param token - Authentication token
   * @returns Headers object with authorization
   */
  private getAuthHeaders(token: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Build query string from parameters
   * @param params - Object with query parameters
   * @returns Query string
   */
  private buildQueryString(
    params: Record<string, string | number | undefined>
  ): string {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    return queryParams.toString();
  }

  /**
   * Retrieve documents from the API
   * @param request - Request object with user identifier, token, and pagination options
   * @returns Promise that resolves to paginated documents response
   */
  async getDocuments(request: GetDocumentsRequest): Promise<DocumentsResponse> {
    try {
      const queryParams = this.buildQueryString({
        userId: request.userId,
        limit: request.limit,
        offset: request.offset,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/documents?${queryParams}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(request.token),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch documents: ${response.status} ${errorText}`
        );
      }

      const apiResponse =
        (await response.json()) as ApiResponse<DocumentsResponse>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid response format from API');
      }

      /* Return the response data directly as it matches the DocumentsResponse interface */
      return apiResponse.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpDocumentDatasourceImp] Error fetching documents:',
        errorMessage
      );
      throw error;
    }
  }

  /**
   * Create a new document via the API
   * @param request - Request object with user identifier, token, and document data
   * @returns Promise that resolves to created document
   */
  async createDocument(request: CreateDocumentRequest): Promise<Document> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/documents`, {
        method: 'POST',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          name: request.name,
          type: request.type,
          url: request.url,
          isEmbedded: request.isEmbedded ?? false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create document: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<Document>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpDocumentDatasourceImp] Error creating document:',
        errorMessage
      );
      throw error;
    }
  }

  /**
   * Update a document via the API
   * @param request - Request object with user identifier, token, document id, and update data
   * @returns Promise that resolves to updated document
   */
  async updateDocument(request: UpdateDocumentRequest): Promise<Document> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/documents`, {
        method: 'PUT',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          id: request.id,
          name: request.name,
          type: request.type,
          url: request.url,
          isEmbedded: request.isEmbedded,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update document: ${response.status} ${errorText}`
        );
      }

      const data = (await response.json()) as ApiResponse<Document>;

      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }

      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpDocumentDatasourceImp] Error updating document:',
        errorMessage
      );
      throw error;
    }
  }

  /**
   * Delete a document via the API
   * @param request - Request object with user identifier, token, and document id
   * @returns Promise that resolves when document is deleted
   */
  async deleteDocument(request: DeleteDocumentRequest): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/documents`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(request.token),
        body: JSON.stringify({
          userId: request.userId,
          id: request.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete document: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        '[HttpDocumentDatasourceImp] Error deleting document:',
        errorMessage
      );
      throw error;
    }
  }
}
