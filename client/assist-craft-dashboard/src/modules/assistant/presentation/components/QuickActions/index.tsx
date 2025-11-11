import { Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuickAction } from '@/modules/assistant/presentation/components/types';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (question: string) => void;
}

export const QuickActions = ({ actions, onActionClick }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant='outline'
            className='w-full justify-start text-sm'
            onClick={() => onActionClick(action.question)}
          >
            <Zap className='w-4 h-4 mr-2' />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
