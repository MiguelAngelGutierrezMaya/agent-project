import { FileText, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

import { usePdfFileUpload } from './usePdfFileUpload';

interface PdfFileUploadProps {
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
 * PDF File Upload Component
 * Reusable component for uploading PDF files with preview and delete functionality
 */
export const PdfFileUpload = ({
  file,
  onFileChange,
  onError,
  label,
  maxSize,
  maxSizeLabel,
  error,
  accept = '.pdf',
  disabled = false,
  className,
}: PdfFileUploadProps) => {
  const { t } = useTranslation();
  const { handleFileChange, handleRemove } = usePdfFileUpload({
    onFileChange,
    onError,
    maxSize,
    maxSizeLabel,
  });

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && <Label>{label}</Label>}
      {file ? (
        <div className='relative border-2 border-gray-300 rounded-lg p-4'>
          <div className='flex items-center gap-4'>
            {/* PDF Icon Preview */}
            <div className='flex-shrink-0 w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center'>
              <FileText className='w-8 h-8 text-red-600' />
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
          <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
          <p className='text-sm text-gray-600 mb-2'>
            {t('training.fileUpload.clickToUpload')}
          </p>
          {maxSizeLabel && (
            <p className='text-xs text-gray-500'>{maxSizeLabel}</p>
          )}
          <input
            id='pdf-file-input'
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
