import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { usePermissionCache } from '../hooks/usePermissionCache';
import { preloadUserPermissions } from '../utils/auth/cachedPermissionUtils';

interface PermissionCacheContextType {
  getCachedPermission: (key: string) => boolean | null;
  setCachedPermission: (key: string, value: boolean, ttl?: number) => void;
  clearCache: () => void;
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
  preloadPermissions: (permissions: string[]) => void;
}

const PermissionCacheContext = createContext<PermissionCacheContextType | undefined>(undefined);

export const usePermissionCacheContext = () => {
  const context = useContext(PermissionCacheContext);
  if (context === undefined) {
    throw new Error('usePermissionCacheContext must be used within a PermissionCacheProvider');
  }
  return context;
};

interface PermissionCacheProviderProps {
  children: ReactNode;
  config?: {
    defaultTTL?: number;
    maxSize?: number;
    enablePersistence?: boolean;
  };
}

export const PermissionCacheProvider: React.FC<PermissionCacheProviderProps> = ({
  children,
  config = {}
}) => {
  const { user } = useAuth();
  const {
    getCachedPermission,
    setCachedPermission,
    clearCache,
    cacheStats,
    preloadPermissions
  } = usePermissionCache(config);

  // Preload user permissions when user changes
  useEffect(() => {
    if (user) {
      // Preload using the cached utils
      preloadUserPermissions(user);
      
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
        'roles.read',
        'roles.create',
        'roles.update',
        'roles.delete',
        'documents.read',
        'documents.create',
        'documents.update',
        'documents.delete',
        'documents.share',
        'tasks.read',
        'tasks.create',
        'tasks.update',
        'tasks.delete'
      ];

      preloadPermissions(commonPermissions);
    }
  }, [user, preloadPermissions]);

  // Performance monitoring
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      const logStats = () => {
        const stats = cacheStats;
        console.log('Permission Cache Stats:', {
          size: stats.size,
          hitRate: `${stats.hitRate.toFixed(2)}%`,
          hits: stats.hits,
          misses: stats.misses
        });
      };

      // Log stats every 30 seconds in development
      const interval = setInterval(logStats, 30000);
      return () => clearInterval(interval);
    }
  }, [cacheStats]);

  const contextValue: PermissionCacheContextType = {
    getCachedPermission,
    setCachedPermission,
    clearCache,
    cacheStats,
    preloadPermissions
  };

  return (
    <PermissionCacheContext.Provider value={contextValue}>
      {children}
    </PermissionCacheContext.Provider>
  );
};