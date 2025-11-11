import { AssistantStatus } from '@/modules/assistant/presentation/components/AssistantStatus';
import { KnowledgeBase } from '@/modules/assistant/presentation/components/KnowledgeBase';
import { QuickActions } from '@/modules/assistant/presentation/components/QuickActions';
import type {
  AssistantStatus as AssistantStatusType,
  KnowledgeBaseInfo,
  QuickAction,
} from '@/modules/assistant/presentation/components/types';

interface AssistantSidebarProps {
  assistantStatus: AssistantStatusType;
  knowledgeBase: KnowledgeBaseInfo;
  quickActions: QuickAction[];
  onActionClick: (question: string) => void;
}

export const AssistantSidebar = ({
  assistantStatus,
  knowledgeBase,
  quickActions,
  onActionClick,
}: AssistantSidebarProps) => {
  return (
    <div className='lg:col-span-1 space-y-4'>
      <AssistantStatus status={assistantStatus} />
      <KnowledgeBase knowledgeBase={knowledgeBase} />
      <QuickActions actions={quickActions} onActionClick={onActionClick} />
    </div>
  );
};
