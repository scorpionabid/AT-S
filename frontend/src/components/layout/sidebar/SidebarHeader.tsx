import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = memo(({ isCollapsed, onToggleCollapse }) => {
  return (
    <div className="sidebar-header flex items-center justify-between p-3 bg-[var(--sidebar-header-bg)]">
      <Link 
        to="/" 
        className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2'}`}
        title={isCollapsed ? import.meta.env.VITE_APP_NAME || 'ATİS' : ''}
      >
        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-600)] flex items-center justify-center text-white font-bold flex-shrink-0">
          A
        </div>
        {!isCollapsed && (
          <span className="text-base font-semibold text-[var(--sidebar-text)] truncate">
            {import.meta.env.VITE_APP_NAME || 'ATİS'}
          </span>
        )}
      </Link>
      
      <button
        onClick={onToggleCollapse}
        className={`p-1.5 text-[var(--sidebar-icon)] hover:text-[var(--sidebar-hover-icon)] hover:bg-[var(--sidebar-hover-bg)] rounded-lg transition-smooth ${isCollapsed ? 'hidden' : ''}`}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
      </button>
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;