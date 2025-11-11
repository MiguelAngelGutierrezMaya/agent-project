import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CollapsibleCard } from '@/modules/Config/presentation/components/CollapsibleCard';
import type { ConfigurationTabProps } from '@/modules/Config/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const ContactsTab = ({
  config,
  setConfig,
  errors,
}: ConfigurationTabProps) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      <CollapsibleCard
        defaultOpen={true}
        title={
          <span className='flex items-center gap-2'>
            <MessageCircle className='w-5 h-5' />
            {t('configuration.contacts.whatsappBusiness.title')}
          </span>
        }
        description={t('configuration.contacts.whatsappBusiness.description')}
      >
        <div className='space-y-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Phone className='w-5 h-5 text-green-600' />
              <div className='flex-1 space-y-2'>
                <Label htmlFor='whatsappNumber'>
                  {t('configuration.contacts.whatsappBusiness.whatsappNumber')}
                </Label>
                <Input
                  id='whatsappNumber'
                  value={config.whatsappNumber}
                  onChange={e =>
                    setConfig({ ...config, whatsappNumber: e.target.value })
                  }
                  placeholder={t(
                    'configuration.contacts.whatsappBusiness.numberPlaceholder'
                  )}
                  className={errors.whatsappNumber ? 'border-red-500' : ''}
                />
                {errors.whatsappNumber && (
                  <p className='text-sm text-red-500'>
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='whatsappAccessToken'>
                {t('configuration.contacts.whatsappBusiness.accessToken')}
              </Label>
              <Input
                id='whatsappAccessToken'
                type='password'
                value={config.whatsappAccessToken}
                onChange={e =>
                  setConfig({ ...config, whatsappAccessToken: e.target.value })
                }
                placeholder={t(
                  'configuration.contacts.whatsappBusiness.tokenPlaceholder'
                )}
                className={errors.whatsappAccessToken ? 'border-red-500' : ''}
              />
              {errors.whatsappAccessToken && (
                <p className='text-sm text-red-500'>
                  {errors.whatsappAccessToken}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='whatsappBusinessPhoneId'>
                {t('configuration.contacts.whatsappBusiness.businessPhoneId')}
              </Label>
              <Input
                id='whatsappBusinessPhoneId'
                value={config.whatsappBusinessPhoneId}
                onChange={e =>
                  setConfig({
                    ...config,
                    whatsappBusinessPhoneId: e.target.value,
                  })
                }
                placeholder={t(
                  'configuration.contacts.whatsappBusiness.phoneIdPlaceholder'
                )}
                className={
                  errors.whatsappBusinessPhoneId ? 'border-red-500' : ''
                }
              />
              {errors.whatsappBusinessPhoneId && (
                <p className='text-sm text-red-500'>
                  {errors.whatsappBusinessPhoneId}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='whatsappDisplayPhone'>
                {t('configuration.contacts.whatsappBusiness.displayPhone')}
              </Label>
              <Input
                id='whatsappDisplayPhone'
                value={config.whatsappDisplayPhone}
                onChange={e =>
                  setConfig({ ...config, whatsappDisplayPhone: e.target.value })
                }
                placeholder={t(
                  'configuration.contacts.whatsappBusiness.numberPlaceholder'
                )}
                className={errors.whatsappDisplayPhone ? 'border-red-500' : ''}
              />
              {errors.whatsappDisplayPhone && (
                <p className='text-sm text-red-500'>
                  {errors.whatsappDisplayPhone}
                </p>
              )}
            </div>

            <Separator />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='facebookEndpoint'>
                  {t(
                    'configuration.contacts.whatsappBusiness.facebookEndpoint'
                  )}
                </Label>
                <Input
                  id='facebookEndpoint'
                  value={config.facebookEndpoint}
                  onChange={e =>
                    setConfig({ ...config, facebookEndpoint: e.target.value })
                  }
                  placeholder={t(
                    'configuration.contacts.whatsappBusiness.endpointPlaceholder'
                  )}
                  className={errors.facebookEndpoint ? 'border-red-500' : ''}
                />
                {errors.facebookEndpoint && (
                  <p className='text-sm text-red-500'>
                    {errors.facebookEndpoint}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='whatsappApiVersion'>
                  {t('configuration.contacts.whatsappBusiness.apiVersion')}
                </Label>
                <Input
                  id='whatsappApiVersion'
                  value={config.whatsappApiVersion}
                  onChange={e =>
                    setConfig({ ...config, whatsappApiVersion: e.target.value })
                  }
                  placeholder={t(
                    'configuration.contacts.whatsappBusiness.apiVersionPlaceholder'
                  )}
                  className={errors.whatsappApiVersion ? 'border-red-500' : ''}
                />
                {errors.whatsappApiVersion && (
                  <p className='text-sm text-red-500'>
                    {errors.whatsappApiVersion}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='whatsappListDescription'>
                {t('configuration.contacts.whatsappBusiness.listDescription')}
              </Label>
              <Input
                id='whatsappListDescription'
                value={config.whatsappListDescription}
                onChange={e =>
                  setConfig({
                    ...config,
                    whatsappListDescription: e.target.value,
                  })
                }
                placeholder={t(
                  'configuration.contacts.whatsappBusiness.listDescriptionPlaceholder'
                )}
                className={
                  errors.whatsappListDescription ? 'border-red-500' : ''
                }
              />
              {errors.whatsappListDescription && (
                <p className='text-sm text-red-500'>
                  {errors.whatsappListDescription}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='whatsappButtonOptionsTitle'>
                {t(
                  'configuration.contacts.whatsappBusiness.buttonOptionsTitle'
                )}
              </Label>
              <Input
                id='whatsappButtonOptionsTitle'
                value={config.whatsappButtonOptionsTitle}
                onChange={e =>
                  setConfig({
                    ...config,
                    whatsappButtonOptionsTitle: e.target.value,
                  })
                }
                placeholder={t(
                  'configuration.contacts.whatsappBusiness.buttonOptionsPlaceholder'
                )}
                className={
                  errors.whatsappButtonOptionsTitle ? 'border-red-500' : ''
                }
              />
              {errors.whatsappButtonOptionsTitle && (
                <p className='text-sm text-red-500'>
                  {errors.whatsappButtonOptionsTitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        defaultOpen={false}
        title={
          <span className='flex items-center gap-2'>
            <Facebook className='w-5 h-5 text-blue-600' />
            {t('configuration.contacts.socialMedia.title')}
          </span>
        }
        description={t('configuration.contacts.socialMedia.description')}
      >
        <div className='space-y-6'>
          <div className='flex items-center gap-4'>
            <Facebook className='w-5 h-5 text-blue-600' />
            <div className='flex-1 space-y-2'>
              <Label htmlFor='facebookPageUrl'>
                {t('configuration.contacts.socialMedia.facebookPageUrl')}
              </Label>
              <Input
                id='facebookPageUrl'
                value={config.facebookPageUrl}
                onChange={e =>
                  setConfig({ ...config, facebookPageUrl: e.target.value })
                }
                placeholder={t(
                  'configuration.contacts.socialMedia.facebookPagePlaceholder'
                )}
                className={errors.facebookPageUrl ? 'border-red-500' : ''}
              />
              {errors.facebookPageUrl && (
                <p className='text-sm text-red-500'>{errors.facebookPageUrl}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className='flex items-center gap-4'>
            <Instagram className='w-5 h-5 text-pink-600' />
            <div className='flex-1 space-y-2'>
              <Label htmlFor='instagramPageUrl'>
                {t('configuration.contacts.socialMedia.instagramPageUrl')}
              </Label>
              <Input
                id='instagramPageUrl'
                value={config.instagramPageUrl}
                onChange={e =>
                  setConfig({ ...config, instagramPageUrl: e.target.value })
                }
                placeholder={t(
                  'configuration.contacts.socialMedia.instagramPagePlaceholder'
                )}
                className={errors.instagramPageUrl ? 'border-red-500' : ''}
              />
              {errors.instagramPageUrl && (
                <p className='text-sm text-red-500'>
                  {errors.instagramPageUrl}
                </p>
              )}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
};
