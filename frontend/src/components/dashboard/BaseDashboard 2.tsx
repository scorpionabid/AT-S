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

  // Default loading component
  const defaultLoadingComponent = (
    <div style={styles.center()}>
      <div style={{
        ...styles.skeleton('40px', '40px'),
        borderRadius: theme.borderRadius.full,
        marginBottom: theme.spacing[4]
      }} />
      <div style={styles.skeleton('200px', '20px')} />
    </div>
  );

  // Default error component
  const defaultErrorComponent = (error: string, retry: () => void) => (
    <div style={{
      ...styles.center(),
      flexDirection: 'column',
      gap: theme.spacing[4]
    }}>
      <div style={styles.alert('error')}>
        <strong>Error:</strong> {error}
      </div>
      <button 
        onClick={retry}
        style={styles.button('secondary')}
        disabled={!dashboardState.canRetry}
      >
        {dashboardState.canRetry ? 'Retry' : `Max retries reached (${dashboardState.retryCount})`}
      </button>
    </div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <div style={styles.center()}>
      <div style={styles.text('base', 'normal', 'tertiary')}>
        No data available
      </div>
    </div>
  );

  const containerStyle = {
    ...styles.card(),
    ...style
  };

  // Header component
  const Header = () => {
    if (!config.title && !config.subtitle) return null;

    return (
      <div style={{
        marginBottom: theme.spacing[6],
        paddingBottom: theme.spacing[4],
        borderBottom: `1px solid ${theme.colors.border.muted}`
      }}>
        {config.title && (
          <h1 style={styles.text('2xl', 'bold')}>
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p style={{
            ...styles.text('base', 'normal', 'secondary'),
            marginTop: theme.spacing[2]
          }}>
            {config.subtitle}
          </p>
        )}
        
        {/* Refresh button and last updated */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing[4]
        }}>
          <button
            onClick={dashboardState.refresh}
            disabled={dashboardState.loading}
            style={{
              ...styles.button('secondary', 'sm'),
              opacity: dashboardState.loading ? 0.6 : 1
            }}
          >
            {dashboardState.loading ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {dashboardState.lastUpdated && (
            <span style={styles.text('sm', 'normal', 'tertiary')}>
              Last updated: {dashboardState.lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle} className={className}>
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