import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStandardizedRole, getRoleLevel } from '../constants/roles';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  scope: string;
  expires: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  scopeKey?: string; // Custom scope key
  persistToStorage?: boolean; // Save to localStorage
}

/**
 * Role-based caching hook that automatically invalidates cache
 * when user scope changes (role, institution, department)
 */
export function useRoleBasedCache<T = any>(
  key: string,
  options: CacheOptions = {}
) {
  const { user } = useAuth();
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    scopeKey,
    persistToStorage = false
  } = options;

  // Generate scope-aware cache key
  const generateScopeKey = useCallback(() => {
    if (!user) return 'anonymous';

    const userRole = getStandardizedRole(
      typeof user.role === 'string' ? user.role : user.role?.name
    );
    
    const scopeParts = [
      userRole,
      user.institution_id || 'no-institution',
      (user.department_ids || []).sort().join(',') || 'no-departments',
      user.id
    ];

    return scopeParts.join(':');
  }, [user]);

  const currentScope = useMemo(() => 
    scopeKey || generateScopeKey(), 
    [scopeKey, generateScopeKey]
  );

  const fullKey = `${key}:${currentScope}`;

  // Load from localStorage on mount if enabled
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`atis-cache:${fullKey}`);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (entry.expires > Date.now()) {
            setCache(prev => new Map(prev.set(fullKey, entry)));
          } else {
            localStorage.removeItem(`atis-cache:${fullKey}`);
          }
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
    }
  }, [fullKey, persistToStorage]);

  const get = useCallback((cacheKey: string = key): T | null => {
    const entry = cache.get(`${cacheKey}:${currentScope}`);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      // Remove expired entry
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(`${cacheKey}:${currentScope}`);
        return newCache;
      });
      
      if (persistToStorage && typeof window !== 'undefined') {
        localStorage.removeItem(`atis-cache:${cacheKey}:${currentScope}`);
      }
      
      return null;
    }

    console.log('🎯 Cache hit:', {
      key: `${cacheKey}:${currentScope}`,
      age: Date.now() - entry.timestamp,
      ttl
    });

    return entry.data;
  }, [cache, currentScope, key, ttl, persistToStorage]);

  const set = useCallback((data: T, cacheKey: string = key): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      scope: currentScope,
      expires: Date.now() + ttl
    };

    const entryKey = `${cacheKey}:${currentScope}`;
    
    setCache(prev => new Map(prev.set(entryKey, entry)));

    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`atis-cache:${entryKey}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }

    console.log('💾 Cache set:', {
      key: entryKey,
      dataSize: JSON.stringify(data).length,
      ttl
    });
  }, [currentScope, key, ttl, persistToStorage]);

  const invalidate = useCallback((cacheKey?: string): void => {
    if (cacheKey) {
      const entryKey = `${cacheKey}:${currentScope}`;
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(entryKey);
        return newCache;
      });
      
      if (persistToStorage && typeof window !== 'undefined') {
        localStorage.removeItem(`atis-cache:${entryKey}`);
      }
    } else {
      // Clear all entries for current scope
      setCache(prev => {
        const newCache = new Map();
        for (const [key, entry] of prev.entries()) {
          if (!key.endsWith(`:${currentScope}`)) {
            newCache.set(key, entry);
          }
        }
        return newCache;
      });
      
      if (persistToStorage && typeof window !== 'undefined') {
        // Clear localStorage entries for current scope
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('atis-cache:') && key.endsWith(`:${currentScope}`)) {
            localStorage.removeItem(key);
          }
        });
      }
    }

    console.log('🗑️ Cache invalidated:', { 
      key: cacheKey || 'all', 
      scope: currentScope 
    });
  }, [currentScope, persistToStorage]);

  const clear = useCallback((): void => {
    setCache(new Map());
    
    if (persistToStorage && typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('atis-cache:')) {
          localStorage.removeItem(key);
        }
      });
    }

    console.log('🧹 All cache cleared');
  }, [persistToStorage]);

  // Auto-invalidate when scope changes
  useEffect(() => {
    console.log('🔄 User scope changed, invalidating cache:', currentScope);
    // Don't clear immediately, just mark for cleanup
    const timeoutId = setTimeout(() => {
      setCache(prev => {
        const newCache = new Map();
        for (const [key, entry] of prev.entries()) {
          if (entry.scope === currentScope || entry.expires > Date.now()) {
            newCache.set(key, entry);
          }
        }
        return newCache;
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentScope]);

  const stats = useMemo(() => {
    const entries = Array.from(cache.entries()).filter(([key]) => 
      key.endsWith(`:${currentScope}`)
    );
    
    const validEntries = entries.filter(([_, entry]) => 
      entry.expires > Date.now()
    );

    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      currentScope,
      cacheSize: JSON.stringify(Object.fromEntries(validEntries)).length
    };
  }, [cache, currentScope]);

  return {
    get,
    set,
    invalidate,
    clear,
    stats,
    currentScope
  };
}

/**
 * Hook for automatic role-based data caching
 */
export function useRoleBasedDataCache<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { autoRefetch?: boolean } = {}
) {
  const { autoRefetch = true, ...cacheOptions } = options;
  const cache = useRoleBasedCache<T>(key, cacheOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh = false): Promise<T | null> => {
    // Check cache first
    if (!forceRefresh) {
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await fetcher();
      cache.set(data, key);
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Data fetch error';
      setError(errorMessage);
      console.error('❌ Role-based data cache fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cache, key, fetcher]);

  const data = cache.get(key);

  useEffect(() => {
    if (autoRefetch && !data && !loading) {
      fetchData();
    }
  }, [autoRefetch, data, loading, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate: () => cache.invalidate(key),
    ...cache
  };
}