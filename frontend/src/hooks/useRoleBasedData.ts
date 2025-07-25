import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getRoleLevel, getStandardizedRole } from '../constants/roles';

interface UseRoleBasedDataOptions {
  endpoint: string;
  autoFetch?: boolean;
  filters?: Record<string, any>;
  dependencies?: any[];
}

interface RoleBasedDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Role-based data fetching hook that automatically applies user scope
 * Regionadmin görə yalnız öz regionundakı data
 * Sektoradmin görə yalnız öz sektorundakı data
 * Məktəbadmin görə yalnız öz məktəbindəkı data
 */
export function useRoleBasedData<T = any>(
  options: UseRoleBasedDataOptions
): RoleBasedDataState<T> {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's data scope based on role
  const getUserScope = useCallback(() => {
    if (!user) return {};

    const userRole = getStandardizedRole(
      typeof user.role === 'string' ? user.role : user.role?.name
    );
    const roleLevel = getRoleLevel(userRole);

    console.log('🔍 User scope calculation:', {
      userRole,
      roleLevel,
      institutionId: user.institution_id,
      departmentIds: user.department_ids
    });

    const scope: Record<string, any> = {};

    switch (userRole) {
      case 'superadmin':
        // SuperAdmin görə bütün data - heç bir məhdudiyyət yoxdur
        break;

      case 'regionadmin':
        // RegionAdmin yalnız öz regionundakı data görə bilər
        if (user.institution_id) {
          scope.region_id = user.institution_id;
        }
        break;

      case 'regionoperator':
        // RegionOperator yalnız öz regionundakı məhdud data
        if (user.institution_id) {
          scope.region_id = user.institution_id;
        }
        if (user.department_ids?.length) {
          scope.department_ids = user.department_ids;
        }
        break;

      case 'sektoradmin':
        // SektorAdmin yalnız öz sektorundakı data
        if (user.institution_id) {
          scope.sector_id = user.institution_id;
        }
        break;

      case 'məktəbadmin':
      case 'mektebadmin':
        // MəktəbAdmin yalnız öz məktəbindəkı data
        if (user.institution_id) {
          scope.school_id = user.institution_id;
        }
        break;

      case 'müəllim':
        // Müəllim yalnız şəxsi data və təyin olunduğu məktəb
        scope.user_id = user.id;
        if (user.institution_id) {
          scope.school_id = user.institution_id;
        }
        break;

      default:
        // Naməlum rol üçün ən məhdud giriş
        scope.user_id = user.id;
    }

    return scope;
  }, [user]);

  const fetchData = useCallback(async () => {
    // Real-time dəyərləri component state-dən götürürük
    const currentUser = user;
    const currentOptions = options;
    
    if (!currentUser) {
      setError('İstifadəçi məlumatları tapılmadı');
      return;
    }

    if (!currentOptions.endpoint) {
      setError('API endpoint təyin edilməyib');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userScope = getUserScope();
      const combinedFilters = {
        ...currentOptions.filters,
        ...userScope
      };

      console.log('🔄 Fetching role-based data:', {
        endpoint: currentOptions.endpoint,
        userScope,
        combinedFilters
      });

      const params = new URLSearchParams();
      Object.entries(combinedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `${currentOptions.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);

      setData(response.data);
      console.log('✅ Role-based data fetched successfully:', response.data);
    } catch (err: any) {
      console.error('❌ Role-based data fetch error:', err);
      setError(err.response?.data?.message || 'Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [getUserScope]);

  // Auto-fetch on mount and dependencies change
  useEffect(() => {
    if (options.autoFetch === false || !options.endpoint || !user) {
      return;
    }

    const performFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const userScope = getUserScope();
        const combinedFilters = {
          ...options.filters,
          ...userScope
        };

        console.log('🔄 Fetching role-based data:', {
          endpoint: options.endpoint,
          userScope,
          combinedFilters
        });

        const params = new URLSearchParams();
        Object.entries(combinedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(`${key}[]`, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        const url = `${options.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get(url);

        setData(response.data);
        console.log('✅ Role-based data fetched successfully:', response.data);
      } catch (err: any) {
        console.error('❌ Role-based data fetch error:', err);
        setError(err.response?.data?.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    performFetch();
  }, [getUserScope, options.endpoint, JSON.stringify(options.filters), ...(options.dependencies || [])]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Regional data üçün specialized hook
 */
export function useRegionalData<T = any>(
  dataType: 'users' | 'institutions' | 'surveys' | 'departments' | 'tasks',
  filters?: Record<string, any>
) {
  return useRoleBasedData<T>({
    endpoint: `/${dataType}`,
    filters,
    autoFetch: true
  });
}

/**
 * Institution-specific data üçün hook
 */
export function useInstitutionalData<T = any>(
  institutionId: number | string,
  dataType: string,
  filters?: Record<string, any>
) {
  return useRoleBasedData<T>({
    endpoint: `/institutions/${institutionId}/${dataType}`,
    filters,
    autoFetch: !!institutionId,
    dependencies: [institutionId]
  });
}

/**
 * Scope-aware search hook
 */
export function useScopedSearch<T = any>(
  resource: string,
  searchTerm: string,
  additionalFilters?: Record<string, any>
) {
  return useRoleBasedData<T>({
    endpoint: `/${resource}/search`,
    filters: {
      q: searchTerm,
      ...additionalFilters
    },
    autoFetch: !!searchTerm,
    dependencies: [searchTerm]
  });
}