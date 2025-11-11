import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type {
  Document,
  DocumentType,
} from '@/modules/training/documents/domain/models/Document';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';
import {
  MAX_IMAGE_SIZE,
  MAX_PDF_SIZE,
} from '@/modules/training/presentation/components/constants';
import type {
  DocumentFormData,
  ProductFormData,
} from '@/modules/training/presentation/pages/Training/useTrainingPage';
import type { Product } from '@/modules/training/products/domain/models/Product';
import {
  ProductCurrencyEnum,
  ProductEnum,
} from '@/modules/training/products/domain/models/Product';

interface UseUploadSectionProps {
  onDocumentSave: (data: DocumentFormData, onSuccess?: () => void) => void;
  onProductSave: (data: ProductFormData, onSuccess?: () => void) => void;
  onDocumentUpdate?: (data: DocumentFormData, onSuccess?: () => void) => void;
  onProductUpdate?: (data: ProductFormData, onSuccess?: () => void) => void;
  onDocumentCancel?: () => void;
  onProductCancel?: () => void;
  savingDocument: boolean;
  savingProduct: boolean;
  isEditingDocument?: boolean;
  isEditingProduct?: boolean;
  editingDocument?: Document | null;
  editingProduct?: Product | null;
}

const createDefaultDocumentForm = (): DocumentFormData => ({
  name: '',
  type: DocumentEnum.PDF,
  url: '',
});

const createDefaultProductForm = (): ProductFormData => ({
  name: '',
  description: '',
  categoryId: '',
  type: ProductEnum.PRODUCT,
  currency: ProductCurrencyEnum.USD,
  price: '',
  detailedDescription: '',
  image: undefined,
  imageKey: undefined,
  removeImage: false,
  isFeatured: false,
});

const resetFileInputValue = (elementId: string) => {
  const input = document.getElementById(elementId) as HTMLInputElement | null;
  if (input) {
    input.value = '';
  }
};

/**
 * Custom hook for UploadSection component logic
 * Manages form state, validation, and submission handlers for create/edit flows
 */
