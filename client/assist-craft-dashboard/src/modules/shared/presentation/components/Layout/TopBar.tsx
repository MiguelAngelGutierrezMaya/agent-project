import { SignedIn, UserButton } from '@clerk/clerk-react';
import React from 'react';

import { LanguageSelector } from '@/modules/shared/presentation/components/LanguageSelector';
import { SidebarTrigger } from '@/modules/shared/presentation/components/Sidebar';
import { ROUTES } from '@/modules/shared/presentation/router';

import { useTopBar } from './useTopBar';

/**
 * TopBar Component
 * Displays the top navigation bar with sidebar trigger, language selector, and user info
 */
export const TopBar: React.FC = () => {
  const { userName, userEmail } = useTopBar();

  return (
    <div className='h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6'>
      <div className='flex items-center gap-4'>
        <SidebarTrigger className='text-gray-600 hover:text-gray-900' />
      </div>

      <div className='flex items-center gap-4'>
        <LanguageSelector className='w-40' />
        <div className='flex items-center gap-3'>
          <SignedIn>
            <UserButton signInUrl={ROUTES.login.main}></UserButton>
          </SignedIn>
          <div className='text-sm'>
            <p className='font-medium text-gray-900'>{userName}</p>
            <p className='text-gray-500'>{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
