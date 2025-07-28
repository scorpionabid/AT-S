/**
 * ATİS Simplified Navigation Hook
 * Simple, focused navigation logic əvəzinə over-engineered useSidebarState
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getVisibleMenuItems } from '../utils/navigation/menuConfig';

// Simple badge interface
export interface NavigationBadges {
  tasks?: number;
  approvals?: number;
  surveys?: number;
  notifications?: number;
}

// Simplified navigation hook
export const useSimplifiedNavigation = () => {
  const { user } = useAuth();

  // Get filtered navigation items based on user permissions
  const navigationItems = useMemo(() => {
    return getVisibleMenuItems(user);
  }, [user]);

  // Simple badge system (placeholder for API integration)
  const badges: NavigationBadges = useMemo(() => ({
    tasks: 3,        // TODO: Replace with real API call
    approvals: 2,    // TODO: Replace with real API call  
    surveys: 1,      // TODO: Replace with real API call
    notifications: 5 // TODO: Replace with real API call
  }), []);

  return {
    navigationItems,
    badges,
    user,
    isLoading: false, // Simplify loading state
    error: null       // Simplify error state
  };
};

export default useSimplifiedNavigation;