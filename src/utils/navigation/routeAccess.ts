import type { User } from '../../types/auth';
import { hasPermission, hasRole } from '../auth';

export interface RouteConfig {
  path: string;
  permission?: string;
  roles?: string[];
  requireAll?: boolean;
  redirect?: string;
  children?: RouteConfig[];
}

export const routeConfigs: RouteConfig[] = [
  {
    path: '/dashboard',
    // Dashboard is accessible to all authenticated users
  },
  {
    path: '/users',
    permission: 'users.read',
    children: [
      {
        path: '/users/create',
        permission: 'users.create'
      },
      {
        path: '/users/:id',
        permission: 'users.read'
      },
      {
        path: '/users/:id/edit',
        permission: 'users.update'
      }
    ]
  },
  {
    path: '/institutions',
    permission: 'institutions.read',
    children: [
      {
        path: '/institutions/create',
        permission: 'institutions.create'
      },
      {
        path: '/institutions/:id',
        permission: 'institutions.read'
      },
      {
        path: '/institutions/:id/edit',
        permission: 'institutions.update'
      }
    ]
  },
  {
    path: '/surveys',
    permission: 'surveys.read',
    children: [
      {
        path: '/surveys/create',
        permission: 'surveys.create'
      },
      {
        path: '/surveys/:id',
        permission: 'surveys.read'
      },
      {
        path: '/surveys/:id/edit',
        permission: 'surveys.update'
      }
    ]
  },
  {
    path: '/roles',
    roles: ['superadmin'],
    children: [
      {
        path: '/roles/create',
        roles: ['superadmin']
      },
      {
        path: '/roles/:id',
        roles: ['superadmin']
      },
      {
        path: '/roles/:id/edit',
        roles: ['superadmin']
      }
    ]
  },
  {
    path: '/reports',
    permission: 'users.read', // Using existing permission temporarily
    children: [
      {
        path: '/reports/institutions',
        permission: 'institutions.read'
      },
      {
        path: '/reports/surveys',
        permission: 'surveys.read'
      },
      {
        path: '/reports/users',
        permission: 'users.read'
      }
    ]
  },
  {
    path: '/settings',
    roles: ['superadmin', 'regionadmin']
  }
];

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (user: User | null, path: string): boolean => {
  if (!user) return false;

  const config = getRouteConfig(path);
  if (!config) return true; // If no config found, allow access

  return checkRouteAccess(user, config);
};

/**
 * Check route access based on configuration
 */
export const checkRouteAccess = (user: User | null, config: RouteConfig): boolean => {
  if (!user) return false;

  // Check role-based access
  if (config.roles && config.roles.length > 0) {
    const hasRequiredRole = config.requireAll
      ? config.roles.every(role => hasRole(user, role))
      : config.roles.some(role => hasRole(user, role));
    
    if (!hasRequiredRole) return false;
  }

  // Check permission-based access
  if (config.permission) {
    return hasPermission(user, config.permission);
  }

  // If no specific permission or role required, allow access
  return true;
};

/**
 * Get route configuration for a specific path
 */
export const getRouteConfig = (path: string): RouteConfig | null => {
  const findConfig = (configs: RouteConfig[], targetPath: string): RouteConfig | null => {
    for (const config of configs) {
      if (matchPath(config.path, targetPath)) {
        return config;
      }

      if (config.children) {
        const found = findConfig(config.children, targetPath);
        if (found) return found;
      }
    }

    return null;
  };

  return findConfig(routeConfigs, path);
};

/**
 * Simple path matching (supports :id parameters)
 */
export const matchPath = (pattern: string, path: string): boolean => {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/:\w+/g, '[^/]+') // Replace :id with regex for any non-slash characters
    .replace(/\//g, '\\/'); // Escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
};

/**
 * Get accessible routes for user
 */
export const getAccessibleRoutes = (user: User | null): string[] => {
  if (!user) return [];

  const accessibleRoutes: string[] = [];

  const checkRoutes = (configs: RouteConfig[]) => {
    for (const config of configs) {
      if (checkRouteAccess(user, config)) {
        accessibleRoutes.push(config.path);
      }

      if (config.children) {
        checkRoutes(config.children);
      }
    }
  };

  checkRoutes(routeConfigs);
  return accessibleRoutes;
};

/**
 * Get redirect path for unauthorized access
 */
export const getRedirectPath = (path: string, user: User | null): string => {
  const config = getRouteConfig(path);
  
  if (config?.redirect) {
    return config.redirect;
  }

  // Default redirects based on user role
  if (user) {
    if (hasRole(user, 'superadmin')) {
      return '/dashboard';
    } else if (hasRole(user, 'regionadmin')) {
      return '/dashboard';
    } else {
      return '/dashboard';
    }
  }

  return '/login';
};

/**
 * Validate route access and return result
 */
export const validateRouteAccess = (user: User | null, path: string): {
  canAccess: boolean;
  reason?: string;
  redirectTo?: string;
} => {
  if (!user) {
    return {
      canAccess: false,
      reason: 'Not authenticated',
      redirectTo: '/login'
    };
  }

  const config = getRouteConfig(path);
  if (!config) {
    return { canAccess: true };
  }

  const canAccess = checkRouteAccess(user, config);
  
  if (!canAccess) {
    let reason = 'Access denied';
    
    if (config.permission) {
      reason = `Missing permission: ${config.permission}`;
    } else if (config.roles) {
      reason = `Missing role: ${config.roles.join(' or ')}`;
    }

    return {
      canAccess: false,
      reason,
      redirectTo: getRedirectPath(path, user)
    };
  }

  return { canAccess: true };
};