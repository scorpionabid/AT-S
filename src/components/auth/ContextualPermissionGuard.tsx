import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } from '../../utils/auth';

interface ContextualPermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // For permissions array - require all or any
  role?: string;
  roles?: string[];
  requireAllRoles?: boolean; // For roles array - require all or any
  fallback?: ReactNode;
  institutionId?: number;
  departmentId?: number;
  context?: 'global' | 'institution' | 'department';
  debug?: boolean;
}

/**
 * Enhanced permission guard with contextual access control
 */
const ContextualPermissionGuard: React.FC<ContextualPermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireAllRoles = false,
  fallback = null,
  institutionId,
  departmentId,
  context = 'global',
  debug = false
}) => {
  const { user } = useAuth();

  // Debug logging
  if (debug && user) {
    console.log('ContextualPermissionGuard Debug:', {
      user: user.username,
      userRoles: user.roles,
      userPermissions: user.permissions,
      requiredPermission: permission,
      requiredPermissions: permissions,
      requiredRole: role,
      requiredRoles: roles,
      context,
      institutionId,
      departmentId
    });
  }

  if (!user) {
    if (debug) console.log('ContextualPermissionGuard: No user found');
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission) {
    const contextualPermission = getContextualPermission(permission, context, institutionId, departmentId);
    if (!hasPermission(user, contextualPermission)) {
      if (debug) console.log(`ContextualPermissionGuard: Permission denied for ${contextualPermission}`);
      return <>{fallback}</>;
    }
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const contextualPermissions = permissions.map(p => 
      getContextualPermission(p, context, institutionId, departmentId)
    );
    
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(user, contextualPermissions)
      : hasAnyPermission(user, contextualPermissions);
      
    if (!hasRequiredPermissions) {
      if (debug) console.log(`ContextualPermissionGuard: Permissions denied for ${contextualPermissions.join(', ')}`);
      return <>{fallback}</>;
    }
  }

  // Check single role
  if (role && !hasRole(user, role)) {
    if (debug) console.log(`ContextualPermissionGuard: Role denied for ${role}`);
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    const hasRequiredRoles = requireAllRoles
      ? roles.every(r => hasRole(user, r))
      : roles.some(r => hasRole(user, r));
      
    if (!hasRequiredRoles) {
      if (debug) console.log(`ContextualPermissionGuard: Roles denied for ${roles.join(', ')}`);
      return <>{fallback}</>;
    }
  }

  // Check institutional access if context requires it
  if (context === 'institution' && institutionId) {
    if (!canAccessInstitution(user, institutionId)) {
      if (debug) console.log(`ContextualPermissionGuard: Institution access denied for ID ${institutionId}`);
      return <>{fallback}</>;
    }
  }

  // Check department access if context requires it
  if (context === 'department' && departmentId) {
    if (!canAccessDepartment(user, departmentId)) {
      if (debug) console.log(`ContextualPermissionGuard: Department access denied for ID ${departmentId}`);
      return <>{fallback}</>;
    }
  }

  if (debug) console.log('ContextualPermissionGuard: Access granted');
  return <>{children}</>;
};

/**
 * Generate contextual permission name
 */
function getContextualPermission(
  basePermission: string, 
  context: string, 
  institutionId?: number, 
  departmentId?: number
): string {
  switch (context) {
    case 'institution':
      return institutionId ? `${basePermission}.institution.${institutionId}` : `${basePermission}.institution`;
    case 'department':
      return departmentId ? `${basePermission}.department.${departmentId}` : `${basePermission}.department`;
    default:
      return basePermission;
  }
}

/**
 * Check if user can access specific institution
 */
function canAccessInstitution(user: any, institutionId: number): boolean {
  // SuperAdmin can access all institutions
  if (hasRole(user, 'superadmin')) {
    return true;
  }

  // Check if user belongs to the institution
  if (user.institution_id === institutionId) {
    return true;
  }

  // Check hierarchical access (e.g., regionadmin can access institutions in their region)
  if (hasRole(user, 'regionadmin')) {
    // TODO: Implement region-based access check
    return true;
  }

  return false;
}

/**
 * Check if user can access specific department
 */
function canAccessDepartment(user: any, departmentId: number): boolean {
  // SuperAdmin can access all departments
  if (hasRole(user, 'superadmin')) {
    return true;
  }

  // Check if user belongs to the department
  if (user.department_id === departmentId) {
    return true;
  }

  // Check if user's departments array includes this department
  if (user.departments && user.departments.includes(departmentId)) {
    return true;
  }

  return false;
}

export default ContextualPermissionGuard;