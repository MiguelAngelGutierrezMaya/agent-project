import { useCallback, useEffect, useRef, useState } from 'react';

import { useFileService } from '@/modules/shared/files/infrastructure/hooks/useFileService';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type { DocumentType } from '@/modules/training/documents/domain/models/Document';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';

interface UseDocumentLinkProps {
  type: DocumentType;
  url: string;
}

/**
 * Custom hook for DocumentLink component logic
 * Manages presigned URL loading for PDF documents and click handling
 */
export const useDocumentLink = ({ type, url }: UseDocumentLinkProps) => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const presignedUrlRef = useRef<string | null>(null);

  const { fileService, getFileRequest, userId } = useFileService();
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const loadPresignedUrl = async () => {
      /* Only load presigned URL for PDF type */
      if (type !== DocumentEnum.PDF || !userId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const request = await getFileRequest(url);
        const response = await fileService.getPresignedUrl(request);
        setPresignedUrl(response.presignedUrl);
        presignedUrlRef.current = response.presignedUrl;
      } catch (err) {
        console.error('Error loading document URL:', err);
        setError(tRef.current('training.documentLink.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    loadPresignedUrl();
  }, [type, url, userId, fileService, getFileRequest]);

  /**
   * Handle document click
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      e.preventDefault();

      if (type === DocumentEnum.PDF) {
        const currentUrl = presignedUrlRef.current || presignedUrl;
        if (currentUrl) {
          window.open(currentUrl, '_blank', 'noopener,noreferrer');
        } else if (loading) {
          /* Wait for URL to load and try again */
          const checkInterval = setInterval(() => {
            const urlToOpen = presignedUrlRef.current || presignedUrl;
            if (urlToOpen) {
              window.open(urlToOpen, '_blank', 'noopener,noreferrer');
              clearInterval(checkInterval);
            }
          }, 200);

          /* Clear interval after 5 seconds to avoid infinite loop */
          setTimeout(() => clearInterval(checkInterval), 5000);
        } else if (error) {
          console.error(tRef.current('training.documentLink.cannotOpen'));
        }
      } else if (type === DocumentEnum.URL) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    [type, url, presignedUrl, loading, error]
  );

  return {
    presignedUrl,
    loading,
    error,
    handleClick,
  };
};
