import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  trigger: React.ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'left-start';
  className?: string;
  disabled?: boolean;
}

interface Position {
  x: number;
  y: number;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  trigger,
  placement = 'bottom-start',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = (): Position => {
    if (!triggerRef.current) return { x: 0, y: 0 };

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = triggerRect.left;
    let y = triggerRect.bottom;

    // Adjust based on placement
    switch (placement) {
      case 'bottom-end':
        x = triggerRect.right;
        break;
      case 'top-start':
        y = triggerRect.top;
        break;
      case 'top-end':
        x = triggerRect.right;
        y = triggerRect.top;
        break;
      case 'right-start':
        x = triggerRect.right;
        y = triggerRect.top;
        break;
      case 'left-start':
        x = triggerRect.left;
        y = triggerRect.top;
        break;
    }

    // Prevent menu from going off-screen
    const menuWidth = 200; // Approximate menu width
    const menuHeight = items.length * 40; // Approximate menu height

    if (x + menuWidth > viewport.width) {
      x = viewport.width - menuWidth - 10;
    }

    if (y + menuHeight > viewport.height) {
      y = viewport.height - menuHeight - 10;
    }

    if (x < 10) x = 10;
    if (y < 10) y = 10;

    return { x, y };
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
    
    setIsOpen(!isOpen);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.id);
      return;
    }
    
    item.onClick?.();
    setIsOpen(false);
    setExpandedSubmenus(new Set());
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: ContextMenuItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setExpandedSubmenus(new Set());
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setExpandedSubmenus(new Set());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const renderMenuItem = (item: ContextMenuItem, depth = 0) => {
    if (item.divider) {
      return <div key={item.id} className="context-menu__divider" />;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSubmenus.has(item.id);

    return (
      <div key={item.id} className="context-menu__item-container">
        <button
          className={classNames(
            'context-menu__item',
            {
              'context-menu__item--disabled': item.disabled,
              'context-menu__item--destructive': item.destructive,
              'context-menu__item--has-children': hasChildren,
              'context-menu__item--expanded': isExpanded,
            }
          )}
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
          disabled={item.disabled}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="context-menu__item-content">
            {item.icon && (
              <Icon 
                name={item.icon} 
                size={16} 
                className="context-menu__item-icon"
              />
            )}
            <span className="context-menu__item-label">{item.label}</span>
          </div>

          <div className="context-menu__item-meta">
            {item.shortcut && (
              <span className="context-menu__item-shortcut">
                {item.shortcut}
              </span>
            )}
            {hasChildren && (
              <Icon 
                name={isExpanded ? 'chevron-down' : 'chevron-right'} 
                size={14}
                className="context-menu__item-chevron"
              />
            )}
          </div>
        </button>

        {hasChildren && isExpanded && (
          <div className="context-menu__submenu">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classNames('context-menu-container', className)}>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        onContextMenu={handleContextMenu}
        className="context-menu__trigger"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 1000,
          }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="context-menu__content">
            {items.map(item => renderMenuItem(item))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for programmatic context menu
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const show = (e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    show,
    hide,
  };
};

// Quick Actions Component
interface QuickActionsProps {
  actions: ContextMenuItem[];
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className = '',
  direction = 'horizontal',
}) => {
  return (
    <div className={classNames(
      'quick-actions',
      `quick-actions--${direction}`,
      className
    )}>
      {actions.map(action => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={classNames(
            'quick-actions__button',
            {
              'quick-actions__button--destructive': action.destructive,
              'quick-actions__button--disabled': action.disabled,
            }
          )}
          title={action.label}
        >
          {action.icon && (
            <Icon name={action.icon} size={16} />
          )}
          <span className="quick-actions__label">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;