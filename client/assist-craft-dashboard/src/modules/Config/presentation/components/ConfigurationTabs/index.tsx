import { Bot, MessageCircle, Settings } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiConfigTab } from '@/modules/Config/presentation/components/AiConfigTab';
import { ContactsTab } from '@/modules/Config/presentation/components/ContactsTab';
import { GeneralTab } from '@/modules/Config/presentation/components/GeneralTab';
import type { ConfigurationTabProps } from '@/modules/Config/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const ConfigurationTabs = ({
  config,
  setConfig,
  errors,
}: ConfigurationTabProps) => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue='general' className='space-y-6'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='general' className='flex items-center gap-2'>
          <Settings className='w-4 h-4' />
          {t('configuration.generalSettings')}
        </TabsTrigger>
        <TabsTrigger value='contacts' className='flex items-center gap-2'>
          <MessageCircle className='w-4 h-4' />
          {t('configuration.contactManagement')}
        </TabsTrigger>
        <TabsTrigger value='ai' className='flex items-center gap-2'>
          <Bot className='w-4 h-4' />
          {t('configuration.aiSettings')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value='general' className='space-y-6'>
        <GeneralTab config={config} setConfig={setConfig} errors={errors} />
      </TabsContent>

      <TabsContent value='contacts' className='space-y-6'>
        <ContactsTab config={config} setConfig={setConfig} errors={errors} />
      </TabsContent>

      <TabsContent value='ai' className='space-y-6'>
        <AiConfigTab config={config} setConfig={setConfig} errors={errors} />
      </TabsContent>
    </Tabs>
  );
};
