import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { isPathActive } from '../../utils/navigation';
import { NavigationItem } from './SidebarContent';

interface SidebarItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: (itemId: string) => void;
  level?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = memo(({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  level = 0,
}) => {
  const location = useLocation();
  
  const isActive = item.path ? isPathActive(location.pathname, item.path) : false;
  const hasChildren = item.children && item.children.length > 0;
  
  const itemTitle = item.title || item.name;
  const itemId = item.id;

  const renderBadge = () => {
    if (!item.badge) return null;
    
    if (typeof item.badge === 'string' || typeof item.badge === 'number') {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full dark:bg-primary-900 dark:text-primary-300">
          {item.badge}
        </span>
      );
    }
    
    if (item.badge && typeof item.badge === 'object' && 'text' in item.badge) {
      const badgeColor = item.badge.color || 'primary';
      return (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-${badgeColor}-600 bg-${badgeColor}-100 rounded-full dark:bg-${badgeColor}-900 dark:text-${badgeColor}-300`}>
          {item.badge.text}
        </span>
      );
    }
    
    return null;
  };

    const baseClasses = `
    flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg
    transition-all duration-200 ease-in-out group relative overflow-hidden
    ${level > 0 ? 'ml-4' : ''}
    ${isActive 
      ? 'bg-primary-50/80 text-primary-700 dark:bg-primary-900/60 dark:text-primary-100 font-semibold shadow-sm' 
      : 'text-neutral-700 hover:bg-neutral-100/80 dark:text-neutral-300 dark:hover:bg-neutral-700/40 hover:text-neutral-900 dark:hover:text-white'
    }
    ${isCollapsed && level === 0 ? 'justify-center' : ''}
  `;

    const iconClasses = `
    ${isCollapsed ? 'mx-auto' : 'mr-3'} 
    flex-shrink-0 w-5 h-5 transition-all duration-200
    ${isActive 
      ? 'text-primary-600 dark:text-primary-300 scale-110' 
      : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 group-hover:scale-105'
    }
  `;

  if (hasChildren) {
    return (
      <div className="relative group/item">
        <button
          onClick={() => onToggle(itemId)}
          className={baseClasses}
          aria-expanded={isExpanded}
        >
          {item.icon && (
            <span className={iconClasses}>
              {item.icon}
            </span>
          )}
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{itemTitle}</span>
              {renderBadge()}
              <FiChevronDown 
                className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        
        {isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.id || child.name}
                item={child}
                isCollapsed={isCollapsed}
                isExpanded={false}
                onToggle={onToggle}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.href) {
    return null;
  }

  if (item.path) {
    return (
      <Link
        to={item.path}
        className={baseClasses}
        title={isCollapsed ? itemTitle : undefined}
      >
        {item.icon && (
          <span className={iconClasses}>
            {item.icon}
          </span>
        )}
        {!isCollapsed && (
          <>
            <span className="flex-1">{itemTitle}</span>
            {renderBadge()}
          </>
        )}
      </Link>
    );
  }

  if (isActive) {
    return (
      <div className={baseClasses}>
        {/* Active indicator line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 dark:bg-primary-400 rounded-r-md"></div>
        {item.icon && (
          <span className={iconClasses}>
            {item.icon}
          </span>
        )}
        
        {!isCollapsed && (
          <>
            <span className="flex-1">{itemTitle}</span>
            {renderBadge()}
          </>
        )}
        
        {/* Subtle pulse animation for active items */}
        {isActive && (
          <span className="absolute inset-0 rounded-lg bg-primary-100/30 dark:bg-primary-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        )}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {item.icon && (
        <Icon 
          name={item.icon as IconName} 
          className={iconClasses}
        />
      )}
      
      {!isCollapsed && (
        <>
          <span className="flex-1">{itemTitle}</span>
          {renderBadge()}
        </>
      )}
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;