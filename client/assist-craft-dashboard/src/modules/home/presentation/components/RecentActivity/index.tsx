import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityItem } from '@/modules/home/presentation/components/types';

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'processing':
        return <Clock className='w-4 h-4 text-blue-600' />;
      case 'pending':
        return <AlertCircle className='w-4 h-4 text-orange-600' />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-orange-100 text-orange-800',
    };
    return (
      variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='w-5 h-5' />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {activities.map(activity => (
            <div
              key={activity.id}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <div className='flex items-center gap-3'>
                {getStatusIcon(activity.status)}
                <div>
                  <p className='font-medium text-gray-900'>{activity.action}</p>
                  <p className='text-sm text-gray-600 truncate max-w-48'>
                    {activity.file}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <Badge className={`${getStatusBadge(activity.status)} text-xs`}>
                  {activity.status}
                </Badge>
                <p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant='outline'
          className='w-full mt-4'
          onClick={() => {
            navigate('/training');
          }}
        >
          View All Training Data
        </Button>
      </CardContent>
    </Card>
  );
};
