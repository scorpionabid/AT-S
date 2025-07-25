import type { User } from '../../types/auth';
import { hasPermission, hasRole } from './index';

/**
 * Preload user permissions for caching
 */
export const preloadUserPermissions = (user: User): void => {
  if (!user) return;

  // Common permissions to preload
  const commonPermissions = [
    'users.read',
    'users.create', 
    'users.update',
    'users.delete',
    'institutions.read',
    'institutions.create',
    'institutions.update', 
    'institutions.delete',
    'surveys.read',
    'surveys.create',
    'surveys.update',
    'surveys.delete',
    'surveys.publish',
    'reports.read',
    'reports.create',
    'settings.read',
    'settings.update'
  ];

  // Cache permission results
  commonPermissions.forEach(permission => {
    const result = hasPermission(user, permission);
    // Store in memory cache if needed
    if (typeof window !== 'undefined') {
      const cacheKey = `perm_${user.id}_${permission}`;
      sessionStorage.setItem(cacheKey, String(result));
    }
  });

  // Common roles to preload
  const commonRoles = [
    'superadmin',
    'regionadmin', 
    'schooladmin',
    'teacher',
    'student'
  ];

  // Cache role results
  commonRoles.forEach(role => {
    const result = hasRole(user, role);
    if (typeof window !== 'undefined') {
      const cacheKey = `role_${user.id}_${role}`;
      sessionStorage.setItem(cacheKey, String(result));
    }
  });
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = (userId?: number): void => {
  if (typeof window === 'undefined') return;

  if (userId) {
    // Clear specific user cache
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(`perm_${userId}_`) || key.startsWith(`role_${userId}_`)) {
        sessionStorage.removeItem(key);
      }
    });
  } else {
    // Clear all permission/role cache
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('perm_') || key.startsWith('role_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Get cached permission result
 */
export const getCachedPermission = (user: User | null, permission: string): boolean | null => {
  if (!user || typeof window === 'undefined') return null;

  const cacheKey = `perm_${user.id}_${permission}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  return cached ? cached === 'true' : null;
};

/**
 * Get cached role result
 */
export const getCachedRole = (user: User | null, role: string): boolean | null => {
  if (!user || typeof window === 'undefined') return null;

  const cacheKey = `role_${user.id}_${role}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  return cached ? cached === 'true' : null;
};
