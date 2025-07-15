// ====================
// ATİS Navigation Service
// Dynamic menu loading and caching service
// Version: 1.0.0
// ====================

import type { User } from '../types/auth';
import { 
  MenuItem, 
  getVisibleMenuItems, 
  getMenuItemByPath, 
  getBreadcrumbItems,
  getMenuStatistics,
  getQuickActions,
  getMenuItemsByCategory,
  searchMenuItems
} from '../utils/navigation/menuConfig';

interface NavigationCache {
  userId: string | number;
  menuItems: MenuItem[];
  timestamp: number;
  permissions: string[];
  roles: string[];
}

class NavigationService {
  private cache: NavigationCache | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY = 'atis_navigation_cache';

  /**
   * Get user's visible menu items with caching
   */
  getMenuItems(user: User | null, forceRefresh: boolean = false): MenuItem[] {
    if (!user) return [];

    // Check cache validity
    if (!forceRefresh && this.isCacheValid(user)) {
      return this.cache!.menuItems;
    }

    // Generate fresh menu items
    const menuItems = getVisibleMenuItems(user);
    
    // Update cache
    this.updateCache(user, menuItems);
    
    return menuItems;
  }

  /**
   * Get menu item by path
   */
  getMenuItem(path: string, user: User | null = null): MenuItem | null {
    const menuItems = user ? this.getMenuItems(user) : [];
    return getMenuItemByPath(path, menuItems);
  }

  /**
   * Get breadcrumb items for current path
   */
  getBreadcrumbs(path: string, user: User | null = null): MenuItem[] {
    const menuItems = user ? this.getMenuItems(user) : [];
    return getBreadcrumbItems(path, menuItems);
  }

  /**
   * Get navigation statistics
   */
  getStatistics(user: User | null): {
    totalItems: number;
    visibleItems: number;
    hiddenItems: number;
    accessibleFeatures: string[];
    byCategory: Record<string, { visible: number; total: number }>;
  } {
    return getMenuStatistics(user);
  }

  /**
   * Get quick actions for user
   */
  getQuickActions(user: User | null): MenuItem[] {
    return getQuickActions(user);
  }

  /**
   * Get menu items grouped by category
   */
  getMenuByCategory(user: User | null): Record<string, MenuItem[]> {
    return getMenuItemsByCategory(user);
  }

  /**
   * Search menu items
   */
  searchMenu(query: string, user: User | null): MenuItem[] {
    return searchMenuItems(user, query);
  }

  /**
   * Check if user can access a specific path
   */
  canAccessPath(path: string, user: User | null): boolean {
    if (!user) return false;
    
    const menuItem = this.getMenuItem(path, user);
    return menuItem !== null;
  }

  /**
   * Get recently accessed menu items
   */
  getRecentlyAccessed(user: User | null, limit: number = 5): MenuItem[] {
    if (!user) return [];

    const recentPaths = this.getRecentlyAccessedPaths();
    const menuItems = this.getMenuItems(user);
    
    return recentPaths
      .map(path => getMenuItemByPath(path, menuItems))
      .filter(Boolean)
      .slice(0, limit) as MenuItem[];
  }

  /**
   * Track accessed path
   */
  trackAccess(path: string): void {
    const recentPaths = this.getRecentlyAccessedPaths();
    
    // Remove if already exists
    const filteredPaths = recentPaths.filter(p => p !== path);
    
    // Add to beginning
    const updatedPaths = [path, ...filteredPaths].slice(0, 10); // Keep last 10
    
    localStorage.setItem('atis_recent_paths', JSON.stringify(updatedPaths));
  }

