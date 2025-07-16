import React, { memo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { isPathActive } from '../../../utils/navigation';
import { NavigationItem } from '../SidebarContent';
import SidebarIcon, { IconName } from './SidebarIcon';
import Badge from './Badge';
// import useHoverEffects from './useHoverEffects';

export interface EnhancedSidebarItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggle: (itemId: string) => void;
  level?: number;
  variant?: 'default' | 'compact' | 'minimal';
}

const EnhancedSidebarItem: React.FC<EnhancedSidebarItemProps> = memo(({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  level = 0,
  variant = 'default'
}) => {
  const location = useLocation();
  const itemRef = useRef<HTMLElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Enhanced hover effects (simplified)
  const [isHovered, setIsHovered] = useState(false);
  const hoverEffects = {
    isHovered,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: (e: React.MouseEvent) => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onFocus: () => {},
      onBlur: () => {}
    },
    styles: {
      transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
      opacity: 1,
      boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s ease-out'
    },
    classes: ''
  };
  
  const isActive = item.path ? isPathActive(location.pathname, item.path) : false;
  const hasChildren = item.children && item.children.length > 0;
  const itemTitle = item.title || item.name;
  const itemId = item.id || item.name || item.path || Math.random().toString(36).substr(2, 9);

  // Handle tooltip delay for collapsed state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isCollapsed && isHovered) {
      timeoutId = setTimeout(() => {
        setShowTooltip(true);
      }, 500); // 500ms delay
    } else {
      setShowTooltip(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCollapsed, isHovered]);

  const getBaseClasses = () => {
    return cn(
      'sidebar-item-base',
      'group/item',
      'relative',
      'w-full',
      'text-sm font-medium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-focus-glow)]',
      'transform-gpu', // Enable hardware acceleration
      hoverEffects.classes,
      {
        // Level-based indentation
        'ml-4': level > 0,
        'ml-8': level > 1,
        
        // Variant styles
        'min-h-[44px]': variant === 'default',
        'min-h-[36px]': variant === 'compact',
        'min-h-[32px]': variant === 'minimal',
        
        // Collapsed state
        'justify-center': isCollapsed && level === 0,
        'px-3': isCollapsed && level === 0,
        
        // State classes
        'sidebar-item-active': isActive,
        'sidebar-item-hover': isHovered && !isActive,
        'sidebar-glow-effect': !isCollapsed,
        
        // Animation stagger
        'stagger-animation': level === 0,
        
        // Cursor
        'cursor-pointer': hasChildren || item.path,
        'cursor-default': !hasChildren && !item.path
      }
    );
  };

  const getIconName = (): IconName => {
    if (typeof item.icon === 'string') {
      return item.icon as IconName;
    }
    return 'home'; // fallback
  };

  const renderIcon = () => {
    if (!item.icon) return null;

    return (
      <SidebarIcon
        name={getIconName()}
        size="md"
        active={isActive}
        animate={true}
        className={cn(
          'mr-3 flex-shrink-0',
          {
            'mx-auto': isCollapsed,
            'mr-0': isCollapsed
          }
        )}
        aria-label={`${itemTitle} icon`}
      />
    );
  };

  const renderBadge = () => {
    if (!item.badge || isCollapsed) return null;

    // Handle different badge types
    if (typeof item.badge === 'string') {
      return (
        <Badge
          type="notification"
          variant="primary"
          text={item.badge}
          size="sm"
        />
      );
    }

    if (typeof item.badge === 'number') {
      return (
        <Badge
          type="count"
          variant="primary"
          count={item.badge}
          size="sm"
          pulse={item.badge > 0}
        />
      );
    }

    if (typeof item.badge === 'object' && item.badge.text) {
      return (
        <Badge
          type="notification"
          variant={(item.badge.color as any) || 'primary'}
          text={item.badge.text}
          size="sm"
        />
      );
    }

    return null;
  };

  const renderExpandIcon = () => {
    if (!hasChildren || isCollapsed) return null;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Expand icon clicked for:', itemId);
          onToggle(itemId);
        }}
        className="ml-auto p-1 -mr-1 rounded hover:bg-[var(--sidebar-hover-bg)] transition-colors"
        aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
      >
        <SidebarIcon
          name={isExpanded ? 'chevron-down' : 'chevron-right'}
          size="sm"
          className={cn(
            'transition-transform duration-200',
            {
              'rotate-90': isExpanded && !isCollapsed
            }
          )}
        />
      </button>
    );
  };

  const renderTooltip = () => {
    if (!isCollapsed || !showTooltip) return null;

    return (
      <div
        className={cn(
          'absolute left-full ml-2 px-3 py-2 z-50',
          'bg-[var(--color-neutral-900)] text-[var(--color-white)]',
          'text-sm rounded-lg shadow-xl',
          'whitespace-nowrap pointer-events-none',
          'opacity-0 transition-all duration-300 ease-out',
          'transform translate-x-2 scale-95',
          {
            'opacity-100 translate-x-0 scale-100': showTooltip
          }
        )}
        style={{
          top: '50%',
          transform: showTooltip ? 'translateY(-50%)' : 'translateY(-50%) translateX(8px) scale(0.95)'
        }}
      >
        {itemTitle}
        {item.badge && (
          <Badge
            type="count"
            variant="primary"
            count={typeof item.badge === 'number' ? item.badge : undefined}
            text={typeof item.badge === 'string' ? item.badge : undefined}
            size="sm"
            className="ml-2"
          />
        )}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[var(--color-neutral-900)]" />
      </div>
    );
  };

  const renderContent = () => (
    <>
      {renderIcon()}
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left truncate">
            {itemTitle}
          </span>
          <div className="flex items-center space-x-2 ml-2">
            {renderBadge()}
            {renderExpandIcon()}
          </div>
        </>
      )}
      {renderTooltip()}
    </>
  );

  const handleClick = (e: React.MouseEvent) => {
    // Call hover effects click handler first
    hoverEffects.handlers.onClick(e);
    
    if (hasChildren) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Toggling item:', itemId, 'hasChildren:', hasChildren);
      onToggle(itemId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (hasChildren) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Keyboard toggling item:', itemId, 'hasChildren:', hasChildren);
        onToggle(itemId);
      }
    }
  };

  // Render children if expanded
  const renderChildren = () => {
    if (!hasChildren || !isExpanded || isCollapsed) return null;

    return (
      <div className="mt-1 space-y-1 overflow-hidden">
        {item.children?.map((child, index) => (
          <div
            key={child.id || child.name}
            className="animate-in slide-in-from-left-2 fade-in duration-300 fill-mode-both"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <EnhancedSidebarItem
              item={child}
              isCollapsed={isCollapsed}
              isExpanded={false}
              onToggle={onToggle}
              level={level + 1}
              variant={variant}
            />
          </div>
        ))}
      </div>
    );
  };

  // Main render logic
  if (hasChildren) {
    return (
      <div className="relative">
        <button
          ref={itemRef as React.RefObject<HTMLButtonElement>}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...hoverEffects.handlers}
          className={getBaseClasses()}
          style={hoverEffects.styles}
          aria-expanded={isExpanded}
          aria-controls={hasChildren ? `submenu-${itemId}` : undefined}
          title={isCollapsed ? itemTitle : undefined}
        >
          {renderContent()}
        </button>
        {renderChildren()}
      </div>
    );
  }

  if (item.path) {
    return (
      <Link
        ref={itemRef as React.RefObject<HTMLAnchorElement>}
        to={item.path}
        {...hoverEffects.handlers}
        className={getBaseClasses()}
        style={hoverEffects.styles}
        title={isCollapsed ? itemTitle : undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {renderContent()}
      </Link>
    );
  }

  // Fallback for items without path or children
  return (
    <div
      ref={itemRef as React.RefObject<HTMLDivElement>}
      {...hoverEffects.handlers}
      className={cn(getBaseClasses(), 'cursor-default')}
      style={hoverEffects.styles}
      title={isCollapsed ? itemTitle : undefined}
    >
      {renderContent()}
    </div>
  );
});

EnhancedSidebarItem.displayName = 'EnhancedSidebarItem';

export default EnhancedSidebarItem;