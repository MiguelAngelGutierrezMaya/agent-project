import { Image as ImageIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

import { useImageFileUpload } from './useImageFileUpload';

interface ImageFileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (error: string) => void;
  label?: string;
  maxSize?: number;
  maxSizeLabel?: string;
  error?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Image File Upload Component
 * Reusable component for uploading image files with preview and delete functionality
 */
export const ImageFileUpload = ({
  file,
  onFileChange,
  onError,
  label,
  maxSize,
  maxSizeLabel,
  error,
  accept = 'image/png,image/jpeg,image/jpg',
  disabled = false,
  className,
}: ImageFileUploadProps) => {
  const { t } = useTranslation();
  const { previewUrl, handleFileChange, handleRemove } = useImageFileUpload({
    file,
    onFileChange,
    onError,
    maxSize,
    maxSizeLabel,
  });

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <Label>{label}</Label>}
      {file && previewUrl ? (
        <div className='relative border-2 border-gray-300 rounded-lg p-4'>
          <div className='flex items-center gap-4'>
            {/* Image Preview */}
            <div className='flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100'>
              <img
                src={previewUrl}
                alt={file.name}
                className='w-full h-full object-cover'
              />
            </div>

            {/* File Info */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {file.name}
              </p>
              <p className='text-xs text-gray-500'>
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* Remove Button */}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleRemove}
              disabled={disabled}
              className='flex-shrink-0'
              aria-label={t('training.fileUpload.removeFile')}
            >
              <X className='w-4 h-4' />
            </Button>
          </div>
        </div>
      ) : (
        <div className='relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors'>
          <ImageIcon className='w-8 h-8 text-gray-400 mx-auto mb-2' />
          <p className='text-sm text-gray-600 mb-2'>
            {t('training.fileUpload.clickToUpload')}
          </p>
          {maxSizeLabel && (
            <p className='text-xs text-gray-500'>{maxSizeLabel}</p>
          )}
          <input
            id='image-file-input'
            type='file'
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
          />
        </div>
      )}
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
};
