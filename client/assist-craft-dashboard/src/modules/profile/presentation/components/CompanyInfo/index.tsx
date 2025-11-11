import { Building, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileData } from '@/modules/profile/presentation/components/types';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

interface CompanyInfoProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  onSave: () => void;
  saving: boolean;
}

export const CompanyInfo = ({
  profile,
  setProfile,
  onSave,
  saving,
}: CompanyInfoProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building className='w-5 h-5' />
          {t('profile.companyInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='companyName'>{t('profile.companyName')}</Label>
          <Input
            id='companyName'
            value={profile.companyName}
            onChange={e => {
              setProfile(prev => ({ ...prev, companyName: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='adminName'>{t('profile.administratorName')}</Label>
          <Input
            id='adminName'
            value={profile.adminName}
            onChange={e => {
              setProfile(prev => ({ ...prev, adminName: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='email'>{t('profile.emailAddress')}</Label>
          <Input
            id='email'
            type='email'
            value={profile.email}
            onChange={e => {
              setProfile(prev => ({ ...prev, email: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='phone'>{t('profile.phoneNumber')}</Label>
          <Input
            id='phone'
            value={profile.phone}
            onChange={e => {
              setProfile(prev => ({ ...prev, phone: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='address'>{t('profile.businessAddress')}</Label>
          <Input
            id='address'
            value={profile.address}
            onChange={e => {
              setProfile(prev => ({ ...prev, address: e.target.value }));
            }}
            className='mt-1'
          />
        </div>

        <Button
          onClick={onSave}
          disabled={saving}
          className='w-full bg-blue-600 hover:bg-blue-700'
        >
          {saving ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
              {t('profile.saving')}
            </>
          ) : (
            <>
              <Save className='w-4 h-4 mr-2' />
              {t('profile.saveProfile')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
