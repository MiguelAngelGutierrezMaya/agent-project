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

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void;
  deleting?: boolean;
}

/**
 * Delete Product Dialog Component
 * Confirmation dialog for deleting a product
 */
export const DeleteProductDialog = ({
  open,
  onOpenChange,
  productName,
  onConfirm,
  deleting = false,
}: DeleteProductDialogProps) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('training.productsTable.deleteDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('training.productsTable.deleteDialog.description', {
              productName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t('training.productsTable.deleteDialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleting
              ? t('training.productsTable.deleteDialog.deleting')
              : t('training.productsTable.deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
