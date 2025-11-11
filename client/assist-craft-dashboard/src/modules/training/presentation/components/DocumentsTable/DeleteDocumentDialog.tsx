import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  onConfirm: () => void;
  deleting?: boolean;
}

/**
 * Delete Document Dialog Component
 * Confirmation dialog for deleting a document
 */
export const DeleteDocumentDialog = ({
  open,
  onOpenChange,
  documentName,
  onConfirm,
  deleting = false,
}: DeleteDocumentDialogProps) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('training.documentsTable.deleteDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('training.documentsTable.deleteDialog.description', {
              documentName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t('training.documentsTable.deleteDialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleting
              ? t('training.documentsTable.deleteDialog.deleting')
              : t('training.documentsTable.deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
