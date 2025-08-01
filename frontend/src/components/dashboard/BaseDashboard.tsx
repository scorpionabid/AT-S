/**
 * ATİS Base Dashboard Component
 * Universal dashboard pattern eliminating duplication
 * Reusable base for all dashboard implementations
 */

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useThemedStyles } from '../../utils/theme/ThemedStyleSystem';
import { useTheme } from '../../utils/theme/ThemeSystem';

// Generic dashboard data type
export interface DashboardData<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Dashboard configuration interface
export interface DashboardConfig<T = any> {
  title?: string;
  subtitle?: string;
  fetchData: () => Promise<T>;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  errorRetryCount?: number;
  loadingComponent?: ReactNode;
  errorComponent?: (error: string, retry: () => void) => ReactNode;
  emptyComponent?: ReactNode;
}

// Dashboard hook for state management
export const useDashboard = <T = any>(config: DashboardConfig<T>) => {
  const {
    fetchData,
    refreshInterval = 30000,
    enableAutoRefresh = false,
    errorRetryCount = 3
  } = config;

  const [state, setState] = useState<DashboardData<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [retryCount, setRetryCount] = useState(0);

  // Fetch data function
  const loadData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data = await fetchData();
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      setRetryCount(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
    }
  }, [fetchData]);

  // Retry function
  const retry = useCallback(() => {
    if (retryCount < errorRetryCount) {
      loadData(true);
    }
  }, [loadData, retryCount, errorRetryCount]);

  // Refresh function
  const refresh = useCallback(() => {
    loadData(false);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    if (!enableAutoRefresh || state.loading || state.error) return;

    const interval = setInterval(() => {
      loadData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshInterval, loadData, state.loading, state.error]);

  return {
    ...state,
    retry,
    refresh,
    canRetry: retryCount < errorRetryCount,
    retryCount
  };
};

// Base Dashboard Component Props
export interface BaseDashboardProps<T = any> {
  config: DashboardConfig<T>;
  children: (data: DashboardData<T> & { retry: () => void; refresh: () => void }) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Base Dashboard Component
export const BaseDashboard = <T = any>({
  config,
  children,
  className = '',
  style = {}
}: BaseDashboardProps<T>) => {
  const { theme } = useTheme();
  const styles = useThemedStyles();
  const dashboardState = useDashboard(config);

  // Default loading component with Tailwind
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center flex-col">
      <div className="w-10 h-10 bg-neutral-200 rounded-full animate-pulse mb-4" />
      <div className="w-48 h-5 bg-neutral-200 rounded animate-pulse" />
    </div>
  );

  // Default error component with Tailwind
  const defaultErrorComponent = (error: string, retry: () => void) => (
    <div className="flex items-center justify-center flex-col gap-4">
      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> {error}
      </div>
      <button 
        onClick={retry}
        className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
          dashboardState.canRetry 
            ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' 
            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
        disabled={!dashboardState.canRetry}
      >
        {dashboardState.canRetry ? 'Retry' : `Max retries reached (${dashboardState.retryCount})`}
      </button>
    </div>
  );

  // Default empty component with Tailwind
  const defaultEmptyComponent = (
    <div className="flex items-center justify-center">
      <div className="text-base text-neutral-500">
        No data available
      </div>
    </div>
  );

  // Header component with Tailwind
  const Header = () => {
    if (!config.title && !config.subtitle) return null;

    return (
      <div className="mb-6 pb-4 border-b border-neutral-200">
        {config.title && (
          <h1 className="text-2xl font-bold text-neutral-900">
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-base text-neutral-600 mt-2">
            {config.subtitle}
          </p>
        )}
        
        {/* Refresh button and last updated */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={dashboardState.refresh}
            disabled={dashboardState.loading}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              dashboardState.loading 
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-60' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {dashboardState.loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {dashboardState.lastUpdated && (
            <span className="text-sm text-neutral-500">
              Last updated: {dashboardState.lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-card border border-neutral-200 ${className}`} style={style}>
      <Header />
      
      {dashboardState.loading && (
        config.loadingComponent || defaultLoadingComponent
      )}
      
      {dashboardState.error && (
        config.errorComponent?.(dashboardState.error, dashboardState.retry) ||
        defaultErrorComponent(dashboardState.error, dashboardState.retry)
      )}
      
      {!dashboardState.loading && !dashboardState.error && !dashboardState.data && (
        config.emptyComponent || defaultEmptyComponent
      )}
      
      {!dashboardState.loading && !dashboardState.error && dashboardState.data && (
        children(dashboardState)
      )}
    </div>
  );
};

export default BaseDashboard;