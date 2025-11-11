import { useAuth } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';

import type {
  CreateFileRequest,
  GetFileRequest,
} from '@/modules/shared/files/domain/datasource/FileDatasource';
import type { FileType } from '@/modules/shared/files/domain/models/File';
import { FileService } from '@/modules/shared/files/infrastructure/service/FileService';

/**
 * Configuration API base URL from environment variables
 */
const API_BASE_URL: string = String(
  import.meta.env.VITE_CONFIG_API_BASE_URL || ''
);
const STAGE: string = String(import.meta.env.VITE_STAGE || '');

/**
 * Custom hook to get FileService instance with authentication
 * Creates a singleton service instance and provides authenticated request helpers
 */
export function useFileService() {
  const { userId, getToken } = useAuth();
  const fileService = useMemo(() => {
    const apiBaseUrl = `${API_BASE_URL}/${STAGE}`;
    return new FileService(apiBaseUrl);
  }, []);

  /**
   * Get authenticated create file request
   */
  const createFile = useCallback(
    async (
      file: string,
      fileName: string,
      fileType: FileType,
      pathPrefix: string
    ): Promise<CreateFileRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        file,
        fileName,
        fileType,
        pathPrefix,
      };
    },
    [userId, getToken]
  );

  /**
   * Get authenticated get file request
   */
  const getFileRequest = useCallback(
    async (key: string): Promise<GetFileRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        key,
      };
    },
    [userId, getToken]
  );

  return {
    fileService,
    createFile,
    getFileRequest,
    userId,
  };
}