export const useUploadSection = ({
  onDocumentSave,
  onProductSave,
  onDocumentUpdate,
  onProductUpdate,
  onDocumentCancel,
  onProductCancel,
  savingDocument: _savingDocument,
  savingProduct: _savingProduct,
  isEditingDocument = false,
  isEditingProduct = false,
  editingDocument = null,
  editingProduct = null,
}: UseUploadSectionProps) => {
  const { t } = useTranslation();

  /* Document form state */
  const [documentForm, setDocumentForm] = useState<DocumentFormData>(
    createDefaultDocumentForm()
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>(
    {}
  );

  /* Product form state */
  const [productForm, setProductForm] = useState<ProductFormData>(
    createDefaultProductForm()
  );
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {}
  );

  /* Sync document form with editing state */
  useEffect(() => {
    if (isEditingDocument && editingDocument) {
      setDocumentForm({
        name: editingDocument.name,
        type: editingDocument.type,
        url: editingDocument.url,
      });
      setDocumentFile(null);
      setDocumentErrors({});
      resetFileInputValue('pdf-file-input');
    } else if (!isEditingDocument && !editingDocument) {
      setDocumentForm(createDefaultDocumentForm());
      setDocumentFile(null);
      setDocumentErrors({});
      resetFileInputValue('pdf-file-input');
    }
  }, [isEditingDocument, editingDocument]);

  /* Sync product form with editing state */
  useEffect(() => {
    if (isEditingProduct && editingProduct) {
      setProductForm({
        name: editingProduct.name,
        description: editingProduct.description || '',
        categoryId: editingProduct.categoryId,
        type: editingProduct.type,
        currency: editingProduct.details
          .currency as ProductFormData['currency'],
        price: editingProduct.details.price.toString(),
        detailedDescription: editingProduct.details.detailedDescription || '',
        image: undefined,
        imageKey: editingProduct.imageUrl ?? null,
        removeImage: false,
        isFeatured: editingProduct.isFeatured,
      });
      setProductImage(null);
      setProductErrors({});
      resetFileInputValue('image-file-input');
    } else if (!isEditingProduct && !editingProduct) {
      setProductForm(createDefaultProductForm());
      setProductImage(null);
      setProductErrors({});
      resetFileInputValue('image-file-input');
    }
  }, [isEditingProduct, editingProduct]);

  /**
   * Handle document type change
   */
  const handleDocumentTypeChange = useCallback(
    (type: DocumentType) => {
      if (isEditingDocument) {
        return;
      }
      setDocumentForm(prev => ({
        ...prev,
        type,
        url: '',
        name:
          type === DocumentEnum.PDF && documentFile ? documentFile.name : '',
        file: undefined,
      }));
      if (type === DocumentEnum.URL) {
        setDocumentFile(null);
      }
      setDocumentErrors({});
    },
    [documentFile, isEditingDocument]
  );

  /**
   * Handle document file change
   */
  const handleDocumentFileChange = useCallback(
    (file: File | null) => {
      if (file) {
        if (file.size > MAX_PDF_SIZE) {
          setDocumentErrors(prev => ({
            ...prev,
            file: t('training.document.file.maxSize'),
            name: '',
          }));
          setDocumentFile(null);
          setDocumentForm(prev => ({
            ...prev,
            file: undefined,
          }));
          return;
        }

        setDocumentFile(file);
        setDocumentForm(prev => ({
          ...prev,
          file,
          name: file.name,
        }));
        setDocumentErrors(prev => ({ ...prev, file: '', name: '' }));
      } else {
        setDocumentFile(null);
        setDocumentForm(prev => ({
          ...prev,
          file: undefined,
          name: isEditingDocument ? prev.name : '',
        }));
        setDocumentErrors(prev => ({ ...prev, file: '', name: '' }));
      }
    },
    [isEditingDocument, t]
  );

  /**
   * Handle document form field changes
   */
  const handleDocumentFormChange = useCallback(
    (field: keyof DocumentFormData, value: string) => {
      setDocumentForm(prev => {
        if (
          field === 'name' &&
          prev.type === DocumentEnum.PDF &&
          !isEditingDocument
        ) {
          return prev;
        }
        return { ...prev, [field]: value };
      });
      setDocumentErrors(prev => ({ ...prev, [field]: '' }));
    },
    [isEditingDocument]
  );

  /**
   * Handle document submit with validation
   */
  const handleDocumentSubmit = useCallback(() => {
    const errors: Record<string, string> = {};
    const isPdf = documentForm.type === DocumentEnum.PDF;
    const hasExistingPdf =
      isEditingDocument && editingDocument?.type === DocumentEnum.PDF;

    if (isPdf) {
      if (!documentFile && !hasExistingPdf) {
        errors.file = t('training.document.file.required');
      } else if (documentFile && documentFile.size > MAX_PDF_SIZE) {
        errors.file = t('training.document.file.maxSize');
      }
      if (!documentForm.name.trim()) {
        errors.name = t('training.document.name.required');
      }
    } else {
      if (!documentForm.name.trim()) {
        errors.name = t('training.document.name.required');
      }
      if (!documentForm.url.trim()) {
        errors.url = t('training.document.url.required');
      }
    }

    if (Object.keys(errors).length > 0) {
      setDocumentErrors(errors);
      return;
    }

    const payload: DocumentFormData = {
      ...documentForm,
      file: documentFile || undefined,
    };

    const handleSuccess = () => {
      setDocumentForm(createDefaultDocumentForm());
      setDocumentFile(null);
      setDocumentErrors({});
      resetFileInputValue('pdf-file-input');
      if (isEditingDocument) {
        onDocumentCancel?.();
      }
    };

    if (isEditingDocument && onDocumentUpdate) {
      onDocumentUpdate(payload, handleSuccess);
    } else {
      onDocumentSave(payload, handleSuccess);
    }
  }, [
    documentForm,
    documentFile,
    editingDocument,
    isEditingDocument,
    onDocumentCancel,
    onDocumentSave,
    onDocumentUpdate,
    t,
  ]);

  /**
   * Handle product image change
   */
  const handleProductImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        if (file.size > MAX_IMAGE_SIZE) {
          setProductErrors(prev => ({
            ...prev,
            image: t('training.product.image.maxSize'),
          }));
          setProductImage(null);
          setProductForm(prev => ({
            ...prev,
            image: undefined,
          }));
          return;
        }

        setProductImage(file);
        setProductForm(prev => ({
          ...prev,
          image: file,
          removeImage: false,
        }));
        setProductErrors(prev => ({ ...prev, image: '' }));
      } else {
        setProductImage(null);
        setProductForm(prev => ({
          ...prev,
          image: undefined,
          removeImage: isEditingProduct ? prev.removeImage : false,
        }));
        setProductErrors(prev => ({ ...prev, image: '' }));
      }
    },
    [isEditingProduct, t]
  );

  /**
   * Handle removal of existing product image when editing
   */
  const handleProductRemoveExistingImage = useCallback(() => {
    setProductForm(prev => ({
      ...prev,
      imageKey: null,
      removeImage: true,
      image: undefined,
    }));
    setProductImage(null);
    setProductErrors(prev => ({ ...prev, image: '' }));
    resetFileInputValue('image-file-input');
  }, []);

  /**
   * Handle product form field changes
   */
  const handleProductFormChange = useCallback(
    (field: keyof ProductFormData, value: string | boolean) => {
      setProductForm(prev => ({ ...prev, [field]: value }));
      setProductErrors(prev => ({ ...prev, [field]: '' }));
    },
    []
  );

  /**
   * Handle product submit with validation
   */
  const handleProductSubmit = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!productForm.name.trim()) {
      errors.name = t('training.product.name.required');
    }
    if (!productForm.description.trim()) {
      errors.description = t('training.product.description.required');
    }
    if (!productForm.type) {
      errors.type = t('training.product.type.required');
    }
    if (!productForm.categoryId) {
      errors.categoryId = t('training.product.category.required');
    }
    if (!productForm.price.trim()) {
      errors.price = t('training.product.price.required');
    } else if (Number.isNaN(Number.parseFloat(productForm.price))) {
      errors.price = t('training.product.price.invalid');
    }
    if (!productForm.currency.trim()) {
      errors.currency = t('training.product.currency.required');
    }
    if (!productForm.detailedDescription.trim()) {
      errors.detailedDescription = t(
        'training.product.detailedDescription.required'
      );
    }
    if (productImage && productImage.size > MAX_IMAGE_SIZE) {
      errors.image = t('training.product.image.maxSize');
    }

    if (Object.keys(errors).length > 0) {
      setProductErrors(errors);
      return;
    }

    const payload: ProductFormData = {
      ...productForm,
      image: productImage || undefined,
    };

    const handleSuccess = () => {
      setProductForm(createDefaultProductForm());
      setProductImage(null);
      setProductErrors({});
      resetFileInputValue('image-file-input');
      if (isEditingProduct) {
        onProductCancel?.();
      }
    };

    if (isEditingProduct && onProductUpdate) {
      onProductUpdate(payload, handleSuccess);
    } else {
      onProductSave(payload, handleSuccess);
    }
  }, [
    isEditingProduct,
    onProductCancel,
    onProductSave,
    onProductUpdate,
    productForm,
    productImage,
    t,
  ]);

  /**
   * Handle document file error
   */
  const handleDocumentFileError = useCallback((error: string) => {
    if (error) {
      setDocumentErrors(prev => ({ ...prev, file: error }));
    } else {
      setDocumentErrors(prev => ({ ...prev, file: '' }));
    }
  }, []);

  /**
   * Handle product image error
   */
  const handleProductImageError = useCallback((error: string) => {
    if (error) {
      setProductErrors(prev => ({ ...prev, image: error }));
    } else {
      setProductErrors(prev => ({ ...prev, image: '' }));
    }
  }, []);

  /**
   * Reset document form to initial state
   */
  const resetDocumentForm = useCallback(() => {
    setDocumentForm(createDefaultDocumentForm());
    setDocumentFile(null);
    setDocumentErrors({});
    resetFileInputValue('pdf-file-input');
  }, []);

  /**
   * Reset product form to initial state
   */
  const resetProductForm = useCallback(() => {
    setProductForm(createDefaultProductForm());
    setProductImage(null);
    setProductErrors({});
    resetFileInputValue('image-file-input');
  }, []);

  return {
    /* Document form state */
    documentForm,
    documentFile,
    documentErrors,
    /* Product form state */
    productForm,
    productImage,
    productErrors,
    /* Document handlers */
    handleDocumentTypeChange,
    handleDocumentFileChange,
    handleDocumentFileError,
    handleDocumentFormChange,
    handleDocumentSubmit,
    resetDocumentForm,
    /* Product handlers */
    handleProductImageChange,
    handleProductImageError,
    handleProductRemoveExistingImage,
    handleProductFormChange,
    handleProductSubmit,
    resetProductForm,
  };
};
