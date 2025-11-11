import {
  DashboardHeader,
  StatsGrid,
  RecentActivity,
  QuickActions,
  SystemStatus,
  getStatsData,
  recentActivityData,
  systemStatusData,
} from '@/modules/home/presentation/components';
import { useTranslation } from '@/modules/shared/presentation/hooks/useTranslation';

export const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6 animate-fade-in'>
      <DashboardHeader />
      <StatsGrid stats={getStatsData(t)} />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <RecentActivity activities={recentActivityData} />
        <QuickActions />
      </div>
      <SystemStatus statusItems={systemStatusData} />
    </div>
  );
};
