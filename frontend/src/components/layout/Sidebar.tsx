import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SidebarContent from './SidebarContent';

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
  const { user } = useAuth();
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    closeMobile, 
    screenSize 
  } = useLayout();

  // Navigation state
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Toggle submenu expansion with useCallback for performance
  const toggleSubmenu = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Handle mobile overlay click
  const handleOverlayClick = useCallback(() => {
    if (screenSize === 'mobile') {
      closeMobile();
    }
  }, [screenSize, closeMobile]);

  // Mobile overlay and sidebar classes
  const mobileOverlayClasses = [
    'mobile-overlay',
    screenSize === 'mobile' && isMobileOpen ? 'active' : ''
  ].filter(Boolean).join(' ');

  // Generate CSS classes for sidebar
  const sidebarClasses = [
    'app-sidebar',
    isCollapsed ? 'collapsed' : '',
    screenSize === 'mobile' && isMobileOpen ? 'mobile-open' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {screenSize === 'mobile' && (
        <div 
          className={mobileOverlayClasses}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={sidebarClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
        {!isCollapsed ? (
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">
              {import.meta.env.VITE_APP_NAME || 'ATİS'}
            </span>
          </Link>
        ) : (
          <Link 
            to="/" 
            className="w-8 h-8 mx-auto rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold"
            title={import.meta.env.VITE_APP_NAME || 'ATİS'}
          >
            A
          </Link>
        )}
        
        <button
          onClick={toggleCollapse}
          className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-smooth"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-5 h-5" />
          ) : (
            <FiChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <SidebarContent
        isCollapsed={isCollapsed}
        expandedItems={expandedItems}
        onToggleSubmenu={toggleSubmenu}
      />

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {user?.firstName || user?.username || 'User'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Sidebar;