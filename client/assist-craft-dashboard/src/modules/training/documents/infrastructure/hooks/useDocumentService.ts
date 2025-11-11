import { useAuth } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';

import type {
  GetDocumentsRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DeleteDocumentRequest,
} from '@/modules/training/documents/domain/datasource/DocumentDatasource';
import type { DocumentType } from '@/modules/training/documents/domain/models/Document';
import { DocumentService } from '@/modules/training/documents/infrastructure/service/DocumentService';

/**
 * Configuration API base URL from environment variables
 */
const API_BASE_URL: string = String(
  import.meta.env.VITE_CONFIG_API_BASE_URL || ''
);
const STAGE: string = String(import.meta.env.VITE_STAGE || '');

/**
 * Custom hook to get DocumentService instance with authentication
 * Creates a singleton service instance and provides authenticated request helpers
 */
export function useDocumentService() {
  const { userId, getToken } = useAuth();
  const documentService = useMemo(() => {
    const apiBaseUrl = `${API_BASE_URL}/${STAGE}`;
    return new DocumentService(apiBaseUrl);
  }, []);

  /**
   * Get authenticated get documents request
   */
  const getDocuments = useCallback(
    async (limit?: number, offset?: number): Promise<GetDocumentsRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        limit,
        offset,
      };
    },
    [userId, getToken]
  );

  /**
   * Get authenticated create document request
   */
  const createDocument = useCallback(
    async (
      name: string,
      type: DocumentType,
      url: string,
      isEmbedded?: boolean
    ): Promise<CreateDocumentRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        name,
        type,
        url,
        isEmbedded,
      };
    },
    [userId, getToken]
  );

  /**
   * Get authenticated update document request
   */
  const updateDocument = useCallback(
    async (
      id: string,
      name?: string,
      type?: DocumentType,
      url?: string,
      isEmbedded?: boolean
    ): Promise<UpdateDocumentRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        id,
        name,
        type,
        url,
        isEmbedded,
      };
    },
    [userId, getToken]
  );

  /**
   * Get authenticated delete document request
   */
  const deleteDocument = useCallback(
    async (id: string): Promise<DeleteDocumentRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        id,
      };
    },
    [userId, getToken]
  );

  return {
    documentService,
    getDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    userId,
  };
}
