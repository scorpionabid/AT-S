// ====================
// ATİS User Service - Unified Version
// Extends GenericCrudService to eliminate duplication
// ====================

import { GenericCrudService, PaginatedResponse, BulkOperationResult } from './base/GenericCrudService';

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role_id?: number;
  institution_id?: number;
  departments?: string[];
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  role?: {
    id: number;
    name: string;
    display_name: string;
    level: number;
  };
  institution?: {
    id: number;
    name: string;
    type: string;
  };
  profile?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    contact_phone?: string;
    patronymic?: string;
    birth_date?: string;
    gender?: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role_id: number;
  institution_id: number;
  departments?: string[];
  profile?: {
    first_name?: string;
    last_name?: string;
    contact_phone?: string;
    patronymic?: string;
    birth_date?: string;
    gender?: string;
  };
  is_active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role_id?: number;
  institution_id?: number;
  departments?: string[];
  profile?: {
    first_name?: string;
    last_name?: string;
    contact_phone?: string;
    patronymic?: string;
    birth_date?: string;
    gender?: string;
  };
  is_active?: boolean;
}

export interface GetUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  institution_id?: number;
  department?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// User Service Class extending GenericCrudService
class UserServiceUnified extends GenericCrudService<User, CreateUserData, UpdateUserData> {
  constructor() {
    super('/users'); // Base endpoint
  }

  /**
   * Get users with enhanced filtering
   * Uses base getAll but with type-safe parameters
   */
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    return this.getAll(params);
  }

  /**
   * Create new user
   * Uses base create method
   */
  async createUser(data: CreateUserData): Promise<User> {
    return this.create(data);
  }

  /**
   * Update user
   * Uses base update method
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return this.update(id, data);
  }

  /**
   * Delete user (soft delete by default)
   * Uses base softDelete method
   */
  async deleteUser(id: number, force: boolean = false): Promise<void> {
    if (force) {
      return this.delete(id);
    } else {
      return this.softDelete(id);
    }
  }

  /**
   * Toggle user status (active/inactive)
   * User-specific method
   */
  async toggleUserStatus(id: number): Promise<User> {
    try {
      const response = await this.makeRequest('POST', `/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      this.handleError('Toggle user status failed', error);
      throw error;
    }
  }

  /**
   * Reset user password
   * User-specific method
   */
  async resetPassword(id: number, newPassword?: string): Promise<{ password: string }> {
    try {
      const payload = newPassword ? { password: newPassword } : {};
      const response = await this.makeRequest('POST', `/${id}/reset-password`, payload);
      return response.data;
    } catch (error) {
      this.handleError('Reset password failed', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * User-specific method
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.makeRequest('POST', '/password-reset', { email });
    } catch (error) {
      this.handleError('Send password reset email failed', error);
      throw error;
    }
  }

  /**
   * Bulk assign roles to users
   * User-specific bulk operation
   */
  async bulkAssignRole(userIds: number[], roleId: number): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-assign-role', {
        user_ids: userIds,
        role_id: roleId
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk role assignment failed', error);
      throw error;
    }
  }

  /**
   * Bulk change institution for users
   * User-specific bulk operation
   */
  async bulkChangeInstitution(userIds: number[], institutionId: number): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-change-institution', {
        user_ids: userIds,
        institution_id: institutionId
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk institution change failed', error);
      throw error;
    }
  }

  /**
   * Bulk activate/deactivate users
   * User-specific bulk operation
   */
  async bulkToggleStatus(userIds: number[], isActive: boolean): Promise<BulkOperationResult> {
    try {
      const response = await this.makeRequest('POST', '/bulk-toggle-status', {
        user_ids: userIds,
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      this.handleError('Bulk status toggle failed', error);
      throw error;
    }
  }

  /**
   * Get user permissions
   * User-specific method
   */
  async getUserPermissions(id: number): Promise<string[]> {
    try {
      const response = await this.makeRequest('GET', `/${id}/permissions`);
      return response.data;
    } catch (error) {
      this.handleError('Get user permissions failed', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * User-specific filtering method
   */
  async getUsersByRole(role: string, params?: Omit<GetUsersParams, 'role'>): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, role });
  }

  /**
   * Get users by institution
   * User-specific filtering method
   */
  async getUsersByInstitution(institutionId: number, params?: Omit<GetUsersParams, 'institution_id'>): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, institution_id: institutionId });
  }

  /**
   * Search users by name or email
   * User-specific search method
   */
  async searchUsers(query: string, params?: Omit<GetUsersParams, 'search'>): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, search: query });
  }

  /**
   * Export users to CSV/Excel
   * User-specific export method
   */
  async exportUsers(format: 'csv' | 'excel', filters?: GetUsersParams): Promise<Blob> {
    try {
      const response = await this.makeRequest('GET', `/export/${format}`, filters, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError('Export users failed', error);
      throw error;
    }
  }

  /**
   * Import users from CSV/Excel
   * User-specific import method
   */
  async importUsers(file: File, options?: { update_existing?: boolean }): Promise<BulkOperationResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.update_existing) {
        formData.append('update_existing', 'true');
      }

      const response = await this.makeRequest('POST', '/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      this.handleError('Import users failed', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   * User-specific method
   */
  async getUserActivityLog(id: number, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<any>> {
    try {
      const response = await this.makeRequest('GET', `/${id}/activity-log`, params);
      return response.data;
    } catch (error) {
      this.handleError('Get user activity log failed', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * User-specific method
   */
  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    users_by_role: Record<string, number>;
    users_by_institution: Record<string, number>;
    recent_logins: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/stats');
      return response.data;
    } catch (error) {
      this.handleError('Get user statistics failed', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserServiceUnified();
export default userService;

// Export types for external use
export type { PaginatedResponse, BulkOperationResult };