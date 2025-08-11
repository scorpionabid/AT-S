import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  MapPin,
  Building2,
  School,
  ClipboardList,
  BarChart3,
  Archive,
  CheckSquare,
  BookOpen,
  Link,
  TreePine,
  Bell,
  Database,
  Monitor,
  Settings,
  Clipboard,
  Baby,
  GraduationCap,
  Download,
  LucideIcon
} from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: LucideIcon;
  children?: MenuItem[];
  roles?: UserRole[];
  description?: string;
}

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
  roles?: UserRole[];
}

export const navigationConfig: MenuGroup[] = [
  {
    id: 'idareetme',
    label: 'İdarəetmə',
    roles: ['SuperAdmin'],
    items: [
      {
        id: 'dashboard',
        label: 'Ana səhifə',
        path: '/',
        icon: LayoutDashboard,
        roles: ['SuperAdmin']
      },
      {
        id: 'notifications',
        label: 'Bildirişlər',
        path: '/notifications',
        icon: Bell,
        roles: ['SuperAdmin']
      },
      {
        id: 'users',
        label: 'İstifadəçilər',
        path: '/users',
        icon: Users,
        roles: ['SuperAdmin']
      },
      {
        id: 'roles',
        label: 'Rollar',
        path: '/roles',
        icon: Shield,
        roles: ['SuperAdmin']
      },
      {
        id: 'tasks',
        label: 'Tapşırıqlar',
        path: '/tasks',
        icon: FileText,
        roles: ['SuperAdmin']
      }
    ]
  },
  {
    id: 'struktur',
    label: 'Struktur',
    roles: ['SuperAdmin'],
    items: [
      {
        id: 'departments',
        label: 'Departmentlər',
        path: '/departments',
        icon: Building2,
        roles: ['SuperAdmin']
      },
      {
        id: 'institutions',
        label: 'Müəssisələr',
        path: '/institutions',
        icon: School,
        roles: ['SuperAdmin']
      },
      {
        id: 'preschools',
        label: 'Məktəbəqədər müəssisələr',
        path: '/preschools',
        icon: Baby,
        roles: ['SuperAdmin']
      },
      {
        id: 'regions',
        label: 'Regionlar',
        path: '/regions',
        icon: MapPin,
        roles: ['SuperAdmin']
      },
      {
        id: 'sectors',
        label: 'Sektorlar',
        path: '/sectors',
        icon: Users,
        roles: ['SuperAdmin']
      },
      {
        id: 'hierarchy',
        label: 'İerarxiya İdarəetməsi',
        path: '/hierarchy',
        icon: Database,
        roles: ['SuperAdmin']
      }
    ]
  },
  {
    id: 'sorqular',
    label: 'Sorğular',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'survey-management',
        label: 'Sorğu İdarəetməsi',
        icon: ClipboardList,
        roles: ['SuperAdmin'],
        children: [
          {
            id: 'surveys',
            label: 'Sorğular',
            path: '/surveys',
            roles: ['SuperAdmin']
          },
          {
            id: 'survey-approval',
            label: 'Təsdiq',
            path: '/surveys/approval',
            roles: ['SuperAdmin']
          },
          {
            id: 'survey-results',
            label: 'Sorğu nəticələri',
            path: '/surveys/results',
            roles: ['SuperAdmin']
          },
          {
            id: 'survey-archive',
            label: 'Arxiv',
            path: '/surveys/archive',
            roles: ['SuperAdmin']
          }
        ]
      },
      {
        id: 'school-management',
        label: 'Məktəb İdarəetməsi',
        icon: GraduationCap,
        roles: ['SuperAdmin'],
        children: [
          {
            id: 'school-workload',
            label: 'Dərs Yükü',
            path: '/school/workload',
            roles: ['SuperAdmin']
          },
          {
            id: 'school-schedules',
            label: 'Dərs Cədvəli',
            path: '/school/schedules',
            roles: ['SuperAdmin']
          },
          {
            id: 'school-attendance',
            label: 'Davamiyyət',
            path: '/school/attendance',
            roles: ['SuperAdmin']
          },
          {
            id: 'school-assessments',
            label: 'Qiymətləndirmələr',
            path: '/school/assessments',
            roles: ['SuperAdmin']
          }
        ]
      }
    ]
  },
  {
    id: 'mezmun',
    label: 'Məzmun',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'documents',
        label: 'Sənədlər',
        path: '/documents',
        icon: FileText,
        roles: ['SuperAdmin', 'RegionAdmin']
      },
      {
        id: 'links',
        label: 'Linklər',
        path: '/links',
        icon: Link,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'hesabatlar',
    label: 'Hesabatlar',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'reports',
        label: 'Hesabatlar',
        path: '/reports',
        icon: Download,
        roles: ['SuperAdmin', 'RegionAdmin']
      },
      {
        id: 'analytics',
        label: 'Sistem Statistikası',
        path: '/analytics',
        icon: BarChart3,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'sistem',
    label: 'Sistem',
    roles: ['SuperAdmin'],
    items: [
      {
        id: 'settings',
        label: 'Sistem Parametrləri',
        path: '/settings',
        icon: Settings,
        roles: ['SuperAdmin']
      },
      {
        id: 'audit-logs',
        label: 'Audit Logları',
        path: '/audit-logs',
        icon: Clipboard,
        roles: ['SuperAdmin']
      },
      {
        id: 'performance',
        label: 'Performans Monitorinqi',
        path: '/performance',
        icon: Monitor,
        roles: ['SuperAdmin']
      }
    ]
  }
];

export const getMenuForRole = (role: UserRole): MenuGroup[] => {
  // Map new role names to compatible navigation roles
  const navigationRole = mapRoleForNavigation(role);
  
  return navigationConfig
    .filter(group => !group.roles || group.roles.includes(navigationRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.includes(navigationRole))
    }))
    .filter(group => group.items.length > 0);
};

// Helper function to map backend roles to navigation roles
function mapRoleForNavigation(role: UserRole): UserRole {
  const roleMapping: Record<UserRole, UserRole> = {
    'superadmin': 'SuperAdmin',
    'regionadmin': 'RegionAdmin',
    'regionoperator': 'RegionAdmin',
    'sektoradmin': 'RegionAdmin',
    'məktəbadmin': 'User',
    'müəllim': 'User',
    'user': 'User'
  };
  
  return roleMapping[role] || 'User';
}

export const findMenuItem = (path: string): MenuItem | null => {
  for (const group of navigationConfig) {
    for (const item of group.items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = item.children.find(child => child.path === path);
        if (found) return found;
      }
    }
  }
  return null;
};