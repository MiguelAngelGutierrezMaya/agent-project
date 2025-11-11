import { FileText, Globe2, Loader2 } from 'lucide-react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type { DocumentType } from '@/modules/training/documents/domain/models/Document';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';

import { useDocumentLink } from './useDocumentLink';

interface DocumentLinkProps {
  /** Document type (PDF or URL) */
  type: DocumentType;
  /** Document URL or S3 key (for PDF) */
  url: string;
  /** Document name */
  name: string;
  /** CSS classes for the container */
  className?: string;
}

/**
 * Document Link Component
 * Displays document link or PDF icon with presigned URL support and caching
 * - PDF: Shows PDF icon that opens document in new window
 * - URL: Shows external link icon that opens URL in new window
 */
export const DocumentLink = ({
  type,
  url,
  name,
  className = '',
}: DocumentLinkProps) => {
  const { t } = useTranslation();
  const { presignedUrl, loading, error, handleClick } = useDocumentLink({
    type,
    url,
  });

  if (type === DocumentEnum.PDF) {
    if (loading) {
      return (
        <button
          type='button'
          disabled
          className={`flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ${className}`}
          title={name}
        >
          <span className='flex h-4 w-4 items-center justify-center'>
            <Loader2 className='h-4 w-4 animate-spin' />
          </span>
          <span className='text-sm'>{t('training.documentLink.loading')}</span>
        </button>
      );
    }

    if (error || !presignedUrl) {
      return (
        <span
          className={`flex items-center gap-2 text-muted-foreground ${className}`}
        >
          <span className='flex h-4 w-4 items-center justify-center'>
            <FileText className='h-4 w-4 text-red-500' />
          </span>
          <span className='text-sm'>{t('training.documentLink.error')}</span>
        </span>
      );
    }

    return (
      <button
        type='button'
        onClick={handleClick}
        className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
        title={t('training.documentLink.openPdf', { name })}
      >
        <span className='flex h-4 w-4 items-center justify-center'>
          <FileText className='h-4 w-4' />
        </span>
        <span className='text-sm'>{t('training.documentLink.viewPdf')}</span>
      </button>
    );
  }

  /* URL type - show external link */
  return (
    <a
      href={url}
      onClick={handleClick}
      target='_blank'
      rel='noopener noreferrer'
      className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
      title={t('training.documentLink.openUrl', { name })}
    >
      <span className='flex h-4 w-4 items-center justify-center'>
        <Globe2 className='h-4 w-4' />
      </span>
      <span className='text-sm'>{t('training.documentLink.viewPage')}</span>
    </a>
  );
};
