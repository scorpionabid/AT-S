import React, { forwardRef } from 'react';
import { StatsCard } from '../../../ui/Card';
import { cn } from '../../../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(({
  title,
  value,
  icon,
  trend,
  className,
  onClick
}, ref) => {
  // Convert trend to design system format
  const change = trend ? {
    value: `${trend.value}%`,
    type: trend.isPositive ? 'increase' as const : 'decrease' as const
  } : undefined;

  return (
    <StatsCard
      ref={ref}
      value={value}
      label={title}
      icon={icon}
      change={change}
      interactive={!!onClick}
      onClick={onClick}
      className={cn('transition-all duration-200', className)}
      variant="default"
    />
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;