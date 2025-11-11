import {
  AssistantHeader,
  ChatInterface,
  AssistantSidebar,
  getAssistantStatus,
  getKnowledgeBaseInfo,
  getQuickActions,
} from '@/modules/assistant/presentation/components';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

import { useAssistantPage } from './useAssistantPage';

/**
 * Assistant Page Component
 * Main page for interacting with the AI assistant
 */
export const AssistantPage = () => {
  const { t } = useTranslation();
  const {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    handleSendMessage,
    handleKeyPress,
    clearChat,
    handleQuickAction,
  } = useAssistantPage();

  return (
    <div className='space-y-6 animate-fade-in h-full flex flex-col'>
      <AssistantHeader onClearChat={clearChat} />
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1'>
        <div className='lg:col-span-3'>
          <ChatInterface
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            messagesEndRef={messagesEndRef}
          />
        </div>
        <AssistantSidebar
          assistantStatus={getAssistantStatus(t)}
          knowledgeBase={getKnowledgeBaseInfo(t)}
          quickActions={getQuickActions(t)}
          onActionClick={handleQuickAction}
        />
      </div>
    </div>
  );
};
