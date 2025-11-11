import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AccountStat } from '@/modules/profile/presentation/components/types';

interface AccountStatsProps {
  stats: AccountStat[];
}

export const AccountStats = ({ stats }: AccountStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-4 ${stat.bgColor} rounded-lg`}
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div
                className={`text-sm ${stat.color.replace('text-', 'text-').replace('-600', '-700')}`}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
