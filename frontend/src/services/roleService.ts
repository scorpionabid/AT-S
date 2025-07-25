import { api } from './api';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  department_access?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  category: string;
  description?: string;
}

export interface GetRolesResponse {
  roles: Role[];
}

export interface GetPermissionsResponse {
  permissions: Permission[];
}

export const roleService = {
  /**
   * Fetch all roles
   */
  getRoles: async () => {
    const response = await api.get<GetRolesResponse>('/roles');
    return response.data;
  },

  /**
   * Fetch a single role by ID
   */
  getRole: async (id: number) => {
    const response = await api.get<{ role: Role; permissions: Permission[] }>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Create a new role
   */
  createRole: async (data: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ message: string; role: Role }>('/roles', data);
    return response.data;
  },

  /**
   * Update an existing role
   */
  updateRole: async (id: number, data: Partial<Role>) => {
    const response = await api.put<{ message: string; role: Role }>(`/roles/${id}`, data);
    return response.data;
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/roles/${id}`);
    return response.data;
  },

  /**
   * Fetch all permissions
   */
  getPermissions: async () => {
    const response = await api.get<GetPermissionsResponse>('/permissions');
    return response.data;
  }
};

export default roleService;