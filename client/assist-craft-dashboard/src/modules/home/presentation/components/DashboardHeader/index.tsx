import { Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('dashboard.title')}
        </h1>
        <p className='text-gray-600 mt-1'>{t('dashboard.welcome')}</p>
      </div>
      <Button
        onClick={() => {
          navigate('/assistant');
        }}
        className='bg-blue-600 hover:bg-blue-700'
      >
        <Bot className='w-4 h-4 mr-2' />
        {t('dashboard.testAssistant')}
      </Button>
    </div>
  );
};
