import React, { useState, useCallback, ReactNode, memo } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { cn } from '../../utils/cn';
import SidebarContent from './SidebarContent';
import SidebarHeader from './sidebar/SidebarHeader';
import UserProfile from './sidebar/UserProfile';
import MobileOverlay from './sidebar/MobileOverlay';
import { useKeyboardNavigation } from './sidebar/useKeyboardNavigation';

interface SidebarProps {
  className?: string;
  variant?: 'modern' | 'classic';
  children?: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = memo(({
  className = '',
  variant = 'modern',
  children
}) => {
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop'
  } = useLayout();
  
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Handle keyboard navigation
  const handleKeyDown = useKeyboardNavigation({
    showSettingsMenu: false,
    isCollapsed,
    isMobileOpen,
    onToggleCollapse: toggleCollapse,
    onCloseMobile: closeMobile,
  });

  // Toggle submenu expansion with useCallback for performance
  const toggleSubmenu = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Sidebar classes
  const sidebarClasses = cn(
    'app-sidebar',
    'flex flex-col h-screen fixed left-0 top-0 z-40',
    'transition-all duration-300 ease-in-out',
    'bg-[var(--sidebar-bg)]',
    'shadow-lg',
    isCollapsed ? 'w-16' : 'w-64',
    className,
    variant === 'modern' && 'border-r border-[var(--sidebar-border)]',
    {
      'translate-x-0': isMobileOpen || screenSize !== 'mobile',
      '-translate-x-full': !isMobileOpen && screenSize === 'mobile'
    } as const
  );

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <MobileOverlay 
        isVisible={isMobileOpen && screenSize === 'mobile'} 
        onClose={closeMobile} 
      />
      
      <aside 
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
      >
        <SidebarHeader 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />

        <SidebarContent
          isCollapsed={isCollapsed}
          expandedItems={expandedItems}
          onToggleSubmenu={toggleSubmenu}
        />

        <UserProfile isCollapsed={isCollapsed} />
      </aside>
      
      {children}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;