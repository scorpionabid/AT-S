import React from 'react';
import classNames from 'classnames';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  count?: number;
  inline?: boolean;
  containerClassName?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  rounded = 'md',
  height = '1em',
  width = '100%',
  circle = false,
  count = 1,
  inline = false,
  containerClassName = '',
  style,
  ...props
}) => {
  const borderRadius = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  const skeletonClasses = classNames(
    'bg-gray-200 dark:bg-gray-700 animate-pulse',
    borderRadius,
    {
      'rounded-full': circle,
      'inline-block': inline,
    },
    className
  );

  const containerClasses = classNames(
    'space-y-2',
    { 'inline-flex flex-col': inline && count > 1 },
    containerClassName
  );

  const skeletons = Array(count).fill(0).map((_, i) => (
    <div
      key={i}
      className={skeletonClasses}
      style={{
        height: circle ? width : height,
        width,
        ...(i < count - 1 ? { marginBottom: '0.5rem' } : {}),
        ...style,
      }}
      {...props}
    />
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return <div className={containerClasses}>{skeletons}</div>;
};

// Table Skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns: number;
  className?: string;
  rowHeight?: string | number;
  header?: boolean;
}> = ({
  rows = 5,
  columns,
  className = '',
  rowHeight = '3rem',
  header = true,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {header && (
        <div className="grid gap-4 mb-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array(columns).fill(0).map((_, i) => (
            <Skeleton key={`header-${i}`} height="1.5rem" className="w-3/4" />
          ))}
        </div>
      )}
      <div className="space-y-2">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4 py-2 items-center" 
            style={{ 
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              height: rowHeight 
            }}
          >
            {Array(columns).fill(0).map((_, colIndex) => (
              <Skeleton 
                key={`${rowIndex}-${colIndex}`} 
                height="1rem" 
                className={colIndex === columns - 1 ? 'w-1/2' : 'w-full'} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{
  count?: number;
  className?: string;
  imageHeight?: string | number;
}> = ({ count = 1, className = '', imageHeight = '12rem' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <Skeleton height={imageHeight} className="w-full" />
          <div className="p-4 space-y-3">
            <Skeleton height="1.25rem" width="80%" />
            <Skeleton height="1rem" width="60%" />
            <div className="pt-2">
              <Skeleton height="2.5rem" width="100%" rounded="lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{
  count?: number;
  className?: string;
  itemHeight?: string | number;
}> = ({ count = 5, className = '', itemHeight = '4rem' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <Skeleton width="2.5rem" height="2.5rem" circle />
            <div className="space-y-2">
              <Skeleton height="1rem" width="8rem" />
              <Skeleton height="0.75rem" width="12rem" />
            </div>
          </div>
          <Skeleton height="2rem" width="6rem" rounded="lg" />
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 5, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array(fields).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="2.5rem" width="100%" rounded="md" />
        </div>
      ))}
      <div className="pt-2">
        <Skeleton height="2.75rem" width="8rem" rounded="lg" />
      </div>
    </div>
  );
};

export default Skeleton;
