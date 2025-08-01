import type { User } from '../../types/auth';
import { getStandardizedRole } from '../../constants/roles';

/**
 * Check if user has specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  const userPermissions = user.permissions || [];
  return userPermissions.includes(permission);
};

/**
 * Check if user has specific role
 * @deprecated Use roleUtils.hasRole instead to avoid duplication
 */
export const hasRole = (user: User | null, role: string): boolean => {
  // Delegate to roleUtils to avoid duplication
  const { hasRole: roleUtilsHasRole } = require('./roleUtils');
  return roleUtilsHasRole(user, role);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get user's permissions
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user) return [];
  
  return user.permissions || [];
};

/**
 * Check if user can create users
 */
export const canCreateUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.create');
};

/**
 * Check if user can update users
 */
export const canUpdateUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.update');
};

/**
 * Check if user can delete users
 */
export const canDeleteUsers = (user: User | null): boolean => {
  return hasPermission(user, 'users.delete');
};

/**
 * Check if user can manage institutions
 */
export const canManageInstitutions = (user: User | null): boolean => {
  return hasAnyPermission(user, ['institutions.create', 'institutions.update', 'institutions.delete']);
};

/**
 * Check if user can manage surveys
 */
export const canManageSurveys = (user: User | null): boolean => {
  return hasAnyPermission(user, ['surveys.create', 'surveys.update', 'surveys.delete']);
};

/**
 * Check if user can publish surveys
 */
export const canPublishSurveys = (user: User | null): boolean => {
  return hasPermission(user, 'surveys.publish');
};

/**
 * Check if user can manage roles
 */
export const canManageRoles = (user: User | null): boolean => {
  return hasAnyPermission(user, ['roles.create', 'roles.update', 'roles.delete']);
};

/**
 * Check if user can manage documents
 */
export const canManageDocuments = (user: User | null): boolean => {
  return hasAnyPermission(user, ['documents.create', 'documents.update', 'documents.delete']);
};

/**
 * Check if user can share documents
 */
export const canShareDocuments = (user: User | null): boolean => {
  return hasPermission(user, 'documents.share');
};

/**
 * Check if user can manage tasks
 */
export const canManageTasks = (user: User | null): boolean => {
  return hasAnyPermission(user, ['tasks.create', 'tasks.update', 'tasks.delete']);
};

/**
 * Group permissions by category
 */
export const groupPermissionsByCategory = (permissions: string[]): Record<string, string[]> => {
  const categories: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const [category] = permission.split('.');
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(permission);
  });
  
  return categories;
};

/**
 * Get permission display name
 */
export const getPermissionDisplayName = (permission: string): string => {
  const permissionDisplayNames = {
    // User Management
    'users.create': 'İstifadəçi Yarat',
    'users.read': 'İstifadəçi Gör',
    'users.update': 'İstifadəçi Redaktə Et',
    'users.delete': 'İstifadəçi Sil',
    
    // Institution Management
    'institutions.create': 'Müəssisə Yarat',
    'institutions.read': 'Müəssisə Gör',
    'institutions.update': 'Müəssisə Redaktə Et',
    'institutions.delete': 'Müəssisə Sil',
    
    // Survey Management
    'surveys.create': 'Anket Yarat',
    'surveys.read': 'Anket Gör',
    'surveys.update': 'Anket Redaktə Et',
    'surveys.delete': 'Anket Sil',
    'surveys.publish': 'Anket Nəşr Et',
    'surveys.manage': 'Anket İdarə Et',
    
    // Assessment Management
    'assessments.create': 'Qiymətləndirmə Yarat',
    'assessments.read': 'Qiymətləndirmə Gör',
    'assessments.update': 'Qiymətləndirmə Redaktə Et',
    'assessments.delete': 'Qiymətləndirmə Sil',
    
    // School Management (FAZA 12 additions)
    'attendance.read': 'Davamiyyət Gör',
    'attendance.create': 'Davamiyyət Yarat',
    'attendance.update': 'Davamiyyət Redaktə Et',
    
    'schedules.read': 'Cədvəl Gör',
    'schedules.create': 'Cədvəl Yarat',
    'schedules.update': 'Cədvəl Redaktə Et',
    'schedules.delete': 'Cədvəl Sil',
    
    'teaching_loads.read': 'Dərs Yükü Gör',
    'teaching_loads.create': 'Dərs Yükü Yarat',
    'teaching_loads.update': 'Dərs Yükü Redaktə Et',
    'teaching_loads.delete': 'Dərs Yükü Sil',
    
    // Role Management
    'roles.create': 'Rol Yarat',
    'roles.read': 'Rol Gör',
    'roles.update': 'Rol Redaktə Et',
    'roles.delete': 'Rol Sil',
    
    // Document Management
    'documents.create': 'Sənəd Yarat',
    'documents.read': 'Sənəd Gör',
    'documents.update': 'Sənəd Redaktə Et',
    'documents.delete': 'Sənəd Sil',
    'documents.share': 'Sənəd Paylaş',
    
    // Task Management
    'tasks.create': 'Tapşırıq Yarat',
    'tasks.read': 'Tapşırıq Gör',
    'tasks.update': 'Tapşırıq Redaktə Et',
    'tasks.delete': 'Tapşırıq Sil',
    
    // Approval Management
    'approvals.read': 'Təsdiqləmə Gör',
    'approvals.create': 'Təsdiqləmə Yarat',
    'approvals.update': 'Təsdiqləmə Redaktə Et',
    'approvals.approve': 'Təsdiqlə',
    'approvals.reject': 'Rədd Et',
    
    // Report Management
    'reports.read': 'Hesabat Gör',
    'reports.create': 'Hesabat Yarat',
    'reports.export': 'Hesabat İxrac Et',
  };
  
  return permissionDisplayNames[permission] || permission;
};

