import { Loader2 } from 'lucide-react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

import { useProductImage } from './useProductImage';

interface ProductImageProps {
  /** File key (S3 key) for the product image */
  imageKey?: string;
  /** Alt text for the image */
  alt?: string;
  /** CSS classes for the image container */
  className?: string;
}

/**
 * Product Image Component
 * Displays product image from S3 using presigned URL with automatic caching
 */
export const ProductImage = ({
  imageKey,
  alt,
  className = '',
}: ProductImageProps) => {
  const { t } = useTranslation();
  const altText = alt || t('common.productImage');
  const { imageUrl, loading, error, handleImageError } = useProductImage({
    imageKey,
  });

  if (!imageKey) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={{ width: '48px', height: '48px' }}
      >
        <span className='text-xs text-muted-foreground text-center'>
          {t('training.productImage.noImage')}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={{ width: '48px', height: '48px' }}
      >
        <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={{ width: '48px', height: '48px' }}
      >
        <span className='text-xs text-muted-foreground'>
          {t('training.productImage.error')}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={altText}
      className={`object-cover rounded ${className}`}
      style={{ width: '48px', height: '48px' }}
      onError={handleImageError}
    />
  );
};