  /**
   * Clear navigation cache
   */
  clearCache(): void {
    this.cache = null;
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Invalidate cache for specific user
   */
  invalidateUserCache(userId: string | number): void {
    if (this.cache && this.cache.userId === userId) {
      this.clearCache();
    }
  }

  /**
   * Preload menu items for better performance
   */
  async preloadMenuItems(user: User | null): Promise<MenuItem[]> {
    if (!user) return [];

    // Return cached if available
    if (this.isCacheValid(user)) {
      return this.cache!.menuItems;
    }

    // Simulate async loading (for future API integration)
    return new Promise((resolve) => {
      setTimeout(() => {
        const menuItems = this.getMenuItems(user, true);
        resolve(menuItems);
      }, 10);
    });
  }

  /**
   * Get navigation analytics
   */
  getAnalytics(user: User | null): {
    userAccess: {
      totalMenuItems: number;
      accessibleItems: number;
      accessibilityPercentage: number;
    };
    categoryAccess: Record<string, {
      total: number;
      accessible: number;
      percentage: number;
    }>;
    recentActivity: {
      accessedPaths: string[];
      frequentPaths: { path: string; count: number }[];
    };
  } {
    const stats = this.getStatistics(user);
    const recentPaths = this.getRecentlyAccessedPaths();
    
    // Calculate frequent paths
    const pathCounts: Record<string, number> = {};
    recentPaths.forEach(path => {
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    });
    
    const frequentPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate category access percentages
    const categoryAccess: Record<string, { total: number; accessible: number; percentage: number }> = {};
    Object.entries(stats.byCategory).forEach(([category, data]) => {
      categoryAccess[category] = {
        total: data.total,
        accessible: data.visible,
        percentage: data.total > 0 ? Math.round((data.visible / data.total) * 100) : 0
      };
    });

    return {
      userAccess: {
        totalMenuItems: stats.totalItems,
        accessibleItems: stats.visibleItems,
        accessibilityPercentage: stats.totalItems > 0 ? Math.round((stats.visibleItems / stats.totalItems) * 100) : 0
      },
      categoryAccess,
      recentActivity: {
        accessedPaths: recentPaths,
        frequentPaths
      }
    };
  }

  /**
   * Export navigation configuration
   */
  exportConfiguration(user: User | null): {
    userInfo: {
      id?: string | number;
      roles: string[];
      permissions: string[];
    };
    menuConfiguration: MenuItem[];
    statistics: any;
    exportedAt: string;
  } {
    const menuItems = this.getMenuItems(user);
    const stats = this.getStatistics(user);

    return {
      userInfo: {
        id: user?.id,
        roles: user?.roles || [],
        permissions: user?.permissions || []
      },
      menuConfiguration: menuItems,
      statistics: stats,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Check cache validity
   */
  private isCacheValid(user: User): boolean {
    if (!this.cache) {
      this.loadCacheFromStorage();
    }

    if (!this.cache) return false;

    const now = Date.now();
    const isExpired = (now - this.cache.timestamp) > this.CACHE_DURATION;
    const isDifferentUser = this.cache.userId !== user.id;
    
    // Check if user permissions/roles changed
    const currentPermissions = user.permissions || [];
    const currentRoles = user.roles || [];
    const permissionsChanged = JSON.stringify(currentPermissions.sort()) !== JSON.stringify(this.cache.permissions.sort());
    const rolesChanged = JSON.stringify(currentRoles.sort()) !== JSON.stringify(this.cache.roles.sort());

    return !isExpired && !isDifferentUser && !permissionsChanged && !rolesChanged;
  }

  /**
   * Update cache
   */
  private updateCache(user: User, menuItems: MenuItem[]): void {
    this.cache = {
      userId: user.id,
      menuItems,
      timestamp: Date.now(),
      permissions: user.permissions || [],
      roles: user.roles || []
    };

    // Persist to localStorage
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to persist navigation cache:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load navigation cache:', error);
      this.cache = null;
    }
  }

  /**
   * Get recently accessed paths from localStorage
   */
  private getRecentlyAccessedPaths(): string[] {
    try {
      const paths = localStorage.getItem('atis_recent_paths');
      return paths ? JSON.parse(paths) : [];
    } catch (error) {
      console.warn('Failed to load recent paths:', error);
      return [];
    }
  }
}

// Export singleton instance
export const navigationService = new NavigationService();

// Export types and utilities
export type { NavigationCache };
export default navigationService;