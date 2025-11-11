export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface AssistantStatus {
  model: string;
  training: string;
  embeddings: string;
}

export interface KnowledgeBaseInfo {
  documents: number;
  lastUpdated: string;
  coverageAreas: string[];
}

export interface QuickAction {
  label: string;
  question: string;
}
