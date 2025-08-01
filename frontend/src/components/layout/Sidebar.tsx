/**
 * ATİS Enhanced Sidebar Component
 * Modern sidebar using modular CSS architecture
 */

import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSimplifiedNavigation } from '../../hooks/useSimplifiedNavigation';
import { isPathActive, MenuItem } from '../../utils/navigation/menuConfig';

// Remove hardcoded navigation items - will use menuConfig instead

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleCollapse, screenSize, isMobileOpen, toggleMobile, closeMobile, setHovered } = useLayout();
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Get navigation items from centralized config
  const { navigationItems } = useSimplifiedNavigation();

  const isExpanded = screenSize === 'mobile' ? true : !isCollapsed;

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

  // Use the centralized isPathActive function instead of local implementation

  const handleMouseEnter = useCallback(() => {
    if (screenSize === 'desktop' && isCollapsed) {
      setHovered(true);
    }
  }, [screenSize, isCollapsed, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      setHovered(false);
      // Auto-collapse sidebar if it's expanded (not originally collapsed)
      if (!isCollapsed) {
        toggleCollapse();
      }
    }
  }, [screenSize, setHovered, isCollapsed, toggleCollapse]);

  const renderNavItem = (item: MenuItem, level = 0): React.JSX.Element => {
    const isActive = isPathActive(location.pathname, item.path || '', item.exactMatch);
    const isItemExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
      // Handle hybrid items (both navigable and expandable)
      if (item.type === 'hybrid' && item.path) {
        return (
          <li key={item.id} className="sidebar-nav-item">
            <div className="sidebar-nav-hybrid">
              {/* Main navigation link */}
              <Link
                to={item.path}
                className={`sidebar-nav-link sidebar-nav-hybrid-main ${isActive ? 'sidebar-nav-link-active' : ''}`}
                onClick={(e) => {
                  // Auto-collapse sidebar after navigation
                  if (screenSize === 'mobile') {
                    closeMobile();
                  } else if (screenSize === 'desktop') {
                    // Always collapse after navigation, regardless of current state
                    if (!isCollapsed) {
                      toggleCollapse();
                    }
                    // Reset hover state
                    setHovered(false);
                  }
                }}
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-text">{item.title}</span>
              </Link>
              
              {/* Submenu toggle button */}
              <button
                className="sidebar-nav-expand-btn"
                onClick={() => toggleExpanded(item.id)}
                aria-expanded={isItemExpanded}
              >
                <ChevronRight 
                  className={`sidebar-nav-expand ${isItemExpanded ? 'sidebar-nav-expand-open' : ''}`}
                />
              </button>
            </div>
            
            {isItemExpanded && (
              <ul className="sidebar-submenu sidebar-submenu-list sidebar-submenu-open">
                {item.children.map(child => renderNavItem(child, level + 1))}
              </ul>
            )}
          </li>
        );
      }
      
      // Handle menu-only items (not navigable, only expandable)
      return (
        <li key={item.id} className="sidebar-nav-item">
          <button
            className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
            onClick={() => toggleExpanded(item.id)}
            aria-expanded={isItemExpanded}
          >
            <Icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{item.title}</span>
            <ChevronRight 
              className={`sidebar-nav-expand ${isItemExpanded ? 'sidebar-nav-expand-open' : ''}`}
            />
          </button>
          
          {isItemExpanded && (
            <ul className="sidebar-submenu sidebar-submenu-list sidebar-submenu-open">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    if (item.path) {
      return (
        <li key={item.id} className="sidebar-nav-item">
          <Link
            to={item.path}
            className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
            onClick={(e) => {
              // Auto-collapse sidebar after navigation
              if (screenSize === 'mobile') {
                closeMobile();
              } else if (screenSize === 'desktop') {
                // Always collapse after navigation, regardless of current state
                if (!isCollapsed) {
                  toggleCollapse();
                }
                // Reset hover state
                setHovered(false);
              }
            }}
          >
            <Icon className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">{item.title}</span>
          </Link>
        </li>
      );
    }

    return (
      <li key={item.id} className="sidebar-nav-item">
        <button
          className="sidebar-nav-link"
          disabled
        >
          <Icon className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">{item.title}</span>
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {screenSize === 'mobile' && isMobileOpen && (
        <div 
          className="sidebar-overlay sidebar-overlay-visible"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar
          ${isCollapsed ? 'sidebar-collapsed' : ''}
          ${screenSize === 'mobile' ? (isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile') : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-logo">
            <div className="sidebar-logo-icon">A</div>
            <span className="sidebar-logo-text">ATİS</span>
          </Link>
          
          {screenSize === 'mobile' && (
            <button className="sidebar-toggle" onClick={closeMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navigationItems.map(item => renderNavItem(item))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{typeof user?.role === 'string' ? user.role : user?.role?.display_name || 'İstifadəçi'}</div>
              <div className="sidebar-user-role">{typeof user?.role === 'string' ? user.role : user?.role?.display_name || 'Rol'}</div>
            </div>
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        {screenSize === 'desktop' && (
          <button
            className="sidebar-toggle"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Sidebar genişləndir' : 'Sidebar daralt'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;