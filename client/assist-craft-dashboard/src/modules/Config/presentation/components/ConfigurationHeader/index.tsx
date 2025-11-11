import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface ConfigurationHeaderProps {
  onSave: () => void;
  saving?: boolean;
  hasChanges?: boolean;
}

export const ConfigurationHeader = ({
  onSave,
  saving = false,
  hasChanges = false,
}: ConfigurationHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>
          {t('configuration.title')}
        </h1>
        <p className='text-gray-600 mt-2'>{t('configuration.subtitle')}</p>
      </div>
      <Button
        onClick={onSave}
        className='flex items-center gap-2'
        disabled={saving || !hasChanges}
      >
        {saving ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <Save className='w-4 h-4' />
        )}
        {saving
          ? t('configuration.saving')
          : t('configuration.saveConfiguration')}
      </Button>
    </div>
  );
};
