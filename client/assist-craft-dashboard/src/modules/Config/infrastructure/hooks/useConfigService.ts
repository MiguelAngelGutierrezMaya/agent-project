import { useAuth } from '@clerk/clerk-react';
import { useCallback, useMemo } from 'react';

import type {
  GetConfigRequest,
  UpdateConfigRequest,
} from '@/modules/Config/domain/datasource/ConfigDatasource';
import { ConfigService } from '@/modules/Config/infrastructure/service/ConfigService';

/**
 * Configuration API base URL from environment variables
 */
const API_BASE_URL: string = String(
  import.meta.env.VITE_CONFIG_API_BASE_URL || ''
);
const STAGE: string = String(import.meta.env.VITE_STAGE || '');

/**
 * Custom hook to get ConfigService instance with authentication
 * Creates a singleton service instance and provides authenticated request helpers
 */
export function useConfigService() {
  const { userId, getToken } = useAuth();
  const configService = useMemo(() => {
    const apiBaseUrl = `${API_BASE_URL}/${STAGE}`;
    return new ConfigService(apiBaseUrl);
  }, []);

  /**
   * Get authenticated configuration request
   */
  const getGetConfigRequest =
    useCallback(async (): Promise<GetConfigRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
      };
    }, [userId, getToken]);

  /**
   * Get authenticated update configuration request
   */
  const getUpdateConfigRequest = useCallback(
    async (
      config: UpdateConfigRequest['config']
    ): Promise<UpdateConfigRequest> => {
      const token = await getToken();
      if (!token || !userId) {
        throw new Error('Authentication required');
      }
      return {
        userId,
        token,
        config,
      };
    },
    [userId, getToken]
  );

  return {
    configService,
    getGetConfigRequest,
    getUpdateConfigRequest,
    userId,
  };
}
