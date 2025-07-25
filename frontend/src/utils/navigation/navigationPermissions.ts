import type { User } from '../../types/auth';
import { hasPermission, hasRole } from '../auth';

export interface NavigationPermission {
  key: string;
  label: string;
  permission?: string;
  roles?: string[];
  category: string;
  description?: string;
}

export const navigationPermissions: NavigationPermission[] = [
  // User Management
  {
    key: 'users.view',
    label: 'View Users',
    permission: 'users.read',
    category: 'User Management',
    description: 'View user list and details'
  },
  {
    key: 'users.create',
    label: 'Create Users',
    permission: 'users.create',
    category: 'User Management',
    description: 'Create new users'
  },
  {
    key: 'users.edit',
    label: 'Edit Users',
    permission: 'users.update',
    category: 'User Management',
    description: 'Edit existing users'
  },
  {
    key: 'users.delete',
    label: 'Delete Users',
    permission: 'users.delete',
    category: 'User Management',
    description: 'Delete users'
  },

  // Institution Management
  {
    key: 'institutions.view',
    label: 'View Institutions',
    permission: 'institutions.read',
    category: 'Institution Management',
    description: 'View institution list and hierarchy'
  },
  {
    key: 'institutions.create',
    label: 'Create Institutions',
    permission: 'institutions.create',
    category: 'Institution Management',
    description: 'Create new institutions'
  },
  {
    key: 'institutions.edit',
    label: 'Edit Institutions',
    permission: 'institutions.update',
    category: 'Institution Management',
    description: 'Edit existing institutions'
  },
  {
    key: 'institutions.delete',
    label: 'Delete Institutions',
    permission: 'institutions.delete',
    category: 'Institution Management',
    description: 'Delete institutions'
  },

  // Survey Management
  {
    key: 'surveys.view',
    label: 'View Surveys',
    permission: 'surveys.read',
    category: 'Survey Management',
    description: 'View survey list and details'
  },
  {
    key: 'surveys.create',
    label: 'Create Surveys',
    permission: 'surveys.create',
    category: 'Survey Management',
    description: 'Create new surveys'
  },
  {
    key: 'surveys.edit',
    label: 'Edit Surveys',
    permission: 'surveys.update',
    category: 'Survey Management',
    description: 'Edit existing surveys'
  },
  {
    key: 'surveys.delete',
    label: 'Delete Surveys',
    permission: 'surveys.delete',
    category: 'Survey Management',
    description: 'Delete surveys'
  },
  {
    key: 'surveys.publish',
    label: 'Publish Surveys',
    permission: 'surveys.publish',
    category: 'Survey Management',
    description: 'Publish surveys for distribution'
  },

  // Role Management
  {
    key: 'roles.view',
    label: 'View Roles',
    roles: ['superadmin'],
    category: 'Role Management',
    description: 'View role list and permissions'
  },
  {
    key: 'roles.create',
    label: 'Create Roles',
    roles: ['superadmin'],
    category: 'Role Management',
    description: 'Create new roles'
  },
  {
    key: 'roles.edit',
    label: 'Edit Roles',
    roles: ['superadmin'],
    category: 'Role Management',
    description: 'Edit existing roles'
  },
  {
    key: 'roles.delete',
    label: 'Delete Roles',
    roles: ['superadmin'],
    category: 'Role Management',
    description: 'Delete roles'
  },

  // Document Management
  {
    key: 'documents.view',
    label: 'View Documents',
    permission: 'documents.read',
    category: 'Document Management',
    description: 'View document list and details'
  },
  {
    key: 'documents.create',
    label: 'Create Documents',
    permission: 'documents.create',
    category: 'Document Management',
    description: 'Upload new documents'
  },
  {
    key: 'documents.edit',
    label: 'Edit Documents',
    permission: 'documents.update',
    category: 'Document Management',
    description: 'Edit existing documents'
  },
  {
    key: 'documents.delete',
    label: 'Delete Documents',
    permission: 'documents.delete',
    category: 'Document Management',
    description: 'Delete documents'
  },
  {
    key: 'documents.share',
    label: 'Share Documents',
    permission: 'documents.share',
    category: 'Document Management',
    description: 'Share documents with others'
  },

  // Task Management
  {
    key: 'tasks.view',
    label: 'View Tasks',
    permission: 'tasks.read',
    category: 'Task Management',
    description: 'View task list and details'
  },
  {
    key: 'tasks.create',
    label: 'Create Tasks',
    permission: 'tasks.create',
    category: 'Task Management',
    description: 'Create new tasks'
  },
  {
    key: 'tasks.edit',
    label: 'Edit Tasks',
    permission: 'tasks.update',
    category: 'Task Management',
    description: 'Edit existing tasks'
  },
  {
    key: 'tasks.delete',
    label: 'Delete Tasks',
    permission: 'tasks.delete',
    category: 'Task Management',
    description: 'Delete tasks'
  },

  // System Administration
  {
    key: 'system.settings',
    label: 'System Settings',
    roles: ['superadmin', 'regionadmin'],
    category: 'System Administration',
    description: 'Access system configuration'
  },
  {
    key: 'system.logs',
    label: 'System Logs',
    roles: ['superadmin'],
    category: 'System Administration',
    description: 'View system logs and audit trail'
  },
  {
    key: 'system.maintenance',
    label: 'System Maintenance',
    roles: ['superadmin'],
    category: 'System Administration',
    description: 'Perform system maintenance tasks'
  }
];

