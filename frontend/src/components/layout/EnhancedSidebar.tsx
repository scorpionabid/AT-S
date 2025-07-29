/**
 * ATİS Enhanced Sidebar Component
 * Modern sidebar using modular CSS architecture
 */

import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, FileText, Settings, ChevronRight, ChevronLeft, 
  X, Menu, BarChart3, Building2, ClipboardList, BookOpen,
  DollarSign, Shield, Wrench, GraduationCap
} from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  id: string;
  title: string;
  path?: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
  department?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    id: 'departments',
    title: 'Departamentlər',
    icon: Building2,
    children: [
      {
        id: 'finance',
        title: 'Maliyyə',
        path: '/departments/finance',
        icon: DollarSign,
        department: 'finance'
      },
      {
        id: 'admin',
        title: 'İdarəetmə',
        path: '/departments/administrative',
        icon: Shield,
        department: 'admin'
      },
      {
        id: 'facility',
        title: 'Texniki Xidmət',
        path: '/departments/facility',
        icon: Wrench,
        department: 'facility'
      }
    ]
  },
  {
    id: 'institutions',
    title: 'Təhsil Müəssisələri',
    path: '/institutions',
    icon: GraduationCap,
    department: 'institutions'
  },
  {
    id: 'assessments',
    title: 'Qiymətləndirmə',
    path: '/assessment',
    icon: ClipboardList,
    department: 'assessment'
  },
  {
    id: 'surveys',
    title: 'Sorğular',
    path: '/surveys',
    icon: FileText,
    department: 'surveys'
  },
  {
    id: 'reports',
    title: 'Hesabatlar',
    path: '/reports',
    icon: BarChart3,
    department: 'reports'
  },
  {
    id: 'users',
    title: 'İstifadəçilər',
    path: '/users',
    icon: Users
  },
  {
    id: 'settings',
    title: 'Tənzimləmələr',
    path: '/settings',
    icon: Settings
  }
];

const EnhancedSidebar: React.FC = () => {
  const { isCollapsed, toggleCollapse, screenSize, isMobileOpen, toggleMobile, closeMobile } = useLayout();
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isExpanded = screenSize === 'mobile' ? true : !isCollapsed;

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const isPathActive = useCallback((path?: string, children?: NavigationItem[]) => {
    if (path && location.pathname === path) return true;
    if (children) {
      return children.some(child => isPathActive(child.path, child.children));
    }
    return false;
  }, [location.pathname]);

  const handleMouseEnter = useCallback(() => {
    if (screenSize === 'desktop' && isCollapsed) {
      // Hover functionality can be added here if needed
    }
  }, [screenSize, isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      // Hover functionality can be added here if needed
    }
  }, [screenSize]);

  const renderNavItem = (item: NavigationItem, level = 0): React.JSX.Element => {
    const isActive = isPathActive(item.path, item.children);
    const isItemExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
      return (
        <li key={item.id} className="sidebar-nav-item">
          <button
            className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
            onClick={() => toggleExpanded(item.id)}
            aria-expanded={isItemExpanded}
          >
            <Icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{item.title}</span>
            <ChevronRight 
              className={`sidebar-nav-expand ${isItemExpanded ? 'sidebar-nav-expand-open' : ''}`}
            />
          </button>
          
          {isItemExpanded && (
            <ul className="sidebar-submenu sidebar-submenu-list sidebar-submenu-open">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    if (item.path) {
      return (
        <li key={item.id} className="sidebar-nav-item">
          <Link
            to={item.path}
            className={`sidebar-nav-link ${item.department ? `sidebar-nav-link-${item.department}` : ''} ${isActive ? 'sidebar-nav-link-active' : ''}`}
            onClick={screenSize === 'mobile' ? closeMobile : undefined}
          >
            <Icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{item.title}</span>
          </Link>
        </li>
      );
    }

    return (
      <li key={item.id} className="sidebar-nav-item">
        <button
          className="sidebar-nav-link"
          disabled
        >
          <Icon className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">{item.title}</span>
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {screenSize === 'mobile' && isMobileOpen && (
        <div 
          className="sidebar-overlay sidebar-overlay-visible"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar
          ${isCollapsed ? 'sidebar-collapsed' : ''}
          ${screenSize === 'mobile' ? (isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile') : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-logo">
            <div className="sidebar-logo-icon">A</div>
            <span className="sidebar-logo-text">ATİS</span>
          </Link>
          
          {screenSize === 'mobile' && (
            <button className="sidebar-toggle" onClick={closeMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navigationItems.map(item => renderNavItem(item))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'İstifadəçi'}</div>
              <div className="sidebar-user-role">{user?.role || 'Rol'}</div>
            </div>
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        {screenSize === 'desktop' && (
          <button
            className="sidebar-toggle"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Sidebar genişləndir' : 'Sidebar daralt'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </aside>
    </>
  );
};

export default EnhancedSidebar;