import { FileText, Database, Zap, Bot, CheckCircle, Clock } from 'lucide-react';

import type { TranslationPath } from '@/modules/shared/presentation/hooks/useTranslation';

import type { StatItem, ActivityItem, SystemStatusItem } from './types';

export const getStatsData = (
  t: (key: TranslationPath) => string
): StatItem[] => [
  {
    title: t('dashboard.stats.totalTrainings'),
    value: '24',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: t('dashboard.stats.documentsProcessed'),
    value: '156',
    change: '+8%',
    icon: Database,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: t('dashboard.stats.embeddingsGenerated'),
    value: '89.2K',
    change: '+23%',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: t('dashboard.stats.activeAssistants'),
    value: '1.2K',
    change: '+15%',
    icon: Bot,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export const recentActivityData: ActivityItem[] = [
  {
    id: 1,
    action: 'PDF uploaded',
    file: 'Company_Handbook_2024.pdf',
    status: 'completed',
    time: '2 hours ago',
  },
  {
    id: 2,
    action: 'Website content extracted',
    file: 'https://acme.com/docs',
    status: 'processing',
    time: '4 hours ago',
  },
  {
    id: 3,
    action: 'Embeddings generated',
    file: 'Product_Documentation.pdf',
    status: 'completed',
    time: '6 hours ago',
  },
  {
    id: 4,
    action: 'PDF uploaded',
    file: 'Training_Manual_v2.pdf',
    status: 'pending',
    time: '1 day ago',
  },
];

export const systemStatusData: SystemStatusItem[] = [
  {
    name: 'Embedding Service',
    status: 'operational',
    description: 'Operational',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Chat API',
    status: 'operational',
    description: 'Operational',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'File Processing',
    status: 'warning',
    description: '3 items in queue',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];
