export const training = {
  title: 'Gestión de Entrenamiento',
  subtitle:
    'Sube y gestiona los datos de entrenamiento para el asistente de IA.',
  uploadDocuments: 'Subir Documentos',
  addTrainingData: 'Agregar Datos de Entrenamiento',
  supportedFormats: 'Formatos soportados: PDF, DOCX, CSV',
  dragAndDrop: 'Arrastra y suelta archivos aquí o haz clic para explorar',
  clickToUpload: 'Haz clic para subir o arrastra y suelta',
  pdfFilesLimit: 'Archivos PDF hasta 5MB',
  imageFilesLimit: 'Archivos de imagen (PNG, JPEG, JPG) hasta 10MB',
  processingStatus: 'Estado de Procesamiento',
  trainingHistory: 'Historial de Entrenamiento',
  uploadProgress: 'Progreso de Subida',
  processingComplete: 'Procesamiento Completo',
  uploadError: 'Error de Subida',
  uploading: 'Subiendo archivo...',
  tabs: {
    document: 'Documento',
    product: 'Producto',
  },
  document: {
    name: {
      label: 'Nombre del Documento',
      placeholder: 'Ingrese el nombre del documento',
      required: 'El nombre del documento es requerido',
    },
    type: {
      label: 'Tipo de Documento',
      pdf: 'PDF',
      url: 'URL',
    },
    url: {
      label: 'URL',
      placeholder: 'https://ejemplo.com/docs',
      required: 'La URL es requerida',
    },
    file: {
      label: 'Archivo PDF',
      required: 'El archivo PDF es requerido',
      maxSize: 'El tamaño del archivo PDF no debe exceder 5MB',
    },
    save: 'Guardar Documento',
    saving: 'Guardando...',
    update: 'Actualizar Documento',
    updating: 'Actualizando...',
  },
  product: {
    name: {
      label: 'Nombre del Producto',
      placeholder: 'Ingrese el nombre del producto',
      required: 'El nombre del producto es requerido',
    },
    description: {
      label: 'Descripción',
      placeholder: 'Ingrese la descripción del producto',
      required: 'La descripción es requerida',
    },
    category: {
      label: 'Categoría',
      placeholder: 'Seleccione una categoría',
      required: 'La categoría es requerida',
      loading: 'Cargando categorías...',
      empty: 'No hay categorías disponibles',
    },
    type: {
      label: 'Tipo de Producto',
      product: 'Producto',
      service: 'Servicio',
      required: 'El tipo de producto es requerido',
    },
    price: {
      label: 'Precio',
      placeholder: '0.00',
      required: 'El precio es requerido',
      invalid: 'El precio debe ser un número válido',
    },
    currency: {
      label: 'Moneda',
      placeholder: 'USD',
      required: 'La moneda es requerida',
    },
    detailedDescription: {
      label: 'Descripción Detallada',
      placeholder: 'Ingrese la descripción detallada del producto',
      required: 'La descripción detallada es requerida',
    },
    image: {
      label: 'Imagen del Producto',
      upload: 'Subir Imagen',
      change: 'Cambiar Imagen',
      current: 'Imagen actual',
      maxSize: 'El tamaño del archivo de imagen no debe exceder 10MB',
    },
    isFeatured: {
      label: 'Producto Destacado',
      description: 'Mostrar este producto en listas destacadas',
    },
    save: 'Guardar Producto',
    saving: 'Guardando...',
    update: 'Actualizar Producto',
    updating: 'Actualizando...',
  },
  urlExtraction: {
    title: 'Extraer contenido del sitio web',
    placeholder: 'https://ejemplo.com/docs',
    extractButton: 'Extraer Contenido',
    extracting: 'Extrayendo...',
  },
  comingSoon: {
    title: 'Próximamente:',
    features: [
      'Importación de datos CSV',
      'Integración de API',
      'Monitoreo de entrenamiento en tiempo real',
      'Análisis avanzados',
    ],
  },
  productsTable: {
    title: 'Productos',
    loading: 'Cargando productos...',
    empty: 'No se encontraron productos',
    columns: {
      image: 'Imagen',
      name: 'Nombre',
      type: 'Tipo',
      price: 'Precio',
      embeddingStatus: 'Estado de Embedding',
      actions: 'Acciones',
    },
    embeddingStatus: {
      embedded: 'Embebido',
      pending: 'Pendiente',
    },
    deleteDialog: {
      title: 'Eliminar Producto',
      description:
        '¿Está seguro de que desea eliminar "{{productName}}"? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      confirm: 'Eliminar',
      deleting: 'Eliminando...',
    },
    pagination: {
      showing: 'Mostrando {{from}} a {{to}} de {{total}} productos',
      previous: 'Anterior',
      next: 'Siguiente',
    },
  },
  documentsTable: {
    title: 'Documentos',
    loading: 'Cargando documentos...',
    empty: 'No se encontraron documentos',
    columns: {
      name: 'Nombre',
      type: 'Tipo',
      document: 'Documento',
      embeddingStatus: 'Estado de Embedding',
      actions: 'Acciones',
    },
    embeddingStatus: {
      embedded: 'Embebido',
      pending: 'Pendiente',
    },
    deleteDialog: {
      title: 'Eliminar Documento',
      description:
        '¿Está seguro de que desea eliminar "{{documentName}}"? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      confirm: 'Eliminar',
      deleting: 'Eliminando...',
    },
    pagination: {
      showing: 'Mostrando {{from}} a {{to}} de {{total}} documentos',
      previous: 'Anterior',
      next: 'Siguiente',
    },
  },
  fileUpload: {
    clickToUpload: 'Haz clic para subir o arrastra y suelta',
    removeFile: 'Eliminar archivo',
    selectPdfFile: 'Por favor, selecciona un archivo PDF',
    selectImageFile: 'Por favor, selecciona un archivo de imagen',
    fileSizeExceeded: 'El tamaño del archivo no debe exceder {{maxSize}}MB',
  },
  documentLink: {
    loading: 'Cargando...',
    error: 'Error',
    viewPdf: 'Ver PDF',
    viewPage: 'Ver página',
    openPdf: 'Abrir {{name}} (PDF)',
    openUrl: 'Abrir {{name}} (URL)',
    failedToLoad: 'Error al cargar el documento',
    cannotOpen: 'No se puede abrir el PDF: Error al cargar la URL',
  },
  productImage: {
    noImage: 'Sin imagen',
    error: 'Error',
    failedToLoad: 'Error al cargar la imagen',
  },
  errors: {
    fileUpload: 'Error al subir archivo',
    fileUploadDescription:
      'Error al subir el archivo. Por favor, intente nuevamente.',
    documentCreate: 'Error al crear documento',
    documentCreateDescription:
      'Error al crear el documento. Por favor, intente nuevamente.',
    productCreate: 'Error al crear producto',
    productCreateDescription:
      'Error al crear el producto. Por favor, intente nuevamente.',
    categoriesLoad: 'Error al cargar categorías',
    categoriesLoadDescription:
      'Error al cargar las categorías de productos. Por favor, intente nuevamente.',
    productsLoad: 'Error al cargar productos',
    productsLoadDescription:
      'Error al cargar los productos. Por favor, intente nuevamente.',
    productDelete: 'Error al eliminar producto',
    productDeleteDescription:
      'Error al eliminar el producto. Por favor, intente nuevamente.',
    documentsLoad: 'Error al cargar documentos',
    documentsLoadDescription:
      'Error al cargar los documentos. Por favor, intente nuevamente.',
    documentDelete: 'Error al eliminar documento',
    documentDeleteDescription:
      'Error al eliminar el documento. Por favor, intente nuevamente.',
    documentUpdate: 'Error al actualizar documento',
    documentUpdateDescription:
      'Error al actualizar el documento. Por favor, intente nuevamente.',
    productUpdate: 'Error al actualizar producto',
    productUpdateDescription:
      'Error al actualizar el producto. Por favor, intente nuevamente.',
  },
} as const;
