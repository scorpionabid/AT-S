/**
 * ATİS Dynamic Role Service
 * Real-time role management with automatic synchronization
 */

import { api } from './api';
import { logger } from '../utils/logger';
import { Role } from '../types/shared';
import { ROLE_DISPLAY_NAMES } from '../constants/roles';

export interface RolesResponse {
  roles: Role[];
  meta?: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

class RoleServiceDynamic {
  private cache: Map<string, Role[]> = new Map();
  private subscribers: Set<(roles: Role[]) => void> = new Set();
  private lastFetchTime: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all roles from API with caching
   */
  async getAllRoles(forceRefresh: boolean = false): Promise<Role[]> {
    const cacheKey = 'all_roles';
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.cache.has(cacheKey) && (now - this.lastFetchTime) < this.cacheTimeout) {
      logger.debug('RoleService', 'Returning cached roles');
      return this.cache.get(cacheKey)!;
    }

    try {
      logger.info('RoleService', 'Fetching roles from API');
      
      const response = await api.get('/roles?guard=api&include_stats=true');
      const data: RolesResponse = response.data;
      
      if (!data.roles || !Array.isArray(data.roles)) {
        throw new Error('Invalid roles response format');
      }

      // Cache the results
      this.cache.set(cacheKey, data.roles);
      this.lastFetchTime = now;
      
      // Notify subscribers
      this.notifySubscribers(data.roles);
      
      logger.info('RoleService', `Fetched ${data.roles.length} roles successfully`);
      return data.roles;
      
    } catch (error) {
      logger.error('RoleService', 'Failed to fetch roles', {
        error: error.message,
        stack: error.stack
      });
      
      // Return cached data if available, otherwise empty array
      const cachedRoles = this.cache.get(cacheKey) || [];
      return cachedRoles;
    }
  }

  /**
   * Get roles filtered by level
   */
  async getRolesByLevel(maxLevel?: number, minLevel?: number): Promise<Role[]> {
    const allRoles = await this.getAllRoles();
    
    return allRoles.filter(role => {
      const matchesMax = maxLevel ? role.level <= maxLevel : true;
      const matchesMin = minLevel ? role.level >= minLevel : true;
      return matchesMax && matchesMin;
    });
  }

  /**
   * Get roles that current user can assign to others
   */
  async getAssignableRoles(currentUserRole: string): Promise<Role[]> {
    const allRoles = await this.getAllRoles();
    
    // Role hierarchy for assignment permissions
    const assignmentRules: Record<string, number> = {
      'superadmin': 999, // Can assign any role
      'regionadmin': 2,  // Can assign level > 2
      'sektoradmin': 4,  // Can assign level > 4
      'schooladmin': 5,  // Can assign level > 5
    };

    const userMaxLevel = assignmentRules[currentUserRole] || 0;
    
    if (userMaxLevel === 999) {
      return allRoles; // Superadmin can assign any role
    }
    
    return allRoles.filter(role => role.level > userMaxLevel);
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    const allRoles = await this.getAllRoles();
    return allRoles.find(role => role.name === name) || null;
  }

  /**
   * Get role display name with fallback
   */
  getRoleDisplayName(role: string | Role): string {
    if (typeof role === 'string') {
      // Try to find in cache first
      const allRoles = this.cache.get('all_roles') || [];
      const foundRole = allRoles.find(r => r.name === role);
      if (foundRole) {
        return foundRole.display_name;
      }
      
      // Use centralized display names from constants
      return ROLE_DISPLAY_NAMES[role] || role;
    }
    
    return role.display_name || role.name;
  }

  /**
   * Create new role
   */
  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at' | 'users_count'>): Promise<Role> {
    try {
      logger.info('RoleService', 'Creating new role', { name: roleData.name });
      
      const response = await api.post('/roles', roleData);
      const newRole: Role = response.data.role;
      
      // Invalidate cache to force refresh
      this.invalidateCache();
      
      // Refresh roles and notify subscribers
      await this.getAllRoles(true);
      
      logger.info('RoleService', 'Role created successfully', { 
        id: newRole.id, 
        name: newRole.name 
      });
      
      return newRole;
      
    } catch (error) {
      logger.error('RoleService', 'Failed to create role', {
        error: error.message,
        roleData
      });
      throw error;
    }
  }

  /**
   * Update existing role
   */
  async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
    try {
      logger.info('RoleService', 'Updating role', { id, changes: Object.keys(roleData) });
      
      const response = await api.put(`/roles/${id}`, roleData);
      const updatedRole: Role = response.data.role;
      
      // Invalidate cache
      this.invalidateCache();
      
      // Refresh roles and notify subscribers
      await this.getAllRoles(true);
      
      logger.info('RoleService', 'Role updated successfully', { 
        id: updatedRole.id, 
        name: updatedRole.name 
      });
      
      return updatedRole;
      
    } catch (error) {
      logger.error('RoleService', 'Failed to update role', {
        error: error.message,
        id,
        roleData
      });
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    try {
      logger.info('RoleService', 'Deleting role', { id });
      
      await api.delete(`/roles/${id}`);
      
      // Invalidate cache
      this.invalidateCache();
      
      // Refresh roles and notify subscribers
      await this.getAllRoles(true);
      
      logger.info('RoleService', 'Role deleted successfully', { id });
      
    } catch (error) {
      logger.error('RoleService', 'Failed to delete role', {
        error: error.message,
        id
      });
      throw error;
    }
  }

  /**
   * Subscribe to role changes
   */
  subscribe(callback: (roles: Role[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Send current cached roles if available
    const cachedRoles = this.cache.get('all_roles');
    if (cachedRoles) {
      callback(cachedRoles);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of role changes
   */
  private notifySubscribers(roles: Role[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(roles);
      } catch (error) {
        logger.error('RoleService', 'Error in subscriber callback', {
          error: error.message
        });
      }
    });
  }

  /**
   * Invalidate cache and force refresh on next request
   */
  invalidateCache(): void {
    logger.debug('RoleService', 'Cache invalidated');
    this.cache.clear();
    this.lastFetchTime = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; lastFetch: number; age: number } {
    return {
      size: this.cache.size,
      lastFetch: this.lastFetchTime,
      age: Date.now() - this.lastFetchTime
    };
  }

  /**
   * Initialize role service - preload roles
   */
  async initialize(): Promise<void> {
    try {
      logger.info('RoleService', 'Initializing role service');
      await this.getAllRoles();
      logger.info('RoleService', 'Role service initialized successfully');
    } catch (error) {
      logger.warn('RoleService', 'Failed to initialize role service', {
        error: error.message
      });
    }
  }
}

// Export singleton instance
export const roleServiceDynamic = new RoleServiceDynamic();

// Auto-initialize on import
roleServiceDynamic.initialize();

export default roleServiceDynamic;