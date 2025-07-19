import React, { memo } from 'react';
import { cn } from '../../../utils/cn';

// Skeleton loading component for sidebar items
export const SidebarItemSkeleton: React.FC<{
  className?: string;
  hasIcon?: boolean;
  hasChevron?: boolean;
  hasBadge?: boolean;
}> = memo(({ className, hasIcon = true, hasChevron = false, hasBadge = false }) => (
  <div className={cn(
    'flex items-center px-3 py-2 space-x-3 animate-pulse',
    className
  )}>
    {hasIcon && (
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-sm flex-shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
    </div>
    {hasBadge && (
      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
    )}
    {hasChevron && (
      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm flex-shrink-0" />
    )}
  </div>
));

SidebarItemSkeleton.displayName = 'SidebarItemSkeleton';

// Skeleton for entire sidebar section
export const SidebarSectionSkeleton: React.FC<{
  itemCount?: number;
  className?: string;
}> = memo(({ itemCount = 3, className }) => (
  <div className={cn('space-y-1', className)}>
    {/* Section header skeleton */}
    <div className="px-3 py-2 animate-pulse">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
    </div>
    
    {/* Section items skeleton */}
    {Array.from({ length: itemCount }).map((_, index) => (
      <SidebarItemSkeleton
        key={index}
        hasIcon={true}
        hasBadge={Math.random() > 0.7} // Random badges for realism
        hasChevron={Math.random() > 0.8} // Random chevrons
      />
    ))}
  </div>
));

SidebarSectionSkeleton.displayName = 'SidebarSectionSkeleton';

// User profile skeleton
export const UserProfileSkeleton: React.FC<{
  isCollapsed?: boolean;
  className?: string;
}> = memo(({ isCollapsed = false, className }) => {
  if (isCollapsed) {
    return (
      <div className={cn('p-3 border-t border-gray-200 dark:border-gray-700', className)}>
        <div className="flex justify-center animate-pulse">
          <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'p-4 border-t border-gray-200 dark:border-gray-700 animate-pulse',
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
});

UserProfileSkeleton.displayName = 'UserProfileSkeleton';

// Complete sidebar loading state
export const SidebarSkeleton: React.FC<{
  isCollapsed?: boolean;
  className?: string;
}> = memo(({ isCollapsed = false, className }) => (
  <div className={cn(
    'h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
    isCollapsed ? 'w-16' : 'w-64',
    className
  )}>
    {/* Header skeleton */}
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      {isCollapsed ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24" />
        </div>
      )}
    </div>

    {/* Search skeleton */}
    {!isCollapsed && (
      <div className="p-3 animate-pulse">
        <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded-lg" />
      </div>
    )}

    {/* Navigation sections skeleton */}
    <div className="flex-1 overflow-hidden">
      <div className="p-2 space-y-4">
        <SidebarSectionSkeleton itemCount={4} />
        <SidebarSectionSkeleton itemCount={3} />
        <SidebarSectionSkeleton itemCount={2} />
      </div>
    </div>

    {/* User profile skeleton */}
    <UserProfileSkeleton isCollapsed={isCollapsed} />
  </div>
));

SidebarSkeleton.displayName = 'SidebarSkeleton';

// Badge loading skeleton
export const BadgeSkeleton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  type?: 'count' | 'indicator';
  className?: string;
}> = memo(({ size = 'md', type = 'count', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn(
      'bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse',
      sizeClasses[size],
      type === 'indicator' && 'w-2 h-2',
      className
    )} />
  );
});

BadgeSkeleton.displayName = 'BadgeSkeleton';

// Loading spinner component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}> = memo(({ size = 'md', className, color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      colorClasses[color],
      className
    )} />
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Loading overlay for specific components
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  text?: string;
}> = memo(({ isLoading, children, className, spinnerSize = 'md', text }) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner size={spinnerSize} />
          {text && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {text}
            </span>
          )}
        </div>
      </div>
    )}
  </div>
));

LoadingOverlay.displayName = 'LoadingOverlay';

// Progressive loading for sidebar content
export const ProgressiveLoader: React.FC<{
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: (error: Error) => React.ReactNode;
  retryButton?: boolean;
  onRetry?: () => void;
}> = memo(({ 
  isLoading, 
  error, 
  children, 
  fallback, 
  errorFallback,
  retryButton = true,
  onRetry 
}) => {
  if (error) {
    if (errorFallback) {
      return <>{errorFallback(error)}</>;
    }
    
    return (
      <div className="p-4 text-center space-y-3">
        <div className="text-red-600 dark:text-red-400 text-sm">
          Loading failed: {error.message}
        </div>
        {retryButton && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }

  return <>{children}</>;
});

ProgressiveLoader.displayName = 'ProgressiveLoader';