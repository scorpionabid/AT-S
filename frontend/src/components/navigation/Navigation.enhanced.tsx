import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, IconName } from '../common/Icon';

// ====================
// TYPE DEFINITIONS
// ====================

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: IconName;
  badge?: {
    text: string | number;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  children?: NavigationItem[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
  exact?: boolean;
  external?: boolean;
  disabled?: boolean;
}

export interface NavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Collapsed state */
  collapsed?: boolean;
  /** Mobile mode */
  mobile?: boolean;
  /** Show labels */
  showLabels?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Collapse handler */
  onToggleCollapse?: () => void;
  /** Item click handler */
  onItemClick?: (item: NavigationItem) => void;
}

// ====================
// NAVIGATION HOOK
// ====================

const useNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const hasPermission = useCallback((item: NavigationItem): boolean => {
    // Check role requirements
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
      if (!userRole || !item.requiredRoles.includes(userRole)) {
        return false;
      }
    }

    // Check permission requirements
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      const userPermissions = user?.permissions || [];
      const hasRequiredPermission = item.requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );
      if (!hasRequiredPermission) {
        return false;
      }
    }

    return true;
  }, [user]);

  const isActive = useCallback((item: NavigationItem): boolean => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    
    if (item.path === '/') {
      return location.pathname === '/';
    }
    
    return location.pathname.startsWith(item.path);
  }, [location.pathname]);

  const hasActiveChild = useCallback((item: NavigationItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child) || hasActiveChild(child));
  }, [isActive]);

  return {
    hasPermission,
    isActive,
    hasActiveChild,
  };
};

// ====================
// MAIN NAVIGATION COMPONENT
// ====================

