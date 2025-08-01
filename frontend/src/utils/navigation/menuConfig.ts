// ====================
// ATİS Navigation - Unified Menu Configuration
// Single source of truth for all navigation items
// Version: 1.0.0
// ====================

import type { User } from '../../types/auth';
import { hasPermission, hasRole } from '../auth';
import { hasNavigationPermission } from './navigationPermissions';
import { 
  FiHome, 
  FiUsers, 
  FiGrid, 
  FiFileText, 
  FiShield, 
  FiBarChart, 
  FiSettings,
  FiList,
  FiUserPlus,
  FiGitBranch,
  FiPlus,
  FiEye,
  FiTrendingUp,
  FiClipboard,
  FiCalendar,
  FiCheckCircle,
  FiFolder,
  FiClock,
  FiBookOpen,
  FiUserCheck,
  FiAward
} from 'react-icons/fi';

export interface MenuIcon {
  component: React.ComponentType<any>;
  emoji?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path?: string; // Optional - only for navigable items
  type: 'button' | 'menu' | 'hybrid' | 'separator'; // Navigation behavior type
  icon: React.ComponentType<any>;
  permission?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: {
    text: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  disabled?: boolean;
  description?: string;
  category?: string;
  external?: boolean;
  exactMatch?: boolean;
}

/**
 * Complete ATİS Navigation Structure - Optimized Hierarchy
 * Reorganized for better UX and logical grouping
 */
export const menuItems: MenuItem[] = [
  // Main Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    type: 'button', // Direct navigation
    icon: FiHome,
    description: 'Əsas dashboard və ümumi məlumatlar',
    category: 'Core',
    exactMatch: true,
  },
  
  // User Management Section
  {
    id: 'users',
    title: 'İstifadəçilər',
    path: '/users',
    type: 'hybrid', // Both navigable and expandable
    icon: FiUsers,
    permission: 'users.read',
    description: 'İstifadəçi idarəetməsi və hesablar',
    category: 'User Management',
    children: [
      {
        id: 'users-list',
        title: 'İstifadəçi Siyahısı',
        path: '/users',
        type: 'button',
        icon: FiList,
        permission: 'users.read',
        exactMatch: true,
      },
      {
        id: 'users-create',
        title: 'Yeni İstifadəçi',
        path: '/users/create',
        type: 'button',
        icon: FiUserPlus,
        permission: 'users.create',
      }
    ]
  },

  // Institution Management Section
  {
    id: 'institutions',
    title: 'Müəssisələr',
    path: '/institutions',
    type: 'hybrid', // Both navigable and expandable
    icon: FiGrid,
    permission: 'institutions.read',
    description: 'Təhsil müəssisələrinin idarəetməsi',
    category: 'Institution Management',
    children: [
      {
        id: 'institutions-list',
        title: 'Müəssisə Siyahısı',
        path: '/institutions',
        type: 'button',
        icon: FiList,
        permission: 'institutions.read',
        exactMatch: true,
      },
      {
        id: 'institutions-hierarchy',
        title: 'İerarxiya',
        path: '/institutions/hierarchy',
        type: 'button',
        icon: FiGitBranch,
        permission: 'institutions.read'
      },
      {
        id: 'institutions-create',
        title: 'Yeni Müəssisə',
        path: '/institutions/create',
        type: 'button',
        icon: FiPlus,
        permission: 'institutions.create',
      }
    ]
  },

