import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { ImageFileUpload } from '@/modules/shared/presentation/components/FileUpload';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import {
  MAX_IMAGE_SIZE,
  UploadSectionTabEnum,
} from '@/modules/training/presentation/components/constants';
import { ProductImage } from '@/modules/training/presentation/components/ProductImage';
import type { ProductFormData } from '@/modules/training/presentation/pages/Training/useTrainingPage';
import type { ProductCategory } from '@/modules/training/productCategories/domain/models/ProductCategory';
import {
  ProductCurrencyEnum,
  ProductEnum,
} from '@/modules/training/products/domain/models/Product';

interface ProductFormTabProps {
  productForm: ProductFormData;
  productImage: File | null;
  productErrors: Record<string, string>;
  categories: ProductCategory[];
  loadingCategories: boolean;
  isSubmitting: boolean;
  handleProductImageChange: (file: File | null) => void;
  handleProductImageError: (error: string) => void;
  handleProductFormChange: (
    field: keyof ProductFormData,
    value: string | boolean
  ) => void;
  handleProductSubmit: () => void;
  isEditing: boolean;
  submitLabel: string;
  submitLoadingLabel: string;
  onCancel?: () => void;
  hasExistingImage?: boolean;
  onRemoveExistingImage?: () => void;
}

/**
 * Product Form Tab Component
 * Handles product creation/editing form with all fields
 */
export const ProductFormTab = ({
  productForm,
  productImage,
  productErrors,
  categories,
  loadingCategories,
  isSubmitting,
  handleProductImageChange,
  handleProductImageError,
  handleProductFormChange,
  handleProductSubmit,
  isEditing,
  submitLabel,
  submitLoadingLabel,
  onCancel,
  hasExistingImage,
  onRemoveExistingImage,
}: ProductFormTabProps) => {
  const { t } = useTranslation();

  const renderExistingImage = () => {
    if (!isEditing || !hasExistingImage || !productForm.imageKey) {
      return null;
    }

    return (
      <div className='flex items-center gap-4 rounded-lg border p-4'>
        <ProductImage
          imageKey={productForm.imageKey ?? undefined}
          alt={productForm.name}
          className='h-16 w-16'
        />
        <div className='flex-1'>
          <p className='text-sm text-muted-foreground'>
            {t('training.product.image.current')}
          </p>
        </div>
        {onRemoveExistingImage && (
          <Button
            type='button'
            variant='outline'
            onClick={onRemoveExistingImage}
            disabled={isSubmitting}
          >
            {t('common.remove')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <TabsContent value={UploadSectionTabEnum.PRODUCT} className='space-y-4'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='product-name'>
            {t('training.product.name.label')} *
          </Label>
          <Input
            id='product-name'
            placeholder={t('training.product.name.placeholder')}
            value={productForm.name}
            onChange={e => handleProductFormChange('name', e.target.value)}
            className={productErrors.name ? 'border-red-500' : ''}
          />
          {productErrors.name && (
            <p className='text-sm text-red-500'>{productErrors.name}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='product-description'>
            {t('training.product.description.label')} *
          </Label>
          <Textarea
            id='product-description'
            placeholder={t('training.product.description.placeholder')}
            value={productForm.description}
            onChange={e =>
              handleProductFormChange('description', e.target.value)
            }
            className={productErrors.description ? 'border-red-500' : ''}
          />
          {productErrors.description && (
            <p className='text-sm text-red-500'>{productErrors.description}</p>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='product-category'>
              {t('training.product.category.label')} *
            </Label>
            <Select
              value={productForm.categoryId}
              onValueChange={value =>
                handleProductFormChange('categoryId', value)
              }
            >
              <SelectTrigger
                className={productErrors.categoryId ? 'border-red-500' : ''}
                disabled={loadingCategories}
              >
                <SelectValue
                  placeholder={
                    loadingCategories
                      ? t('training.product.category.loading')
                      : t('training.product.category.placeholder')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className='px-2 py-1.5 text-sm text-gray-500'>
                    {t('training.product.category.empty')}
                  </div>
                ) : (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {productErrors.categoryId && (
              <p className='text-sm text-red-500'>{productErrors.categoryId}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='product-type'>
              {t('training.product.type.label')} *
            </Label>
            <Select
              value={productForm.type}
              onValueChange={value =>
                handleProductFormChange(
                  'type',
                  value as ProductFormData['type']
                )
              }
            >
              <SelectTrigger
                className={productErrors.type ? 'border-red-500' : ''}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductEnum.PRODUCT}>
                  {t('training.product.type.product')}
                </SelectItem>
                <SelectItem value={ProductEnum.SERVICE}>
                  {t('training.product.type.service')}
                </SelectItem>
              </SelectContent>
            </Select>
            {productErrors.type && (
              <p className='text-sm text-red-500'>{productErrors.type}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='product-price'>
              {t('training.product.price.label')} *
            </Label>
            <Input
              id='product-price'
              type='number'
              step='0.01'
              min='0'
              placeholder={t('training.product.price.placeholder')}
              value={productForm.price}
              onChange={e => handleProductFormChange('price', e.target.value)}
              className={productErrors.price ? 'border-red-500' : ''}
            />
            {productErrors.price && (
              <p className='text-sm text-red-500'>{productErrors.price}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='product-currency'>
              {t('training.product.currency.label')} *
            </Label>
            <Select
              value={productForm.currency}
              onValueChange={value =>
                handleProductFormChange('currency', value)
              }
            >
              <SelectTrigger
                className={productErrors.currency ? 'border-red-500' : ''}
              >
                <SelectValue
                  placeholder={t('training.product.currency.placeholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductCurrencyEnum).map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {productErrors.currency && (
              <p className='text-sm text-red-500'>{productErrors.currency}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='product-detailed-description'>
            {t('training.product.detailedDescription.label')} *
          </Label>
          <Textarea
            id='product-detailed-description'
            placeholder={t('training.product.detailedDescription.placeholder')}
            value={productForm.detailedDescription}
            onChange={e =>
              handleProductFormChange('detailedDescription', e.target.value)
            }
            className={
              productErrors.detailedDescription ? 'border-red-500' : ''
            }
          />
          {productErrors.detailedDescription && (
            <p className='text-sm text-red-500'>
              {productErrors.detailedDescription}
            </p>
          )}
        </div>

        {renderExistingImage()}

        <ImageFileUpload
          file={productImage}
          onFileChange={handleProductImageChange}
          onError={handleProductImageError}
          label={t('training.product.image.label')}
          maxSize={MAX_IMAGE_SIZE}
          maxSizeLabel={t('training.imageFilesLimit')}
          error={productErrors.image}
          disabled={isSubmitting}
        />

        <div className='flex items-center space-x-2'>
          <Checkbox
            id='product-featured'
            checked={productForm.isFeatured}
            onCheckedChange={checked =>
              handleProductFormChange('isFeatured', checked === true)
            }
          />
          <Label
            htmlFor='product-featured'
            className='cursor-pointer text-sm font-normal'
          >
            {t('training.product.isFeatured.label')}
          </Label>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          {isEditing && onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting || loadingCategories}
              className='sm:w-auto'
            >
              {t('common.cancel')}
            </Button>
          )}
          <Button
            onClick={handleProductSubmit}
            disabled={isSubmitting || loadingCategories}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? submitLoadingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
