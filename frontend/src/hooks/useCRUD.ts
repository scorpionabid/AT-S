import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export interface CRUDState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface CRUDFilters {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface CRUDOperations<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  // State
  state: CRUDState<T>;
  
  // Read operations
  fetchData: (filters?: CRUDFilters) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Create operations
  createItem: (data: CreateData) => Promise<T>;
  
  // Update operations
  updateItem: (id: number, data: UpdateData) => Promise<T>;
  
  // Delete operations
  deleteItem: (id: number) => Promise<void>;
  bulkDelete: (ids: number[]) => Promise<void>;
  
  // Search and filter
  setFilters: (filters: CRUDFilters) => void;
  clearFilters: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  
  // Sorting
  setSort: (field: string, order: 'asc' | 'desc') => void;
  
  // Utility
  findItem: (id: number) => T | undefined;
  getSelectedItems: (ids: number[]) => T[];
}

export interface UseCRUDOptions {
  endpoint: string;
  initialFilters?: CRUDFilters;
  autoFetch?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function useCRUD<T extends { id: number }, CreateData = Partial<T>, UpdateData = Partial<T>>(
  options: UseCRUDOptions
): CRUDOperations<T, CreateData, UpdateData> {
  const {
    endpoint,
    initialFilters = { page: 1, per_page: 10 },
    autoFetch = true,
    onError,
    onSuccess
  } = options;

  // State management
  const [state, setState] = useState<CRUDState<T>>({
    data: [],
    loading: autoFetch,
    error: null,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0
    }
  });

  const [currentFilters, setCurrentFilters] = useState<CRUDFilters>(initialFilters);