/**
 * Check if user has navigation permission
 */
export const hasNavigationPermission = (user: User | null, permissionKey: string): boolean => {
  if (!user) return false;

  const navPermission = navigationPermissions.find(p => p.key === permissionKey);
  if (!navPermission) return false;

  // Check role-based access
  if (navPermission.roles && navPermission.roles.length > 0) {
    return navPermission.roles.some(role => hasRole(user, role));
  }

  // Check permission-based access
  if (navPermission.permission) {
    return hasPermission(user, navPermission.permission);
  }

  return false;
};

/**
 * Get user's navigation permissions
 */
export const getUserNavigationPermissions = (user: User | null): NavigationPermission[] => {
  if (!user) return [];

  return navigationPermissions.filter(permission => 
    hasNavigationPermission(user, permission.key)
  );
};

/**
 * Group navigation permissions by category
 */
export const getNavigationPermissionsByCategory = (user: User | null): Record<string, NavigationPermission[]> => {
  const userPermissions = getUserNavigationPermissions(user);
  const grouped: Record<string, NavigationPermission[]> = {};

  userPermissions.forEach(permission => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });

  return grouped;
};

/**
 * Get navigation permission statistics
 */
export const getNavigationPermissionStats = (user: User | null): {
  total: number;
  granted: number;
  denied: number;
  byCategory: Record<string, { granted: number; total: number }>;
} => {
  const userPermissions = getUserNavigationPermissions(user);
  const total = navigationPermissions.length;
  const granted = userPermissions.length;
  const denied = total - granted;

  const byCategory: Record<string, { granted: number; total: number }> = {};

  navigationPermissions.forEach(permission => {
    if (!byCategory[permission.category]) {
      byCategory[permission.category] = { granted: 0, total: 0 };
    }
    byCategory[permission.category].total++;
    
    if (hasNavigationPermission(user, permission.key)) {
      byCategory[permission.category].granted++;
    }
  });

  return {
    total,
    granted,
    denied,
    byCategory
  };
};

/**
 * Check if user can access admin features
 */
export const canAccessAdminFeatures = (user: User | null): boolean => {
  if (!user) return false;

  const adminPermissions = [
    'users.create',
    'users.update', 
    'users.delete',
    'institutions.create',
    'institutions.update',
    'institutions.delete',
    'surveys.create',
    'surveys.update',
    'surveys.delete',
    'surveys.publish'
  ];

  return adminPermissions.some(permission => hasPermission(user, permission));
};

/**
 * Get quick actions based on user permissions
 */
export const getQuickActions = (user: User | null): {
  label: string;
  path: string;
  icon: string;
  permission: string;
}[] => {
  const quickActions = [
    {
      label: 'Yeni İstifadəçi',
      path: '/users/create',
      icon: 'user-plus',
      permission: 'users.create'
    },
    {
      label: 'Yeni Müəssisə',
      path: '/institutions/create',
      icon: 'building-plus',
      permission: 'institutions.create'
    },
    {
      label: 'Yeni Anket',
      path: '/surveys/create',
      icon: 'plus',
      permission: 'surveys.create'
    },
    {
      label: 'Yeni Rol',
      path: '/roles/create',
      icon: 'shield-plus',
      permission: 'roles.create'
    }
  ];

  return quickActions.filter(action => 
    hasPermission(user, action.permission)
  );
};