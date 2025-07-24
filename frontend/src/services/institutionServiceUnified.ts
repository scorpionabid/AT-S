// ====================
// ATİS Institution Service - Unified Version
// Extends GenericCrudService to eliminate duplication
// ====================

import { GenericCrudService, PaginatedResponse, BulkOperationResult } from './base/GenericCrudService';

// Institution interfaces
export interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  parent_id: number | null;
  level: number;
  region_code: string;
  institution_code: string;
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  metadata: {
    description?: string;
    website?: string;
  };
  is_active: boolean;
  established_date: string;
  created_at: string;
  updated_at: string;
  children?: Institution[];
  parent?: Institution;
  departments_count?: number;
  users_count?: number;
}

export interface CreateInstitutionData {
  name: string;
  short_name: string;
  type: string;
  parent_id?: number | null;
  level: number;
  region_code: string;
  institution_code: string;
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
  is_active?: boolean;
  established_date?: string;
}

export interface UpdateInstitutionData extends Partial<CreateInstitutionData> {}

export interface GetInstitutionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  parent_id?: number;
  level?: number;
  region_code?: string;
  is_active?: boolean;
  include_children?: boolean;
  include_stats?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface InstitutionHierarchy {
  id: number;
  name: string;
  type: string;
  level: number;
  children: InstitutionHierarchy[];
  departments_count: number;
  users_count: number;
}

// Institution Service Class extending GenericCrudService
class InstitutionServiceUnified extends GenericCrudService<Institution, CreateInstitutionData, UpdateInstitutionData> {
  constructor() {
    super('/institutions'); // Base endpoint
  }

  /**
   * Get institutions with enhanced filtering
   * Uses base getAll but with type-safe parameters
   */
  async getInstitutions(params?: GetInstitutionsParams): Promise<PaginatedResponse<Institution>> {
    return this.getAll(params);
  }

