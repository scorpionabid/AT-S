import React, { forwardRef } from 'react';
import { Card, CardContent, CardTitle } from '../../../ui/Card';
import { Progress } from '../../../ui/Loading';
import { cn } from '../../../../utils/cn';

interface PerformanceCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  className?: string;
}

const PerformanceCard = forwardRef<HTMLDivElement, PerformanceCardProps>(({
  title,
  score,
  maxScore = 100,
  description,
  color = 'blue',
  size = 'medium',
  showProgress = true,
  className
}, ref) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getCardVariant = (score: number): 'default' | 'success' | 'warning' | 'error' => {
    if (color === 'blue') {
      const scoreColor = getScoreColor(percentage);
      return scoreColor === 'success' ? 'success' : scoreColor === 'warning' ? 'warning' : 'error';
    }
    return color === 'green' ? 'success' : color === 'yellow' ? 'warning' : color === 'red' ? 'error' : 'default';
  };

  const cardSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
  const progressVariant = color === 'blue' ? getScoreColor(percentage) : 
                         color === 'green' ? 'success' : 
                         color === 'yellow' ? 'warning' : 
                         color === 'red' ? 'error' : 'primary';

  return (
    <Card 
      ref={ref}
      variant={getCardVariant(percentage)}
      size={cardSize}
      className={cn('text-center', className)}
    >
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <CardTitle level={4} className={cn(
            'text-center',
            size === 'small' && 'text-sm',
            size === 'large' && 'text-lg'
          )}>
            {title}
          </CardTitle>
          
          <div className="flex items-center justify-center space-x-1">
            <span className={cn(
              'font-bold',
              size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-2xl',
              getCardVariant(percentage) === 'success' && 'text-success-700',
              getCardVariant(percentage) === 'warning' && 'text-warning-700',
              getCardVariant(percentage) === 'error' && 'text-error-700',
              getCardVariant(percentage) === 'default' && 'text-neutral-900'
            )}>
              {score}
            </span>
            {maxScore !== 100 && (
              <span className="text-neutral-500 text-sm">
                /{maxScore}
              </span>
            )}
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-2">
            <Progress
              value={percentage}
              variant={progressVariant}
              size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'}
              showValue={size !== 'small'}
              className="w-full"
            />
          </div>
        )}
        
        {description && (
          <p className={cn(
            'text-neutral-600',
            size === 'small' ? 'text-xs' : 'text-sm'
          )}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

PerformanceCard.displayName = 'PerformanceCard';

export default PerformanceCard;