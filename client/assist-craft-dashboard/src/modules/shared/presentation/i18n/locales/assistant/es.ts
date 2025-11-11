export const assistant = {
  title: 'Asistente Virtual',
  subtitle: 'Prueba e interactúa con tu asistente de IA en tiempo real.',
  chatPlaceholder: 'Escribe tu mensaje...',
  sendMessage: 'Enviar Mensaje',
  clearChat: 'Limpiar Chat',
  assistantStatus: 'Estado del Asistente',
  knowledgeBase: 'Base de Conocimiento',
  quickQuestions: 'Preguntas Rápidas',
  modelInfo: 'Información del Modelo',
  trainingData: 'Datos de Entrenamiento',
  coverageAreas: 'Áreas de Cobertura',
  online: 'En Línea',
  typing: 'escribiendo...',
  chatTitle: 'Chat del Asistente de IA',
  initialMessage:
    '¡Hola! Soy tu asistente de IA entrenado con los datos de tu empresa. ¿Cómo puedo ayudarte hoy?',
  mockResponses: {
    hr: 'Basándome en el manual de la empresa, puedo ayudarte con políticas de RRHH, solicitudes de vacaciones y beneficios de empleados. ¿Qué información específica buscas?',
    product:
      'Según la documentación del producto, esta función está disponible en el plan Pro. ¿Te gustaría que explique los detalles de implementación?',
    process:
      'Encontré información relevante en tus materiales de entrenamiento. El proceso típicamente toma 3-5 días hábiles y requiere aprobación de tu gerente directo.',
    faq: 'Desde la base de datos de FAQ, esta es una pregunta común. El enfoque recomendado es contactar al departamento de TI para problemas de soporte técnico.',
    guidance:
      'Basándome en los documentos cargados, puedo proporcionar orientación sobre este tema. Permíteme desglosarlo en pasos simples para ti.',
  },
  status: {
    model: 'GPT-4',
    training: 'Actualizado',
    embeddings: '89.2K',
  },
  knowledge: {
    documents: 24,
    lastUpdated: 'hace 2 horas',
    coverageAreas: [
      'Políticas de RRHH',
      'Documentación del Producto',
      'Materiales de Entrenamiento',
      'Base de Datos FAQ',
    ],
  },
  quickActions: {
    hrPolicies: 'Preguntar sobre políticas de RRHH',
    hrQuestion: '¿Cuáles son las políticas de vacaciones de la empresa?',
    expenseProcedures: 'Procedimientos de gastos',
    expenseQuestion: '¿Cómo envío un reporte de gastos?',
    productInfo: 'Información del producto',
    productQuestion: '¿Cuáles son las características del producto?',
  },
} as const;