  /**
   * Create new institution
   * Uses base create method
   */
  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    return this.create(data);
  }

  /**
   * Update institution
   * Uses base update method
   */
  async updateInstitution(id: number, data: UpdateInstitutionData): Promise<Institution> {
    return this.update(id, data);
  }

  /**
   * Delete institution (soft delete by default)
   * Uses base softDelete method
   */
  async deleteInstitution(id: number, force: boolean = false): Promise<void> {
    if (force) {
      return this.delete(id);
    } else {
      return this.softDelete(id);
    }
  }

  /**
   * Get institution hierarchy
   * Institution-specific method
   */
  async getInstitutionHierarchy(rootId?: number): Promise<InstitutionHierarchy[]> {
    try {
      const params = rootId ? { root_id: rootId } : {};
      const response = await this.makeRequest('GET', '/hierarchy', params);
      return response.data;
    } catch (error) {
      this.handleError('Get institution hierarchy failed', error);
      throw error;
    }
  }

  /**
   * Get institution children
   * Institution-specific method
   */
  async getInstitutionChildren(id: number, params?: GetInstitutionsParams): Promise<PaginatedResponse<Institution>> {
    try {
      const response = await this.makeRequest('GET', `/${id}/children`, params);
      return response.data;
    } catch (error) {
      this.handleError('Get institution children failed', error);
      throw error;
    }
  }

  /**
   * Get institution ancestors (path to root)
   * Institution-specific method
   */
  async getInstitutionAncestors(id: number): Promise<Institution[]> {
    try {
      const response = await this.makeRequest('GET', `/${id}/ancestors`);
      return response.data;
    } catch (error) {
      this.handleError('Get institution ancestors failed', error);
      throw error;
    }
  }

  /**
   * Move institution to different parent
   * Institution-specific method
   */
  async moveInstitution(id: number, newParentId: number | null): Promise<Institution> {
    try {
      const response = await this.makeRequest('POST', `/${id}/move`, { 
        parent_id: newParentId 
      });
      return response.data;
    } catch (error) {
      this.handleError('Move institution failed', error);
      throw error;
    }
  }

  /**
   * Get institutions by type
   * Institution-specific filtering method
   */
  async getInstitutionsByType(type: string, params?: Omit<GetInstitutionsParams, 'type'>): Promise<PaginatedResponse<Institution>> {
    return this.getInstitutions({ ...params, type });
  }

  /**
   * Get institutions by region
   * Institution-specific filtering method
   */
  async getInstitutionsByRegion(regionCode: string, params?: Omit<GetInstitutionsParams, 'region_code'>): Promise<PaginatedResponse<Institution>> {
    return this.getInstitutions({ ...params, region_code: regionCode });
  }

  /**
   * Get institutions by level
   * Institution-specific filtering method
   */
  async getInstitutionsByLevel(level: number, params?: Omit<GetInstitutionsParams, 'level'>): Promise<PaginatedResponse<Institution>> {
    return this.getInstitutions({ ...params, level });
  }

  /**
   * Search institutions
   * Institution-specific search method
   */
  async searchInstitutions(query: string, params?: Omit<GetInstitutionsParams, 'search'>): Promise<PaginatedResponse<Institution>> {
    return this.getInstitutions({ ...params, search: query });
  }

  /**
   * Bulk change institution type
   * Institution-specific bulk operation
   */
  async bulkChangeType(institutionIds: number[], newType: string): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-change-type', {
        institution_ids: institutionIds,
        type: newType
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk type change failed', error);
      throw error;
    }
  }

  /**
   * Bulk move institutions
   * Institution-specific bulk operation
   */
  async bulkMoveInstitutions(institutionIds: number[], newParentId: number | null): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-move', {
        institution_ids: institutionIds,
        parent_id: newParentId
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk move failed', error);
      throw error;
    }
  }

  /**
   * Bulk activate/deactivate institutions
   * Institution-specific bulk operation
   */
  async bulkToggleStatus(institutionIds: number[], isActive: boolean): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-toggle-status', {
        institution_ids: institutionIds,
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk status toggle failed', error);
      throw error;
    }
  }

  /**
   * Get institution statistics
   * Institution-specific method
   */
  async getInstitutionStats(id?: number): Promise<{
    total_institutions: number;
    institutions_by_type: Record<string, number>;
    institutions_by_region: Record<string, number>;
    institutions_by_level: Record<string, number>;
    active_institutions: number;
    inactive_institutions: number;
    total_departments: number;
    total_users: number;
  }> {
    try {
      const endpoint = id ? `/${id}/stats` : '/stats';
      const response = await this.makeRequest('GET', endpoint);
      return response.data;
    } catch (error) {
      this.handleError('Get institution statistics failed', error);
      throw error;
    }
  }

  /**
   * Export institutions to CSV/Excel
   * Institution-specific export method
   */
  async exportInstitutions(format: 'csv' | 'excel', filters?: GetInstitutionsParams): Promise<Blob> {
    try {
      const response = await this.makeRequest('GET', `/export/${format}`, filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError('Export institutions failed', error);
      throw error;
    }
  }

  /**
   * Import institutions from CSV/Excel
   * Institution-specific import method
   */
  async importInstitutions(file: File, options?: { 
    update_existing?: boolean;
    create_hierarchy?: boolean;
  }): Promise<BulkOperationResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.update_existing) {
        formData.append('update_existing', 'true');
      }
      if (options?.create_hierarchy) {
        formData.append('create_hierarchy', 'true');
      }

      const response = await this.makeRequest('POST', '/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      this.handleError('Import institutions failed', error);
      throw error;
    }
  }

  /**
   * Validate institution code uniqueness
   * Institution-specific validation method
   */
  async validateInstitutionCode(code: string, excludeId?: number): Promise<{ is_valid: boolean; message?: string }> {
    try {
      const params = { code, exclude_id: excludeId };
      const response = await this.makeRequest('GET', '/validate-code', params);
      return response.data;
    } catch (error) {
      this.handleError('Validate institution code failed', error);
      throw error;
    }
  }

  /**
   * Get institution departments
   * Institution-specific method
   */
  async getInstitutionDepartments(id: number, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<any>> {
    try {
      const response = await this.makeRequest('GET', `/${id}/departments`, params);
      return response.data;
    } catch (error) {
      this.handleError('Get institution departments failed', error);
      throw error;
    }
  }

  /**
   * Get institution users
   * Institution-specific method
   */
  async getInstitutionUsers(id: number, params?: { page?: number; per_page?: number; role?: string }): Promise<PaginatedResponse<any>> {
    try {
      const response = await this.makeRequest('GET', `/${id}/users`, params);
      return response.data;
    } catch (error) {
      this.handleError('Get institution users failed', error);
      throw error;
    }
  }

  /**
   * Generate institution report
   * Institution-specific method
   */
  async generateInstitutionReport(id: number, reportType: 'detailed' | 'summary' | 'users' | 'departments'): Promise<Blob> {
    try {
      const response = await this.makeRequest('GET', `/${id}/report/${reportType}`, {}, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError('Generate institution report failed', error);
      throw error;
    }
  }
}

// Export singleton instance
export const institutionService = new InstitutionServiceUnified();
export default institutionService;

// Export types for external use
export type { PaginatedResponse, BulkOperationResult, InstitutionHierarchy };