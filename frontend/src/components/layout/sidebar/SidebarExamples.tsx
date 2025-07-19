import React, { memo, useState } from 'react';
import { FiPlay, FiPause, FiRotateCw, FiWifi, FiWifiOff, FiLoader } from 'react-icons/fi';
import Sidebar from '../Sidebar';
import { SidebarErrorBoundary, NetworkErrorFallback, PermissionErrorFallback, DataErrorFallback } from './ErrorBoundaries';
import { SidebarSkeleton, LoadingSpinner, ProgressiveLoader } from './LoadingStates';
import { FallbackSidebarContent, ProgressiveEnhancement } from './GracefulDegradation';
import { cn } from '../../../utils/cn';

// Example 1: Basic sidebar with all features enabled
export const BasicEnhancedSidebar: React.FC = memo(() => (
  <Sidebar
    enableErrorBoundary={true}
    enableLoadingStates={true}
    enableGracefulDegradation={true}
    enableAutoRefresh={false}
    refreshInterval={30000}
  />
));

BasicEnhancedSidebar.displayName = 'BasicEnhancedSidebar';

// Example 2: Sidebar with auto-refresh for real-time updates
export const RealTimeSidebar: React.FC = memo(() => (
  <Sidebar
    enableErrorBoundary={true}
    enableLoadingStates={true}
    enableGracefulDegradation={true}
    enableAutoRefresh={true}
    refreshInterval={15000} // Refresh every 15 seconds
  />
));

RealTimeSidebar.displayName = 'RealTimeSidebar';

// Example 3: Minimal sidebar for performance-critical scenarios
export const MinimalSidebar: React.FC = memo(() => (
  <Sidebar
    enableErrorBoundary={false}
    enableLoadingStates={false}
    enableGracefulDegradation={false}
    contentVariant="minimal"
  />
));

MinimalSidebar.displayName = 'MinimalSidebar';

// Example 4: Demo component to showcase all error states
export const ErrorStatesDemoSidebar: React.FC = memo(() => {
  const [demoState, setDemoState] = useState<'normal' | 'loading' | 'network' | 'permission' | 'data'>('normal');
  const [isOnline, setIsOnline] = useState(true);

  const renderCurrentDemo = () => {
    switch (demoState) {
      case 'loading':
        return (
          <div className="w-64 h-screen">
            <SidebarSkeleton />
          </div>
        );
        
      case 'network':
        return (
          <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <NetworkErrorFallback onRetry={() => setDemoState('normal')} />
          </div>
        );
        
      case 'permission':
        return (
          <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <PermissionErrorFallback />
          </div>
        );
        
      case 'data':
        return (
          <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <DataErrorFallback 
              dataType="navigation data"
              onRetry={() => setDemoState('normal')} 
            />
          </div>
        );
        
      default:
        return (
          <ProgressiveEnhancement
            isOnline={isOnline}
            hasData={true}
            isLoading={false}
            error={null}
            fallback={<FallbackSidebarContent showOfflineIndicator={!isOnline} />}
          >
            <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ Normal sidebar state
              </div>
            </div>
          </ProgressiveEnhancement>
        );
    }
  };

  return (
    <div className="flex">
      {renderCurrentDemo()}
      
      {/* Demo controls */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Error States Demo
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setDemoState('normal')}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors text-left',
              demoState === 'normal'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            Normal State
          </button>
          
          <button
            onClick={() => setDemoState('loading')}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors text-left flex items-center space-x-2',
              demoState === 'loading'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            <FiLoader className="w-4 h-4" />
            <span>Loading State</span>
          </button>
          
          <button
            onClick={() => setDemoState('network')}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors text-left flex items-center space-x-2',
              demoState === 'network'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            <FiWifiOff className="w-4 h-4" />
            <span>Network Error</span>
          </button>
          
          <button
            onClick={() => setDemoState('permission')}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors text-left',
              demoState === 'permission'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            Permission Error
          </button>
          
          <button
            onClick={() => setDemoState('data')}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors text-left',
              demoState === 'data'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            )}
          >
            Data Error
          </button>
        </div>
        
        <hr className="my-4 border-gray-200 dark:border-gray-600" />
        
        <div className="space-y-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2',
              isOnline
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            )}
          >
            {isOnline ? <FiWifi className="w-4 h-4" /> : <FiWifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Features Demonstrated
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Loading skeletons with pulse animation</li>
            <li>• Network error fallback with retry</li>
            <li>• Permission-based error states</li>
            <li>• Data loading error handling</li>
            <li>• Online/offline status detection</li>
            <li>• Progressive enhancement patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

ErrorStatesDemoSidebar.displayName = 'ErrorStatesDemoSidebar';

// Example 5: Progressive loading example
export const ProgressiveLoadingExample: React.FC = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasData, setHasData] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (Math.random() > 0.7) {
        setError(new Error('Simulated network error'));
        setIsLoading(false);
      } else {
        setHasData(true);
        setIsLoading(false);
      }
    }, 2000);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setHasData(false);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Progressive Loading Example
      </h3>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={simulateLoading}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
          <span>{isLoading ? 'Loading...' : 'Start Loading'}</span>
        </button>
        
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
        >
          <FiRotateCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <ProgressiveLoader
          isLoading={isLoading}
          error={error}
          onRetry={simulateLoading}
          fallback={
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Loading progressive content...
              </p>
            </div>
          }
        >
          <div className="p-6">
            {hasData ? (
              <div className="text-green-600 dark:text-green-400">
                ✓ Content loaded successfully!
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                Click "Start Loading" to begin
              </div>
            )}
          </div>
        </ProgressiveLoader>
      </div>
    </div>
  );
});

ProgressiveLoadingExample.displayName = 'ProgressiveLoadingExample';

// Export all examples
export const SidebarExamples = {
  BasicEnhanced: BasicEnhancedSidebar,
  RealTime: RealTimeSidebar,
  Minimal: MinimalSidebar,
  ErrorStatesDemo: ErrorStatesDemoSidebar,
  ProgressiveLoading: ProgressiveLoadingExample
};