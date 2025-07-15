import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { getVisibleMenuItems, isPathActive } from '../../utils/navigation';
import { Icon, IconName } from '../common/Icon';
import styles from './Sidebar.module.scss';

// Extend the base User type to include additional properties
type User = {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  role?: string;
  [key: string]: any; // Allow additional properties
};

interface NavigationItem {
  id?: string;
  name?: string;
  title?: string;
  path?: string;
  href?: string;
  icon?: string | React.ComponentType<any>; // Allow both string and component types
  badge?: string | { text: string; color?: string } | number;
  requiredRoles?: string[];
  children?: NavigationItem[];
}

// Type guard to check if an icon is a string (for Icon component)
const isIconString = (icon: any): icon is string => {
  return typeof icon === 'string';
};

// Convert MenuItem to NavigationItem
const convertToNavigationItem = (item: any): NavigationItem => {
  return {
    id: item.id,
    name: item.name,
    title: item.title,
    path: item.path,
    href: item.href,
    icon: typeof item.icon === 'string' ? item.icon : undefined, // Only use string icons
    badge: item.badge,
    requiredRoles: item.requiredRoles || item.roles,
    children: item.children?.map(convertToNavigationItem)
  };
};

interface SidebarProps {
  className?: string;
  variant?: 'modern' | 'classic';
  theme?: 'light' | 'dark' | 'auto';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  variant = 'modern',
  theme = 'auto'
}) => {
  const { user, logout } = useAuth();
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    closeMobile, 
    screenSize 
  } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Get visible menu items based on user roles and convert to NavigationItem
  const menuItems = useMemo(() => {
    const items = getVisibleMenuItems(user || null);
    return items.map(convertToNavigationItem);
  }, [user]);

  // Toggle submenu expansion
  const toggleSubmenu = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if a menu item is active
  const isActive = (item: NavigationItem): boolean => {
    if (item.path) {
      return isPathActive(location.pathname, item.path);
    }
    
    if (item.children) {
      return item.children.some(child => isActive(child));
    }
    
    return false;
  };

  // Combine classes based on state
  const sidebarClasses = [
    styles.sidebar,
    variant === 'modern' ? styles.modern : styles.classic,
    theme === 'dark' ? styles.dark : styles.light,
    isCollapsed ? styles.collapsed : '',
    isMobileOpen ? styles.open : '',
    className
  ].filter(Boolean).join(' ');

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobileOpen && screenSize === 'mobile') {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(`.${styles.sidebar}`)) {
          closeMobile();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileOpen, screenSize, closeMobile]);

  // Render a single navigation item
  const renderNavItem = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id || '');
    const active = isActive(item);
    
    return (
      <div key={item.id || item.href} className={styles.navItem}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.id || '')}
              className={`${styles.navLink} ${active ? styles.active : ''}`}
            >
              <div className={styles.navContent}>
                {item.icon && (
                  <span className={styles.navIcon}>
                    <Icon name={item.icon as IconName} />
                  </span>
                )}
                {!isCollapsed && <span className={styles.navLabel}>{item.title || item.name}</span>}
                <span className={`${styles.chevron} ${isExpanded ? styles.rotated : ''}`}>
                  <FiChevronDown />
                </span>
              </div>
            </button>
            
            {isExpanded && !isCollapsed && item.children && (
              <div className={styles.submenu}>
                {item.children.map(child => renderNavItem(child))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.href || '#'}
            onClick={() => screenSize === 'mobile' && closeMobile()}
            className={`${styles.navLink} ${active ? styles.active : ''}`}
          >
            <div className={styles.navContent}>
              {item.icon && isIconString(item.icon) && (
                <span className={styles.navIcon}>
                  <Icon name={item.icon as IconName} />
                </span>
              )}
              {!isCollapsed && <span className={styles.navLabel}>{item.title || item.name}</span>}
              {item.badge && (
                <span className={styles.badge}>
                  {typeof item.badge === 'object' ? item.badge.text : item.badge}
                </span>
              )}
            </div>
          </Link>
        )}
      </div>
    );
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mobile overlay
  const overlayClasses = [
    styles.overlay,
    isMobileOpen ? styles.visible : ''
  ].filter(Boolean).join(' ');

  return (
    <React.Fragment>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className={overlayClasses}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header */}
        <div className={styles.header}>
          {!isCollapsed ? (
            <Link to="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>A</div>
              <span className={styles.logoText}>ATIS</span>
            </Link>
          ) : (
            <Link to="/" className={styles.logoLinkCollapsed}>
              <div className={styles.logoIcon}>A</div>
            </Link>
          )}
          
          <button
            onClick={toggleCollapse}
            className={styles.collapseButton}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navContent}>
            {menuItems.map((item) => renderNavItem(item))}
          </div>
        </nav>

        {/* User profile */}
        {user && (
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>
                  {user.firstName || user.username || 'User'}
                </p>
                <p className={styles.userRole}>
                  {user.role || 'User'}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Sidebar;