  // Departments Section
  {
    id: 'departments',
    title: 'Şöbələr',
    path: '/departments',
    type: 'hybrid', // Both navigable and expandable
    icon: FiUsers,
    roles: ['superadmin', 'regionadmin'],
    description: 'Şöbələrin idarəetməsi və koordinasiyası',
    category: 'Department Management',
    children: [
      {
        id: 'departments-overview',
        title: 'Şöbələr Ümumi Baxış',
        path: '/departments',
        type: 'button',
        icon: FiGrid,
        roles: ['superadmin', 'regionadmin'],
        exactMatch: true,
      },
      {
        id: 'finance-department',
        title: 'Maliyyə Şöbəsi',
        path: '/departments/finance',
        type: 'button',
        icon: FiTrendingUp,
        roles: ['superadmin', 'regionadmin', 'regionoperator_maliyye'],
      },
      {
        id: 'admin-department',
        title: 'İnzibati Şöbəsi',
        path: '/departments/administrative',
        type: 'button',
        icon: FiSettings,
        roles: ['superadmin', 'regionadmin', 'regionoperator_inzibati'],
      },
      {
        id: 'facility-department',
        title: 'Təsərrüfat Şöbəsi',
        path: '/departments/facility',
        type: 'button',
        icon: FiFolder,
        roles: ['superadmin', 'regionadmin', 'regionoperator_tesserrufat'],
      }
    ]
  },

  // Survey Management Section
  {
    id: 'surveys',
    title: 'Anketlər',
    path: '/surveys',
    type: 'hybrid', // Both navigable and expandable
    icon: FiFileText,
    permission: 'surveys.read',
    description: 'Anket yaratma və idarəetmə',
    category: 'Survey Management',
    children: [
      {
        id: 'surveys-list',
        title: 'Anket Siyahısı',
        path: '/surveys',
        type: 'button',
        icon: FiList,
        permission: 'surveys.read',
        exactMatch: true,
      },
      {
        id: 'surveys-create',
        title: 'Yeni Anket',
        path: '/surveys/create',
        type: 'button',
        icon: FiPlus,
        permission: 'surveys.create',
      },
      {
        id: 'surveys-responses',
        title: 'Cavablar',
        path: '/surveys/responses',
        type: 'button',
        icon: FiEye,
        permission: 'surveys.read',
      }
    ]
  },

  // Assessment Management Section
  {
    id: 'assessments',
    title: 'Qiymətləndirmələr',
    path: '/assessments',
    type: 'hybrid', // Both navigable and expandable
    icon: FiClipboard,
    permission: 'assessments.read',
    description: 'KSQ, BSQ və digər qiymətləndirmələr',
    category: 'Assessment Management',
    children: [
      {
        id: 'assessments-overview',
        title: 'Ümumi Baxış',
        path: '/assessments',
        type: 'button',
        icon: FiEye,
        permission: 'assessments.read',
        exactMatch: true,
      },
      {
        id: 'assessments-ksq',
        title: 'KSQ Nəticələri',
        path: '/assessments/ksq',
        type: 'button',
        icon: FiAward,
        permission: 'assessments.read'
      },
      {
        id: 'assessments-bsq',
        title: 'BSQ Nəticələri',
        path: '/assessments/bsq',
        type: 'button',
        icon: FiTrendingUp,
        permission: 'assessments.read'
      },
      {
        id: 'assessments-analytics',
        title: 'Analitika',
        path: '/assessments/analytics',
        type: 'button',
        icon: FiBarChart,
        permission: 'assessments.read'
      }
    ]
  },

  // School Management Section (FAZA 12 - Consolidated)
  {
    id: 'school-management',
    title: 'Məktəb İdarəetməsi',
    path: '/school',
    type: 'hybrid', // Both navigable and expandable
    icon: FiBookOpen,
    roles: ['superadmin', 'regionadmin', 'sektoradmin', 'schooladmin', 'muavin_mudir', 'muellim'],
    description: 'Məktəb akademik funksiyalarının idarəetməsi',
    category: 'School Management',
    children: [
      {
        id: 'school-attendance',
        title: 'Davamiyyət',
        path: '/attendance',
        type: 'button',
        icon: FiUserCheck,
        roles: ['superadmin', 'schooladmin', 'muavin_mudir', 'muellim'],
        description: 'Sinif səviyyəsində davamiyyət idarəetməsi'
      },
      {
        id: 'school-schedules',
        title: 'Cədvəllər',
        path: '/schedules',
        type: 'button',
        icon: FiCalendar,
        roles: ['superadmin', 'schooladmin', 'muavin_mudir'],
        description: 'Dərs cədvəlləri və planlaşdırma'
      },
      {
        id: 'school-teaching-loads',
        title: 'Dərs Yükləri',
        path: '/teaching-loads',
        type: 'button',
        icon: FiClock,
        roles: ['superadmin', 'schooladmin', 'muavin_mudir'],
        description: 'Müəllim dərs yüklərinin idarəetməsi'
      }
    ]
  },

