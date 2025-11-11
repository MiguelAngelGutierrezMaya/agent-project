import { useCallback, useEffect, useRef } from 'react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface UsePdfFileUploadProps {
  onFileChange: (file: File | null) => void;
  onError?: (error: string) => void;
  maxSize?: number;
  maxSizeLabel?: string;
}

/**
 * Custom hook for PdfFileUpload component logic
 * Manages PDF file validation
 */
export const usePdfFileUpload = ({
  onFileChange,
  onError,
  maxSize,
  maxSizeLabel,
}: UsePdfFileUploadProps) => {
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  /**
   * Handle file selection
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) {
        onFileChange(null);
        return;
      }

      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        const errorMsg = tRef.current('training.fileUpload.selectPdfFile');
        onError?.(errorMsg);
        event.target.value = '';
        onFileChange(null);
        return;
      }

      // Validate file size if maxSize is provided
      if (maxSize && selectedFile.size > maxSize) {
        const errorMsg =
          maxSizeLabel ||
          tRef.current('training.fileUpload.fileSizeExceeded', {
            maxSize: (maxSize / 1024 / 1024).toFixed(0),
          });
        onError?.(errorMsg);
        event.target.value = '';
        onFileChange(null);
        return;
      }

      // File is valid
      onFileChange(selectedFile);
      onError?.('');
    },
    [maxSize, maxSizeLabel, onError, onFileChange]
  );

  /**
   * Handle file removal
   */
  const handleRemove = useCallback(() => {
    onFileChange(null);
    onError?.('');

    // Reset file input
    const fileInput = document.getElementById(
      'pdf-file-input'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, [onFileChange, onError]);

  return {
    handleFileChange,
    handleRemove,
  };
};
