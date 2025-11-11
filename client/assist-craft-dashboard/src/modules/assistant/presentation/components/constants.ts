import type {
  Message,
  AssistantStatus,
  KnowledgeBaseInfo,
  QuickAction,
} from './types';

export const getInitialMessage = (t: (key: string) => string): Message => ({
  id: 1,
  content: t('assistant.initialMessage'),
  sender: 'assistant',
  timestamp: new Date(),
});

export const getMockResponses = (t: (key: string) => string): string[] => [
  t('assistant.mockResponses.hr'),
  t('assistant.mockResponses.product'),
  t('assistant.mockResponses.process'),
  t('assistant.mockResponses.faq'),
  t('assistant.mockResponses.guidance'),
];

export const getAssistantStatus = (
  t: (key: string) => string
): AssistantStatus => ({
  model: t('assistant.status.model'),
  training: t('assistant.status.training'),
  embeddings: t('assistant.status.embeddings'),
});

export const getKnowledgeBaseInfo = (
  t: (key: string) => string
): KnowledgeBaseInfo => ({
  documents: 24,
  lastUpdated: t('assistant.knowledge.lastUpdated'),
  coverageAreas: t('assistant.knowledge.coverageAreas', {
    returnObjects: true,
  }) as string[],
});

export const getQuickActions = (t: (key: string) => string): QuickAction[] => [
  {
    label: t('assistant.quickActions.hrPolicies'),
    question: t('assistant.quickActions.hrQuestion'),
  },
  {
    label: t('assistant.quickActions.expenseProcedures'),
    question: t('assistant.quickActions.expenseQuestion'),
  },
  {
    label: t('assistant.quickActions.productInfo'),
    question: t('assistant.quickActions.productQuestion'),
  },
];