export const Navigation: React.FC<NavigationProps> = ({
  items,
  collapsed = false,
  mobile = false,
  showLabels = true,
  className = '',
  onToggleCollapse,
  onItemClick,
}) => {
  const { hasPermission, isActive, hasActiveChild } = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand active parent items
  useEffect(() => {
    const newExpanded = new Set<string>();
    
    const checkAndExpand = (navItems: NavigationItem[]) => {
      navItems.forEach(item => {
        if (hasActiveChild(item)) {
          newExpanded.add(item.id);
        }
        if (item.children) {
          checkAndExpand(item.children);
        }
      });
    };

    checkAndExpand(items);
    setExpandedItems(newExpanded);
  }, [items, hasActiveChild]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: NavigationItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    if (item.children && item.children.length > 0) {
      e.preventDefault();
      toggleExpanded(item.id);
    }

    onItemClick?.(item);
  };

  const filterVisibleItems = (navItems: NavigationItem[]): NavigationItem[] => {
    return navItems.filter(item => hasPermission(item));
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const itemIsActive = isActive(item);
    const itemHasActiveChild = hasActiveChild(item);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const visibleChildren = hasChildren ? filterVisibleItems(item.children!) : [];

    const itemClasses = classNames(
      'nav-item',
      {
        'nav-item--child': level > 0,
        'nav-item--disabled': item.disabled,
        'nav-item--expanded': isExpanded,
      }
    );

    const linkClasses = classNames(
      'nav-link',
      {
        'nav-link--active': itemIsActive,
        'nav-link--has-active-child': itemHasActiveChild,
        'nav-link--collapsed': collapsed,
        'nav-link--disabled': item.disabled,
      }
    );

    const LinkComponent = item.external ? 'a' : Link;
    const linkProps = item.external 
      ? { href: item.path, target: '_blank', rel: 'noopener noreferrer' }
      : { to: item.path };

    return (
      <div key={item.id} className={itemClasses}>
        <LinkComponent
          {...linkProps}
          className={linkClasses}
          onClick={(e) => handleItemClick(item, e)}
          title={collapsed ? item.label : undefined}
          aria-disabled={item.disabled}
          style={{ paddingLeft: level > 0 ? `${16 + (level * 16)}px` : undefined }}
        >
          <span className="nav-icon">
            <Icon name={item.icon} size={20} />
          </span>
          
          {showLabels && !collapsed && (
            <span className="nav-label">{item.label}</span>
          )}
          
          {item.badge && !collapsed && (
            <span className={`nav-badge nav-badge--${item.badge.color}`}>
              {item.badge.text}
            </span>
          )}
          
          {hasChildren && visibleChildren.length > 0 && !collapsed && (
            <span 
              className={classNames(
                'nav-arrow',
                { 'nav-arrow--expanded': isExpanded }
              )}
            >
              <Icon name="chevron-down" size={16} />
            </span>
          )}
        </LinkComponent>
        
        {hasChildren && visibleChildren.length > 0 && !collapsed && (
          <div 
            className={classNames(
              'nav-children',
              { 'nav-children--expanded': isExpanded }
            )}
          >
            {visibleChildren.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const visibleItems = filterVisibleItems(items);

  const navigationClasses = classNames(
    'navigation',
    {
      'navigation--collapsed': collapsed,
      'navigation--mobile': mobile,
    },
    className
  );

  return (
    <nav className={navigationClasses} role="navigation" aria-label="Main navigation">
      <div className="nav-content">
        {visibleItems.map(item => renderNavigationItem(item))}
      </div>
    </nav>
  );
};

Navigation.displayName = 'Navigation';

// ====================
// SIDEBAR NAVIGATION COMPONENT
// ====================

export interface SidebarNavigationProps extends NavigationProps {
  /** Sidebar title */
  title?: string;
  /** Logo component */
  logo?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Collapsible sidebar */
  collapsible?: boolean;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  title = "Navigation",
  logo,
  footer,
  collapsible = true,
  collapsed = false,
  onToggleCollapse,
  ...props
}) => {
  const { user } = useAuth();

  const sidebarClasses = classNames(
    'role-based-navigation',
    {
      'collapsed': collapsed,
    }
  );

  return (
    <aside className={sidebarClasses} role="complementary">
      <div className="nav-header">
        <div className="nav-title">
          {logo && <span className="nav-logo">{logo}</span>}
          {!collapsed && (
            <span className="nav-text">{title}</span>
          )}
        </div>
        
        {collapsible && (
          <button
            type="button"
            className="nav-collapse-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            <Icon name={collapsed ? "chevron-right" : "chevron-left"} size={16} />
          </button>
        )}
      </div>
      
      <Navigation
        {...props}
        collapsed={collapsed}
        className="nav-content"
      />
      
      {footer && !collapsed && (
        <div className="nav-footer">
          {footer}
        </div>
      )}
      
      {!collapsed && user && (
        <div className="nav-footer">
          <div className="user-info">
            <div className="user-role">
              {typeof user.role === 'string' ? user.role : (user.role?.name || user.role?.display_name || 'User')}
            </div>
            <div className="user-name">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.username
              }
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

SidebarNavigation.displayName = 'SidebarNavigation';

// ====================
// MOBILE BOTTOM NAVIGATION
// ====================

export interface MobileBottomNavigationProps {
  /** Navigation items (max 5 recommended) */
  items: NavigationItem[];
  /** Additional CSS classes */
  className?: string;
  /** Hide on scroll */
  hideOnScroll?: boolean;
  /** Item click handler */
  onItemClick?: (item: NavigationItem) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  items,
  className = '',
  hideOnScroll = true,
  onItemClick,
}) => {
  const { hasPermission, isActive } = useNavigation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide navigation on scroll down
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOnScroll]);

  const visibleItems = items.filter(hasPermission).slice(0, 5);

  const navigationClasses = classNames(
    'mobile-nav',
    {
      'mobile-nav--hidden': !isVisible,
    },
    className
  );

  return (
    <nav className={navigationClasses} role="navigation" aria-label="Mobile navigation">
      <div className="mobile-nav__container">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={classNames(
              'mobile-nav__item',
              {
                'mobile-nav__item--active': isActive(item),
                'mobile-nav__item--disabled': item.disabled,
              }
            )}
            onClick={() => onItemClick?.(item)}
            aria-disabled={item.disabled}
          >
            <div className="mobile-nav__icon-container">
              <Icon 
                name={item.icon} 
                size={24} 
                className="mobile-nav__icon"
              />
              {item.badge && (
                <span className="mobile-nav__badge">
                  {item.badge.text}
                </span>
              )}
            </div>
            <span className="mobile-nav__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

MobileBottomNavigation.displayName = 'MobileBottomNavigation';

// ====================
// TAB NAVIGATION COMPONENT
// ====================

export interface TabNavigationProps {
  /** Tab items */
  items: NavigationItem[];
  /** Additional CSS classes */
  className?: string;
  /** Variant style */
  variant?: 'default' | 'pills' | 'underline';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Scrollable tabs */
  scrollable?: boolean;
  /** Item click handler */
  onItemClick?: (item: NavigationItem) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  items,
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  scrollable = true,
  onItemClick,
}) => {
  const { hasPermission, isActive } = useNavigation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter(hasPermission);

  const tabsClasses = classNames(
    'tab-navigation',
    {
      [`tab-navigation--${variant}`]: variant !== 'default',
      [`tab-navigation--${size}`]: size !== 'md',
      'tab-navigation--full-width': fullWidth,
      'tab-navigation--scrollable': scrollable,
    },
    className
  );

  // Auto-scroll to active tab
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const activeTab = scrollContainerRef.current.querySelector('.tab-nav-item--active');
    if (activeTab) {
      activeTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [visibleItems]);

  return (
    <div className={tabsClasses} role="tablist">
      <div ref={scrollContainerRef} className="tab-navigation__container">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={classNames(
              'tab-nav-item',
              {
                'tab-nav-item--active': isActive(item),
                'tab-nav-item--disabled': item.disabled,
              }
            )}
            onClick={() => onItemClick?.(item)}
            role="tab"
            aria-selected={isActive(item)}
            aria-disabled={item.disabled}
          >
            <Icon name={item.icon} className="tab-nav-icon" />
            <span className="tab-nav-label">{item.label}</span>
            {item.badge && (
              <span className="tab-nav-badge">
                {item.badge.text}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

TabNavigation.displayName = 'TabNavigation';

// ====================
// BREADCRUMB NAVIGATION
// ====================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: IconName;
}

export interface BreadcrumbNavigationProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator icon */
  separator?: IconName;
  /** Max items to show before collapsing */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  separator = 'chevron-right',
  maxItems = 5,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const displayItems = items.length > maxItems 
    ? [items[0], { label: '...', icon: 'more-horizontal' as IconName }, ...items.slice(-2)]
    : items;

  return (
    <nav 
      className={classNames('breadcrumb-navigation', className)}
      aria-label="Breadcrumb"
    >
      <ol className="breadcrumb-list">
        {displayItems.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.path ? (
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => handleItemClick(item)}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-text">
                {item.icon && <Icon name={item.icon} size={16} />}
                {item.label}
              </span>
            )}
            
            {index < displayItems.length - 1 && (
              <Icon 
                name={separator} 
                size={16} 
                className="breadcrumb-separator"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

BreadcrumbNavigation.displayName = 'BreadcrumbNavigation';

// ====================
// EXPORT ALL COMPONENTS
// ====================

export default Navigation;