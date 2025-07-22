import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { getVisibleMenuItems, isPathActive } from '../../utils/navigation';
import { Icon, IconName } from '../common/Icon';
// SCSS modules removed - using Tailwind CSS classes

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
    toggleMobile,
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

  // Tailwind CSS classes based on state
  const sidebarClasses = [
    // Base sidebar styles with proper contrast
    'fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out z-30 overflow-y-auto border-r border-gray-200 dark:border-gray-700',
    
    // Width based on screen size and collapsed state
    screenSize === 'mobile' ? 'w-72' : (isCollapsed ? 'w-20' : 'w-72'),
    
    // Mobile state - always show on desktop, conditionally on mobile
    screenSize === 'mobile' 
      ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
      : 'translate-x-0',
    
    // Scrollbar styles
    'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent',
    
    className
  ].filter(Boolean).join(' ');

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobileOpen && screenSize === 'mobile') {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-sidebar]')) {
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
      <div key={item.id || item.path} className="relative">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.id || '')}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
                active 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {item.icon && (
                    <span className="flex items-center justify-center w-6 h-6 mr-3">
                      <Icon name={item.icon as IconName} />
                    </span>
                  )}
                  {!isCollapsed && <span className="font-medium">{item.title || item.name}</span>}
                </div>
                <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  <FiChevronDown />
                </span>
              </div>
            </button>
            
            {isExpanded && !isCollapsed && item.children && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map(child => renderNavItem(child))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.path || '#'}
            onClick={() => screenSize === 'mobile' && closeMobile()}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
              active 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {item.icon && isIconString(item.icon) && (
                  <span className="flex items-center justify-center w-6 h-6 mr-3">
                    <Icon name={item.icon as IconName} />
                  </span>
                )}
                {!isCollapsed && <span className="font-medium">{item.title || item.name}</span>}
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
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

  // Mobile overlay classes
  const overlayClasses = [
    'fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300',
    screenSize === 'mobile' ? 'block' : 'hidden',
    isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  ].filter(Boolean).join(' ');

  return (
    <React.Fragment>
      {/* Mobile overlay */}
      <div 
        className={overlayClasses}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div 
        className={sidebarClasses} 
        data-sidebar
        style={{
          transitionProperty: 'transform',
          transitionDuration: '300ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed ? (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {import.meta.env.VITE_APP_NAME || 'ATIS'}
              </span>
            </Link>
          ) : (
            <Link to="/" className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </Link>
          )}
          
          <button
            onClick={() => screenSize === 'mobile' ? toggleMobile() : toggleCollapse()}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            aria-label={screenSize === 'mobile' ? 'Toggle menu' : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
          >
            {screenSize === 'mobile' ? (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            ) : isCollapsed ? (
              <FiChevronRight />
            ) : (
              <FiChevronLeft />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => renderNavItem(item))}
        </nav>

        {/* User profile */}
        {user && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.firstName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {typeof user.role === 'string' ? user.role : (user.role?.name || user.role?.display_name || 'User')}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Sidebar;
