import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AssistantStatus as AssistantStatusType } from '@/modules/assistant/presentation/components/types';

interface AssistantStatusProps {
  status: AssistantStatusType;
}

export const AssistantStatus = ({ status }: AssistantStatusProps) => {
  const statusItems = [
    { label: 'Model', value: status.model, color: 'bg-green-500' },
    { label: 'Training', value: status.training, color: 'bg-blue-500' },
    { label: 'Embeddings', value: status.embeddings, color: 'bg-purple-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Assistant Status</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {statusItems.map((item, index) => (
          <div key={index} className='flex items-center gap-3'>
            <div className={`w-3 h-3 ${item.color} rounded-full`} />
            <span className='text-sm text-gray-700'>
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
