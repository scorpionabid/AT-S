import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

interface SkeletonGroupProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

// Base Skeleton Component
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'text',
  animation = 'pulse',
}) => {
  const style: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  const classes = classNames(
    'skeleton',
    `skeleton--${variant}`,
    `skeleton--${animation}`,
    className
  );

  return <div className={classes} style={style} />;
};

// Skeleton Group Component (shows/hides children based on loading state)
export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  children,
  loading = false,
  className = '',
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return <div className={classNames('skeleton-group', className)}>{children}</div>;
};

// Pre-built Skeleton Components
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={classNames('text-skeleton', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
          className={i < lines - 1 ? 'mb-2' : ''}
        />
      ))}
    </div>
  );
};

export const AvatarSkeleton: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
};

export const ButtonSkeleton: React.FC<{ width?: string | number; className?: string }> = ({
  width = 120,
  className = '',
}) => {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={40}
      className={classNames('rounded-md', className)}
    />
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={classNames('card card--skeleton', className)}>
      <div className="skeleton skeleton--card-header"></div>
      <div className="skeleton skeleton--card-content">
        <div className="skeleton skeleton--line skeleton--line-full"></div>
        <div className="skeleton skeleton--line skeleton--line-3-4"></div>
        <div className="skeleton skeleton--line skeleton--line-1-2"></div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className = '',
}) => {
  return (
    <div className={classNames('table-skeleton', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="table-skeleton__row">
          <AvatarSkeleton size={40} className="table-skeleton__avatar" />
          <div className="table-skeleton__content">
            <Skeleton height={16} width="75%" className="table-skeleton__title" />
            <Skeleton height={12} width="50%" className="table-skeleton__subtitle" />
          </div>
          <ButtonSkeleton width={80} className="table-skeleton__action" />
        </div>
      ))}
    </div>
  );
};

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={classNames('stat-card stat-card--skeleton', className)}>
      <div className="skeleton skeleton--stat-icon"></div>
      <div className="skeleton skeleton--stat-value"></div>
      <div className="skeleton skeleton--stat-title"></div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard-skeleton">
      {/* Header Skeleton */}
      <div className="dashboard-skeleton__header">
        <Skeleton height={32} width="200px" />
        <Skeleton height={16} width="300px" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="dashboard-skeleton__stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="dashboard-skeleton__content">
        <div className="dashboard-skeleton__main">
          <CardSkeleton />
          <TableSkeleton rows={6} />
        </div>
        <div className="dashboard-skeleton__sidebar">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;