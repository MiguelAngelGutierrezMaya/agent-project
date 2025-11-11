import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * CollapsibleCard Component
 * A Card component with collapse/expand functionality
 * Shows a chevron icon in the header that toggles the card content
 */
export const CollapsibleCard = ({
  title,
  description,
  defaultOpen = false,
  children,
  className,
}: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={className}>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-gray-50/50 transition-colors'>
            <CardTitle className='flex items-center justify-between gap-2'>
              <span className='flex-1'>{title}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200',
                  isOpen && 'transform rotate-180'
                )}
              />
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className='overflow-hidden transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
