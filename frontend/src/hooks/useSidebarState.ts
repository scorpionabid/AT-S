import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Interface for sidebar state
interface SidebarState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  lastUpdated: Date | null;
}

// Interface for sidebar data
interface SidebarData {
  navigationItems: any[];
  badges: {
    notifications: number;
    messages: number;
    tasks: number;
    approvals: number;
    surveys: number;
    documents: number;
  };
  userProfile: any;
}

// Hook configuration options
interface UseSidebarStateOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: SidebarData) => void;
}

// Custom hook for managing sidebar state
export const useSidebarState = (options: UseSidebarStateOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    maxRetries = 3,
    retryDelay = 2000, // 2 seconds
    onError,
    onSuccess
  } = options;

  const { user, token } = useAuth();
  const [state, setState] = useState<SidebarState>({
    isLoading: true,
    error: null,
    retryCount: 0,
    lastUpdated: null
  });
  
  const [data, setData] = useState<SidebarData | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Helper function to generate navigation items based on user role
  const generateNavigationItems = useCallback((userRole: string) => {
    const baseItems = [
      // Main Navigation
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home', roles: ['superadmin', 'regionadmin', 'schooladmin', 'müəllim'] },
      
      // System Management (SuperAdmin only)
      { id: 'users', label: 'İstifadəçilər', path: '/users', icon: 'users', roles: ['superadmin', 'regionadmin'] },
      { id: 'institutions', label: 'Təhsil Müəssisələri', path: '/institutions', icon: 'building', roles: ['superadmin', 'regionadmin'] },
      { id: 'roles', label: 'Rollar və İcazələr', path: '/roles', icon: 'shield', roles: ['superadmin'] },
      { id: 'regional-departments', label: 'Regional Şöbələr', path: '/regional-departments', icon: 'building', roles: ['superadmin', 'regionadmin'] },
      
      // Survey Management
      { id: 'surveys', label: 'Sorğular', path: '/surveys', icon: 'clipboard', roles: ['superadmin', 'regionadmin', 'schooladmin'] },
      
      // Task and Workflow Management
      { id: 'tasks', label: 'Tapşırıqlar', path: '/tasks', icon: 'check-square', roles: ['superadmin', 'regionadmin', 'schooladmin'] },
      { id: 'approvals', label: 'Təsdiq Prosesi', path: '/approvals', icon: 'check-circle', roles: ['superadmin', 'regionadmin', 'schooladmin', 'muavin_mudir'] },
      
      // School Academic Management
      { id: 'attendance', label: 'Sinif Davamiyyəti', path: '/attendance', icon: 'calendar-check', roles: ['superadmin', 'schooladmin', 'muavin_mudir', 'müəllim'] },
      { id: 'schedules', label: 'Dərs Cədvəli', path: '/schedules', icon: 'calendar', roles: ['superadmin', 'schooladmin', 'muavin_mudir'] },
      { id: 'teaching-loads', label: 'Təhsil Yükü', path: '/teaching-loads', icon: 'book-open', roles: ['superadmin', 'schooladmin', 'muavin_mudir'] },
      { id: 'school', label: 'Məktəb İdarəetməsi', path: '/school', icon: 'school', roles: ['superadmin', 'regionadmin', 'schooladmin', 'muavin_mudir'] },
      
      // Document Management
      { id: 'documents', label: 'Sənədlər', path: '/documents', icon: 'file-text', roles: ['superadmin', 'regionadmin', 'schooladmin', 'müəllim'] },
      
      // Analytics and Reports
      { id: 'assessments', label: 'Qiymətləndirmə', path: '/assessments', icon: 'trending-up', roles: ['superadmin', 'regionadmin', 'schooladmin'] },
      { id: 'reports', label: 'Hesabatlar', path: '/reports', icon: 'bar-chart', roles: ['superadmin', 'regionadmin', 'schooladmin'] },
      
      // System Settings
      { id: 'settings', label: 'Sistem Tənzimləmələri', path: '/settings', icon: 'settings', roles: ['superadmin'] },
    ];

    return baseItems.filter(item => item.roles.includes(userRole));
  }, []);

  // Helper function to generate badge counts
  const generateBadgeCounts = useCallback(async () => {
    // In real implementation, these would be API calls
    // For now, return realistic mock data for each navigation item
    return {
      // Navigation item badges (mapped by ID)
      tasks: Math.floor(Math.random() * 8) + 2, // 2-10 pending tasks
      approvals: Math.floor(Math.random() * 5) + 1, // 1-6 pending approvals
      surveys: Math.floor(Math.random() * 3) + 1, // 1-4 new surveys
      documents: Math.floor(Math.random() * 6) + 1, // 1-7 new documents
      users: Math.floor(Math.random() * 3), // 0-3 new registrations
      institutions: Math.floor(Math.random() * 2), // 0-2 pending institution updates
      attendance: Math.floor(Math.random() * 4) + 1, // 1-5 attendance issues
      schedules: Math.floor(Math.random() * 2), // 0-2 schedule conflicts
      'teaching-loads': Math.floor(Math.random() * 3), // 0-3 workload alerts
      reports: Math.floor(Math.random() * 2), // 0-2 new reports
      // Legacy badges
      notifications: Math.floor(Math.random() * 10),
      messages: Math.floor(Math.random() * 5)
    };
  }, []);

  // Fetch sidebar data from API
  const fetchSidebarData = useCallback(async (isRetry = false): Promise<SidebarData> => {
    // For now, return mock data until proper sidebar APIs are implemented
    // This prevents the infinite loading state
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return mock sidebar data based on user role
      // Check for multiple ways role can be stored
      const userRole = user?.roles?.[0] || user?.role || user?.role_name || 'user';
      
      console.log('User role detection:', {
        user,
        userRoles: user?.roles,
        userRole: user?.role,
        detectedRole: userRole
      });
      
      const navigationItems = generateNavigationItems(userRole);
      const badges = await generateBadgeCounts();
      
      return {
        navigationItems,
        badges,
        userProfile: user || {
          username: 'User',
          email: 'user@example.com',
          role: userRole
        }
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }, [token, user]);

  // Stable references for callbacks
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  
  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  });

  // Load sidebar data with error handling and retries
  const loadSidebarData = useCallback(async (isRetry = false) => {
    if (!user || !token) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: new Error('User not authenticated')
      }));
      return;
    }

    // Don't show loading for retries
    if (!isRetry) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const sidebarData = await fetchSidebarData(isRetry);
      
      setData(sidebarData);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        retryCount: 0,
        lastUpdated: new Date()
      }));

      onSuccessRef.current?.(sidebarData);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Sidebar data loaded successfully:', sidebarData);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      
      // Don't trigger retries for AbortError or cancelled requests
      if (errorObj.message.includes('cancelled') || errorObj.name === 'AbortError') {
        // Just silently handle cancellation, don't update state to avoid loops
        return;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
        retryCount: isRetry ? prev.retryCount + 1 : 1
      }));

      onErrorRef.current?.(errorObj);
    }
  }, [user, token, fetchSidebarData]);

  // Manual retry function
  const retry = useCallback(() => {
    if (state.retryCount < maxRetries) {
      loadSidebarData(true);
    }
  }, [loadSidebarData, state.retryCount, maxRetries]);

  // Reset error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  // Refresh data manually
  const refresh = useCallback(() => {
    loadSidebarData(false);
  }, [loadSidebarData]);

  // Update badge count manually
  const updateBadge = useCallback((badgeType: keyof SidebarData['badges'], newCount: number) => {
    setData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        badges: {
          ...prev.badges,
          [badgeType]: Math.max(0, newCount)
        }
      };
    });
  }, []);

  // Increment badge count
  const incrementBadge = useCallback((badgeType: keyof SidebarData['badges'], amount = 1) => {
    setData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        badges: {
          ...prev.badges,
          [badgeType]: prev.badges[badgeType] + amount
        }
      };
    });
  }, []);

  // Decrement badge count
  const decrementBadge = useCallback((badgeType: keyof SidebarData['badges'], amount = 1) => {
    setData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        badges: {
          ...prev.badges,
          [badgeType]: Math.max(0, prev.badges[badgeType] - amount)
        }
      };
    });
  }, []);

  // Initial load effect - only run once when user/token become available
  const hasInitiallyLoaded = useRef(false);
  
  useEffect(() => {
    if (user && token && !hasInitiallyLoaded.current && !data) {
      hasInitiallyLoaded.current = true;
      loadSidebarData();
    }
  }, [user, token, loadSidebarData, data]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && !state.isLoading && !state.error && user && token) {
      const refreshData = async () => {
        try {
          const sidebarData = await fetchSidebarData(true);
          setData(sidebarData);
          setState(prev => ({
            ...prev,
            lastUpdated: new Date()
          }));
          onSuccessRef.current?.(sidebarData);
        } catch (error) {
          // Silent fail for auto-refresh
          if (process.env.NODE_ENV === 'development') {
        console.debug('Auto-refresh failed:', error);
      }
        }
      };

      refreshIntervalRef.current = setInterval(refreshData, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
    
    // Clean up interval if conditions are not met
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
    };
  }, [autoRefresh, refreshInterval, state.isLoading, state.error, user, token, fetchSidebarData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    retryCount: state.retryCount,
    lastUpdated: state.lastUpdated,
    
    // Data
    data,
    navigationItems: data?.navigationItems || [],
    badges: data?.badges || {
      notifications: 0,
      messages: 0,
      tasks: 0,
      approvals: 0,
      surveys: 0,
      documents: 0
    },
    userProfile: data?.userProfile || null,
    
    // Actions
    retry,
    refresh,
    clearError,
    updateBadge,
    incrementBadge,
    decrementBadge,
    
    // Computed state
    hasError: state.error !== null,
    canRetry: state.retryCount < maxRetries,
    isStale: state.lastUpdated ? Date.now() - state.lastUpdated.getTime() > refreshInterval * 2 : false
  };
};

// Hook for sidebar loading states
export const useSidebarLoadingState = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const setInitialLoadComplete = useCallback(() => {
    setIsInitialLoad(false);
  }, []);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setIsRefreshing(refreshing);
  }, []);

  const setRetrying = useCallback((retrying: boolean) => {
    setIsRetrying(retrying);
  }, []);

  return {
    isInitialLoad,
    isRefreshing,
    isRetrying,
    setInitialLoadComplete,
    setRefreshing,
    setRetrying
  };
};

// Export default hook
export default useSidebarState;