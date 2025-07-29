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
  const { isCollapsed, toggleCollapse, screenSize, isMobileOpen, toggleMobile, closeMobile } = useLayout();
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
      // Hover functionality can be added here if needed
    }
  }, [screenSize, isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      // Hover functionality can be added here if needed
    }
  }, [screenSize]);

  const renderNavItem = (item: MenuItem, level = 0): React.JSX.Element => {
    const isActive = isPathActive(item.path || '', location.pathname);
    const isItemExpanded = expandedItems.has(item.id);
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
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
            onClick={screenSize === 'mobile' ? closeMobile : undefined}
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
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'İstifadəçi'}</div>
              <div className="sidebar-user-role">{user?.role || 'Rol'}</div>
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