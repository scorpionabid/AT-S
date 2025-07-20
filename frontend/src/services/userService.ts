import { api } from './api';
import { RoleAssignableService, PaginatedResponse } from './base/GenericCrudService';

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

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role_id: number;
  institution_id?: number;
  departments?: string[];
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  birth_date?: string;
  gender?: string;
  contact_phone?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  institution_id?: number;
  departments?: string[];
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  patronymic?: string;
  birth_date?: string;
  gender?: string;
  contact_phone?: string;
}

export interface BulkOperationResponse {
  message: string;
  updated_count: number;
  total_requested: number;
}

export interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
  total_requested: number;
}

export interface ExportResponse {
  message: string;
  format: string;
  count: number;
  data: any[];
  timestamp: string;
}

export interface BulkStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  by_role: Record<string, number>;
  by_institution: Record<string, number>;
  recent_activity: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

class UserService extends RoleAssignableService<User, CreateUserData, UpdateUserData> {
  constructor() {
    super('/users');
  }

  /**
   * Fetch paginated list of users (using inherited getAll method)
   */
  async getUsers(params: GetUsersParams = {}): Promise<{ users: PaginatedResponse<User> }> {
    const response = await this.getAll(params);
    return { users: response };
  }

  /**
   * Fetch a single user by ID with permissions
   */
  async getUser(id: number): Promise<{ user: User; permissions: string[] }> {
    try {
      const response = await api.get<{ user: User; permissions: string[] }>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<{ message: string; user: User }> {
    try {
      const response = await api.post<{ message: string; user: User }>('/users', data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<{ message: string; user: User }> {
    try {
      const response = await api.put<{ message: string; user: User }>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  resetPassword: async (id: number, newPassword: string) => {
    const response = await api.post<{ message: string }>(`/users/${id}/reset-password`, {
      new_password: newPassword
    });
    return response.data;
  },

  /**
   * Toggle user status
   */
  toggleStatus: async (id: number) => {
    const response = await api.post<{ message: string; user: User }>(`/users/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Bulk activate users
   */
  bulkActivate: async (userIds: number[]) => {
    const response = await api.post<BulkOperationResponse>('/users/bulk/activate', {
      user_ids: userIds
    });
    return response.data;
  },

  /**
   * Bulk deactivate users
   */
  bulkDeactivate: async (userIds: number[]) => {
    const response = await api.post<BulkOperationResponse>('/users/bulk/deactivate', {
      user_ids: userIds
    });
    return response.data;
  },

  /**
   * Bulk assign role to users
   */
  bulkAssignRole: async (userIds: number[], roleId: number) => {
    const response = await api.post<BulkOperationResponse>('/users/bulk/assign-role', {
      user_ids: userIds,
      role_id: roleId
    });
    return response.data;
  },

  /**
   * Bulk assign institution to users
   */
  bulkAssignInstitution: async (userIds: number[], institutionId: number) => {
    const response = await api.post<BulkOperationResponse>('/users/bulk/assign-institution', {
      user_ids: userIds,
      institution_id: institutionId
    });
    return response.data;
  },

  /**
   * Bulk delete users
   */
  bulkDelete: async (userIds: number[], confirm: boolean) => {
    const response = await api.post<BulkDeleteResponse>('/users/bulk/delete', {
      user_ids: userIds,
      confirm: confirm
    });
    return response.data;
  },

  /**
   * Export users
   */
  exportUsers: async (format: 'csv' | 'json', filters: any = {}, includeProfiles: boolean = false) => {
    const response = await api.post<ExportResponse>('/users/export', {
      format,
      filters,
      include_profiles: includeProfiles
    });
    return response.data;
  },

  /**
   * Get bulk operation statistics
   */
  async getBulkStatistics(): Promise<{ status: string; data: BulkStatistics }> {
    try {
      const response = await api.get<{ status: string; data: BulkStatistics }>('/users/bulk/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching bulk statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;