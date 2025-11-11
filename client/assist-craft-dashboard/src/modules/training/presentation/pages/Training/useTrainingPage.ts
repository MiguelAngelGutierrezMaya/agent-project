import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { useConfigService } from '@/modules/Config/infrastructure/hooks/useConfigService';
import { FileTypeEnum } from '@/modules/shared/files/domain/models/File';
import { useFileService } from '@/modules/shared/files/infrastructure/hooks/useFileService';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import type {
  Document,
  DocumentType,
} from '@/modules/training/documents/domain/models/Document';
import { DocumentEnum } from '@/modules/training/documents/domain/models/Document';
import { useDocumentService } from '@/modules/training/documents/infrastructure/hooks/useDocumentService';
import { UploadSectionTabEnum } from '@/modules/training/presentation/components/constants';
import type { ProductCategory } from '@/modules/training/productCategories/domain/models/ProductCategory';
import { useProductCategoryService } from '@/modules/training/productCategories/infrastructure/hooks/useProductCategoryService';
import type {
  Product,
  ProductCurrencyType,
  ProductType,
} from '@/modules/training/products/domain/models/Product';
import { useProductService } from '@/modules/training/products/infrastructure/hooks/useProductService';

/**
 * Document form data interface
 */
export interface DocumentFormData {
  name: string;
  type: DocumentType;
  url: string;
  file?: File;
}

/**
 * Product form data interface
 */
export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  type: ProductType;
  price: string;
  currency: ProductCurrencyType;
  detailedDescription: string;
  image?: File | null;
  /** Existing image key if editing */
  imageKey?: string | null;
  /** Flag indicating if the current image should be removed */
  removeImage?: boolean;
  isFeatured: boolean;
}

/**
 * Convert a File to base64 string
 * @param file - File to convert
 * @returns Promise that resolves to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      /* Remove data URL prefix (e.g., "data:image/png;base64,") */
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Get FileType from file MIME type
 * @param mimeType - MIME type of the file
 * @returns FileType enum value
 */
