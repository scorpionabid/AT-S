/**
 * ATİS Unified Sidebar Component
 * Production-ready sidebar with ThemedStyleSystem integration
 * Single source of truth for all sidebar functionality
 */

import React, { useCallback, ReactNode, memo, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { isPathActive, MenuItem } from '../../utils/navigation/menuConfig';
import { useSimplifiedNavigation } from '../../hooks/useSimplifiedNavigation';
import { useThemedStyles } from '../../utils/theme/ThemedStyleSystem';
import { useTheme } from '../../utils/theme/ThemeSystem';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

const UnifiedSidebar: React.FC<SidebarProps> = memo(({ className = '' }) => {
  const layoutContext = useLayout();
  const { 
    isCollapsed, 
    isHovered,
    toggleCollapse, 
    setHovered,
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop'
  } = layoutContext;
  
  const { theme } = useTheme();
  const styles = useThemedStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get navigation items from simplified hook
  const { navigationItems } = useSimplifiedNavigation();

  // Hover handlers for desktop sidebar expansion
  const handleMouseEnter = useCallback(() => {
    if (screenSize === 'desktop' && isCollapsed) {
      setHovered(true);
    }
  }, [screenSize, isCollapsed, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      setHovered(false);
    }
  }, [screenSize, setHovered]);

  // Toggle submenu expansion
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Handle hybrid navigation (both navigate and expand)
  const handleHybridClick = useCallback((item: MenuItem) => {
    // Always toggle expansion for hybrid items
    toggleExpanded(item.id);
    
    // Navigate to the item's path if it exists
    if (item.path) {
      navigate(item.path);
    }
    
    // Close mobile sidebar if needed
    if (screenSize === 'mobile') {
      closeMobile();
    }
  }, [toggleExpanded, navigate, screenSize, closeMobile]);

  // Auto-expand active parent menu
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          isPathActive(location.pathname, child.path, child.exactMatch)
        );
        if (hasActiveChild) {
          setExpandedItems(prev => new Set([...prev, item.id]));
        }
      }
    });
  }, [location.pathname, navigationItems]);

  const isExpanded = (isCollapsed && !isHovered) ? false : true;

  // Use modular CSS classes instead of inline styles
  const sidebarClasses = `
    sidebar
    ${isCollapsed ? 'sidebar-collapsed' : ''}
    ${screenSize === 'mobile' ? (isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile') : ''}
    ${theme.name ? `sidebar-theme-${theme.name}` : ''}
  `.trim().replace(/\s+/g, ' ');

  // Use modular CSS classes for header and logo
  const headerClasses = 'sidebar-header';
  const logoClasses = 'sidebar-logo';
  const logoIconClasses = 'sidebar-logo-icon';
  const logoTextClasses = 'sidebar-logo-text';

  // Use modular CSS classes for navigation
  const navClasses = 'sidebar-nav';
  const navListClasses = 'sidebar-nav-list';
  const navItemClasses = 'sidebar-nav-item';
  
  const getNavLinkClasses = (isActive: boolean) => `
    sidebar-nav-link
    ${isActive ? 'sidebar-nav-link-active' : ''}
  `.trim().replace(/\s+/g, ' ');
  
  const navIconClasses = 'sidebar-nav-icon';
  const navTextClasses = 'sidebar-nav-text';

  const chevronStyles = {
    width: '16px',
    height: '16px',
    marginLeft: 'auto',
    opacity: isExpanded ? 1 : 0,
    transition: `opacity ${theme.animation.duration.colors}, transform ${theme.animation.duration.colors}`
  };

  const submenuStyles = {
    marginLeft: isExpanded ? theme.spacing[8] : '0',
    overflow: 'hidden',
    transition: `margin-left ${theme.animation.duration.colors}`
  };

  const collapseButtonStyles = {
    position: 'absolute' as const,
    bottom: theme.spacing[4],
    left: '50%',
    transform: 'translateX(-50%)',
    padding: theme.spacing[2],
    backgroundColor: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.full,
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    display: screenSize === 'desktop' ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.animation.duration.colors}`,
    zIndex: 10,
    ':hover': {
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      borderColor: theme.colors.border.strong
    }
  };

  const mobileOverlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 'calc(var(--z-sidebar) - 1)',
    display: screenSize === 'mobile' && isMobileOpen ? 'block' : 'none'
  };

  const mobileCloseButtonStyles = {
    position: 'absolute' as const,
    top: theme.spacing[4],
    right: theme.spacing[4],
    padding: theme.spacing[2],
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.md,
    transition: `all ${theme.animation.duration.colors}`,
    ':hover': {
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary
    }
  };

  // Render navigation item
  const renderNavItem = (item: MenuItem, level: number = 0) => {
    const isActive = isPathActive(location.pathname, item.path, item.exactMatch);
    const isItemExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
      // Handle different navigation types for parent items with children
      if (item.type === 'hybrid' && item.path) {
        // Hybrid: Both navigate and expand submenu
        return (
          <div key={item.id}>
            <button
              style={navItemStyles(isActive)}
              onClick={() => handleHybridClick(item)}
              aria-expanded={isItemExpanded}
            >
              <Icon style={navIconStyles} />
              <span style={navTextStyles}>{item.title}</span>
              <ChevronRight 
                style={{
                  ...chevronStyles,
                  transform: isItemExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                }} 
              />
            </button>
            
            {isItemExpanded && (
              <div style={submenuStyles}>
                {item.children.map(child => renderNavItem(child, level + 1))}
              </div>
            )}
          </div>
        );
      } else {
        // Menu: Only expand submenu (no navigation)
        return (
          <div key={item.id}>
            <button
              style={navItemStyles(isActive)}
              onClick={() => toggleExpanded(item.id)}
              aria-expanded={isItemExpanded}
            >
              <Icon style={navIconStyles} />
              <span style={navTextStyles}>{item.title}</span>
              <ChevronRight 
                style={{
                  ...chevronStyles,
                  transform: isItemExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                }} 
              />
            </button>
            
            {isItemExpanded && (
              <div style={submenuStyles}>
                {item.children.map(child => renderNavItem(child, level + 1))}
              </div>
            )}
          </div>
        );
      }
    }

    // For items without children (leaf items)
    if (item.path) {
      return (
        <Link
          key={item.id}
          to={item.path}
          style={navItemStyles(isActive)}
          onClick={screenSize === 'mobile' ? closeMobile : undefined}
        >
          <Icon style={navIconStyles} />
          <span style={navTextStyles}>{item.title}</span>
        </Link>
      );
    }

    // For items without path (should rarely happen)
    return (
      <button
        key={item.id}
        style={navItemStyles(isActive)}
        disabled
      >
        <Icon style={navIconStyles} />
        <span style={navTextStyles}>{item.title}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div style={mobileOverlayStyles} onClick={closeMobile} />

      {/* Sidebar */}
      <aside
        className={`${sidebarClasses} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className={headerClasses}>
          <Link to="/dashboard" className={logoClasses}>
            <div className={logoIconClasses}>A</div>
            {isExpanded && <span className={logoTextClasses}>ATİS</span>}
          </Link>
          
          {/* Mobile close button */}
          {screenSize === 'mobile' && (
            <button className="sidebar-toggle" onClick={closeMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={navClasses}>
          <ul className={navListClasses}>
            {navigationItems.map(item => renderNavItem(item))}
          </ul>
        </nav>

        {/* Desktop collapse toggle */}
        <button
          style={collapseButtonStyles}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
});

UnifiedSidebar.displayName = 'UnifiedSidebar';

export default UnifiedSidebar;