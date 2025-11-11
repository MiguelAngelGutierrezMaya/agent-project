import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PencilLine,
  RefreshCw,
  Star,
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
import { ProductImage } from '@/modules/training/presentation/components/ProductImage';
import type { Product } from '@/modules/training/products/domain/models/Product';

import { DeleteProductDialog } from './DeleteProductDialog';

interface ProductsTableProps {
  products?: Product[];
  loading: boolean;
  onDelete: (productId: string) => void;
  onEdit: (product: Product) => void;
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
 * Products Table Component
 * Displays a table of products with embedding status and delete functionality
 */
export const ProductsTable = ({
  products = [],
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
}: ProductsTableProps) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      onDelete(selectedProduct.id);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  /**
   * Handle dialog close
   */
  const handleDialogClose = (open: boolean) => {
    if (!deleting) {
      setDeleteDialogOpen(open);
      if (!open) {
        setSelectedProduct(null);
      }
    }
  };

  return (
    <>
      <Card className='min-h-[30rem] flex flex-col'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>{t('training.productsTable.title')}</CardTitle>
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
                {t('training.productsTable.loading')}
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground'>
              {t('training.productsTable.empty')}
            </div>
          ) : (
            <>
              <div className='flex-1 overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('training.productsTable.columns.image')}
                      </TableHead>
                      <TableHead>
                        {t('training.productsTable.columns.name')}
                      </TableHead>
                      <TableHead>
                        {t('training.productsTable.columns.type')}
                      </TableHead>
                      <TableHead>
                        {t('training.productsTable.columns.price')}
                      </TableHead>
                      <TableHead>
                        {t('training.productsTable.columns.embeddingStatus')}
                      </TableHead>
                      <TableHead className='text-right'>
                        {t('training.productsTable.columns.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <ProductImage
                            imageKey={product.imageUrl || undefined}
                            alt={product.name}
                          />
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-start gap-2'>
                            <span className='flex h-4 w-4 items-center justify-center pt-1'>
                              {product.isFeatured ? (
                                <Star className='h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400' />
                              ) : null}
                            </span>
                            <span className='flex-1 whitespace-normal break-words leading-tight'>
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.type === 'product'
                            ? t('training.product.type.product')
                            : t('training.product.type.service')}
                        </TableCell>
                        <TableCell>
                          {product.details.currency}{' '}
                          {product.details.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {product.isEmbedded ? (
                              <>
                                <CheckCircle2 className='h-4 w-4 text-green-600' />
                                <span className='text-sm text-green-600'>
                                  {t(
                                    'training.productsTable.embeddingStatus.embedded'
                                  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className='h-4 w-4 text-orange-600' />
                                <span className='text-sm text-orange-600'>
                                  {t(
                                    'training.productsTable.embeddingStatus.pending'
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
                              onClick={() => onEdit(product)}
                              disabled={loading || deleting}
                              aria-label={t('common.edit')}
                            >
                              <PencilLine className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteClick(product)}
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
                products.length > 0 &&
                (hasNextPage || hasPreviousPage) && (
                  <div className='flex items-center justify-between border-t pt-4 mt-4'>
                    <div className='text-sm text-muted-foreground'>
                      {t('training.productsTable.pagination.showing', {
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
                        {t('training.productsTable.pagination.previous')}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={onNextPage}
                        disabled={!hasNextPage || loading}
                      >
                        {t('training.productsTable.pagination.next')}
                        <ChevronRight className='h-4 w-4 ml-1' />
                      </Button>
                    </div>
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        productName={selectedProduct?.name || ''}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </>
  );
};
