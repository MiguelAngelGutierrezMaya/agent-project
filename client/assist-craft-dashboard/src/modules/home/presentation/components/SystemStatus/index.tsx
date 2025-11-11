import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemStatusItem } from '@/modules/home/presentation/components/types';

interface SystemStatusProps {
  statusItems: SystemStatusItem[];
}

export const SystemStatus = ({ statusItems }: SystemStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {statusItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 ${item.bgColor} rounded-lg`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <div>
                <p
                  className={`font-medium ${item.color.replace('text-', 'text-').replace('-600', '-900')}`}
                >
                  {item.name}
                </p>
                <p
                  className={`text-sm ${item.color.replace('text-', 'text-').replace('-600', '-700')}`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
