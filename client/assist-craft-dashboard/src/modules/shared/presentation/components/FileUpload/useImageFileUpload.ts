import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface UseImageFileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onError?: (error: string) => void;
  maxSize?: number;
  maxSizeLabel?: string;
}

/**
 * Custom hook for ImageFileUpload component logic
 * Manages image preview URL and file validation
 */
export const useImageFileUpload = ({
  file,
  onFileChange,
  onError,
  maxSize,
  maxSizeLabel,
}: UseImageFileUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  /**
   * Create preview URL when file changes
   */
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      return undefined;
    }
  }, [file]);

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
      if (!selectedFile.type.startsWith('image/')) {
        const errorMsg = tRef.current('training.fileUpload.selectImageFile');
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

      onFileChange(selectedFile);
      onError?.('');
    },
    [maxSize, maxSizeLabel, onError, onFileChange]
  );

  /**
   * Handle file removal
   */
  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onFileChange(null);
    onError?.('');

    // Reset file input
    const fileInput = document.getElementById(
      'image-file-input'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, [onFileChange, onError, previewUrl]);

  return {
    previewUrl,
    handleFileChange,
    handleRemove,
  };
};
