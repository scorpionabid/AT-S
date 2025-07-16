// ====================================
// ATİS Navigation - Unified Exports
// Single source of truth for navigation
// ====================================

// Main menu configuration
export * from './menuConfig';

// Route access utilities
export * from './routeAccess';

// Navigation permissions utilities
export * from './navigationPermissions';

// Re-export commonly used functions from menuConfig
export {
  getVisibleMenuItems,
  canAccessMenuItem,
  getMenuItemByPath,
  getBreadcrumbItems,
  isPathActive,
  getMenuStatistics,
  getQuickActions,
  getMenuItemsByCategory,
  searchMenuItems
} from './menuConfig';

// Re-export route access functions
export {
  canAccessRoute,
  getRouteConfig,
  getAccessibleRoutes,
  validateRouteAccess,
  getRedirectPath
} from './routeAccess';

// Re-export navigation permission functions
export {
  hasNavigationPermission,
  getUserNavigationPermissions,
  getNavigationPermissionsByCategory,
  canAccessAdminFeatures
} from './navigationPermissions';