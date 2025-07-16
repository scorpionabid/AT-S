import React, { useState, useCallback, useEffect, useRef, ReactNode, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { cn } from '../../utils/cn';
import type { NavigationItem } from './SidebarContent';
import SidebarContent from './SidebarContent';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiUser, 
  FiLogOut, 
  FiSun, 
  FiMoon,
  FiChevronDown,
  FiSettings
} from 'react-icons/fi';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

interface LayoutContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
  screenSize: ScreenSize;
  theme: 'light' | 'dark' | 'auto';
  toggleTheme: () => void;
}

interface UserType {
  username?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface SidebarProps {
  className?: string;
  variant?: 'modern' | 'classic';
  theme?: 'light' | 'dark' | 'auto';
  children?: ReactNode;
}

// TypeScript types and interfaces

const NewSidebar: React.FC<SidebarProps> = ({
  className = '',
  variant = 'modern',
  theme = 'auto',
  children
}) => {
  // Hooks
  const { user, logout } = useAuth();
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop',
    theme: currentTheme = 'light',
    toggleTheme 
  } = useLayout() as unknown as LayoutContextType;
  
  const navigate = useNavigate();
  const settingsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // State
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const userData = user as UserType | null;
  
  // Event Handlers
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [logout, navigate]);

  const toggleSubmenu = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleMenuItemClick = useCallback((item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // If item has children, toggle the submenu
      toggleSubmenu(item.id || item.path || '');
    } else if (item.path) {
      // If item has a path, navigate to it
      navigate(item.path);
      // Close mobile menu when an item is clicked
      if (screenSize === 'mobile') {
        closeMobile();
      }
    }
  }, [toggleSubmenu, screenSize, closeMobile, navigate]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && isMobileOpen) {
      closeMobile();
    } else if (e.key === 'Tab' && !e.shiftKey && !isCollapsed) {
      // Handle tab navigation within sidebar
      const focusableElements = sidebarRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex="0"]'
      ) as NodeListOf<HTMLElement> | undefined;
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (document.activeElement === lastElement && !e.shiftKey) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isMobileOpen, isCollapsed, closeMobile]);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileOpen && screenSize === 'mobile') {
      closeMobile();
    }
  }, [location.pathname, isMobileOpen, screenSize, closeMobile]);

  // Auto-close settings menu on mobile when sidebar collapses
  useEffect(() => {
    if (isCollapsed && showSettingsMenu) {
      setShowSettingsMenu(false);
    }
  }, [isCollapsed, showSettingsMenu]);

  // Auto-expand parent items when a child is active
  useEffect(() => {
    const activeItem = document.querySelector('.sidebar-item-active');
    if (activeItem) {
      const parentItem = activeItem.closest('.sidebar-item-has-children');
      if (parentItem) {
        const itemId = parentItem.getAttribute('data-item-id');
        if (itemId && !expandedItems.includes(itemId)) {
          setExpandedItems(prev => [...prev, itemId]);
        }
      }
    }
  }, [location.pathname, expandedItems]);

  // Close mobile menu when screen size changes to mobile
  useEffect(() => {
    if (screenSize === 'mobile') {
      closeMobile();
    }
  }, [closeMobile, screenSize]);

  // Styles
  const sidebarClasses = cn(
    'app-sidebar',
    'flex flex-col h-screen fixed left-0 top-0 z-40',
    'transition-all duration-300 ease-in-out',
    'bg-white dark:bg-neutral-800',
    'shadow-lg',
    isCollapsed ? 'w-16' : 'w-64',
    className,
    variant === 'modern' && 'border-r border-neutral-200 dark:border-neutral-700',
    {
      'translate-x-0': isMobileOpen || screenSize !== 'mobile',
      '-translate-x-full': !isMobileOpen && screenSize === 'mobile'
    } as const
  );

  const settingsMenuClasses = cn(
    'settings-menu absolute bottom-full right-0 mb-2 w-56 z-50',
    'bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-1',
    'border border-neutral-200 dark:border-neutral-700',
    'transition-all duration-200 ease-in-out',
    'opacity-0 invisible translate-y-2',
    {
      'opacity-100 visible translate-y-0': showSettingsMenu
    }
  );

  return (
    <div className={cn(
      'flex h-screen bg-background transition-all duration-300 ease-in-out',
      className
    )}>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeMobile}
          role="presentation"
          aria-hidden={!isMobileOpen}
        />
      )}
      
      <div 
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
          'flex flex-col bg-gradient-to-b from-background to-background/95',
          'border-r border-border/50 shadow-lg',
          'overflow-hidden',
          isCollapsed ? 'w-[70px]' : 'w-[260px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          className
        )}
        aria-label="Sidebar"
      >
        {/* Sidebar header */}
        <div className="sidebar-header flex items-center justify-between p-3">
          <Link 
            to="/" 
            className={cn(
              'flex items-center transition-opacity duration-200',
              isCollapsed ? 'justify-center w-full' : 'space-x-2'
            )}
            aria-label={isCollapsed ? 'Go to home' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {import.meta.env.VITE_APP_NAME || 'ATIS'}
              </span>
            )}
          </Link>
          
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
          )}
        </div>

        {/* Navigation content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1">
          <SidebarContent 
            isCollapsed={isCollapsed}
            expandedItems={expandedItems}
            onToggleSubmenu={(itemId: string) => {
              setExpandedItems(prev => 
                prev.includes(itemId) 
                  ? prev.filter(id => id !== itemId)
                  : [...prev, itemId]
              );
            }}
          />
        </div>

        {/* Sidebar footer */}
        <div className="sidebar-footer border-t border-neutral-200 dark:border-neutral-700 p-3 mt-auto">
          <div 
            ref={settingsRef}
            className="relative"
          >
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={cn(
                'w-full flex items-center p-2 rounded-lg transition-colors',
                'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                isCollapsed ? 'justify-center' : 'justify-between'
              )}
              aria-expanded={showSettingsMenu}
              aria-haspopup="true"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                {!isCollapsed && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                      {userData?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                      {userData?.email || 'user@example.com'}
                    </p>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <FiChevronDown 
                  className={cn(
                    'transform transition-transform',
                    showSettingsMenu ? 'rotate-180' : ''
                  )} 
                  size={16} 
                />
              )}
            </button>

            {/* Dropdown menu */}
            {showSettingsMenu && !isCollapsed && (
              <div className="absolute bottom-full mb-2 left-0 right-0 mx-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FiSun className="mr-3" size={16} />
                  <span>Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span className="flex items-center">
                    <FiLogOut className="mr-2" /> Sign out
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default NewSidebar;
