import { useUser } from '@clerk/clerk-react';
import { useMemo } from 'react';

import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

/**
 * Custom hook for TopBar component logic
 * Manages user information extraction from Clerk
 */
export const useTopBar = () => {
  const { user } = useUser();
  const { t } = useTranslation();

  const userName = useMemo(() => {
    return user?.fullName || t('common.user');
  }, [user, t]);

  const userEmail = useMemo(() => {
    const emails = user?.emailAddresses;

    if (emails && emails.length > 0) {
      return emails[0].emailAddress;
    }

    return t('common.defaultEmail');
  }, [user, t]);

  return {
    userName,
    userEmail,
  };
};