  // Task Management Section
  {
    id: 'tasks',
    title: 'Tapşırıqlar',
    path: '/tasks',
    type: 'hybrid', // Both navigable and expandable
    icon: FiClipboard,
    permission: 'tasks.read',
    description: 'Tapşırıq idarəetməsi və izləmə',
    category: 'Task Management',
    children: [
      {
        id: 'tasks-list',
        title: 'Tapşırıq Siyahısı',
        path: '/tasks',
        type: 'button',
        icon: FiList,
        permission: 'tasks.read',
        exactMatch: true,
      },
      {
        id: 'tasks-create',
        title: 'Yeni Tapşırıq',
        path: '/tasks/create',
        type: 'button',
        icon: FiPlus,
        permission: 'tasks.create',
      }
    ]
  },

  // Approval Management Section (No children - single page)
  {
    id: 'approvals',
    title: 'Təsdiqləmələr',
    path: '/approvals',
    type: 'button', // Direct navigation
    icon: FiCheckCircle,
    permission: 'approvals.read',
    description: 'Məlumat təsdiqləmə və workflow',
    category: 'Approval Management',
    exactMatch: true,
  },

  // Document Management Section
  {
    id: 'documents',
    title: 'Sənədlər',
    path: '/documents',
    type: 'hybrid', // Both navigable and expandable
    icon: FiFolder,
    permission: 'documents.read',
    description: 'Fayl paylaşım və sənəd idarəetməsi',
    category: 'Document Management',
    children: [
      {
        id: 'documents-list',
        title: 'Sənəd Siyahısı',
        path: '/documents',
        type: 'button',
        icon: FiList,
        permission: 'documents.read',
        exactMatch: true,
      },
      {
        id: 'documents-upload',
        title: 'Fayl Yüklə',
        path: '/documents/upload',
        type: 'button',
        icon: FiPlus,
        permission: 'documents.create',
      }
    ]
  },

  // Reports Section
  {
    id: 'reports',
    title: 'Hesabatlar',
    path: '/reports',
    type: 'hybrid', // Both navigable and expandable
    icon: FiBarChart,
    permission: 'reports.read',
    description: 'Sistem hesabatları və analitika',
    category: 'Reports',
    children: [
      {
        id: 'reports-overview',
        title: 'Ümumi Hesabat',
        path: '/reports',
        type: 'button',
        icon: FiEye,
        permission: 'reports.read',
        exactMatch: true,
      },
      {
        id: 'reports-institutions',
        title: 'Müəssisə Hesabatları',
        path: '/reports/institutions',
        type: 'button',
        icon: FiGrid,
        permission: 'reports.read'
      },
      {
        id: 'reports-surveys',
        title: 'Anket Hesabatları',
        path: '/reports/surveys',
        type: 'button',
        icon: FiTrendingUp,
        permission: 'reports.read'
      },
      {
        id: 'reports-custom',
        title: 'Xüsusi Hesabat',
        path: '/reports/custom',
        type: 'button',
        icon: FiSettings,
        permission: 'reports.create',
      }
    ]
  },

  // Role Management Section (SuperAdmin only)
  {
    id: 'roles',
    title: 'Rollar',
    path: '/roles',
    type: 'hybrid', // Both navigable and expandable
    icon: FiShield,
    permission: 'roles.read',
    roles: ['superadmin'],
    description: 'Rol və icazə idarəetməsi',
    category: 'System Administration',
    children: [
      {
        id: 'roles-list',
        title: 'Rol Siyahısı',
        path: '/roles',
        type: 'button',
        icon: FiList,
        permission: 'roles.read',
        roles: ['superadmin'],
        exactMatch: true,
      },
      {
        id: 'roles-create',
        title: 'Yeni Rol',
        path: '/roles/create',
        type: 'button',
        icon: FiPlus,
        permission: 'roles.create',
        roles: ['superadmin'],
      }
    ]
  },

