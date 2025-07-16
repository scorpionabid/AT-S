import React from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: IconName;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

// Trend Indicator Component
const TrendIndicator: React.FC<{ trend: { value: number; isPositive: boolean } }> = ({
  trend,
}) => {
  const { value, isPositive } = trend;
  
  return (
    <div className={classNames(
      'trend-indicator',
      isPositive ? 'trend-indicator--positive' : 'trend-indicator--negative'
    )}>
      <Icon 
        name={isPositive ? 'trending-up' : 'trending-down'} 
        size={16} 
        className="trend-indicator__icon"
      />
      <span className="trend-indicator__value">
        {Math.abs(value)}%
      </span>
    </div>
  );
};

// Stat Card Skeleton
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={classNames('stat-card stat-card--skeleton', className)}>
      <div className="skeleton skeleton--stat-icon"></div>
      <div className="skeleton skeleton--stat-value"></div>
      <div className="skeleton skeleton--stat-title"></div>
    </div>
  );
};

// StatCard Component
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading = false,
  className = '',
  onClick,
}) => {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }

  const cardClasses = classNames(
    'card card--elevated card--hover stat-card',
    `stat-card--${color}`,
    {
      'card--clickable': !!onClick,
    },
    className
  );

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent>
        <div className="stat-card__header">
          {icon && (
            <div className="stat-card__icon">
              <Icon name={icon} size={24} />
            </div>
          )}
          {trend && <TrendIndicator trend={trend} />}
        </div>
        
        <div className="stat-card__body">
          <div className="stat-card__value">{value}</div>
          <div className="stat-card__title">{title}</div>
        </div>
      </CardContent>
    </div>
  );
};

export default StatCard;