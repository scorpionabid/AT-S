import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getVisibleMenuItems, isPathActive } from '../../utils/navigation/menuConfig';
import { ROLE_DISPLAY_NAMES, getStandardizedRole } from '../../constants/roles';

// Using MenuItem interface from unified menu config
import type { MenuItem } from '../../utils/navigation/menuConfig';

interface RoleBasedNavigationProps {
  className?: string;
  showLabels?: boolean;
  isCollapsed?: boolean;
}

const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
  className = '',
  showLabels = true,
  isCollapsed = false
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const getUserRole = (): string | null => {
    if (typeof user?.role === 'string') {
      return getStandardizedRole(user.role);
    } else if (typeof user?.role === 'object' && user?.role?.name) {
      return getStandardizedRole(user.role.name);
    } else if (user?.roles && user.roles.length > 0) {
      return getStandardizedRole(user.roles[0]);
    }
    return null;
  };

  const currentRole = getUserRole();

  // Get filtered navigation items based on user permissions
  const filteredNavigation = getVisibleMenuItems(user);

  const renderNavigationItem = (item: MenuItem, isChild = false) => {
    const isActive = isPathActive(location.pathname, item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={`nav-item ${isChild ? 'nav-child' : ''}`}>
        <Link
          to={item.path}
          className={`nav-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
          title={isCollapsed ? item.title : ''}
        >
          <span className="nav-icon">
            {React.createElement(item.icon, { size: 20 })}
          </span>
          {showLabels && !isCollapsed && (
            <span className="nav-label">{item.title}</span>
          )}
          {item.badge && !isCollapsed && (
            <span className={`nav-badge nav-badge--${item.badge.color}`}>
              {item.badge.text}
            </span>
          )}
          {hasChildren && !isCollapsed && (
            <span className="nav-arrow">▼</span>
          )}
        </Link>
        
        {hasChildren && !isCollapsed && (
          <div className={`nav-children ${isActive ? 'expanded' : ''}`}>
            {item.children?.map(child => renderNavigationItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`role-based-navigation ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        {!isCollapsed && (
          <div className="nav-title">
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Naviqasiya</span>
          </div>
        )}
      </div>
      
      <div className="nav-content">
        {filteredNavigation.map(item => renderNavigationItem(item))}
      </div>
      
      {!isCollapsed && (
        <div className="nav-footer">
          <div className="user-info">
            <div className="user-role">
              {currentRole ? ROLE_DISPLAY_NAMES[currentRole] || 'İstifadəçi' : 'İstifadəçi'}
            </div>
            <div className="user-name">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.username
              }
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleBasedNavigation;