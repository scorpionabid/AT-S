/**
 * ATİS Universal Hook Factory
 * Common hook patterns üçün factory functions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GenericCrudService } from '../services/base/GenericCrudService';
import type { PaginatedResponse } from '../services/base/GenericCrudService';

// Generic API state interface
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

// List state interface
export interface ListState<T> {
  items: T[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  } | null;
  loading: boolean;
  error: string | null;
  selectedItems: T[];
  filters: Record<string, any>;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
}

// CRUD operations interface
export interface CrudOperations<T> {
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: number | string, data: Partial<T>) => Promise<T | null>;
  delete: (id: number | string) => Promise<boolean>;
  bulkDelete: (ids: (number | string)[]) => Promise<boolean>;
}

// Hook Factory Class
export class HookFactory {
  /**
   * Creates a data fetching hook
   */
  static createDataHook<T>(
    fetchFunction: () => Promise<T>,
    dependencies: any[] = [],
    options: {
      cacheTime?: number;
      refetchOnMount?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
    } = {}
  ) {
    return function useData(): ApiState<T> & {
      refetch: () => Promise<void>;
      invalidate: () => void;
    } {
      const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: true,
        error: null,
        lastFetch: null
      });

      const { cacheTime = 300000, refetchOnMount = true, onSuccess, onError } = options;
      const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

      const fetchData = useCallback(async () => {
        // Check cache first
        if (cacheRef.current && cacheTime > 0) {
          const age = Date.now() - cacheRef.current.timestamp;
          if (age < cacheTime) {
            setState({
              data: cacheRef.current.data,
              loading: false,
              error: null,
              lastFetch: cacheRef.current.timestamp
            });
            return;
          }
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
          const data = await fetchFunction();
          const timestamp = Date.now();
          
          // Update cache
          cacheRef.current = { data, timestamp };
          
          setState({
            data,
            loading: false,
            error: null,
            lastFetch: timestamp
          });

          onSuccess?.(data);
        } catch (error: any) {
          const errorMessage = error.message || 'Xəta baş verdi';
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage
          }));
          onError?.(errorMessage);
        }
      }, dependencies);

      const invalidate = useCallback(() => {
        cacheRef.current = null;
      }, []);

      useEffect(() => {
        if (refetchOnMount) {
          fetchData();
        }
      }, [fetchData, refetchOnMount]);

      return {
        ...state,
        refetch: fetchData,
        invalidate
      };
    };
  }

  /**
   * Creates a list management hook with CRUD operations
   */
  static createListHook<T extends { id: number | string }>(
    service: GenericCrudService<T>,
    options: {
      initialFilters?: Record<string, any>;
      initialSort?: { field: string; order: 'asc' | 'desc' };
      pageSize?: number;
      onSuccess?: (operation: string, data?: any) => void;
      onError?: (operation: string, error: string) => void;
    } = {}
  ) {
    return function useList() {
      const {
        initialFilters = {},
        initialSort = { field: 'id', order: 'desc' },
        pageSize = 20,
        onSuccess,
        onError
      } = options;

      const [state, setState] = useState<ListState<T>>({
        items: [],
        pagination: null,
        loading: false,
        error: null,
        selectedItems: [],
        filters: initialFilters,
        sortBy: initialSort.field,
        sortOrder: initialSort.order
      });

      // Fetch items
      const fetchItems = useCallback(async (page: number = 1) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
          const params = {
            page,
            per_page: pageSize,
            sort_by: state.sortBy,
            sort_order: state.sortOrder,
            ...state.filters
          };

          const response = await service.getAll(params);
          
          setState(prev => ({
            ...prev,
            items: response.data,
            pagination: response.meta ? {
              currentPage: response.meta.current_page,
              lastPage: response.meta.last_page,
              perPage: response.meta.per_page,
              total: response.meta.total
            } : null,
            loading: false
          }));

          onSuccess?.('fetch', response);
        } catch (error: any) {
          const errorMessage = error.message || 'Məlumatları yükləyərkən xəta';
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          onError?.('fetch', errorMessage);
        }
      }, [state.sortBy, state.sortOrder, state.filters, pageSize, service, onSuccess, onError]);

      // CRUD operations
      const operations: CrudOperations<T> = {
        create: async (data: Partial<T>) => {
          try {
            const created = await service.create(data);
            setState(prev => ({ ...prev, items: [created, ...prev.items] }));
            onSuccess?.('create', created);
            return created;
          } catch (error: any) {
            const errorMessage = error.message || 'Yaradılarkən xəta';
            onError?.('create', errorMessage);
            return null;
          }
        },

        update: async (id: number | string, data: Partial<T>) => {
          try {
            const updated = await service.update(id, data);
            setState(prev => ({
              ...prev,
              items: prev.items.map(item => item.id === id ? updated : item)
            }));
            onSuccess?.('update', updated);
            return updated;
          } catch (error: any) {
            const errorMessage = error.message || 'Yenilənərkən xəta';
            onError?.('update', errorMessage);
            return null;
          }
        },

        delete: async (id: number | string) => {
          try {
            await service.delete(id);
            setState(prev => ({
              ...prev,
              items: prev.items.filter(item => item.id !== id),
              selectedItems: prev.selectedItems.filter(item => item.id !== id)
            }));
            onSuccess?.('delete', { id });
            return true;
          } catch (error: any) {
            const errorMessage = error.message || 'Silinərkən xəta';
            onError?.('delete', errorMessage);
            return false;
          }
        },

        bulkDelete: async (ids: (number | string)[]) => {
          try {
            await service.bulkDelete(ids.map(id => Number(id)));
            setState(prev => ({
              ...prev,
              items: prev.items.filter(item => !ids.includes(item.id)),
              selectedItems: []
            }));
            onSuccess?.('bulkDelete', { ids });
            return true;
          } catch (error: any) {
            const errorMessage = error.message || 'Toplu silmə zamanı xəta';
            onError?.('bulkDelete', errorMessage);
            return false;
          }
        }
      };

      // Selection management
      const toggleSelection = useCallback((item: T) => {
        setState(prev => {
          const isSelected = prev.selectedItems.some(selected => selected.id === item.id);
          return {
            ...prev,
            selectedItems: isSelected
              ? prev.selectedItems.filter(selected => selected.id !== item.id)
              : [...prev.selectedItems, item]
          };
        });
      }, []);

      const selectAll = useCallback(() => {
        setState(prev => ({ ...prev, selectedItems: [...prev.items] }));
      }, []);

      const clearSelection = useCallback(() => {
        setState(prev => ({ ...prev, selectedItems: [] }));
      }, []);

      // Filtering and sorting
      const updateFilters = useCallback((newFilters: Record<string, any>) => {
        setState(prev => ({ ...prev, filters: { ...prev.filters, ...newFilters } }));
      }, []);

      const updateSort = useCallback((field: string, order?: 'asc' | 'desc') => {
        setState(prev => ({
          ...prev,
          sortBy: field,
          sortOrder: order || (prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc')
        }));
      }, []);

      const clearFilters = useCallback(() => {
        setState(prev => ({ ...prev, filters: initialFilters }));
      }, [initialFilters]);

      // Load data on mount and when filters/sort change
      useEffect(() => {
        fetchItems(1);
      }, [fetchItems]);

      return {
        ...state,
        operations,
        fetchItems,
        toggleSelection,
        selectAll,
        clearSelection,
        updateFilters,
        updateSort,
        clearFilters,
        refresh: () => fetchItems(state.pagination?.currentPage || 1)
      };
    };
  }

  /**
   * Creates a form submission hook
   */
  static createSubmitHook<TData, TResponse = TData>(
    submitFunction: (data: TData) => Promise<TResponse>,
    options: {
      onSuccess?: (response: TResponse) => void;
      onError?: (error: string) => void;
      resetOnSuccess?: boolean;
    } = {}
  ) {
    return function useSubmit() {
      const [submitting, setSubmitting] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [success, setSuccess] = useState(false);

      const { onSuccess, onError, resetOnSuccess = true } = options;

      const submit = useCallback(async (data: TData): Promise<TResponse | null> => {
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
          const response = await submitFunction(data);
          setSuccess(true);
          onSuccess?.(response);
          
          if (resetOnSuccess) {
            setTimeout(() => setSuccess(false), 3000);
          }
          
          return response;
        } catch (error: any) {
          const errorMessage = error.message || 'Xəta baş verdi';
          setError(errorMessage);
          onError?.(errorMessage);
          return null;
        } finally {
          setSubmitting(false);
        }
      }, [submitFunction, onSuccess, onError, resetOnSuccess]);

      const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
        setSubmitting(false);
      }, []);

      return {
        submit,
        submitting,
        error,
        success,
        reset
      };
    };
  }

  /**
   * Creates a toggle hook for boolean states
   */
  static createToggleHook(initialValue: boolean = false) {
    return function useToggle() {
      const [value, setValue] = useState(initialValue);

      const toggle = useCallback(() => setValue(prev => !prev), []);
      const setTrue = useCallback(() => setValue(true), []);
      const setFalse = useCallback(() => setValue(false), []);

      return {
        value,
        toggle,
        setTrue,
        setFalse,
        setValue
      };
    };
  }

  /**
   * Creates a local storage hook
   */
  static createLocalStorageHook<T>(key: string, defaultValue: T) {
    return function useLocalStorage() {
      const [value, setValue] = useState<T>(() => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
        } catch {
          return defaultValue;
        }
      });

      const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
        setValue(prev => {
          const valueToStore = typeof newValue === 'function' 
            ? (newValue as (prev: T) => T)(prev)
            : newValue;
          
          try {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.error(`LocalStorage write error for key "${key}":`, error);
          }
          
          return valueToStore;
        });
      }, [key]);

      const removeValue = useCallback(() => {
        try {
          localStorage.removeItem(key);
          setValue(defaultValue);
        } catch (error) {
          console.error(`LocalStorage remove error for key "${key}":`, error);
        }
      }, [key, defaultValue]);

      return {
        value,
        setValue: setStoredValue,
        removeValue
      };
    };
  }

  /**
   * Creates a debounced value hook
   */
  static createDebounceHook<T>(delay: number = 300) {
    return function useDebounce(value: T) {
      const [debouncedValue, setDebouncedValue] = useState<T>(value);

      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);

      return debouncedValue;
    };
  }

  /**
   * Creates a pagination hook
   */
  static createPaginationHook(initialPage: number = 1, initialPageSize: number = 20) {
    return function usePagination() {
      const [currentPage, setCurrentPage] = useState(initialPage);
      const [pageSize, setPageSize] = useState(initialPageSize);

      const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, page));
      }, []);

      const nextPage = useCallback(() => {
        setCurrentPage(prev => prev + 1);
      }, []);

      const prevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }, []);

      const reset = useCallback(() => {
        setCurrentPage(initialPage);
      }, [initialPage]);

      return {
        currentPage,
        pageSize,
        setPageSize,
        goToPage,
        nextPage,
        prevPage,
        reset
      };
    };
  }
}

export default HookFactory;