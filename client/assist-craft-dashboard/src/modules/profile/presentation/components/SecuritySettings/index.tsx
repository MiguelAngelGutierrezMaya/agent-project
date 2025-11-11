import { Lock, Building, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PasswordData } from '@/modules/profile/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface SecuritySettingsProps {
  passwords: PasswordData;
  setPasswords: React.Dispatch<React.SetStateAction<PasswordData>>;
  onPasswordChange: () => void;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SecuritySettings = ({
  passwords,
  setPasswords,
  onPasswordChange,
  onLogoUpload,
}: SecuritySettingsProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Lock className='w-5 h-5' />
          {t('profile.securitySettings')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='currentPassword'>
            {t('profile.currentPassword')}
          </Label>
          <Input
            id='currentPassword'
            type='password'
            value={passwords.current}
            onChange={e => {
              setPasswords(prev => ({ ...prev, current: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='newPassword'>{t('profile.newPassword')}</Label>
          <Input
            id='newPassword'
            type='password'
            value={passwords.new}
            onChange={e => {
              setPasswords(prev => ({ ...prev, new: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='confirmPassword'>
            {t('profile.confirmPassword')}
          </Label>
          <Input
            id='confirmPassword'
            type='password'
            value={passwords.confirm}
            onChange={e => {
              setPasswords(prev => ({ ...prev, confirm: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <Button
          onClick={onPasswordChange}
          variant='outline'
          className='w-full'
          disabled={!passwords.current || !passwords.new || !passwords.confirm}
        >
          {t('profile.updatePassword')}
        </Button>

        <div className='pt-4 border-t border-gray-200'>
          <Label>{t('profile.companyLogo')}</Label>
          <div className='mt-2 flex items-center gap-4'>
            <div className='w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center'>
              <Building className='w-8 h-8 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-600 mb-2'>
                {t('profile.uploadLogoDescription')}
              </p>
              <div className='relative'>
                <Button variant='outline' size='sm'>
                  <Upload className='w-4 h-4 mr-2' />
                  {t('profile.uploadLogo')}
                </Button>
                <input
                  type='file'
                  accept='image/*'
                  onChange={onLogoUpload}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
