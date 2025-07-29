import React from 'react';
import { FiAlertCircle, FiWifi, FiRefreshCw } from 'react-icons/fi';
import { LoadingSpinner } from './Loading';

// LoadingSpinner is exported from ./Loading.tsx to avoid duplication

export interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rectangular'
}) => {
  const baseClasses = 'atis-loading-skeleton animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  showActions = false,
  className = ''
}) => {
  return (
    <div className={`atis-card p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <LoadingSkeleton 
            width="3rem" 
            height="3rem" 
            variant="circular" 
          />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton height="1.25rem" width="75%" />
          {Array.from({ length: lines }).map((_, index) => (
            <LoadingSkeleton 
              key={index}
              height="1rem" 
              width={index === lines - 1 ? '50%' : '100%'} 
            />
          ))}
          {showActions && (
            <div className="flex space-x-2 mt-4">
              <LoadingSkeleton width="5rem" height="2rem" />
              <LoadingSkeleton width="4rem" height="2rem" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`atis-card ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <LoadingSkeleton key={index} height="1rem" width="80%" />
          ))}
        </div>
        
        {/* Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div 
              key={rowIndex} 
              className="grid gap-4" 
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton key={colIndex} height="1rem" width="90%" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export interface LoadingPageProps {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCards?: boolean;
  cardCount?: number;
  className?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Yüklənir...',
  subtitle = 'Məlumatlar hazırlanır',
  showHeader = true,
  showCards = true,
  cardCount = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="atis-card p-6">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="large" />
            <div className="space-y-2">
              <LoadingSkeleton height="1.5rem" width="12rem" />
              <LoadingSkeleton height="1rem" width="20rem" />
            </div>
          </div>
        </div>
      )}
      
      {showCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: cardCount }).map((_, index) => (
            <LoadingCard 
              key={index}
              lines={2}
              showAvatar={index % 2 === 0}
              showActions={index % 3 === 0}
            />
          ))}
        </div>
      )}
      
      <LoadingTable rows={8} columns={5} />
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 text-gray-400">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
};

export interface ErrorStateProps {
  error?: Error | string | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Xəta baş verdi',
  description,
  onRetry,
  showRetry = true,
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const finalDescription = description || errorMessage || 'Bilinməyən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-4 flex justify-center">
        <div className="w-12 h-12 text-red-500">
          <FiAlertCircle className="w-full h-full" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{finalDescription}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="atis-button-primary inline-flex items-center"
        >
          <FiRefreshCw className="w-4 h-4 mr-2" />
          Yenidən Cəhd Et
        </button>
      )}
    </div>
  );
};

export interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className = ''
}) => {
  return (
    <ErrorState
      icon={<FiWifi className="w-full h-full" />}
      title="İnternet Bağlantı Problemi"
      description="İnternet bağlantınızı yoxlayın və yenidən cəhd edin."
      onRetry={onRetry}
      className={className}
    />
  );
};

// Utility hook for loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState<Error | null>(null);

  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    withLoading,
    retry,
    setLoading: setIsLoading,
    setError
  };
};

export default {
  LoadingSkeleton,
  LoadingCard,
  LoadingTable,
  LoadingPage,
  EmptyState,
  ErrorState,
  NetworkError,
  useLoadingState
};