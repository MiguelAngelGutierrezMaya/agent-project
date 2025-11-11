export interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  file: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  time: string;
}

export interface SystemStatusItem {
  name: string;
  status: 'operational' | 'warning' | 'error';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}
