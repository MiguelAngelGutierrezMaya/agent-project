import { TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { StatItem } from '@/modules/home/presentation/components/types';

interface StatsGridProps {
  stats: StatItem[];
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {stats.map((stat, index) => (
        <Card key={index} className='hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  {stat.title}
                </p>
                <div className='flex items-center mt-2'>
                  <span className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </span>
                  <span className='ml-2 flex items-center text-sm text-green-600'>
                    <TrendingUp className='w-3 h-3 mr-1' />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
