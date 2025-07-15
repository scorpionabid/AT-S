import type { User } from '../../types/auth';

/**
 * Check if user has specific role
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  
  const userRoles = user.roles || [];
  const userRoleNames = userRoles;
  
  return userRoleNames.includes(role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  
  return roles.some(role => hasRole(user, role));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  
  return roles.every(role => hasRole(user, role));
};

/**
 * Get user's role names
 */
export const getUserRoles = (user: User | null): string[] => {
  if (!user) return [];
  
  const userRoles = user.roles || [];
  return userRoles;
};

/**
 * Check if user is SuperAdmin
 */
export const isSuperAdmin = (user: User | null): boolean => {
  return hasRole(user, 'superadmin');
};

/**
 * Check if user is RegionAdmin
 */
export const isRegionAdmin = (user: User | null): boolean => {
  return hasRole(user, 'regionadmin');
};

/**
 * Check if user is SektorAdmin
 */
export const isSektorAdmin = (user: User | null): boolean => {
  return hasRole(user, 'sektoradmin');
};

/**
 * Check if user has admin-level access (SuperAdmin or RegionAdmin)
 */
export const hasAdminAccess = (user: User | null): boolean => {
  return hasAnyRole(user, ['superadmin', 'regionadmin']);
};

/**
 * Check if user has management-level access (SuperAdmin, RegionAdmin, or SektorAdmin)
 */
export const hasManagementAccess = (user: User | null): boolean => {
  return hasAnyRole(user, ['superadmin', 'regionadmin', 'sektoradmin']);
};

/**
 * Get user's highest role level
 */
export const getUserRoleLevel = (user: User | null): number => {
  if (!user) return 0;
  
  const roleHierarchy = {
    'superadmin': 6,
    'regionadmin': 5,
    'sektoradmin': 4,
    'məktəbadmin': 3,
    'müəllim': 2,
    'şagird': 1
  };
  
  const userRoles = getUserRoles(user);
  const levels = userRoles.map(role => roleHierarchy[role] || 0);
  
  return Math.max(...levels, 0);
};

/**
 * Check if user can manage another user based on role hierarchy
 */
export const canManageUser = (currentUser: User | null, targetUser: User | null): boolean => {
  if (!currentUser || !targetUser) return false;
  
  const currentUserLevel = getUserRoleLevel(currentUser);
  const targetUserLevel = getUserRoleLevel(targetUser);
  
  return currentUserLevel > targetUserLevel;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
  const roleDisplayNames = {
    'superadmin': 'Super Administrator',
    'regionadmin': 'Region Administrator',
    'sektoradmin': 'Sector Administrator',
    'məktəbadmin': 'School Administrator',
    'müəllim': 'Teacher',
    'şagird': 'Student'
  };
  
  return roleDisplayNames[role] || role;
};