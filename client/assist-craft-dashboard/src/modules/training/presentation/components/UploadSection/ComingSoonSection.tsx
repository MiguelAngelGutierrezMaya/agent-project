import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

/**
 * Coming Soon Section Component
 * Displays upcoming features
 */
export const ComingSoonSection = () => {
  const { t } = useTranslation();

  return (
    <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
      <h4 className='font-medium text-blue-900 mb-2'>
        {t('training.comingSoon.title')}
      </h4>
      <ul className='text-sm text-blue-800 space-y-1'>
        <li>• CSV data import</li>
        <li>• API integration</li>
        <li>• Real-time training monitoring</li>
        <li>• Advanced analytics</li>
      </ul>
    </div>
  );
};