  // Fetch data
  const fetchData = useCallback(async (filters: CRUDFilters = currentFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log(`🔄 Fetching data from ${endpoint} with filters:`, filters);
      
      const response = await api.get(endpoint, { 
        params: {
          ...filters,
          // Ensure pagination params are present
          page: filters.page || 1,
          per_page: filters.per_page || 10
        }
      });
      
      console.log('✅ Data fetched successfully:', response.data);
      
      // Handle different response structures
      let data: T[];
      let meta;
      
      if (response.data.data) {
        // Laravel pagination format
        data = response.data.data;
        meta = response.data.meta || response.data;
      } else if (Array.isArray(response.data)) {
        // Simple array format
        data = response.data;
        meta = {
          current_page: 1,
          last_page: 1,
          per_page: data.length,
          total: data.length,
          from: 1,
          to: data.length
        };
      } else {
        // Custom format (institutions, users, etc.)
        const keys = Object.keys(response.data);
        const dataKey = keys.find(key => Array.isArray(response.data[key]));
        
        if (dataKey) {
          data = response.data[dataKey];
          meta = response.data.meta || {
            current_page: 1,
            last_page: 1,
            per_page: data.length,
            total: data.length,
            from: 1,
            to: data.length
          };
        } else {
          throw new Error('Invalid response format');
        }
      }
      
      setState(prev => ({
        ...prev,
        data,
        meta,
        loading: false,
        error: null
      }));
      
      // Update current filters
      setCurrentFilters(filters);
      
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Məlumat yüklənərkən xəta baş verdi';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      onError?.(errorMessage);
    }
  }, [endpoint, currentFilters, onError]);

  // Refresh data with current filters
  const refreshData = useCallback(() => {
    return fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  // Create item
  const createItem = useCallback(async (data: CreateData): Promise<T> => {
    try {
      console.log(`🆕 Creating new item at ${endpoint}:`, data);
      
      const response = await api.post(endpoint, data);
      const newItem = response.data.data || response.data;
      
      console.log('✅ Item created successfully:', newItem);
      
      // Add to current data if on first page
      if (state.meta.current_page === 1) {
        setState(prev => ({
          ...prev,
          data: [newItem, ...prev.data.slice(0, prev.meta.per_page - 1)],
          meta: {
            ...prev.meta,
            total: prev.meta.total + 1
          }
        }));
      }
      
      onSuccess?.('Məlumat uğurla əlavə edildi');
      return newItem;
      
    } catch (error: any) {
      console.error('❌ Error creating item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Məlumat əlavə edilərkən xəta baş verdi';
      onError?.(errorMessage);
      throw error;
    }
  }, [endpoint, state.meta, onSuccess, onError]);

  // Update item
  const updateItem = useCallback(async (id: number, data: UpdateData): Promise<T> => {
    try {
      console.log(`✏️ Updating item ${id} at ${endpoint}:`, data);
      
      const response = await api.put(`${endpoint}/${id}`, data);
      const updatedItem = response.data.data || response.data;
      
      console.log('✅ Item updated successfully:', updatedItem);
      
      // Update in current data
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => 
          item.id === id ? updatedItem : item
        )
      }));
      
      onSuccess?.('Məlumat uğurla yeniləndi');
      return updatedItem;
      
    } catch (error: any) {
      console.error('❌ Error updating item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Məlumat yenilənərkən xəta baş verdi';
      onError?.(errorMessage);
      throw error;
    }
  }, [endpoint, onSuccess, onError]);

  // Delete item
  const deleteItem = useCallback(async (id: number): Promise<void> => {
    try {
      console.log(`🗑️ Deleting item ${id} at ${endpoint}`);
      
      await api.delete(`${endpoint}/${id}`);
      
      console.log('✅ Item deleted successfully');
      
      // Remove from current data
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => item.id !== id),
        meta: {
          ...prev.meta,
          total: prev.meta.total - 1
        }
      }));
      
      onSuccess?.('Məlumat uğurla silindi');
      
    } catch (error: any) {
      console.error('❌ Error deleting item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Məlumat silinərkən xəta baş verdi';
      onError?.(errorMessage);
      throw error;
    }
  }, [endpoint, onSuccess, onError]);

  // Bulk delete
  const bulkDelete = useCallback(async (ids: number[]): Promise<void> => {
    try {
      console.log(`🗑️ Bulk deleting items at ${endpoint}:`, ids);
      
      await api.post(`${endpoint}/bulk-delete`, { ids });
      
      console.log('✅ Items deleted successfully');
      
      // Remove from current data
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => !ids.includes(item.id)),
        meta: {
          ...prev.meta,
          total: prev.meta.total - ids.length
        }
      }));
      
      onSuccess?.(`${ids.length} məlumat uğurla silindi`);
      
    } catch (error: any) {
      console.error('❌ Error bulk deleting items:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Məlumatlar silinərkən xəta baş verdi';
      onError?.(errorMessage);
      throw error;
    }
  }, [endpoint, onSuccess, onError]);

  // Filter management
  const setFilters = useCallback((filters: CRUDFilters) => {
    const newFilters = { ...currentFilters, ...filters };
    setCurrentFilters(newFilters);
    fetchData(newFilters);
  }, [currentFilters, fetchData]);

  const clearFilters = useCallback(() => {
    const clearedFilters = { 
      page: 1, 
      per_page: currentFilters.per_page || 10 
    };
    setCurrentFilters(clearedFilters);
    fetchData(clearedFilters);
  }, [currentFilters.per_page, fetchData]);

  // Pagination helpers
  const setPage = useCallback((page: number) => {
    setFilters({ page });
  }, [setFilters]);

  const setPerPage = useCallback((per_page: number) => {
    setFilters({ page: 1, per_page });
  }, [setFilters]);

  // Sorting helpers
  const setSort = useCallback((field: string, order: 'asc' | 'desc') => {
    setFilters({ sort_field: field, sort_order: order });
  }, [setFilters]);

  // Utility functions
  const findItem = useCallback((id: number): T | undefined => {
    return state.data.find(item => item.id === id);
  }, [state.data]);

  const getSelectedItems = useCallback((ids: number[]): T[] => {
    return state.data.filter(item => ids.includes(item.id));
  }, [state.data]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData(initialFilters);
    }
  }, []); // Only run on mount

  return {
    state,
    fetchData,
    refreshData,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    setFilters,
    clearFilters,
    setPage,
    setPerPage,
    setSort,
    findItem,
    getSelectedItems
  };
}

export default useCRUD;