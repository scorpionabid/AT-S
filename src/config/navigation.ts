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
    id: 'dashboard',
    label: 'Ana Panel',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'dashboard',
        label: 'İdarəetmə Paneli',
        path: '/',
        icon: LayoutDashboard,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'administration',
    label: 'İdarəetmə',
    roles: ['SuperAdmin'],
    items: [
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
      }
    ]
  },
  {
    id: 'structure',
    label: 'Struktur',
    roles: ['SuperAdmin'],
    items: [
      {
        id: 'regions',
        label: 'Regionlar',
        path: '/regions',
        icon: MapPin,
        roles: ['SuperAdmin']
      },
      {
        id: 'departments',
        label: 'Departamentlər',
        path: '/departments',
        icon: Building2,
        roles: ['SuperAdmin']
      },
      {
        id: 'institutions',
        label: 'Təhsil Müəssisələri',
        path: '/institutions',
        icon: School,
        roles: ['SuperAdmin']
      },
      {
        id: 'preschools',
        label: 'Məktəbəqədər Tərbiyə',
        path: '/preschools',
        icon: TreePine,
        roles: ['SuperAdmin']
      }
    ]
  },
  {
    id: 'surveys',
    label: 'Sorğular',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'surveys',
        label: 'Sorğular',
        path: '/surveys',
        icon: ClipboardList,
        roles: ['SuperAdmin', 'RegionAdmin']
      },
      {
        id: 'survey-results',
        label: 'Nəticələr',
        path: '/survey-results',
        icon: BarChart3,
        roles: ['SuperAdmin', 'RegionAdmin']
      },
      {
        id: 'survey-approval',
        label: 'Təsdiq',
        path: '/survey-approval',
        icon: CheckSquare,
        roles: ['SuperAdmin']
      },
      {
        id: 'survey-archive',
        label: 'Arxiv',
        path: '/survey-archive',
        icon: Archive,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'content',
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
        label: 'Keçidlər',
        path: '/links',
        icon: Link,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'reporting',
    label: 'Hesabatlar',
    roles: ['SuperAdmin', 'RegionAdmin'],
    items: [
      {
        id: 'reports',
        label: 'Hesabatlar',
        path: '/reports',
        icon: BarChart3,
        roles: ['SuperAdmin', 'RegionAdmin']
      },
      {
        id: 'tasks',
        label: 'Tapşırıqlar',
        path: '/tasks',
        icon: CheckSquare,
        roles: ['SuperAdmin', 'RegionAdmin']
      }
    ]
  },
  {
    id: 'system',
    label: 'Sistem',
    roles: ['SuperAdmin'],
    items: [
      {
        id: 'hierarchy',
        label: 'İerarxiya',
        path: '/hierarchy',
        icon: TreePine,
        roles: ['SuperAdmin']
      },
      {
        id: 'sectors',
        label: 'Sektorlar',
        path: '/sectors',
        icon: Building2,
        roles: ['SuperAdmin']
      }
    ]
  }
];

export const getMenuForRole = (role: UserRole): MenuGroup[] => {
  return navigationConfig
    .filter(group => !group.roles || group.roles.includes(role))
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.includes(role))
    }))
    .filter(group => group.items.length > 0);
};

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