  // Settings Section
  {
    id: 'settings',
    title: 'Tənzimləmələr',
    path: '/settings',
    type: 'hybrid', // Both navigable and expandable
    icon: FiSettings,
    description: 'Sistem və istifadəçi tənzimləmələri',
    category: 'Settings',
    children: [
      {
        id: 'settings-profile',
        title: 'Profil',
        path: '/settings/profile',
        type: 'button',
        icon: FiUsers,
        description: 'Şəxsi profil tənzimləmələri'
      },
      {
        id: 'settings-system',
        title: 'Sistem',
        path: '/settings/system',
        type: 'button',
        icon: FiSettings,
        roles: ['superadmin'],
        description: 'Sistem tənzimləmələri'
      },
      {
        id: 'settings-regional',
        title: 'Regional',
        path: '/settings/regional',
        type: 'button',
        icon: FiGrid,
        roles: ['regionadmin'],
        description: 'Regional tənzimləmələr'
      }
    ]
  }
];

/**
 * Check if user can access a menu item (unified with navigationPermissions)
 */
export const canAccessMenuItem = (user: User | null, item: MenuItem): boolean => {
  if (!user) return false;

  // SUPERADMIN BYPASS: Superadmin should have access to everything
  const isSuperAdmin = (typeof user.role === 'string' && user.role === 'superadmin') ||
                      (typeof user.role === 'object' && user.role?.name === 'superadmin') ||
                      (user.roles && user.roles.includes('superadmin'));

  if (isSuperAdmin) {
    return true;
  }

  // Try to use centralized navigation permission system first
  if (item.permission) {
    // Create a navigation permission key from the permission
    const navPermissionKey = `${item.permission}`;
    
    // Check if this permission exists in our centralized system
    if (hasNavigationPermission(user, navPermissionKey)) {
      return true;
    }
    
    // Fallback to direct permission check
    return hasPermission(user, item.permission);
  }

  // Check role-based access
  if (item.roles && item.roles.length > 0) {
    return item.roles.some(role => hasRole(user, role));
  }

  // If no specific permission or role required, allow access
  return true;
};

/**
 * Filter menu items based on user permissions
 */
export const getVisibleMenuItems = (user: User | null): MenuItem[] => {
  if (!user) return [];

  const filterMenuItem = (item: MenuItem): MenuItem | null => {
    if (!canAccessMenuItem(user, item)) {
      return null;
    }

    // Filter children if they exist
    if (item.children) {
      const visibleChildren = item.children
        .map(filterMenuItem)
        .filter(Boolean) as MenuItem[];

      // If item has children but none are visible, hide the parent
      if (item.children.length > 0 && visibleChildren.length === 0) {
        return null;
      }

      return {
        ...item,
        children: visibleChildren
      };
    }

    return item;
  };

  const filteredItems = menuItems
    .map(filterMenuItem)
    .filter(Boolean) as MenuItem[];

  // Remove duplicates based on item id
  const uniqueItems = filteredItems.filter((item, index, arr) => 
    arr.findIndex(i => i.id === item.id) === index
  );

  return uniqueItems;
};

/**
 * Get menu item by path
 */
export const getMenuItemByPath = (path: string, items: MenuItem[] = menuItems): MenuItem | null => {
  for (const item of items) {
    if (item.exactMatch ? item.path === path : path.startsWith(item.path)) {
      return item;
    }

    if (item.children) {
      const found = getMenuItemByPath(path, item.children);
      if (found) return found;
    }
  }

  return null;
};

/**
 * Get breadcrumb items for current path
 */
export const getBreadcrumbItems = (path: string, items: MenuItem[] = menuItems): MenuItem[] => {
  const breadcrumb: MenuItem[] = [];

  const findPathInItems = (currentPath: string, currentItems: MenuItem[], parentItem?: MenuItem): boolean => {
    for (const item of currentItems) {
      const isMatch = item.exactMatch ? item.path === currentPath : currentPath.startsWith(item.path);
      
      if (isMatch) {
        if (parentItem) {
          breadcrumb.push(parentItem);
        }
        breadcrumb.push(item);
        return true;
      }

      if (item.children) {
        if (findPathInItems(currentPath, item.children, item)) {
          return true;
        }
      }
    }

    return false;
  };

  findPathInItems(path, items);
  return breadcrumb;
};

