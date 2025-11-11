import { Bot } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CollapsibleCard } from '@/modules/Config/presentation/components/CollapsibleCard';
import type { ConfigurationTabProps } from '@/modules/Config/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const AiConfigTab = ({
  config,
  setConfig,
  errors,
}: ConfigurationTabProps) => {
  const { t } = useTranslation();

  return (
    <CollapsibleCard
      defaultOpen={true}
      title={
        <span className='flex items-center gap-2'>
          <Bot className='w-5 h-5' />
          {t('configuration.ai.title')}
        </span>
      }
      description={t('configuration.ai.description')}
    >
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='chatModel'>{t('configuration.ai.chatModel')}</Label>
            <Select
              value={config.chatModel}
              onValueChange={value =>
                setConfig({ ...config, chatModel: value })
              }
            >
              <SelectTrigger
                id='chatModel'
                className={errors.chatModel ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={t('configuration.ai.selectModel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='azure-openai-gpt-4o-mini'>
                  {t('configuration.ai.models.chatModels.azureGpt4oMini')}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.chatModel && (
              <p className='text-sm text-red-500'>{errors.chatModel}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='embeddingModel'>
              {t('configuration.ai.embeddingModel')}
            </Label>
            <Select
              value={config.embeddingModel}
              onValueChange={value =>
                setConfig({ ...config, embeddingModel: value })
              }
            >
              <SelectTrigger
                id='embeddingModel'
                className={errors.embeddingModel ? 'border-red-500' : ''}
              >
                <SelectValue placeholder={t('configuration.ai.selectModel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='text-embedding-3-small'>
                  {t('configuration.ai.models.embeddingModels.embedding3Small')}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.embeddingModel && (
              <p className='text-sm text-red-500'>{errors.embeddingModel}</p>
            )}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='temperature'>
              {t('configuration.ai.temperature')}:{' '}
              {config.temperature.toFixed(2)}
            </Label>
            <Slider
              id='temperature'
              min={0}
              max={1}
              step={0.01}
              value={[config.temperature]}
              onValueChange={([value]) =>
                setConfig({ ...config, temperature: value })
              }
            />
            <div className='flex justify-between text-sm text-gray-500'>
              <span>{t('configuration.ai.temperatureMoreDeterministic')}</span>
              <span>{t('configuration.ai.temperatureMoreCreative')}</span>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='maxTokens'>
              {t('configuration.ai.maxTokens')}: {config.maxTokens}
            </Label>
            <Slider
              id='maxTokens'
              min={0}
              max={30000}
              step={100}
              value={[config.maxTokens]}
              onValueChange={([value]) =>
                setConfig({ ...config, maxTokens: value })
              }
            />
            <div className='flex justify-between text-sm text-gray-500'>
              <span>0</span>
              <span>30000</span>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between p-4 border rounded-lg'>
          <div>
            <h3 className='font-medium'>
              {t('configuration.ai.batchEmbedding')}
            </h3>
            <p className='text-sm text-gray-600'>
              {t('configuration.ai.batchEmbeddingDescription')}
            </p>
          </div>
          <Switch
            checked={config.batchEmbedding}
            onCheckedChange={checked =>
              setConfig({ ...config, batchEmbedding: checked })
            }
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};
