import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { PdfFileUpload } from '@/modules/shared/presentation/components/FileUpload';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';
import {
  MAX_PDF_SIZE,
  UploadSectionTabEnum,
} from '@/modules/training/presentation/components/constants';
import type { DocumentFormData } from '@/modules/training/presentation/pages/Training/useTrainingPage';

interface DocumentFormTabProps {
  documentForm: DocumentFormData;
  documentFile: File | null;
  documentErrors: Record<string, string>;
  isSubmitting: boolean;
  handleDocumentTypeChange: (type: DocumentFormData['type']) => void;
  handleDocumentFileChange: (file: File | null) => void;
  handleDocumentFileError: (error: string) => void;
  handleDocumentFormChange: (
    field: keyof DocumentFormData,
    value: string
  ) => void;
  handleDocumentSubmit: () => void;
  isEditing: boolean;
  submitLabel: string;
  submitLoadingLabel: string;
  onCancel?: () => void;
  disableTypeSelection?: boolean;
  allowEditPdfName?: boolean;
}

/**
 * Document Form Tab Component
 * Handles both PDF upload and URL input for documents
 */
export const DocumentFormTab = ({
  documentForm,
  documentFile,
  documentErrors,
  isSubmitting,
  handleDocumentTypeChange,
  handleDocumentFileChange,
  handleDocumentFileError,
  handleDocumentFormChange,
  handleDocumentSubmit,
  isEditing,
  submitLabel,
  submitLoadingLabel,
  onCancel,
  disableTypeSelection,
  allowEditPdfName,
}: DocumentFormTabProps) => {
  const { t } = useTranslation();

  const renderPdfNameInput = () => {
    const isReadOnly = !allowEditPdfName;
    const className = [
      documentErrors.name ? 'border-red-500' : '',
      isReadOnly ? 'bg-gray-50 cursor-not-allowed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Input
        id='document-name'
        placeholder={t('training.document.name.placeholder')}
        value={documentForm.name}
        readOnly={isReadOnly}
        onChange={
          !isReadOnly
            ? e => handleDocumentFormChange('name', e.target.value)
            : undefined
        }
        className={className}
      />
    );
  };

  return (
    <TabsContent value={UploadSectionTabEnum.DOCUMENT} className='space-y-4'>
      <div className='space-y-4'>
        {/* Document Type Selector */}
        <div className='space-y-2'>
          <Label>{t('training.document.type.label')}</Label>
          <Select
            value={documentForm.type}
            onValueChange={value =>
              handleDocumentTypeChange(value as DocumentFormData['type'])
            }
            disabled={disableTypeSelection}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DocumentEnum.PDF}>
                {t('training.document.type.pdf')}
              </SelectItem>
              <SelectItem value={DocumentEnum.URL}>
                {t('training.document.type.url')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF Upload Section */}
        {documentForm.type === DocumentEnum.PDF && (
          <>
            <div className='space-y-2'>
              <Label htmlFor='document-name'>
                {t('training.document.name.label')}
              </Label>
              {renderPdfNameInput()}
              {documentErrors.name && (
                <p className='text-sm text-red-500'>{documentErrors.name}</p>
              )}
            </div>

            <PdfFileUpload
              file={documentFile}
              onFileChange={handleDocumentFileChange}
              onError={handleDocumentFileError}
              label={t('training.document.file.label')}
              maxSize={MAX_PDF_SIZE}
              maxSizeLabel={t('training.pdfFilesLimit')}
              error={documentErrors.file}
              disabled={isSubmitting}
            />
          </>
        )}

        {/* URL Input Section */}
        {documentForm.type === DocumentEnum.URL && (
          <>
            <div className='space-y-2'>
              <Label htmlFor='document-name-url'>
                {t('training.document.name.label')} *
              </Label>
              <Input
                id='document-name-url'
                placeholder={t('training.document.name.placeholder')}
                value={documentForm.name}
                onChange={e => handleDocumentFormChange('name', e.target.value)}
                className={documentErrors.name ? 'border-red-500' : ''}
              />
              {documentErrors.name && (
                <p className='text-sm text-red-500'>{documentErrors.name}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='document-url'>
                {t('training.document.url.label')} *
              </Label>
              <Input
                id='document-url'
                placeholder={t('training.document.url.placeholder')}
                value={documentForm.url}
                onChange={e => handleDocumentFormChange('url', e.target.value)}
                className={documentErrors.url ? 'border-red-500' : ''}
              />
              {documentErrors.url && (
                <p className='text-sm text-red-500'>{documentErrors.url}</p>
              )}
            </div>
          </>
        )}

        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          {isEditing && onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
              className='sm:w-auto'
            >
              {t('common.cancel')}
            </Button>
          )}
          <Button
            onClick={handleDocumentSubmit}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? submitLoadingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
