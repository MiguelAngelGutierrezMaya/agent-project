export const assistant = {
  title: 'Virtual Assistant',
  subtitle: 'Test and interact with your AI assistant in real-time.',
  chatPlaceholder: 'Type your message...',
  sendMessage: 'Send Message',
  clearChat: 'Clear Chat',
  assistantStatus: 'Assistant Status',
  knowledgeBase: 'Knowledge Base',
  quickQuestions: 'Quick Questions',
  modelInfo: 'Model Information',
  trainingData: 'Training Data',
  coverageAreas: 'Coverage Areas',
  online: 'Online',
  typing: 'typing...',
  chatTitle: 'AI Assistant Chat',
  initialMessage:
    "Hello! I'm your AI assistant trained on your company's data. How can I help you today?",
  mockResponses: {
    hr: 'Based on your company handbook, I can help you with HR policies, vacation requests, and employee benefits. What specific information are you looking for?',
    product:
      'According to the product documentation, this feature is available in the Pro plan. Would you like me to explain the implementation details?',
    process:
      'I found relevant information in your training materials. The process typically takes 3-5 business days and requires approval from your direct manager.',
    faq: 'From the FAQ database, this is a common question. The recommended approach is to contact the IT department for technical support issues.',
    guidance:
      'Based on the uploaded documents, I can provide guidance on this topic. Let me break this down into simple steps for you.',
  },
  status: {
    model: 'GPT-4',
    training: 'Updated',
    embeddings: '89.2K',
  },
  knowledge: {
    documents: 24,
    lastUpdated: '2 hours ago',
    coverageAreas: [
      'HR Policies',
      'Product Documentation',
      'Training Materials',
      'FAQ Database',
    ],
  },
  quickActions: {
    hrPolicies: 'Ask about HR policies',
    hrQuestion: "What are the company's vacation policies?",
    expenseProcedures: 'Expense procedures',
    expenseQuestion: 'How do I submit an expense report?',
    productInfo: 'Product information',
    productQuestion: 'What are the product features?',
  },
} as const;
