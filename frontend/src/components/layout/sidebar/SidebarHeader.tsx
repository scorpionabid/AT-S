import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// import useHoverEffects from './useHoverEffects';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = memo(({ isCollapsed, onToggleCollapse }) => {
  const logoHover = {
    handlers: {
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      onClick: (e: React.MouseEvent) => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onFocus: () => {},
      onBlur: () => {}
    },
    styles: {
      transform: 'scale(1)',
      opacity: 1,
      boxShadow: 'none',
      transition: 'all 0.2s ease-out'
    }
  };
  
  // Simple click handler for the collapse button
  const handleCollapseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleCollapse();
  };
  return (
    <div className="sidebar-header group">
      <Link 
        to="/" 
        className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center w-full' : 'space-x-2'}`}
        title={isCollapsed ? import.meta.env.VITE_APP_NAME || 'ATİS' : ''}
        {...logoHover.handlers}
        style={logoHover.styles}
      >
        <div className="sidebar-header-logo bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 rounded-lg">
          <span className="drop-shadow-sm">A</span>
        </div>
        {!isCollapsed && (
          <span className="sidebar-header-title truncate">
            {import.meta.env.VITE_APP_NAME || 'ATİS'}
          </span>
        )}
      </Link>
      
      {!isCollapsed && (
        <button
          onClick={handleCollapseClick}
          className="sidebar-header-toggle"
          aria-label="Collapse sidebar"
        >
          <FiChevronLeft className="w-5 h-5 transition-transform duration-200" />
        </button>
      )}
      
      {isCollapsed && (
        <button
          onClick={handleCollapseClick}
          className="sidebar-header-toggle absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          aria-label="Expand sidebar"
        >
          <FiChevronRight className="w-4 h-4 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;