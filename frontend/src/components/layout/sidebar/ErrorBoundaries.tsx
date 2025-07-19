import React, { Component, ReactNode, memo } from 'react';
import { FiAlertCircle, FiRefreshCw, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../../utils/cn';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

// Props for error boundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Main Error Boundary component
export class SidebarErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sidebar Error Boundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));

      // Auto-reset after a delay if retry fails
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      return (
        <SidebarErrorFallback
          error={error}
          onRetry={retryCount < maxRetries ? this.handleRetry : undefined}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
interface SidebarErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

export const SidebarErrorFallback: React.FC<SidebarErrorFallbackProps> = memo(({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  className
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className={cn(
      'p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
      className
    )}>
      <div className="flex items-start space-x-3">
        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error.message || 'An unexpected error occurred in the sidebar'}
          </p>
          
          {/* Error details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex items-center space-x-1"
          >
            {showDetails ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
            <span>{showDetails ? 'Hide' : 'Show'} details</span>
          </button>

          {showDetails && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-800 dark:text-red-200 font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
            </div>
          )}

          {/* Retry button */}
          {onRetry && (
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded transition-colors"
                disabled={retryCount >= maxRetries}
              >
                <FiRefreshCw className="w-3 h-3 mr-1" />
                Retry ({retryCount}/{maxRetries})
              </button>
              
              {retryCount >= maxRetries && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Max retries reached
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SidebarErrorFallback.displayName = 'SidebarErrorFallback';

// Specific error components for different scenarios
export const NetworkErrorFallback: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = memo(({ onRetry, className }) => (
  <div className={cn(
    'p-4 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg',
    className
  )}>
    <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
      Connection Problem
    </h3>
    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
      Unable to load sidebar data. Check your internet connection.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 inline-flex items-center px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded transition-colors"
      >
        <FiRefreshCw className="w-3 h-3 mr-1" />
        Retry
      </button>
    )}
  </div>
));

NetworkErrorFallback.displayName = 'NetworkErrorFallback';

export const PermissionErrorFallback: React.FC<{
  className?: string;
}> = memo(({ className }) => (
  <div className={cn(
    'p-4 text-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg',
    className
  )}>
    <FiAlertCircle className="w-8 h-8 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Access Restricted
    </h3>
    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
      You don't have permission to view this content.
    </p>
  </div>
));

PermissionErrorFallback.displayName = 'PermissionErrorFallback';

export const DataErrorFallback: React.FC<{
  onRetry?: () => void;
  dataType?: string;
  className?: string;
}> = memo(({ onRetry, dataType = 'data', className }) => (
  <div className={cn(
    'p-4 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg',
    className
  )}>
    <FiAlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
      Data Loading Failed
    </h3>
    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
      Failed to load {dataType}. This might be a temporary issue.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 inline-flex items-center px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
      >
        <FiRefreshCw className="w-3 h-3 mr-1" />
        Try Again
      </button>
    )}
  </div>
));

DataErrorFallback.displayName = 'DataErrorFallback';

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', error);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
};

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <SidebarErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </SidebarErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};