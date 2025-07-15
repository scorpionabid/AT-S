import type { User } from '../../types/auth';
import { hasPermission as originalHasPermission, hasRole as originalHasRole } from './permissionUtils';

interface PermissionCacheEntry {
  value: boolean;
  timestamp: number;
  ttl: number;
}

class PermissionCacheManager {
  private cache = new Map<string, PermissionCacheEntry>();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes (increased)
  private maxSize = 500; // Increased cache size
  private stats = { hits: 0, misses: 0, total: 0 };
  private backgroundRefreshThreshold = 2 * 60 * 1000; // Refresh if 2 minutes left

  private generateKey(userId: number, type: 'permission' | 'role', value: string): string {
    return `${userId}:${type}:${value}`;
  }

  private isExpired(entry: PermissionCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private enforceMaxSize(): void {
    if (this.cache.size > this.maxSize) {
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      
      const toRemove = entries.slice(0, this.cache.size - this.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  get(key: string): boolean | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  set(key: string, value: boolean, ttl: number = this.defaultTTL): void {
    const entry: PermissionCacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
    this.cleanExpired();
    this.enforceMaxSize();
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, total: 0 };
  }

  // New methods for enhanced performance
  getStats() {
    this.stats.total = this.stats.hits + this.stats.misses;
    const hitRate = this.stats.total > 0 ? (this.stats.hits / this.stats.total * 100).toFixed(2) : '0.00';
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: this.stats.total > 0 ? this.stats.hits / this.stats.total : 0
    };
  }

  // Background refresh for expiring entries
  scheduleBackgroundRefresh(key: string, refreshFn: () => Promise<boolean>): void {
    const entry = this.cache.get(key);
    if (!entry) return;

    const timeUntilExpiry = entry.ttl - (Date.now() - entry.timestamp);
    if (timeUntilExpiry <= this.backgroundRefreshThreshold) {
      // Schedule background refresh
      setTimeout(async () => {
        try {
          const newValue = await refreshFn();
          this.set(key, newValue);
        } catch (error) {
          console.warn('Background cache refresh failed:', error);
        }
      }, 0);
    }
  }

  // Batch operations for performance
  setMany(entries: Array<{ key: string; value: boolean; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  // Preload user permissions into cache
  preloadUser(user: User): void {
    const userId = user.id;
    const timestamp = Date.now();
    
    // Cache all permissions
    user.permissions?.forEach(permission => {
      const key = this.generateKey(userId, 'permission', permission);
      this.cache.set(key, {
        value: true,
        timestamp,
        ttl: this.defaultTTL
      });
    });

    // Cache all roles
    user.roles?.forEach(role => {
      const key = this.generateKey(userId, 'role', role);
      this.cache.set(key, {
        value: true,
        timestamp,
        ttl: this.defaultTTL
      });
    });
  }


  hasPermissionCached(user: User | null, permission: string): boolean {
    if (!user) return false;
    
    const key = this.generateKey(user.id, 'permission', permission);
    let cached = this.get(key);
    
    if (cached === null) {
      // Cache miss - compute and store
      cached = originalHasPermission(user, permission);
      this.set(key, cached);
    }
    
    return cached;
  }

  hasRoleCached(user: User | null, role: string): boolean {
    if (!user) return false;
    
    const key = this.generateKey(user.id, 'role', role);
    let cached = this.get(key);
    
    if (cached === null) {
      // Cache miss - compute and store
      cached = originalHasRole(user, role);
      this.set(key, cached);
    }
    
    return cached;
  }

  hasAnyPermissionCached(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    
    return permissions.some(permission => this.hasPermissionCached(user, permission));
  }

  hasAllPermissionsCached(user: User | null, permissions: string[]): boolean {
    if (!user) return false;
    
    return permissions.every(permission => this.hasPermissionCached(user, permission));
  }

  hasAnyRoleCached(user: User | null, roles: string[]): boolean {
    if (!user) return false;
    
    return roles.some(role => this.hasRoleCached(user, role));
  }

  hasAllRolesCached(user: User | null, roles: string[]): boolean {
    if (!user) return false;
    
    return roles.every(role => this.hasRoleCached(user, role));
  }

  preloadUserPermissions(user: User | null): void {
    if (!user) return;
    
    // Preload user's permissions
    const userPermissions = user.permissions || [];
    userPermissions.forEach(permission => {
      const key = this.generateKey(user.id, 'permission', permission);
      this.set(key, true);
    });
    
    // Preload user's roles
    const userRoles = user.roles || [];
    const roleNames = userRoles;
    roleNames.forEach(role => {
      const key = this.generateKey(user.id, 'role', role);
      this.set(key, true);
    });
  }

  invalidateUser(userId: number): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Global cache instance
const permissionCache = new PermissionCacheManager();

// Auto-cleanup expired entries every minute
setInterval(() => {
  permissionCache.clear();
}, 60000);

// Cached permission functions
export const hasPermission = (user: User | null, permission: string): boolean => {
  return permissionCache.hasPermissionCached(user, permission);
};

export const hasRole = (user: User | null, role: string): boolean => {
  return permissionCache.hasRoleCached(user, role);
};

export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  return permissionCache.hasAnyPermissionCached(user, permissions);
};

export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  return permissionCache.hasAllPermissionsCached(user, permissions);
};

export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  return permissionCache.hasAnyRoleCached(user, roles);
};

export const hasAllRoles = (user: User | null, roles: string[]): boolean => {
  return permissionCache.hasAllRolesCached(user, roles);
};

export const preloadUserPermissions = (user: User | null): void => {
  permissionCache.preloadUserPermissions(user);
};

export const invalidateUserCache = (userId: number): void => {
  permissionCache.invalidateUser(userId);
};

export const clearPermissionCache = (): void => {
  permissionCache.clear();
};

export const getPermissionCacheStats = (): {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
} => {
  return permissionCache.getStats();
};

// Convenience functions for common permission checks
export const canCreateUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.create');
};

export const canUpdateUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.update');
};

export const canDeleteUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.delete');
};

export const canManageInstitutions = (user: User | null): boolean => {
  return hasAnyPermission(user, ['institutions.create', 'institutions.update', 'institutions.delete']);
};

export const canManageSurveys = (user: User | null): boolean => {
  return hasAnyPermission(user, ['surveys.create', 'surveys.update', 'surveys.delete']);
};

export const canPublishSurveys = (user: User | null): boolean => {
  return hasPermission(user, 'surveys.publish');
};

export const canManageRoles = (user: User | null): boolean => {
  return hasAnyPermission(user, ['roles.create', 'roles.update', 'roles.delete']);
};

export const canManageDocuments = (user: User | null): boolean => {
  return hasAnyPermission(user, ['documents.create', 'documents.update', 'documents.delete']);
};

export const canShareDocuments = (user: User | null): boolean => {
  return hasPermission(user, 'documents.share');
};

export const canManageTasks = (user: User | null): boolean => {
  return hasAnyPermission(user, ['tasks.create', 'tasks.update', 'tasks.delete']);
};

export const isSuperAdmin = (user: User | null): boolean => {
  return hasRole(user, 'superadmin');
};

export const isRegionAdmin = (user: User | null): boolean => {
  return hasRole(user, 'regionadmin');
};

export const isSektorAdmin = (user: User | null): boolean => {
  return hasRole(user, 'sektoradmin');
};

export const hasAdminAccess = (user: User | null): boolean => {
  return hasAnyRole(user, ['superadmin', 'regionadmin']);
};

export const hasManagementAccess = (user: User | null): boolean => {
  return hasAnyRole(user, ['superadmin', 'regionadmin', 'sektoradmin']);
};