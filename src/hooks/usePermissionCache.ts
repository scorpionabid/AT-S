import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionCacheEntry {
  value: boolean;
  timestamp: number;
  ttl: number;
}

interface PermissionCacheConfig {
  defaultTTL: number; // Default cache time in milliseconds
  maxSize: number; // Maximum number of cached entries
  enablePersistence: boolean; // Whether to persist cache to localStorage
}

const defaultConfig: PermissionCacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enablePersistence: true
};

export const usePermissionCache = (config: Partial<PermissionCacheConfig> = {}) => {
  const { user } = useAuth();
  const finalConfig = { ...defaultConfig, ...config };
  const cacheRef = useRef<Map<string, PermissionCacheEntry>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  });

  // Load cache from localStorage on initialization
  useEffect(() => {
    if (finalConfig.enablePersistence && user) {
      const cacheKey = `permission_cache_${user.id}`;
      const storedCache = localStorage.getItem(cacheKey);
      
      if (storedCache) {
        try {
          const parsed = JSON.parse(storedCache);
          const now = Date.now();
          
          // Filter out expired entries
          const validEntries = Object.entries(parsed).filter(([_, entry]) => {
            const cacheEntry = entry as PermissionCacheEntry;
            return now - cacheEntry.timestamp < cacheEntry.ttl;
          });
          
          cacheRef.current = new Map(validEntries);
          updateCacheStats();
        } catch (error) {
          console.error('Failed to load permission cache:', error);
        }
      }
    }
  }, [user, finalConfig.enablePersistence]);

  // Save cache to localStorage
  const persistCache = useCallback(() => {
    if (finalConfig.enablePersistence && user) {
      const cacheKey = `permission_cache_${user.id}`;
      const cacheObject = Object.fromEntries(cacheRef.current);
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
      } catch (error) {
        console.error('Failed to persist permission cache:', error);
      }
    }
  }, [user, finalConfig.enablePersistence]);

  // Update cache statistics
  const updateCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const size = cache.size;
    const totalRequests = cacheStats.hits + cacheStats.misses;
    const hitRate = totalRequests > 0 ? (cacheStats.hits / totalRequests) * 100 : 0;

    setCacheStats(prev => ({
      ...prev,
      size,
      hitRate
    }));
  }, [cacheStats.hits, cacheStats.misses]);

  // Clean expired entries
  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    let removedCount = 0;

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      updateCacheStats();
      persistCache();
    }

    return removedCount;
  }, [updateCacheStats, persistCache]);

  // Enforce cache size limit
  const enforceMaxSize = useCallback(() => {
    const cache = cacheRef.current;
    
    if (cache.size > finalConfig.maxSize) {
      // Remove oldest entries
      const entries = Array.from(cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      
      const toRemove = entries.slice(0, cache.size - finalConfig.maxSize);
      toRemove.forEach(([key]) => cache.delete(key));
      
      updateCacheStats();
      persistCache();
    }
  }, [finalConfig.maxSize, updateCacheStats, persistCache]);

  // Get cached permission value
  const getCachedPermission = useCallback((key: string): boolean | null => {
    const cache = cacheRef.current;
    const entry = cache.get(key);
    
    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired
      cache.delete(key);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.value;
  }, []);

  // Set cached permission value
  const setCachedPermission = useCallback((
    key: string, 
    value: boolean, 
    ttl: number = finalConfig.defaultTTL
  ) => {
    const cache = cacheRef.current;
    const entry: PermissionCacheEntry = {
      value,
      timestamp: Date.now(),
      ttl
    };

    cache.set(key, entry);
    
    // Clean up and enforce limits
    cleanExpiredEntries();
    enforceMaxSize();
    
    updateCacheStats();
    persistCache();
  }, [finalConfig.defaultTTL, cleanExpiredEntries, enforceMaxSize, updateCacheStats, persistCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    
    setCacheStats({
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    });

    if (finalConfig.enablePersistence && user) {
      const cacheKey = `permission_cache_${user.id}`;
      localStorage.removeItem(cacheKey);
    }
  }, [user, finalConfig.enablePersistence]);

  // Clear expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanExpiredEntries();
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, [cleanExpiredEntries]);

  // Clear cache when user changes
  useEffect(() => {
    if (user) {
      clearCache();
    }
  }, [user?.id, clearCache]);

  // Get cache entries for debugging
  const getCacheEntries = useCallback(() => {
    return Array.from(cacheRef.current.entries()).map(([key, entry]) => ({
      key,
      value: entry.value,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      expired: Date.now() - entry.timestamp > entry.ttl
    }));
  }, []);

  // Preload common permissions
  const preloadPermissions = useCallback((permissions: string[]) => {
    if (!user) return;

    permissions.forEach(permission => {
      const key = `${user.id}:${permission}`;
      const cached = getCachedPermission(key);
      
      if (cached === null) {
        // This would typically trigger a permission check
        // For now, we'll just add a placeholder
        const hasPermission = user.permissions?.includes(permission) || false;
        setCachedPermission(key, hasPermission);
      }
    });
  }, [user, getCachedPermission, setCachedPermission]);

  return {
    getCachedPermission,
    setCachedPermission,
    clearCache,
    cleanExpiredEntries,
    getCacheEntries,
    preloadPermissions,
    cacheStats,
    config: finalConfig
  };
};