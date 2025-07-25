// ====================
// ATİS Generic CRUD Service
// Base class for eliminating API service duplication
// ====================

import { api } from '../api';

// Generic interfaces for CRUD operations
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface BulkOperationResult {
  message: string;
  success_count: number;
  total_count: number;
  errors: string[];
  successful_items?: any[];
  failed_items?: any[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

// Generic CRUD Service Base Class
export class GenericCrudService<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  constructor(protected endpoint: string) {}

  /**
   * Get all items with optional pagination and filtering
   */
  async getAll(params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get(this.endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get a single item by ID
   */
  async getById(id: number | string): Promise<T> {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new item
   */
  async create(data: CreateT): Promise<T> {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing item
   */
  async update(id: number | string, data: UpdateT): Promise<T> {
    try {
      const response = await api.put(`${this.endpoint}/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  async delete(id: number | string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk activate items
   */
  async bulkActivate(ids: number[]): Promise<BulkOperationResult> {
    try {
      const response = await api.post(`${this.endpoint}/bulk/activate`, { ids });
      return response.data;
    } catch (error) {
      console.error(`Error bulk activating ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Bulk deactivate items
   */
  async bulkDeactivate(ids: number[]): Promise<BulkOperationResult> {
    try {
      const response = await api.post(`${this.endpoint}/bulk/deactivate`, { ids });
      return response.data;
    } catch (error) {
      console.error(`Error bulk deactivating ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: number[], confirm: boolean = false): Promise<BulkOperationResult> {
    try {
      const response = await api.post(`${this.endpoint}/bulk/delete`, { ids, confirm });
      return response.data;
    } catch (error) {
      console.error(`Error bulk deleting ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Search items with query
   */
  async search(query: string, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get(`${this.endpoint}/search`, { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Export items to file
   */
  async export(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: any): Promise<Blob> {
    try {
      const response = await api.get(`${this.endpoint}/export`, {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for the resource
   */
  async getStats(params?: any): Promise<any> {
    try {
      const response = await api.get(`${this.endpoint}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint} stats:`, error);
      throw error;
    }
  }
}

// Specialized service for resources that support role assignment
export class RoleAssignableService<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  extends GenericCrudService<T, CreateT, UpdateT> {

  /**
   * Bulk assign role to items
   */
  async bulkAssignRole(ids: number[], roleId: number): Promise<BulkOperationResult> {
    try {
      const response = await api.post(`${this.endpoint}/bulk/assign-role`, { 
        ids, 
        role_id: roleId 
      });
      return response.data;
    } catch (error) {
      console.error(`Error bulk assigning role for ${this.endpoint}:`, error);
      throw error;
    }
  }
}

// Specialized service for hierarchical resources (like institutions)
export class HierarchicalService<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  extends GenericCrudService<T, CreateT, UpdateT> {

  /**
   * Get children of a parent item
   */
  async getChildren(parentId: number | string, params?: any): Promise<T[]> {
    try {
      const response = await api.get(`${this.endpoint}/${parentId}/children`, { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching children for ${this.endpoint}/${parentId}:`, error);
      throw error;
    }
  }

  /**
   * Get hierarchy tree
   */
  async getHierarchy(params?: any): Promise<T[]> {
    try {
      const response = await api.get(`${this.endpoint}/hierarchy`, { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching hierarchy for ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Bulk assign parent to items
   */
  async bulkAssignParent(ids: number[], parentId: number): Promise<BulkOperationResult> {
    try {
      const response = await api.post(`${this.endpoint}/bulk/assign-parent`, { 
        ids, 
        parent_id: parentId 
      });
      return response.data;
    } catch (error) {
      console.error(`Error bulk assigning parent for ${this.endpoint}:`, error);
      throw error;
    }
  }
}

export default GenericCrudService;