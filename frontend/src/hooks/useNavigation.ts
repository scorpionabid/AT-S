// ====================
// ATİS Navigation Hook
// React hook for navigation management
// Version: 1.0.0
// ====================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { navigationService } from '../services/navigationService';
import type { MenuItem } from '../utils/navigation/menuConfig';

interface UseNavigationOptions {
  enableCaching?: boolean;
  trackAccess?: boolean;
  preloadOnMount?: boolean;
}

interface NavigationState {
  menuItems: MenuItem[];
  currentMenuItem: MenuItem | null;
  breadcrumbs: MenuItem[];
  isLoading: boolean;
  error: string | null;
  quickActions: MenuItem[];
}

interface NavigationActions {
  refreshMenu: () => void;
  searchMenu: (query: string) => MenuItem[];
  getMenuByCategory: () => Record<string, MenuItem[]>;
  canAccessPath: (path: string) => boolean;
  getRecentlyAccessed: (limit?: number) => MenuItem[];
  getStatistics: () => any;
  clearCache: () => void;
}

export const useNavigation = (options: UseNavigationOptions = {}): NavigationState & NavigationActions => {
  const {
    enableCaching = true,
    trackAccess = true,
    preloadOnMount = true
  } = options;

  const { user } = useAuth();
  const location = useLocation();

  const [state, setState] = useState<NavigationState>({
    menuItems: [],
    currentMenuItem: null,
    breadcrumbs: [],
    isLoading: true,
    error: null,
    quickActions: []
  });

  // Load menu items
  const loadMenuItems = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) {
      setState(prev => ({
        ...prev,
        menuItems: [],
        currentMenuItem: null,
        breadcrumbs: [],
        isLoading: false,
        quickActions: []
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const menuItems = enableCaching
        ? await navigationService.preloadMenuItems(user)
        : navigationService.getMenuItems(user, true);

      const currentMenuItem = navigationService.getMenuItem(location.pathname, user);
      const breadcrumbs = navigationService.getBreadcrumbs(location.pathname, user);
      const quickActions = navigationService.getQuickActions(user);

      setState(prev => ({
        ...prev,
        menuItems,
        currentMenuItem,
        breadcrumbs,
        quickActions,
        isLoading: false
      }));

      // Track access if enabled
      if (trackAccess && currentMenuItem) {
        navigationService.trackAccess(location.pathname);
      }

    } catch (error) {
      console.error('Failed to load navigation:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load navigation',
        isLoading: false
      }));
    }
  }, [user, location.pathname, enableCaching, trackAccess]);

  // Load menu items on mount and when dependencies change
  useEffect(() => {
    if (preloadOnMount) {
      loadMenuItems();
    }
  }, [loadMenuItems, preloadOnMount]);

  // Update current menu item and breadcrumbs when location changes
  useEffect(() => {
    if (user && state.menuItems.length > 0) {
      const currentMenuItem = navigationService.getMenuItem(location.pathname, user);
      const breadcrumbs = navigationService.getBreadcrumbs(location.pathname, user);

      setState(prev => ({
        ...prev,
        currentMenuItem,
        breadcrumbs
      }));

      // Track access
      if (trackAccess && currentMenuItem) {
        navigationService.trackAccess(location.pathname);
      }
    }
  }, [location.pathname, user, state.menuItems, trackAccess]);

  // Actions
  const refreshMenu = useCallback(() => {
    loadMenuItems(true);
  }, [loadMenuItems]);

  const searchMenu = useCallback((query: string): MenuItem[] => {
    return navigationService.searchMenu(query, user);
  }, [user]);

  const getMenuByCategory = useCallback((): Record<string, MenuItem[]> => {
    return navigationService.getMenuByCategory(user);
  }, [user]);

  const canAccessPath = useCallback((path: string): boolean => {
    return navigationService.canAccessPath(path, user);
  }, [user]);

  const getRecentlyAccessed = useCallback((limit: number = 5): MenuItem[] => {
    return navigationService.getRecentlyAccessed(user, limit);
  }, [user]);

  const getStatistics = useCallback(() => {
    return navigationService.getStatistics(user);
  }, [user]);

  const clearCache = useCallback(() => {
    navigationService.clearCache();
    refreshMenu();
  }, [refreshMenu]);

  return {
    // State
    ...state,
    // Actions
    refreshMenu,
    searchMenu,
    getMenuByCategory,
    canAccessPath,
    getRecentlyAccessed,
    getStatistics,
    clearCache
  };
};

// Specialized hooks

/**
 * Hook for quick navigation actions
 */
export const useQuickActions = () => {
  const { user } = useAuth();
  return useMemo(() => navigationService.getQuickActions(user), [user]);
};

/**
 * Hook for navigation breadcrumbs
 */
export const useBreadcrumbs = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  return useMemo(() => {
    return navigationService.getBreadcrumbs(location.pathname, user);
  }, [location.pathname, user]);
};

/**
 * Hook for checking path access
 */
export const usePathAccess = (path: string) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    return navigationService.canAccessPath(path, user);
  }, [path, user]);
};

/**
 * Hook for menu search
 */
export const useMenuSearch = (query: string) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!query.trim()) return [];
    return navigationService.searchMenu(query, user);
  }, [query, user]);
};

/**
 * Hook for navigation analytics
 */
export const useNavigationAnalytics = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    return navigationService.getAnalytics(user);
  }, [user]);
};

/**
 * Hook for menu categories
 */
export const useMenuCategories = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    return navigationService.getMenuByCategory(user);
  }, [user]);
};

/**
 * Hook for recently accessed items
 */
export const useRecentlyAccessed = (limit: number = 5) => {
  const { user } = useAuth();
  const location = useLocation();
  
  return useMemo(() => {
    return navigationService.getRecentlyAccessed(user, limit);
  }, [user, limit, location.pathname]); // Re-calculate when location changes
};

export default useNavigation;