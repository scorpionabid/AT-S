// ====================
// ATİS CRUD Hook
// Eliminates CRUD operation duplication across list components
// ====================

import { useState, useEffect, useCallback } from 'react';

export interface UseCRUDOptions<T> {
  apiEndpoint: string;
  initialFilters?: Record<string, any>;
  pageSize?: number;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UseCRUDReturn<T> {
  // Data state
  data: T[];
  loading: boolean;
  error: string;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // Filters & Search
  filters: Record<string, any>;
  searchTerm: string;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  editingItem: T | null;
  deletingItem: T | null;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  
  // CRUD Operations
  fetchData: (page?: number) => Promise<void>;
  createItem: (item: Partial<T>) => Promise<void>;
  updateItem: (id: number | string, item: Partial<T>) => Promise<void>;
  deleteItem: (id: number | string, soft?: boolean) => Promise<void>;
  
  // Modal controls
  openCreateModal: () => void;
  openEditModal: (item: T) => void;
  openDeleteModal: (item: T) => void;
  closeModals: () => void;
  
  // Bulk operations
  bulkDelete: (ids: (number | string)[], soft?: boolean) => Promise<void>;
  bulkUpdate: (ids: (number | string)[], updates: Partial<T>) => Promise<void>;
  
  // Refresh
  refetch: () => Promise<void>;
}

export function useCRUD<T extends { id: number | string }>({
  apiEndpoint,
  initialFilters = {},
  pageSize = 10,
  onError,
  onSuccess
}: UseCRUDOptions<T>): UseCRUDReturn<T> {
  
  // Data state
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Build API parameters
  const buildParams = useCallback((page: number = currentPage) => {
    const params: Record<string, any> = {
      page,
      per_page: pageSize,
      ...filters
    };
    
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    
    return params;
  }, [currentPage, pageSize, filters, searchTerm]);

  // Fetch data from API
  const fetchData = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError('');
      
      const params = buildParams(page);
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${apiEndpoint}?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: PaginatedResponse<T> = await response.json();
      
      setData(result.data);
      setCurrentPage(result.meta.current_page);
      setTotalPages(result.meta.last_page);
      setTotalCount(result.meta.total);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Məlumatları yükləyərkən xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, buildParams, currentPage, onError]);

  // Create new item
  const createItem = useCallback(async (item: Partial<T>) => {
    try {
      setLoading(true);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yaradılma zamanı xəta baş verdi');
      }
      
      await fetchData(1); // Refresh first page
      closeModals();
      
      if (onSuccess) onSuccess('Məlumat uğurla yaradıldı');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Yaradılma zamanı xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, fetchData, onError, onSuccess]);

  // Update existing item
  const updateItem = useCallback(async (id: number | string, item: Partial<T>) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yenilənmə zamanı xəta baş verdi');
      }
      
      await fetchData(); // Refresh current page
      closeModals();
      
      if (onSuccess) onSuccess('Məlumat uğurla yeniləndi');
      
    } catch (err: any) {
      const errorMessage = err.message || 'Yenilənmə zamanı xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, fetchData, onError, onSuccess]);

  // Delete item
  const deleteItem = useCallback(async (id: number | string, soft: boolean = true) => {
    try {
      setLoading(true);
      
      const endpoint = soft ? `${apiEndpoint}/${id}/soft-delete` : `${apiEndpoint}/${id}`;
      const method = soft ? 'POST' : 'DELETE';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Silinmə zamanı xəta baş verdi');
      }
      
      await fetchData(); // Refresh current page
      closeModals();
      
      const message = soft ? 'Məlumat uğurla arxivləndi' : 'Məlumat uğurla silindi';
      if (onSuccess) onSuccess(message);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Silinmə zamanı xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, fetchData, onError, onSuccess]);

  // Bulk delete
  const bulkDelete = useCallback(async (ids: (number | string)[], soft: boolean = true) => {
    try {
      setLoading(true);
      
      const endpoint = soft ? `${apiEndpoint}/bulk-soft-delete` : `${apiEndpoint}/bulk-delete`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Toplu silinmə zamanı xəta baş verdi');
      }
      
      await fetchData(); // Refresh current page
      
      const message = soft ? 
        `${ids.length} məlumat uğurla arxivləndi` : 
        `${ids.length} məlumat uğurla silindi`;
      if (onSuccess) onSuccess(message);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Toplu silinmə zamanı xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, fetchData, onError, onSuccess]);

  // Bulk update
  const bulkUpdate = useCallback(async (ids: (number | string)[], updates: Partial<T>) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${apiEndpoint}/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, updates }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Toplu yenilənmə zamanı xəta baş verdi');
      }
      
      await fetchData(); // Refresh current page
      
      if (onSuccess) onSuccess(`${ids.length} məlumat uğurla yeniləndi`);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Toplu yenilənmə zamanı xəta baş verdi';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, fetchData, onError, onSuccess]);

  // Filter functions
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  }, [initialFilters]);

  // Modal controls
  const openCreateModal = useCallback(() => {
    setShowCreateModal(true);
    setError('');
  }, []);

  const openEditModal = useCallback((item: T) => {
    setEditingItem(item);
    setShowEditModal(true);
    setError('');
  }, []);

  const openDeleteModal = useCallback((item: T) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
    setError('');
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingItem(null);
    setDeletingItem(null);
    setError('');
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Refetch (alias for fetchData)
  const refetch = useCallback(() => fetchData(), [fetchData]);

  // Initial data fetch and dependencies
  useEffect(() => {
    fetchData();
  }, [currentPage, filters, searchTerm]);

  return {
    // Data state
    data,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalCount,
    
    // Filters & Search
    filters,
    searchTerm,
    
    // Modal states
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingItem,
    deletingItem,
    
    // Actions
    setCurrentPage: handlePageChange,
    setSearchTerm: handleSearchChange,
    setFilters: handleFiltersChange,
    updateFilter,
    clearFilters,
    
    // CRUD Operations
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    
    // Modal controls
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
    
    // Bulk operations
    bulkDelete,
    bulkUpdate,
    
    // Refresh
    refetch
  };
}

export default useCRUD;