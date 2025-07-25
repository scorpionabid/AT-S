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
    <>

      
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
          className="sidebar-header-toggle absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 z-10"
          aria-label="Expand sidebar"
        >
          <FiChevronRight className="w-4 h-4 transition-transform duration-200" />
        </button>
      )}
    </>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;