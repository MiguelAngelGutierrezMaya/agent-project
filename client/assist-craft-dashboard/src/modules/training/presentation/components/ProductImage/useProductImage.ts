import { useEffect, useRef, useState } from 'react';

import { useFileService } from '@/modules/shared/files/infrastructure/hooks/useFileService';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface UseProductImageProps {
  imageKey?: string;
}

/**
 * Custom hook for ProductImage component logic
 * Manages image loading from S3 with presigned URL and caching
 */
export const useProductImage = ({ imageKey }: UseProductImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fileService, getFileRequest, userId } = useFileService();
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const loadImage = async () => {
      if (!imageKey || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const request = await getFileRequest(imageKey);
        const response = await fileService.getPresignedUrl(request);
        setImageUrl(response.presignedUrl);
      } catch (err) {
        console.error('Error loading product image:', err);
        setError(tRef.current('training.productImage.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageKey, userId, fileService, getFileRequest]);

  /**
   * Handle image load error
   */
  const handleImageError = () => {
    setError(tRef.current('training.productImage.failedToLoad'));
  };

  return {
    imageUrl,
    loading,
    error,
    handleImageError,
  };
};
