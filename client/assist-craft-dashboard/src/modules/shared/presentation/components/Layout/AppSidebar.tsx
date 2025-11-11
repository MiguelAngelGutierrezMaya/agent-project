import { Home, FileText, Bot, User, Brain, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/modules/shared/presentation/components/Sidebar';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';
import { ROUTES } from '@/modules/shared/presentation/router';

export function AppSidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t('navigation.dashboard'),
      url: ROUTES.dashboard.main,
      icon: Home,
    },
    {
      title: t('navigation.training'),
      url: ROUTES.training.main,
      icon: FileText,
    },
    {
      title: t('navigation.configuration'),
      url: ROUTES.configure.main,
      icon: Settings,
    },
    {
      title: t('navigation.assistant'),
      url: ROUTES.assistant.main,
      icon: Bot,
    },
    {
      title: t('navigation.profile'),
      url: ROUTES.profile.main,
      icon: User,
    },
  ];

  return (
    <Sidebar className='border-r border-gray-200 bg-white'>
      <SidebarHeader className='p-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Brain className='w-5 h-5 text-white' />
          </div>
          <div>
            <h1 className='font-semibold text-gray-900'>
              {t('common.aiAssistant')}
            </h1>
            <p className='text-sm text-gray-500'>{t('common.platform')}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='p-4'>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-3'>
            {t('common.navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full rounded-lg transition-colors ${
                      location.pathname === item.url
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Link
                      to={item.url}
                      className='flex items-center gap-3 px-3 py-2'
                    >
                      <item.icon className='w-5 h-5' />
                      <span className='font-medium'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
