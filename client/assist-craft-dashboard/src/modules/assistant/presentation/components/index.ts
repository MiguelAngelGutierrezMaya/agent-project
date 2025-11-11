// Components
export { AssistantHeader } from './AssistantHeader';
export { ChatInterface } from './ChatInterface';
export { AssistantStatus } from './AssistantStatus';
export { KnowledgeBase } from './KnowledgeBase';
export { QuickActions } from './QuickActions';
export { AssistantSidebar } from './AssistantSidebar';

// Types and Constants
export type {
  Message,
  AssistantStatus as AssistantStatusType,
  KnowledgeBaseInfo,
  QuickAction,
} from './types';
export {
  getInitialMessage,
  getMockResponses,
  getAssistantStatus,
  getKnowledgeBaseInfo,
  getQuickActions,
} from './constants';
