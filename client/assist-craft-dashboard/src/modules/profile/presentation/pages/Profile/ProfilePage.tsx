import {
  ProfileHeader,
  CompanyInfo,
  SecuritySettings,
  AccountStats,
  accountStats,
} from '@/modules/profile/presentation/components';

import { useProfilePage } from './useProfilePage';

/**
 * Profile Page Component
 * Displays user profile information and settings
 */
export const ProfilePage: React.FC = () => {
  const {
    profile,
    setProfile,
    passwords,
    setPasswords,
    saving,
    handleProfileSave,
    handlePasswordChange,
    handleLogoUpload,
  } = useProfilePage();

  return (
    <div className='space-y-6 animate-fade-in'>
      <ProfileHeader />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CompanyInfo
          profile={profile}
          setProfile={setProfile}
          onSave={handleProfileSave}
          saving={saving}
        />
        <SecuritySettings
          passwords={passwords}
          setPasswords={setPasswords}
          onPasswordChange={handlePasswordChange}
          onLogoUpload={handleLogoUpload}
        />
      </div>
      <AccountStats stats={accountStats} />
    </div>
  );
};
