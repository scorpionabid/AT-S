// ====================
// ATİS Unified Role Service
// Eliminates role/permission service duplication
// ====================

import { GenericCrudService } from './base/GenericCrudService';
import { api } from './api';
import { ATİSTypes } from '../types/shared';

// Re-export shared types for consistency
export type Role = ATİSTypes.Role;
export type Permission = ATİSTypes.Permission;

// Role-specific types
export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
  level: number;
  department_access?: string;
  permissions?: number[];
}

export interface UpdateRoleData {
  name?: string;
  display_name?: string;
  description?: string;
  level?: number;
  department_access?: string;
  permissions?: number[];
}

export interface GetRolesParams {
  page?: number;
  per_page?: number;
  search?: string;
  level?: number;
  department?: string;
  sort_by?: 'name' | 'display_name' | 'level' | 'created_at';
  sort_direction?: 'asc' | 'desc';
}

export interface GetPermissionsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  sort_by?: 'name' | 'display_name' | 'category';
  sort_direction?: 'asc' | 'desc';
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface AssignPermissionsData {
  permission_ids: number[];
}

// Unified Role Service extending GenericCrudService
class RoleServiceUnified extends GenericCrudService<Role, CreateRoleData, UpdateRoleData> {
  constructor() {
    super('/roles');
  }

  /**
   * Get all roles with optional filtering
   */
  async getRoles(params?: GetRolesParams) {
    return this.getAll(params);
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleWithPermissions(id: number): Promise<RoleWithPermissions> {
    const response = await api.get<{ 
      status: string; 
      data: RoleWithPermissions 
    }>(`${this.endpoint}/${id}/permissions`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Role və ya icazələr tapılmadı');
  }

  /**
   * Create role with permissions
   */
  async createRoleWithPermissions(data: CreateRoleData): Promise<Role> {
    const response = await api.post<{ 
      status: string; 
      data: Role; 
      message: string 
    }>(`${this.endpoint}/with-permissions`, data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Rol yaradıla bilmədi');
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(roleId: number, data: AssignPermissionsData): Promise<void> {
    const response = await api.put<{ 
      status: string; 
      message: string 
    }>(`${this.endpoint}/${roleId}/permissions`, data);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'İcazələr yenilənə bilmədi');
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    return this.updateRolePermissions(roleId, { permission_ids: permissionIds });
  }

  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const response = await api.delete<{ 
      status: string; 
      message: string 
    }>(`${this.endpoint}/${roleId}/permissions`, {
      data: { permission_ids: permissionIds }
    });
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'İcazələr silinə bilmədi');
    }
  }

  /**
   * Get all permissions with optional filtering
   */
  async getPermissions(params?: GetPermissionsParams) {
    return api.get<{
      status: string;
      data: Permission[];
      meta?: any;
    }>('/permissions', { params }).then(response => {
      if (response.data.status === 'success') {
        return {
          data: response.data.data,
          meta: response.data.meta
        };
      }
      throw new Error('İcazələr yüklənə bilmədi');
    });
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const response = await api.get<{
      status: string;
      data: Record<string, Permission[]>;
    }>('/permissions/by-category');
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Kateqoriya üzrə icazələr yüklənə bilmədi');
  }

  /**
   * Check if role has specific permission
   */
  async checkRolePermission(roleId: number, permissionName: string): Promise<boolean> {
    const response = await api.get<{
      status: string;
      data: { has_permission: boolean };
    }>(`${this.endpoint}/${roleId}/check-permission/${permissionName}`);
    
    if (response.data.status === 'success') {
      return response.data.data.has_permission;
    }
    return false;
  }

  /**
   * Get role hierarchy levels
   */
  async getRoleLevels(): Promise<Array<{ level: number; name: string; roles: Role[] }>> {
    const response = await api.get<{
      status: string;
      data: Array<{ level: number; name: string; roles: Role[] }>;
    }>(`${this.endpoint}/hierarchy`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Rol iyerarxiyası yüklənə bilmədi');
  }

  /**
   * Bulk assign permissions to multiple roles
   */
  async bulkAssignPermissions(assignments: Array<{ role_id: number; permission_ids: number[] }>) {
    return this.bulkOperation('/bulk-assign-permissions', assignments, 'İcazələr toplu şəkildə təyin edildi');
  }

  /**
   * Clone role with all permissions
   */
  async cloneRole(roleId: number, newRoleData: Omit<CreateRoleData, 'permissions'>): Promise<Role> {
    const response = await api.post<{
      status: string;
      data: Role;
      message: string;
    }>(`${this.endpoint}/${roleId}/clone`, newRoleData);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Rol kopyalana bilmədi');
  }
}

// Export unified service instance
export const roleService = new RoleServiceUnified();

// Permission service utilities
export const permissionUtils = {
  /**
   * Group permissions by category
   */
  groupByCategory(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((groups, permission) => {
      const category = permission.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  },

  /**
   * Check if permission name matches pattern
   */
  matchesPattern(permission: Permission, pattern: string): boolean {
    const searchTerm = pattern.toLowerCase();
    return (
      permission.name.toLowerCase().includes(searchTerm) ||
      permission.display_name.toLowerCase().includes(searchTerm) ||
      permission.category.toLowerCase().includes(searchTerm)
    );
  },

  /**
   * Get permission display text
   */
  getDisplayText(permission: Permission): string {
    return permission.display_name || permission.name;
  },

  /**
   * Sort permissions by category and name
   */
  sortPermissions(permissions: Permission[]): Permission[] {
    return [...permissions].sort((a, b) => {
      const categoryCompare = (a.category || '').localeCompare(b.category || '');
      if (categoryCompare !== 0) return categoryCompare;
      return (a.display_name || a.name).localeCompare(b.display_name || b.name);
    });
  }
};

// Role service utilities
export const roleUtils = {
  /**
   * Check if role has sufficient level for operation
   */
  hasLevel(role: Role, requiredLevel: number): boolean {
    return role.level >= requiredLevel;
  },

  /**
   * Get role hierarchy position
   */
  getHierarchyPosition(role: Role, allRoles: Role[]): {
    above: Role[];
    below: Role[];
    same: Role[];
  } {
    return {
      above: allRoles.filter(r => r.level > role.level),
      below: allRoles.filter(r => r.level < role.level),
      same: allRoles.filter(r => r.level === role.level && r.id !== role.id)
    };
  },

  /**
   * Format role display name
   */
  getDisplayName(role: Role): string {
    return role.display_name || role.name;
  },

  /**
   * Check if role can manage another role
   */
  canManageRole(managerRole: Role, targetRole: Role): boolean {
    return managerRole.level > targetRole.level;
  }
};

export default roleService;