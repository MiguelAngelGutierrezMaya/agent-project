import { Plus, Settings, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollapsibleCard } from '@/modules/Config/presentation/components/CollapsibleCard';
import type { ConfigurationTabProps } from '@/modules/Config/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

import { useGeneralTab } from './useGeneralTab';

/**
 * General Tab Component
 * Displays general configuration settings including bot name and company information
 */
export const GeneralTab = ({
  config,
  setConfig,
  errors,
}: ConfigurationTabProps) => {
  const { t } = useTranslation();

  const {
    companyFields,
    updateCompanyField,
    updateCompanyFieldKey,
    removeCompanyField,
    addCompanyField,
  } = useGeneralTab({ config, setConfig });

  return (
    <div className='space-y-6'>
      <CollapsibleCard
        defaultOpen={true}
        title={
          <span className='flex items-center gap-2'>
            <Settings className='w-5 h-5' />
            {t('configuration.general.title')}
          </span>
        }
        description={t('configuration.general.description')}
      >
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='botName'>
              {t('configuration.general.botName')}
            </Label>
            <Input
              id='botName'
              value={config.botName}
              onChange={e => setConfig({ ...config, botName: e.target.value })}
              placeholder={t('configuration.general.botNamePlaceholder')}
              className={errors.botName ? 'border-red-500' : ''}
            />
            {errors.botName && (
              <p className='text-sm text-red-500'>{errors.botName}</p>
            )}
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        defaultOpen={false}
        title={t('configuration.general.companyInformation.title')}
        description={t('configuration.general.companyInformation.description')}
      >
        <div className='space-y-4'>
          {companyFields.map(field => (
            <div key={field.id} className='flex gap-2 items-end'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor={`company-${field.id}`}>
                  {t('configuration.general.companyInformation.fieldLabel')}
                </Label>
                <Input
                  id={`company-${field.id}`}
                  value={field.key}
                  onChange={e =>
                    updateCompanyFieldKey(field.id, e.target.value)
                  }
                  placeholder={t(
                    'configuration.general.companyInformation.fieldPlaceholder'
                  )}
                />
              </div>
              <div className='flex-1 space-y-2'>
                <Label htmlFor={`company-value-${field.id}`}>
                  {t('configuration.general.companyInformation.valueLabel')}
                </Label>
                <Input
                  id={`company-value-${field.id}`}
                  value={field.value}
                  onChange={e => updateCompanyField(field.id, e.target.value)}
                  placeholder={t(
                    'configuration.general.companyInformation.valuePlaceholder'
                  )}
                  className={
                    errors[`companyInformation.${field.key}`]
                      ? 'border-red-500'
                      : ''
                  }
                />
                {errors[`companyInformation.${field.key}`] && (
                  <p className='text-sm text-red-500'>
                    {errors[`companyInformation.${field.key}`]}
                  </p>
                )}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => removeCompanyField(field.id)}
                className='text-red-600 hover:text-red-700'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          ))}
          <Button
            onClick={addCompanyField}
            variant='outline'
            className='w-full'
          >
            <Plus className='w-4 h-4 mr-2' />
            {t('configuration.general.companyInformation.addField')}
          </Button>
        </div>
      </CollapsibleCard>
    </div>
  );
};
