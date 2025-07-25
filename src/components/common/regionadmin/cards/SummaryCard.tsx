import React, { forwardRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { cn } from '../../../../utils/cn';

interface SummaryCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
  }>;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(({
  title,
  items,
  icon,
  actionButton,
  className
}, ref) => {
  return (
    <Card ref={ref} className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="flex-shrink-0 p-1 bg-primary-100 rounded text-primary-600">
              {icon}
            </div>
          )}
          <CardTitle level={4}>{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index} 
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-md transition-colors',
                item.highlight 
                  ? 'bg-primary-50 border border-primary-200' 
                  : 'bg-neutral-50 hover:bg-neutral-100'
              )}
            >
              <span className="text-sm font-medium text-neutral-700">
                {item.label}:
              </span>
              <span className={cn(
                'text-sm font-semibold',
                item.highlight ? 'text-primary-700' : 'text-neutral-900'
              )}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      
      {actionButton && (
        <CardFooter>
          <Button 
            variant="outline"
            size="sm"
            onClick={actionButton.onClick}
            className="w-full"
          >
            {actionButton.label}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
});

SummaryCard.displayName = 'SummaryCard';

export default SummaryCard;