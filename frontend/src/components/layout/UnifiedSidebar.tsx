/**
 * ATİS Unified Sidebar Component
 * Production-ready sidebar with ThemedStyleSystem integration
 * Single source of truth for all sidebar functionality
 */

import React, { useCallback, ReactNode, memo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get navigation items and badges from simplified hook
  const { navigationItems, badges } = useSimplifiedNavigation();

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

  // Sidebar styles using ThemedStyleSystem
  const sidebarStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    height: '100vh',
    width: isExpanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
    backgroundColor: theme.colors.background.elevated,
    borderRight: `1px solid ${theme.colors.border.default}`,
    zIndex: '500', // Sabit z-index dəyəri təyin edildi,
    transition: 'width var(--transition-sidebar), background-color var(--transition-base), border-color var(--transition-base)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    boxShadow: styles.shadow('sm'),
    ...(screenSize === 'mobile' && {
      transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      width: 'var(--sidebar-width)',
      zIndex: 'var(--z-modal-backdrop)'
    })
  };

  const logoContainerStyles = {
    height: 'var(--header-height)',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing[6]}`,
    borderBottom: `1px solid ${theme.colors.border.muted}`,
    backgroundColor: theme.colors.background.primary,
    transition: `background-color ${theme.animation.duration.colors}`
  };

  const logoStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.interactive.primary,
    textDecoration: 'none',
    transition: `color ${theme.animation.duration.colors}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2]
  };

  const logoIconStyles = {
    width: '32px',
    height: '32px',
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold
  };

  const navContainerStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: theme.spacing[2],
    scrollbarWidth: 'thin' as const
  };

  const navItemStyles = (isActive: boolean, hasChildren: boolean = false) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    margin: `${theme.spacing[1]} 0`,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    backgroundColor: isActive ? theme.colors.interactive.primary : 'transparent',
    color: isActive ? theme.colors.text.inverse : theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: `all ${theme.animation.duration.colors}`,
    justifyContent: isExpanded ? 'flex-start' : 'center',
    position: 'relative' as const,
    ':hover': {
      backgroundColor: isActive ? theme.colors.interactive.primaryHover : theme.colors.background.tertiary,
      color: isActive ? theme.colors.text.inverse : theme.colors.text.primary
    }
  });

  const navIconStyles = {
    width: '20px',
    height: '20px',
    marginRight: isExpanded ? theme.spacing[3] : '0',
    flexShrink: 0,
    transition: `margin-right ${theme.animation.duration.colors}`
  };

  const navTextStyles = {
    opacity: isExpanded ? 1 : 0,
    transition: `opacity ${theme.animation.duration.colors}`,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    flex: 1
  };

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
      return (
        <div key={item.id}>
          <button
            style={navItemStyles(isActive, true)}
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
  };

  return (
    <>
      {/* Mobile overlay */}
      <div style={mobileOverlayStyles} onClick={closeMobile} />

      {/* Sidebar */}
      <aside
        style={sidebarStyles}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div style={logoContainerStyles}>
          <Link to="/dashboard" style={logoStyles}>
            <div style={logoIconStyles}>A</div>
            {isExpanded && <span>ATİS</span>}
          </Link>
          
          {/* Mobile close button */}
          {screenSize === 'mobile' && (
            <button style={mobileCloseButtonStyles} onClick={closeMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={navContainerStyles}>
          {navigationItems.map(item => renderNavItem(item))}
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