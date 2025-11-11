import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type { Document } from '@/modules/training/documents/domain/models/Document';
import { UploadSectionTabEnum } from '@/modules/training/presentation/components/constants';
import type {
  DocumentFormData,
  ProductFormData,
} from '@/modules/training/presentation/pages/Training/useTrainingPage';
import type { ProductCategory } from '@/modules/training/productCategories/domain/models/ProductCategory';
import type { Product } from '@/modules/training/products/domain/models/Product';

import { ComingSoonSection } from './ComingSoonSection';
import { DocumentFormTab } from './DocumentFormTab';
import { ProductFormTab } from './ProductFormTab';
import { useUploadSection } from './useUploadSection';
import { useUploadSectionHeight } from './useUploadSectionHeight';

interface UploadSectionProps {
  onDocumentSave: (data: DocumentFormData, onSuccess?: () => void) => void;
  onProductSave: (data: ProductFormData, onSuccess?: () => void) => void;
  onDocumentUpdate: (data: DocumentFormData, onSuccess?: () => void) => void;
  onProductUpdate: (data: ProductFormData, onSuccess?: () => void) => void;
  onDocumentCancelEdit: () => void;
  onProductCancelEdit: () => void;
  categories?: ProductCategory[];
  loadingCategories: boolean;
  savingDocument: boolean;
  savingProduct: boolean;
  isEditingDocument: boolean;
  isEditingProduct: boolean;
  editingDocument?: Document | null;
  editingProduct?: Product | null;
  activeTab: UploadSectionTabEnum;
  onTabChange: (tab: UploadSectionTabEnum) => void;
}

/**
 * Upload Section Component
 * Provides interface for uploading documents (PDF/URL) and creating/editing products
 */
export const UploadSection = ({
  onDocumentSave,
  onProductSave,
  onDocumentUpdate,
  onProductUpdate,
  onDocumentCancelEdit,
  onProductCancelEdit,
  categories = [],
  loadingCategories,
  savingDocument,
  savingProduct,
  isEditingDocument,
  isEditingProduct,
  editingDocument = null,
  editingProduct = null,
  activeTab,
  onTabChange,
}: UploadSectionProps) => {
  const { t } = useTranslation();
  const cardRef = useUploadSectionHeight();

  const {
    documentForm,
    documentFile,
    documentErrors,
    productForm,
    productImage,
    productErrors,
    handleDocumentTypeChange,
    handleDocumentFileChange,
    handleDocumentFileError,
    handleDocumentFormChange,
    handleDocumentSubmit,
    resetDocumentForm,
    handleProductImageChange,
    handleProductImageError,
    handleProductRemoveExistingImage,
    handleProductFormChange,
    handleProductSubmit,
    resetProductForm,
  } = useUploadSection({
    onDocumentSave,
    onProductSave,
    onDocumentUpdate,
    onProductUpdate,
    onDocumentCancel: onDocumentCancelEdit,
    onProductCancel: onProductCancelEdit,
    savingDocument,
    savingProduct,
    isEditingDocument,
    isEditingProduct,
    editingDocument,
    editingProduct,
  });

  const documentSubmitLabel = isEditingDocument
    ? t('training.document.update')
    : t('training.document.save');
  const documentSubmittingLabel = isEditingDocument
    ? t('training.document.updating')
    : t('training.document.saving');
  const productSubmitLabel = isEditingProduct
    ? t('training.product.update')
    : t('training.product.save');
  const productSubmittingLabel = isEditingProduct
    ? t('training.product.updating')
    : t('training.product.saving');

  const handleDocumentCancel = () => {
    resetDocumentForm();
    onDocumentCancelEdit();
  };

  const handleProductCancel = () => {
    resetProductForm();
    onProductCancelEdit();
  };

  return (
    <Card ref={cardRef} className='h-full'>
      <CardHeader>
        <CardTitle>{t('training.addTrainingData')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value => onTabChange(value as UploadSectionTabEnum)}
          className='space-y-4'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger
              value={UploadSectionTabEnum.DOCUMENT}
              disabled={isEditingProduct}
            >
              {t('training.tabs.document')}
            </TabsTrigger>
            <TabsTrigger
              value={UploadSectionTabEnum.PRODUCT}
              disabled={isEditingDocument}
            >
              {t('training.tabs.product')}
            </TabsTrigger>
          </TabsList>

          <DocumentFormTab
            documentForm={documentForm}
            documentFile={documentFile}
            documentErrors={documentErrors}
            isSubmitting={savingDocument}
            handleDocumentTypeChange={handleDocumentTypeChange}
            handleDocumentFileChange={handleDocumentFileChange}
            handleDocumentFileError={handleDocumentFileError}
            handleDocumentFormChange={handleDocumentFormChange}
            handleDocumentSubmit={handleDocumentSubmit}
            isEditing={isEditingDocument}
            submitLabel={documentSubmitLabel}
            submitLoadingLabel={documentSubmittingLabel}
            onCancel={isEditingDocument ? handleDocumentCancel : undefined}
            disableTypeSelection={isEditingDocument}
            allowEditPdfName={isEditingDocument}
          />

          <ProductFormTab
            productForm={productForm}
            productImage={productImage}
            productErrors={productErrors}
            categories={categories}
            loadingCategories={loadingCategories}
            isSubmitting={savingProduct}
            handleProductImageChange={handleProductImageChange}
            handleProductImageError={handleProductImageError}
            handleProductFormChange={handleProductFormChange}
            handleProductSubmit={handleProductSubmit}
            isEditing={isEditingProduct}
            submitLabel={productSubmitLabel}
            submitLoadingLabel={productSubmittingLabel}
            onCancel={isEditingProduct ? handleProductCancel : undefined}
            hasExistingImage={Boolean(productForm.imageKey)}
            onRemoveExistingImage={handleProductRemoveExistingImage}
          />
        </Tabs>

        <ComingSoonSection />
      </CardContent>
    </Card>
  );
};
