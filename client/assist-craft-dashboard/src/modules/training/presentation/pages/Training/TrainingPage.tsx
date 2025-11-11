import {
  DocumentsTable,
  ProductsTable,
  TrainingHeader,
  UploadSection,
} from '@/modules/training/presentation/components';

import { useTrainingPage } from './useTrainingPage';

/**
 * Training Page Component
 * Main page for training data management (documents and products)
 */
export const TrainingPage = () => {
  const {
    categories,
    loadingCategories,
    savingDocument,
    savingProduct,
    products,
    loadingProducts,
    deletingProduct,
    productsTotal,
    productsOffset,
    productsLimit,
    hasNextPage,
    hasPreviousPage,
    documents,
    loadingDocuments,
    deletingDocument,
    documentsTotal,
    documentsOffset,
    documentsLimit,
    hasDocumentsNextPage,
    hasDocumentsPreviousPage,
    activeTab,
    editingProduct,
    editingDocument,
    isEditingProduct,
    isEditingDocument,
    handleTabChange,
    handleProductEdit,
    handleDocumentEdit,
    handleProductCancelEdit,
    handleDocumentCancelEdit,
    handleDocumentSave,
    handleProductSave,
    handleProductUpdate,
    handleDocumentUpdate,
    handleProductDelete,
    handleDocumentDelete,
    handleNextPage,
    handlePreviousPage,
    handleDocumentsNextPage,
    handleDocumentsPreviousPage,
    handleRefreshProducts,
    handleRefreshDocuments,
  } = useTrainingPage();

  return (
    <div className='space-y-6 animate-fade-in'>
      <TrainingHeader />
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-1'>
          <UploadSection
            onDocumentSave={handleDocumentSave}
            onProductSave={handleProductSave}
            onDocumentUpdate={handleDocumentUpdate}
            onProductUpdate={handleProductUpdate}
            onDocumentCancelEdit={handleDocumentCancelEdit}
            onProductCancelEdit={handleProductCancelEdit}
            categories={categories}
            loadingCategories={loadingCategories}
            savingDocument={savingDocument}
            savingProduct={savingProduct}
            isEditingDocument={isEditingDocument}
            isEditingProduct={isEditingProduct}
            editingDocument={editingDocument}
            editingProduct={editingProduct}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        <div className='lg:col-span-2 space-y-6' id='tables-container'>
          <ProductsTable
            products={products}
            loading={loadingProducts}
            onDelete={handleProductDelete}
            onEdit={handleProductEdit}
            deleting={deletingProduct}
            total={productsTotal}
            offset={productsOffset}
            limit={productsLimit}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onRefresh={handleRefreshProducts}
          />
          <DocumentsTable
            documents={documents}
            loading={loadingDocuments}
            onDelete={handleDocumentDelete}
            onEdit={handleDocumentEdit}
            deleting={deletingDocument}
            total={documentsTotal}
            offset={documentsOffset}
            limit={documentsLimit}
            hasNextPage={hasDocumentsNextPage}
            hasPreviousPage={hasDocumentsPreviousPage}
            onNextPage={handleDocumentsNextPage}
            onPreviousPage={handleDocumentsPreviousPage}
            onRefresh={handleRefreshDocuments}
          />
        </div>
      </div>
    </div>
  );
};
