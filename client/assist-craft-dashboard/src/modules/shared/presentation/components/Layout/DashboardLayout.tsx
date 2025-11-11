import React from 'react';

import { SidebarProvider } from '@/modules/shared/presentation/components/Sidebar';

import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-50'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <TopBar />
          <main className='flex-1 p-6 overflow-auto'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
