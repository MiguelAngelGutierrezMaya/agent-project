import { RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface AssistantHeaderProps {
  onClearChat: () => void;
}

export const AssistantHeader = ({ onClearChat }: AssistantHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('assistant.title')}
        </h1>
        <p className='text-gray-600 mt-1'>{t('assistant.subtitle')}</p>
      </div>
      <div className='flex gap-3'>
        <Button variant='outline' onClick={onClearChat}>
          <RotateCcw className='w-4 h-4 mr-2' />
          {t('assistant.clearChat')}
        </Button>
        <Badge className='bg-green-100 text-green-800 px-3 py-1'>
          <div className='w-2 h-2 bg-green-500 rounded-full mr-2' />
          {t('assistant.online')}
        </Badge>
      </div>
    </div>
  );
};
