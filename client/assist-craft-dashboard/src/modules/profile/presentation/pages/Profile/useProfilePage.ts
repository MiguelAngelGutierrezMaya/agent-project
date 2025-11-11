import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import type {
  ProfileData,
  PasswordData,
} from '@/modules/profile/presentation/components';
import {
  initialProfileData,
  initialPasswordData,
} from '@/modules/profile/presentation/components';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

/**
 * Custom hook for Profile Page logic
 * Manages profile state, password state, and form handlers
 */
export const useProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfileData);
  const [passwords, setPasswords] = useState<PasswordData>(initialPasswordData);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  /**
   * Handle profile save
   */
  const handleProfileSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: tRef.current('profile.profileUpdated'),
        description: tRef.current('profile.profileUpdatedDescription'),
      });
    }, 1000);
  }, [toast]);

  /**
   * Handle password change
   */
  const handlePasswordChange = useCallback(() => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: tRef.current('profile.passwordMismatch'),
        description: tRef.current('profile.passwordMismatchDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: tRef.current('profile.passwordTooShort'),
        description: tRef.current('profile.passwordTooShortDescription'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: tRef.current('profile.passwordUpdated'),
      description: tRef.current('profile.passwordUpdatedDescription'),
    });

    setPasswords({ current: '', new: '', confirm: '' });
  }, [passwords, toast]);

  /**
   * Handle logo upload
   */
  const handleLogoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        toast({
          title: tRef.current('profile.logoUploaded'),
          description: tRef.current('profile.logoUploadedDescription'),
        });
      }
    },
    [toast]
  );

  return {
    profile,
    setProfile,
    passwords,
    setPasswords,
    saving,
    handleProfileSave,
    handlePasswordChange,
    handleLogoUpload,
  };
};
