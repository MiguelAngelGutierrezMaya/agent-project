import { FileText, Zap, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Upload New Training Data',
      icon: FileText,
      onClick: () => navigate('/training'),
    },
    {
      label: 'Generate Embeddings',
      icon: Zap,
      onClick: () => navigate('/training'),
    },
    {
      label: 'Test Virtual Assistant',
      icon: Bot,
      onClick: () => navigate('/assistant'),
    },
    {
      label: 'Update Company Profile',
      icon: FileText,
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {actions.map((action, index) => (
          <Button
            key={index}
            className='w-full justify-start'
            variant='outline'
            onClick={action.onClick}
          >
            <action.icon className='w-4 h-4 mr-2' />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
