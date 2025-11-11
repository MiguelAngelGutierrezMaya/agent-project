import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const TrainingHeader = () => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('training.title')}
        </h1>
        <p className='text-gray-600 mt-1'>{t('training.subtitle')}</p>
      </div>
    </div>
  );
};