/**
 * Check if current path is active
 */
export const isPathActive = (currentPath: string, itemPath: string, exactMatch?: boolean): boolean => {
  if (exactMatch) {
    return currentPath === itemPath;
  }

  if (currentPath === itemPath) return true;
  
  // Special case for dashboard
  if (itemPath === '/dashboard') {
    return currentPath === '/dashboard' || currentPath === '/';
  }
  
  // Check if current path is a child of item path
  if (itemPath !== '/' && currentPath.startsWith(itemPath)) {
    return true;
  }

  return false;
};

/**
 * Get menu statistics for admin dashboard
 */
export const getMenuStatistics = (user: User | null): {
  totalItems: number;
  visibleItems: number;
  hiddenItems: number;
  accessibleFeatures: string[];
  byCategory: Record<string, { visible: number; total: number }>;
} => {
  const visibleItems = getVisibleMenuItems(user);
  
  const countItems = (items: MenuItem[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countItems(item.children) : 0);
    }, 0);
  };

  const totalCount = countItems(menuItems);
  const visibleCount = countItems(visibleItems);

  const accessibleFeatures = visibleItems.map(item => item.title);

  // Count by category
  const byCategory: Record<string, { visible: number; total: number }> = {};
  
  const countByCategory = (items: MenuItem[], isVisible: boolean) => {
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!byCategory[category]) {
        byCategory[category] = { visible: 0, total: 0 };
      }
      byCategory[category].total++;
      if (isVisible) {
        byCategory[category].visible++;
      }
      
      if (item.children) {
        countByCategory(item.children, isVisible);
      }
    });
  };

  countByCategory(menuItems, false);
  countByCategory(visibleItems, true);

  return {
    totalItems: totalCount,
    visibleItems: visibleCount,
    hiddenItems: totalCount - visibleCount,
    accessibleFeatures,
    byCategory
  };
};

/**
 * Get quick actions based on user permissions
 */
export const getQuickActions = (user: User | null): MenuItem[] => {
  const quickActionPaths = [
    '/users/create',
    '/institutions/create',
    '/surveys/create',
    '/roles/create',
    '/tasks/create',
    '/documents/upload'
  ];

  const allItems = [...menuItems];
  const flattenItems = (items: MenuItem[]): MenuItem[] => {
    return items.reduce((acc, item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flattenItems(item.children));
      }
      return acc;
    }, [] as MenuItem[]);
  };

  const flatItems = flattenItems(allItems);
  
  return quickActionPaths
    .map(path => flatItems.find(item => item.path === path))
    .filter(Boolean)
    .filter(item => canAccessMenuItem(user, item!)) as MenuItem[];
};

/**
 * Get menu items by category
 */
export const getMenuItemsByCategory = (user: User | null): Record<string, MenuItem[]> => {
  const visibleItems = getVisibleMenuItems(user);
  const grouped: Record<string, MenuItem[]> = {};

  const groupItems = (items: MenuItem[]) => {
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
  };

  groupItems(visibleItems);
  return grouped;
};

/**
 * Search menu items by title or description
 */
export const searchMenuItems = (user: User | null, query: string): MenuItem[] => {
  const visibleItems = getVisibleMenuItems(user);
  const searchTerm = query.toLowerCase();

  const searchInItems = (items: MenuItem[]): MenuItem[] => {
    const results: MenuItem[] = [];
    
    items.forEach(item => {
      const matchesTitle = item.title.toLowerCase().includes(searchTerm);
      const matchesDescription = item.description?.toLowerCase().includes(searchTerm);
      
      if (matchesTitle || matchesDescription) {
        results.push(item);
      }
      
      if (item.children) {
        results.push(...searchInItems(item.children));
      }
    });
    
    return results;
  };

  return searchInItems(visibleItems);
};