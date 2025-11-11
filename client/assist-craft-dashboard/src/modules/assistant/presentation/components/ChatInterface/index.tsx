import { Send, Bot, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Message } from '@/modules/assistant/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatInterface = ({
  messages,
  inputValue,
  setInputValue,
  isTyping,
  onSendMessage,
  onKeyPress,
  messagesEndRef,
}: ChatInterfaceProps) => {
  const { t } = useTranslation();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader className='border-b border-gray-200'>
        <CardTitle className='flex items-center gap-2'>
          <Bot className='w-5 h-5 text-blue-600' />
          {t('assistant.chatTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col p-0'>
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  {message.sender === 'user' ? (
                    <User className='w-4 h-4' />
                  ) : (
                    <Bot className='w-4 h-4' />
                  )}
                  <span className='text-xs opacity-75'>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className='text-sm'>{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className='flex justify-start'>
              <div className='bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg'>
                <div className='flex items-center gap-2 mb-1'>
                  <Bot className='w-4 h-4' />
                  <span className='text-xs opacity-75'>
                    {t('assistant.typing')}
                  </span>
                </div>
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className='border-t border-gray-200 p-4'>
          <div className='flex gap-2'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={t('assistant.chatPlaceholder')}
              disabled={isTyping}
              className='flex-1'
            />
            <Button
              onClick={onSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className='bg-blue-600 hover:bg-blue-700'
            >
              <Send className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
