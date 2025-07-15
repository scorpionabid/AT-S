import { api } from './api';

export interface Institution {
  id: number;
  name: string;
  short_name?: string;
  type: string;
  level: number;
  institution_code: string;
  region_code?: string;
  established_date?: string;
  is_active: boolean;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  parent?: Institution;
  children?: Institution[];
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  metadata?: {
    description?: string;
    website?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface GetInstitutionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  level?: number;
  is_active?: boolean;
  parent_id?: number | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const institutionService = {
  /**
   * Fetch paginated list of institutions
   */
  getInstitutions: async (params: GetInstitutionsParams = {}) => {
    const response = await api.get<PaginatedResponse<Institution>>('/institutions', { params });
    return response.data;
  },

  /**
   * Fetch a single institution by ID
   */
  getInstitution: async (id: number) => {
    const response = await api.get<{ data: Institution }>(`/institutions/${id}`);
    return response.data.data;
  },

  /**
   * Create a new institution
   */
  createInstitution: async (data: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ data: Institution }>('/institutions', data);
    return response.data.data;
  },

  /**
   * Update an existing institution
   */
  updateInstitution: async (id: number, data: Partial<Institution>) => {
    const response = await api.put<{ data: Institution }>(`/institutions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an institution
   */
  deleteInstitution: async (id: number) => {
    await api.delete(`/institutions/${id}`);
    return true;
  },

  /**
   * Toggle institution active status
   */
  toggleStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch<{ data: Institution }>(`/institutions/${id}/status`, {
      is_active: isActive,
    });
    return response.data.data;
  },

  /**
   * Get institution types
   */
  getInstitutionTypes: async () => {
    // This would typically come from an API endpoint
    return [
      { value: 'ministry', label: 'Nazirlik' },
      { value: 'region', label: 'Regional İdarə' },
      { value: 'sektor', label: 'Sektor' },
      { value: 'school', label: 'Məktəb' },
      { value: 'vocational', label: 'Peşə Məktəbi' },
      { value: 'university', label: 'Universitet' },
    ];
  },

  /**
   * Get institution levels
   */
  getInstitutionLevels: async () => {
    // This would typically come from an API endpoint
    return [
      { value: 1, label: 'Səviyyə 1 - Nazirlik' },
      { value: 2, label: 'Səviyyə 2 - Regional' },
      { value: 3, label: 'Səviyyə 3 - Sektor' },
      { value: 4, label: 'Səviyyə 4 - Məktəb' },
      { value: 5, label: 'Səviyyə 5 - Şöbə' },
    ];
  },

  /**
   * Search institutions by name or code
   */
  searchInstitutions: async (query: string) => {
    const response = await api.get<Institution[]>('/institutions/search', {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Bulk activate institutions
   */
  bulkActivate: async (institutionIds: number[]) => {
    const response = await api.post<{ message: string; updated_count: number; total_requested: number }>('/institutions/bulk/activate', {
      institution_ids: institutionIds
    });
    return response.data;
  },

  /**
   * Bulk deactivate institutions
   */
  bulkDeactivate: async (institutionIds: number[]) => {
    const response = await api.post<{ message: string; updated_count: number; total_requested: number }>('/institutions/bulk/deactivate', {
      institution_ids: institutionIds
    });
    return response.data;
  },

  /**
   * Bulk assign parent institution
   */
  bulkAssignParent: async (institutionIds: number[], parentId: number) => {
    const response = await api.post<{ message: string; updated_count: number; total_requested: number }>('/institutions/bulk/assign-parent', {
      institution_ids: institutionIds,
      parent_id: parentId
    });
    return response.data;
  },

  /**
   * Bulk update institution type
   */
  bulkUpdateType: async (institutionIds: number[], type: string) => {
    const response = await api.post<{ message: string; updated_count: number; total_requested: number; new_type: string; new_level: number }>('/institutions/bulk/update-type', {
      institution_ids: institutionIds,
      type: type
    });
    return response.data;
  },

  /**
   * Export institutions
   */
  exportInstitutions: async (format: 'csv' | 'json', filters: any = {}, includeHierarchy: boolean = false) => {
    const response = await api.post<{ message: string; format: string; count: number; data: any[]; timestamp: string }>('/institutions/export', {
      format,
      filters,
      include_hierarchy: includeHierarchy
    });
    return response.data;
  },

  /**
   * Get bulk operation statistics
   */
  getBulkStatistics: async () => {
    const response = await api.get<{ status: string; data: any }>('/institutions/bulk/statistics');
    return response.data;
  },
};

export default institutionService;
