import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { Icon } from '../common/Icon';
import { isPathActive } from '../../utils/navigation';

interface NavigationItem {
  id?: string;
  name?: string;
  title?: string;
  path?: string;
  href?: string;
  icon?: string;
  badge?: string | { text: string; color?: string } | number;
  children?: NavigationItem[];
}

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
  
  const itemTitle = item.title || item.name || '';
  const itemId = item.id || item.name || '';

  const renderBadge = () => {
    if (!item.badge) return null;
    
    if (typeof item.badge === 'string' || typeof item.badge === 'number') {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full dark:bg-primary-900 dark:text-primary-300">
          {item.badge}
        </span>
      );
    }
    
    if (typeof item.badge === 'object' && item.badge.text) {
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
    flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg
    transition-smooth group relative
    ${level > 0 ? 'ml-6' : ''}
    ${isActive 
      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
    }
  `;

  const iconClasses = `
    ${isCollapsed ? 'mx-auto' : 'mr-3'} 
    flex-shrink-0 w-5 h-5
    ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}
  `;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => onToggle(itemId)}
          className={baseClasses}
          aria-expanded={isExpanded}
        >
          {item.icon && (
            <Icon 
              name={item.icon} 
              className={iconClasses}
            />
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
    return (
      <a
        href={item.href}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.icon && (
          <Icon 
            name={item.icon} 
            className={iconClasses}
          />
        )}
        
        {!isCollapsed && (
          <>
            <span className="flex-1">{itemTitle}</span>
            {renderBadge()}
          </>
        )}
      </a>
    );
  }

  if (item.path) {
    return (
      <Link
        to={item.path}
        className={baseClasses}
      >
        {item.icon && (
          <Icon 
            name={item.icon} 
            className={iconClasses}
          />
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

  return (
    <div className={baseClasses}>
      {item.icon && (
        <Icon 
          name={item.icon} 
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