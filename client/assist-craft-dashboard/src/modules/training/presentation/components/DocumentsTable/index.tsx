import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  Loader2,
  PencilLine,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type { Document } from '@/modules/training/documents/domain/models/Document';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';
import { DocumentLink } from '@/modules/training/presentation/components/DocumentLink';

import { DeleteDocumentDialog } from './DeleteDocumentDialog';

interface DocumentsTableProps {
  documents?: Document[];
  loading: boolean;
  onDelete: (documentId: string) => void;
  onEdit: (document: Document) => void;
  deleting?: boolean;
  total?: number;
  offset?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onRefresh?: () => void;
}

/**
 * Documents Table Component
 * Displays a table of documents with embedding status and delete functionality
 */
export const DocumentsTable = ({
  documents = [],
  loading,
  onDelete,
  deleting = false,
  total = 0,
  offset = 0,
  limit = 5,
  hasNextPage = false,
  hasPreviousPage = false,
  onNextPage,
  onPreviousPage,
  onRefresh,
  onEdit,
}: DocumentsTableProps) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = () => {
    if (selectedDocument) {
      onDelete(selectedDocument.id);
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  /**
   * Handle dialog close
   */
  const handleDialogClose = (open: boolean) => {
    if (!deleting) {
      setDeleteDialogOpen(open);
      if (!open) {
        setSelectedDocument(null);
      }
    }
  };

  return (
    <>
      <Card className='min-h-[30rem] flex flex-col'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>{t('training.documentsTable.title')}</CardTitle>
            {onRefresh && (
              <Button
                variant='outline'
                size='sm'
                onClick={onRefresh}
                disabled={loading}
                className='gap-2'
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                {t('common.refresh')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='flex-1 flex flex-col'>
          {loading ? (
            <div className='flex flex-1 items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              <span className='ml-2 text-sm text-muted-foreground'>
                {t('training.documentsTable.loading')}
              </span>
            </div>
          ) : documents.length === 0 ? (
            <div className='flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground'>
              {t('training.documentsTable.empty')}
            </div>
          ) : (
            <>
              <div className='flex-1 overflow-x-auto'>
                <Table className='w-full table-fixed'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-60'>
                        {t('training.documentsTable.columns.name')}
                      </TableHead>
                      <TableHead>
                        {t('training.documentsTable.columns.type')}
                      </TableHead>
                      <TableHead>
                        {t('training.documentsTable.columns.document')}
                      </TableHead>
                      <TableHead>
                        {t('training.documentsTable.columns.embeddingStatus')}
                      </TableHead>
                      <TableHead className='text-right'>
                        {t('training.documentsTable.columns.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map(document => (
                      <TableRow key={document.id}>
                        <TableCell className='w-60 align-top font-medium'>
                          <div className='flex w-full items-start gap-2'>
                            {document.type === DocumentEnum.PDF ? (
                              <span className='flex h-4 w-4 items-center justify-center pt-1'>
                                <FileText className='h-4 w-4 text-red-600' />
                              </span>
                            ) : (
                              <span className='flex h-4 w-4 items-center justify-center pt-1'>
                                <Globe2 className='h-4 w-4 text-blue-600' />
                              </span>
                            )}
                            <span className='flex-1 whitespace-normal break-words break-all leading-tight'>
                              {document.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {document.type === DocumentEnum.PDF
                            ? t('training.document.type.pdf')
                            : t('training.document.type.url')}
                        </TableCell>
                        <TableCell>
                          <DocumentLink
                            type={document.type}
                            url={document.url}
                            name={document.name}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {document.isEmbedded ? (
                              <>
                                <CheckCircle2 className='h-4 w-4 text-green-600' />
                                <span className='text-sm text-green-600'>
                                  {t(
                                    'training.documentsTable.embeddingStatus.embedded'
                                  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className='h-4 w-4 text-orange-600' />
                                <span className='text-sm text-orange-600'>
                                  {t(
                                    'training.documentsTable.embeddingStatus.pending'
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => onEdit(document)}
                              disabled={loading || deleting}
                              aria-label={t('common.edit')}
                            >
                              <PencilLine className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteClick(document)}
                              disabled={deleting}
                              className='text-destructive hover:text-destructive hover:bg-destructive/10'
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {!loading &&
                documents.length > 0 &&
                (hasNextPage || hasPreviousPage) && (
                  <div className='flex items-center justify-between border-t pt-4 mt-4'>
                    <div className='text-sm text-muted-foreground'>
                      {t('training.documentsTable.pagination.showing', {
                        from: offset + 1,
                        to: Math.min(offset + limit, total),
                        total,
                      })}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={onPreviousPage}
                        disabled={!hasPreviousPage || loading}
                      >
                        <ChevronLeft className='h-4 w-4 mr-1' />
                        {t('training.documentsTable.pagination.previous')}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={onNextPage}
                        disabled={!hasNextPage || loading}
                      >
                        {t('training.documentsTable.pagination.next')}
                        <ChevronRight className='h-4 w-4 ml-1' />
                      </Button>
                    </div>
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        documentName={selectedDocument?.name || ''}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </>
  );
};
