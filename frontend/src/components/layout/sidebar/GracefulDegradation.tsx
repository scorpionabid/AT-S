import React, { memo, useState, useEffect, ReactNode } from 'react';
import { FiWifiOff, FiAlertTriangle, FiRefreshCw, FiHome, FiUsers, FiSettings, FiUser } from 'react-icons/fi';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../contexts/AuthContext';

// Fallback sidebar content when data is unavailable
export interface FallbackSidebarContentProps {
  isCollapsed: boolean;
  showOfflineIndicator?: boolean;
  className?: string;
}

export const FallbackSidebarContent: React.FC<FallbackSidebarContentProps> = memo(({
  isCollapsed,
  showOfflineIndicator = false,
  className
}) => {
  const { user } = useAuth();

  const basicNavigationItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiUsers, label: 'Users', path: '/users' },
    { icon: FiSettings, label: 'Settings', path: '/settings' }
  ];

  if (isCollapsed) {
    return (
      <div className={cn('w-16 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700', className)}>
        {/* Offline indicator */}
        {showOfflineIndicator && (
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <FiWifiOff className="w-4 h-4 text-red-500" title="Offline mode" />
            </div>
          </div>
        )}

        {/* Basic navigation */}
        <div className="p-2 space-y-1">
          {basicNavigationItems.map((item, index) => (
            <div
              key={index}
              className="flex justify-center p-2 rounded text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </div>
          ))}
        </div>

        {/* User avatar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700', className)}>
      {/* Header with offline indicator */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ATİS</h2>
          {showOfflineIndicator && (
            <div className="flex items-center space-x-1 text-red-500">
              <FiWifiOff className="w-4 h-4" />
              <span className="text-xs">Offline</span>
            </div>
          )}
        </div>
        {showOfflineIndicator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Limited functionality available
          </p>
        )}
      </div>

      {/* Basic navigation */}
      <div className="p-3 space-y-1">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
          Navigation
        </div>
        {basicNavigationItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Status message */}
      <div className="p-3 mt-4">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <FiAlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                {showOfflineIndicator ? 'Offline Mode' : 'Loading Issue'}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {showOfflineIndicator 
                  ? 'Some features may be unavailable until connection is restored.'
                  : 'Unable to load full navigation. Basic features are available.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User profile fallback */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {showOfflineIndicator ? 'Offline' : 'Limited access'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

FallbackSidebarContent.displayName = 'FallbackSidebarContent';

// Progressive enhancement wrapper
export interface ProgressiveEnhancementProps {
  isOnline: boolean;
  hasData: boolean;
  isLoading: boolean;
  error: Error | null;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  className?: string;
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = memo(({
  isOnline,
  hasData,
  isLoading,
  error,
  children,
  fallback,
  loadingComponent,
  errorComponent,
  className
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (error && !hasData) {
    return (
      <div className={className}>
        {errorComponent || (
          <div className="p-4 text-center">
            <FiAlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message || 'Something went wrong'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show fallback when offline or no data
  if (!isOnline || !hasData) {
    return (
      <div className={className}>
        {fallback || <FallbackSidebarContent isCollapsed={false} showOfflineIndicator={!isOnline} />}
      </div>
    );
  }

  // Show enhanced content
  return <div className={className}>{children}</div>;
});

ProgressiveEnhancement.displayName = 'ProgressiveEnhancement';

// Network status detector hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

// Alias for compatibility
export const useOnlineStatus = useNetworkStatus;

// Offline banner component
export const OfflineBanner: React.FC<{
  isVisible: boolean;
  onRetry?: () => void;
  className?: string;
}> = memo(({ isVisible, onRetry, className }) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiWifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            You're offline. Some features may be limited.
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded transition-colors"
          >
            <FiRefreshCw className="w-3 h-3 mr-1" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

export default {
  FallbackSidebarContent,
  ProgressiveEnhancement,
  useNetworkStatus,
  useOnlineStatus,
  OfflineBanner
};