/**
 * Check if user has any role from a list
 */
/**
 * @deprecated Use roleUtils.hasAnyRole instead to avoid duplication
 */
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  // Delegate to roleUtils to avoid duplication
  const { hasAnyRole: roleUtilsHasAnyRole } = require('./roleUtils');
  return roleUtilsHasAnyRole(user, roles);
};

/**
 * Check if user has all roles from a list
 */
export const hasAllRoles = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  
  return roles.every(role => hasRole(user, role));
};

/**
 * Get user's current roles
 */
export const getUserRoles = (user: User | null): string[] => {
  if (!user) return [];
  
  let userRoles: string[] = [];
  
  if (typeof user.role === 'string') {
    userRoles = [getStandardizedRole(user.role)];
  } else if (typeof user.role === 'object' && user.role?.name) {
    userRoles = [getStandardizedRole(user.role.name)];
  } else if (user.roles && Array.isArray(user.roles)) {
    userRoles = user.roles.map(r => getStandardizedRole(typeof r === 'string' ? r : r.name));
  }
  
  return userRoles;
};

/**
 * Enhanced navigation-specific permission checks
 */

/**
 * Check if user can manage attendance
 */
export const canManageAttendance = (user: User | null): boolean => {
  return hasAnyPermission(user, ['attendance.read', 'attendance.create', 'attendance.update']);
};

/**
 * Check if user can manage schedules
 */
export const canManageSchedules = (user: User | null): boolean => {
  return hasAnyPermission(user, ['schedules.read', 'schedules.create', 'schedules.update']);
};

/**
 * Check if user can manage teaching loads
 */
export const canManageTeachingLoads = (user: User | null): boolean => {
  return hasAnyPermission(user, ['teaching_loads.read', 'teaching_loads.create', 'teaching_loads.update']);
};

/**
 * Check if user can manage approvals
 */
export const canManageApprovals = (user: User | null): boolean => {
  return hasAnyPermission(user, ['approvals.read', 'approvals.create', 'approvals.approve']);
};

/**
 * Check if user can view reports
 */
export const canViewReports = (user: User | null): boolean => {
  return hasPermission(user, 'reports.read');
};

/**
 * Check if user can create reports
 */
export const canCreateReports = (user: User | null): boolean => {
  return hasPermission(user, 'reports.create');
};

/**
 * Check if user can export reports
 */
export const canExportReports = (user: User | null): boolean => {
  return hasPermission(user, 'reports.export');
};

/**
 * Get permission level for a resource
 */
export const getPermissionLevel = (user: User | null, resource: string): 'none' | 'read' | 'write' | 'admin' => {
  if (!user) return 'none';
  
  const permissions = getUserPermissions(user);
  const resourcePermissions = permissions.filter(p => p.startsWith(resource + '.'));
  
  if (resourcePermissions.includes(`${resource}.delete`) || resourcePermissions.includes(`${resource}.manage`)) {
    return 'admin';
  }
  
  if (resourcePermissions.some(p => ['create', 'update'].some(action => p.endsWith(action)))) {
    return 'write';
  }
  
  if (resourcePermissions.includes(`${resource}.read`)) {
    return 'read';
  }
  
  return 'none';
};

/**
 * Check contextual permissions based on institution/department
 */
export const hasContextualPermission = (
  user: User | null, 
  permission: string, 
  context?: { institutionId?: number; department?: string }
): boolean => {
  if (!hasPermission(user, permission)) return false;
  
  // If no context provided, global permission is sufficient
  if (!context) return true;
  
  // TODO: Implement contextual permission checking
  // This would check if user has permission in specific institution/department
  // For now, return basic permission check
  return true;
};