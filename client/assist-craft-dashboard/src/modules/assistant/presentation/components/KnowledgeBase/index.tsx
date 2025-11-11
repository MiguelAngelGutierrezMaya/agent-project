import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { KnowledgeBaseInfo } from '@/modules/assistant/presentation/components/types';

interface KnowledgeBaseProps {
  knowledgeBase: KnowledgeBaseInfo;
}

export const KnowledgeBase = ({ knowledgeBase }: KnowledgeBaseProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Knowledge Base</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-sm'>
          <div className='font-medium text-gray-900'>
            Documents: {knowledgeBase.documents}
          </div>
          <div className='text-gray-600'>
            Last updated: {knowledgeBase.lastUpdated}
          </div>
        </div>
        <div className='text-sm'>
          <div className='font-medium text-gray-900'>Coverage Areas:</div>
          <ul className='text-gray-600 mt-1 space-y-1'>
            {knowledgeBase.coverageAreas.map((area, index) => (
              <li key={index}>• {area}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
