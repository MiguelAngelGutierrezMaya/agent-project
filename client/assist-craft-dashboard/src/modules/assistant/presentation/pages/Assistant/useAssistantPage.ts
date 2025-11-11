import { useCallback, useEffect, useRef, useState } from 'react';

import type { Message } from '@/modules/assistant/presentation/components';
import {
  getInitialMessage,
  getMockResponses,
} from '@/modules/assistant/presentation/components';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

/**
 * Custom hook for Assistant Page logic
 * Manages chat messages, input state, and message handlers
 */
export const useAssistantPage = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(t)]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Handle send message
   */
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(
      () => {
        const mockResponses = getMockResponses(t);
        const assistantMessage: Message = {
          id: messages.length + 2,
          content:
            mockResponses[Math.floor(Math.random() * mockResponses.length)],
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      },
      1500 + Math.random() * 1000
    );
  }, [inputValue, messages.length, t]);

  /**
   * Handle key press
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  /**
   * Clear chat
   */
  const clearChat = useCallback(() => {
    setMessages([getInitialMessage(t)]);
  }, [t]);

  /**
   * Handle quick action
   */
  const handleQuickAction = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    handleSendMessage,
    handleKeyPress,
    clearChat,
    handleQuickAction,
  };
};
