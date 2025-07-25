import type { User } from '../../types/auth';

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;

  // Check if user has permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  // Fallback: check if user is superadmin (has all permissions)
  const isSuperAdmin = (typeof user.role === 'string' && user.role === 'superadmin') ||
                      (typeof user.role === 'object' && user.role?.name === 'superadmin') ||
                      (user.roles && user.roles.includes('superadmin'));

  return isSuperAdmin;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;

  // Check roles array (from /me endpoint)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }

  // Check single role property
  if (typeof user.role === 'string') {
    return user.role === role;
  }

  // Check role object
  if (typeof user.role === 'object' && user.role?.name) {
    return user.role.name === role;
  }

  return false;
};

/**
 * Check if user can access institution
 */
export const canAccessInstitution = (user: User | null, institutionId: number): boolean => {
  if (!user) return false;

  // Superadmin can access all institutions
  if (hasRole(user, 'superadmin')) {
    return true;
  }

  // Region admin can access institutions in their region
  if (hasRole(user, 'regionadmin')) {
    // TODO: Add proper region-based access control
    return true;
  }

  // School admin can only access their own institution
  if (hasRole(user, 'schooladmin')) {
    return user.institution_id === institutionId;
  }

  return false;
};

/**
 * Check if user can access department
 */
export const canAccessDepartment = (user: User | null, departmentId: number): boolean => {
  if (!user) return false;

  // Superadmin can access all departments
  if (hasRole(user, 'superadmin')) {
    return true;
  }

  // Check if user belongs to the department
  return user.department_id === departmentId;
};