const getFileTypeFromMime = (mimeType: string): FileTypeEnum => {
  switch (mimeType) {
    case 'image/png':
      return FileTypeEnum.PNG;
    case 'image/jpeg':
      return FileTypeEnum.JPEG;
    case 'image/jpg':
      return FileTypeEnum.JPG;
    case 'application/pdf':
      return FileTypeEnum.PDF;
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

/**
 * Custom hook for Training Page logic
 * Manages document and product creation, category loading, and file uploads
 */
export const useTrainingPage = () => {
  const pathPrefixProducts = useRef<string>('training/products');
  const pathPrefixDocuments = useRef<string>('training/documents');

  const [savingDocument, setSavingDocument] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [productsOffset, setProductsOffset] = useState(0);
  const [productsTotal, setProductsTotal] = useState(0);
  const PRODUCTS_LIMIT = 5;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [documentsOffset, setDocumentsOffset] = useState(0);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const DOCUMENTS_LIMIT = 5;

  const [activeTab, setActiveTab] = useState<UploadSectionTabEnum>(
    UploadSectionTabEnum.DOCUMENT
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const { toast } = useToast();
  const { t } = useTranslation();

  /* Use refs to keep stable references to functions */
  const toastRef = useRef(toast);
  const tRef = useRef(t);

  /* Update refs on change */
  useEffect(() => {
    toastRef.current = toast;
    tRef.current = t;
  }, [toast, t]);

  /* Services */
  const {
    documentService,
    createDocument,
    getDocuments,
    updateDocument,
    deleteDocument,
    userId: documentUserId,
  } = useDocumentService();
  const {
    productService,
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    userId: productUserId,
  } = useProductService();
  const {
    productCategoryService,
    getProductCategories,
    userId: categoryUserId,
  } = useProductCategoryService();
  const { configService, getGetConfigRequest } = useConfigService();
  const { fileService, createFile } = useFileService();

  /**
   * Handle tab change in upload section
   */
  const handleTabChange = useCallback(
    (tab: UploadSectionTabEnum) => {
      setActiveTab(tab);
      if (tab === UploadSectionTabEnum.DOCUMENT && editingProduct) {
        setEditingProduct(null);
      }
      if (tab === UploadSectionTabEnum.PRODUCT && editingDocument) {
        setEditingDocument(null);
      }
    },
    [editingDocument, editingProduct]
  );

  /**
   * Load categories on mount
   */
  useEffect(() => {
    const loadCategories = async () => {
      if (!categoryUserId) return;

      setLoadingCategories(true);
      try {
        const request = await getProductCategories(100, 0);
        const response =
          await productCategoryService.getProductCategories(request);
        setCategories(response.data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toastRef.current({
          title: tRef.current('training.errors.categoriesLoad'),
          description: tRef.current(
            'training.errors.categoriesLoadDescription'
          ),
          variant: 'destructive',
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [categoryUserId, getProductCategories, productCategoryService]);

  /**
   * Load products function
   */
  const loadProducts = useCallback(
    async (offset?: number) => {
      if (!productUserId) return;

      const currentOffset = offset !== undefined ? offset : productsOffset;
      setLoadingProducts(true);
      try {
        const request = await getProducts(PRODUCTS_LIMIT, currentOffset);
        const response = await productService.getProducts(request);
        setProducts(response.data);
        setProductsTotal(response.total);
      } catch (error) {
        console.error('Error loading products:', error);
        toastRef.current({
          title: tRef.current('training.errors.productsLoad'),
          description: tRef.current('training.errors.productsLoadDescription'),
          variant: 'destructive',
        });
      } finally {
        setLoadingProducts(false);
      }
    },
    [productUserId, getProducts, productService, productsOffset]
  );

  /**
   * Load products on mount and when offset changes
   */
  useEffect(() => {
    if (productUserId) {
      loadProducts();
    }
  }, [productUserId, productsOffset, loadProducts]);

  /**
   * Load documents function
   */
  const loadDocuments = useCallback(
    async (offset?: number) => {
      if (!documentUserId) return;

      const currentOffset = offset !== undefined ? offset : documentsOffset;
      setLoadingDocuments(true);
      try {
        const request = await getDocuments(DOCUMENTS_LIMIT, currentOffset);
        const response = await documentService.getDocuments(request);
        setDocuments(response.data);
        setDocumentsTotal(response.total);
      } catch (error) {
        console.error('Error loading documents:', error);
        toastRef.current({
          title: tRef.current('training.errors.documentsLoad'),
          description: tRef.current('training.errors.documentsLoadDescription'),
          variant: 'destructive',
        });
      } finally {
        setLoadingDocuments(false);
      }
    },
    [documentUserId, getDocuments, documentService, documentsOffset]
  );

  /**
   * Load documents on mount and when offset changes
   */
  useEffect(() => {
    if (documentUserId) {
      loadDocuments();
    }
  }, [documentUserId, documentsOffset, loadDocuments]);

  /**
   * Start editing a product
   */
  const handleProductEdit = useCallback((product: Product) => {
    setEditingDocument(null);
    setEditingProduct(product);
    setActiveTab(UploadSectionTabEnum.PRODUCT);
  }, []);

  /**
   * Start editing a document
   */
  const handleDocumentEdit = useCallback((document: Document) => {
    setEditingProduct(null);
    setEditingDocument(document);
    setActiveTab(UploadSectionTabEnum.DOCUMENT);
  }, []);

  /**
   * Cancel product editing
   */
  const handleProductCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  /**
   * Cancel document editing
   */
  const handleDocumentCancelEdit = useCallback(() => {
    setEditingDocument(null);
  }, []);

  /**
   * Handle document save
   * Uploads PDF file if needed and creates document
   */
  const handleDocumentSave = useCallback(
    async (data: DocumentFormData, onSuccess?: () => void) => {
      if (!documentUserId) {
        toastRef.current({
          title: tRef.current('training.errors.documentCreate'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setSavingDocument(true);
      try {
        let documentUrl = data.url;

        /* If it's a PDF file, upload it first */
        if (data.type === DocumentEnum.PDF && data.file) {
          /* Convert file to base64 */
          const base64 = await fileToBase64(data.file);
          const fileType = getFileTypeFromMime(data.file.type);

          /* Get schema from config */
          const configRequest = await getGetConfigRequest();
          const config = await configService.getConfig(configRequest);
          const schema = config.schema;
          const pathPrefix = `${schema}/${pathPrefixDocuments.current}`;

          /* Upload file to get S3 key */
          const fileRequest = await createFile(
            base64,
            data.file.name,
            fileType,
            pathPrefix
          );
          const fileResponse = await fileService.uploadFile(fileRequest);

          /* Use the key as the URL */
          documentUrl = fileResponse.key;
        }

        /* Create document */
        const request = await createDocument(
          data.name,
          data.type,
          documentUrl,
          false
        );
        await documentService.createDocument(request);

        toastRef.current({
          title: tRef.current('success.saved'),
          description: '',
        });
        /* Call onSuccess callback to reset form */
        onSuccess?.();
        /* Reload documents after creation - reset to first page to show new document */
        setDocumentsOffset(0);
        await loadDocuments(0);
      } catch (error) {
        console.error('Error creating document:', error);
        toastRef.current({
          title: tRef.current('training.errors.documentCreate'),
          description: tRef.current(
            'training.errors.documentCreateDescription'
          ),
          variant: 'destructive',
        });
      } finally {
        setSavingDocument(false);
      }
    },
    [
      documentUserId,
      createDocument,
      documentService,
      configService,
      getGetConfigRequest,
      createFile,
      fileService,
      loadDocuments,
    ]
  );

  /**
   * Handle document update
   * Uploads new PDF file if provided and updates document metadata
   */
  const handleDocumentUpdate = useCallback(
    async (data: DocumentFormData, onSuccess?: () => void) => {
      if (!documentUserId || !editingDocument) {
        toastRef.current({
          title: tRef.current('training.errors.documentUpdate'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setSavingDocument(true);
      try {
        let documentUrl = editingDocument.url;

        if (editingDocument.type === DocumentEnum.PDF) {
          if (data.file) {
            const base64 = await fileToBase64(data.file);
            const fileType = getFileTypeFromMime(data.file.type);

            /* Get schema from config */
            const configRequest = await getGetConfigRequest();
            const config = await configService.getConfig(configRequest);
            const schema = config.schema;
            const pathPrefix = `${schema}/${pathPrefixDocuments.current}`;

            const fileRequest = await createFile(
              base64,
              data.file.name,
              fileType,
              pathPrefix
            );
            const fileResponse = await fileService.uploadFile(fileRequest);
            documentUrl = fileResponse.key;
          }
        } else {
          documentUrl = data.url;
        }

        const request = await updateDocument(
          editingDocument.id,
          data.name,
          editingDocument.type,
          documentUrl,
          false
        );
        await documentService.updateDocument(request);

        toastRef.current({
          title: tRef.current('success.updated'),
          description: '',
        });
        onSuccess?.();
        setEditingDocument(null);
        await loadDocuments(documentsOffset);
      } catch (error) {
        console.error('Error updating document:', error);
        toastRef.current({
          title: tRef.current('training.errors.documentUpdate'),
          description: tRef.current(
            'training.errors.documentUpdateDescription'
          ),
          variant: 'destructive',
        });
      } finally {
        setSavingDocument(false);
      }
    },
    [
      documentUserId,
      editingDocument,
      updateDocument,
      documentService,
      configService,
      getGetConfigRequest,
      createFile,
      fileService,
      loadDocuments,
      documentsOffset,
    ]
  );

  /**
   * Handle product save
   * Uploads image file if needed and creates product
   */
  const handleProductSave = useCallback(
    async (data: ProductFormData, onSuccess?: () => void) => {
      if (!productUserId) {
        toastRef.current({
          title: tRef.current('training.errors.productCreate'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setSavingProduct(true);
      try {
        let imageUrl: string | undefined;

        /* If image is provided, upload it first */
        if (data.image) {
          /* Convert file to base64 */
          const base64 = await fileToBase64(data.image);
          const fileType = getFileTypeFromMime(data.image.type);

          /* Get schema from config */
          const configRequest = await getGetConfigRequest();
          const config = await configService.getConfig(configRequest);
          const schema = config.schema;
          const pathPrefix = `${schema}/${pathPrefixProducts.current}`;

          /* Upload file to get S3 key */
          const fileRequest = await createFile(
            base64,
            data.image.name,
            fileType,
            pathPrefix
          );
          const fileResponse = await fileService.uploadFile(fileRequest);

          /* Use the key as the imageUrl */
          imageUrl = fileResponse.key;
        }

        /* Create product */
        const request = await createProduct(
          data.categoryId,
          data.name,
          data.type,
          {
            price: Number.parseFloat(data.price),
            currency: data.currency,
            detailedDescription: data.detailedDescription || undefined,
          },
          data.description || undefined,
          imageUrl,
          false,
          data.isFeatured
        );
        await productService.createProduct(request);

        toastRef.current({
          title: tRef.current('success.saved'),
          description: '',
        });
        /* Call onSuccess callback to reset form */
        onSuccess?.();
        /* Reload products after creation - reset to first page to show new product */
        setProductsOffset(0);
        await loadProducts(0);
      } catch (error) {
        console.error('Error creating product:', error);
        toastRef.current({
          title: tRef.current('training.errors.productCreate'),
          description: tRef.current('training.errors.productCreateDescription'),
          variant: 'destructive',
        });
      } finally {
        setSavingProduct(false);
      }
    },
    [
      productUserId,
      createProduct,
      productService,
      configService,
      getGetConfigRequest,
      createFile,
      fileService,
      loadProducts,
    ]
  );

  /**
   * Handle product update
   * Uploads new image if provided and updates product metadata
   */
  const handleProductUpdate = useCallback(
    async (data: ProductFormData, onSuccess?: () => void) => {
      if (!productUserId || !editingProduct) {
        toastRef.current({
          title: tRef.current('training.errors.productUpdate'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setSavingProduct(true);
      try {
        let imageUrl: string | null | undefined =
          editingProduct.imageUrl ?? undefined;

        if (data.image) {
          const base64 = await fileToBase64(data.image);
          const fileType = getFileTypeFromMime(data.image.type);

          /* Get schema from config */
          const configRequest = await getGetConfigRequest();
          const config = await configService.getConfig(configRequest);
          const schema = config.schema;
          const pathPrefix = `${schema}/${pathPrefixProducts.current}`;

          const fileRequest = await createFile(
            base64,
            data.image.name,
            fileType,
            pathPrefix
          );
          const fileResponse = await fileService.uploadFile(fileRequest);
          imageUrl = fileResponse.key;
        } else if (data.removeImage && !data.image) {
          /* Explicitly clear existing image when user removes it */
          imageUrl = '';
        }

        const request = await updateProduct(
          editingProduct.id,
          data.categoryId,
          data.name,
          data.type,
          data.description || undefined,
          imageUrl ?? undefined,
          false,
          data.isFeatured,
          {
            price: Number.parseFloat(data.price),
            currency: data.currency,
            detailedDescription: data.detailedDescription || undefined,
          }
        );
        await productService.updateProduct(request);

        toastRef.current({
          title: tRef.current('success.updated'),
          description: '',
        });
        onSuccess?.();
        setEditingProduct(null);
        await loadProducts(productsOffset);
      } catch (error) {
        console.error('Error updating product:', error);
        toastRef.current({
          title: tRef.current('training.errors.productUpdate'),
          description: tRef.current('training.errors.productUpdateDescription'),
          variant: 'destructive',
        });
      } finally {
        setSavingProduct(false);
      }
    },
    [
      productUserId,
      editingProduct,
      updateProduct,
      productService,
      configService,
      getGetConfigRequest,
      createFile,
      fileService,
      loadProducts,
      productsOffset,
    ]
  );

  /**
   * Handle product delete
   */
  const handleProductDelete = useCallback(
    async (productId: string) => {
      if (!productUserId) {
        toastRef.current({
          title: tRef.current('training.errors.productDelete'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setDeletingProduct(true);
      try {
        const request = await deleteProduct(productId);
        await productService.deleteProduct(request);

        if (editingProduct && editingProduct.id === productId) {
          setEditingProduct(null);
        }

        toastRef.current({
          title: tRef.current('success.deleted'),
          description: '',
        });

        /* Reload products after deletion - reset to first page */
        setProductsOffset(0);
        await loadProducts(0);
      } catch (error) {
        console.error('Error deleting product:', error);
        toastRef.current({
          title: tRef.current('training.errors.productDelete'),
          description: tRef.current('training.errors.productDeleteDescription'),
          variant: 'destructive',
        });
      } finally {
        setDeletingProduct(false);
      }
    },
    [productUserId, deleteProduct, productService, loadProducts, editingProduct]
  );

  /**
   * Handle next page
   */
  const handleNextPage = useCallback(() => {
    const nextOffset = productsOffset + PRODUCTS_LIMIT;
    if (nextOffset < productsTotal) {
      setProductsOffset(nextOffset);
    }
  }, [productsOffset, productsTotal]);

  /**
   * Handle previous page
   */
  const handlePreviousPage = useCallback(() => {
    const prevOffset = Math.max(0, productsOffset - PRODUCTS_LIMIT);
    setProductsOffset(prevOffset);
  }, [productsOffset]);

  /**
   * Handle document delete
   */
  const handleDocumentDelete = useCallback(
    async (documentId: string) => {
      if (!documentUserId) {
        toastRef.current({
          title: tRef.current('training.errors.documentDelete'),
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      setDeletingDocument(true);
      try {
        const request = await deleteDocument(documentId);
        await documentService.deleteDocument(request);

        if (editingDocument && editingDocument.id === documentId) {
          setEditingDocument(null);
        }

        toastRef.current({
          title: tRef.current('success.deleted'),
          description: '',
        });

        /* Reload documents after deletion - reset to first page */
        setDocumentsOffset(0);
        await loadDocuments(0);
      } catch (error) {
        console.error('Error deleting document:', error);
        toastRef.current({
          title: tRef.current('training.errors.documentDelete'),
          description: tRef.current(
            'training.errors.documentDeleteDescription'
          ),
          variant: 'destructive',
        });
      } finally {
        setDeletingDocument(false);
      }
    },
    [
      documentUserId,
      deleteDocument,
      documentService,
      loadDocuments,
      editingDocument,
    ]
  );

  /**
   * Check if there are more products to load
   */
  const hasNextPage = productsOffset + PRODUCTS_LIMIT < productsTotal;
  const hasPreviousPage = productsOffset > 0;

  /**
   * Handle next page for documents
   */
  const handleDocumentsNextPage = useCallback(() => {
    const nextOffset = documentsOffset + DOCUMENTS_LIMIT;
    if (nextOffset < documentsTotal) {
      setDocumentsOffset(nextOffset);
    }
  }, [documentsOffset, documentsTotal]);

  /**
   * Handle previous page for documents
   */
  const handleDocumentsPreviousPage = useCallback(() => {
    const prevOffset = Math.max(0, documentsOffset - DOCUMENTS_LIMIT);
    setDocumentsOffset(prevOffset);
  }, [documentsOffset]);

  /**
   * Check if there are more documents to load
   */
  const hasDocumentsNextPage =
    documentsOffset + DOCUMENTS_LIMIT < documentsTotal;
  const hasDocumentsPreviousPage = documentsOffset > 0;

  /**
   * Handle refresh products - reload with current offset
   */
  const handleRefreshProducts = useCallback(async () => {
    await loadProducts(productsOffset);
  }, [loadProducts, productsOffset]);

  /**
   * Handle refresh documents - reload with current offset
   */
  const handleRefreshDocuments = useCallback(async () => {
    await loadDocuments(documentsOffset);
  }, [loadDocuments, documentsOffset]);

  const isEditingProduct = Boolean(editingProduct);
  const isEditingDocument = Boolean(editingDocument);

  return {
    categories,
    loadingCategories,
    savingDocument,
    savingProduct,
    products,
    loadingProducts,
    deletingProduct,
    productsTotal,
    productsOffset,
    productsLimit: PRODUCTS_LIMIT,
    hasNextPage,
    hasPreviousPage,
    documents,
    loadingDocuments,
    deletingDocument,
    documentsTotal,
    documentsOffset,
    documentsLimit: DOCUMENTS_LIMIT,
    hasDocumentsNextPage,
    hasDocumentsPreviousPage,
    activeTab,
    handleTabChange,
    editingProduct,
    editingDocument,
    isEditingProduct,
    isEditingDocument,
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
  };
};
