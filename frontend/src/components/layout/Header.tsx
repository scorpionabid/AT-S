/**
 * ATİS Header Component - ThemedStyleSystem Migration
 * Inline CSS → Theme-aware styling with ThemedStyleSystem
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useNavigate } from 'react-router-dom';
import { useThemedStyles } from '../../utils/theme/ThemedStyleSystem';
import { useTheme } from '../../utils/theme/ThemeSystem';

interface HeaderProps {
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const { isCollapsed, screenSize, toggleMobile } = useLayout();
  const { theme } = useTheme();
  const styles = useThemedStyles();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Yeni tapşırıq',
      message: 'Sizə yeni tapşırıq təyin edildi',
      type: 'info',
      timestamp: '5 dəqiqə əvvəl',
      read: false
    },
    {
      id: '2',
      title: 'Anket tamamlandı',
      message: 'Məktəb rəhbərliyi anketi tamamladı',
      type: 'success',
      timestamp: '1 saat əvvəl',
      read: false
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Header styles using ThemedStyleSystem
  const headerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: screenSize === 'mobile' ? 0 : (isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
    right: 0,
    height: 'var(--header-height)',
    zIndex: 'var(--z-header)',
    backgroundColor: theme.colors.background.elevated,
    borderBottom: `1px solid ${theme.colors.border.default}`,
    boxShadow: styles.shadow('sm'),
    transition: 'left var(--transition-sidebar), background-color var(--transition-base), border-color var(--transition-base)',
    display: 'flex',
    alignItems: 'center',
    padding: screenSize === 'mobile' ? `0 ${theme.spacing[4]}` : `0 ${theme.spacing[6]}`
  };

  const searchContainerStyles = {
    position: 'relative' as const,
    maxWidth: '400px',
    width: '100%',
    marginLeft: theme.spacing[4]
  };

  const searchInputStyles = {
    ...styles.input(),
    paddingLeft: theme.spacing[10],
    fontSize: theme.typography.fontSize.sm,
    width: '100%'
  };

  const searchIconStyles = {
    position: 'absolute' as const,
    left: theme.spacing[3],
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.text.tertiary,
    pointerEvents: 'none' as const
  };

  const actionsContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginLeft: 'auto'
  };

  const iconButtonStyles = {
    position: 'relative' as const,
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    transition: `background-color ${theme.animation.duration.colors}, color ${theme.animation.duration.colors}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary
    }
  };

  const badgeStyles = {
    position: 'absolute' as const,
    top: theme.spacing[1],
    right: theme.spacing[1],
    backgroundColor: theme.colors.status.error,
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    borderRadius: theme.borderRadius.full,
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  };

  const dropdownStyles = {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: theme.spacing[1],
    backgroundColor: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: styles.shadow('lg'),
    zIndex: 'var(--z-dropdown)',
    minWidth: '280px',
    maxHeight: '400px',
    overflow: 'auto'
  };

  const notificationItemStyles = {
    padding: theme.spacing[4],
    borderBottom: `1px solid ${theme.colors.border.muted}`,
    cursor: 'pointer',
    transition: `background-color ${theme.animation.duration.colors}`,
    ':hover': {
      backgroundColor: theme.colors.background.tertiary
    },
    ':last-child': {
      borderBottom: 'none'
    }
  };

  const profileMenuStyles = {
    padding: theme.spacing[2],
    width: '200px'
  };

  const menuItemStyles = {
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'left' as const,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    transition: `background-color ${theme.animation.duration.colors}`,
    ':hover': {
      backgroundColor: theme.colors.background.tertiary
    }
  };

  const mobileMenuButtonStyles = {
    ...iconButtonStyles,
    marginRight: theme.spacing[3]
  };

  return (
    <header style={headerStyles} className={className}>
      {/* Mobile menu button */}
      {screenSize === 'mobile' && (
        <button 
          style={mobileMenuButtonStyles}
          onClick={toggleMobile}
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Search */}
      <div style={searchContainerStyles}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={searchIconStyles} />
          <input
            type="text"
            placeholder="Axtarış..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyles}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={actionsContainerStyles}>
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button
            style={iconButtonStyles}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Bildirişlər${unreadCount > 0 ? ` (${unreadCount} oxunmamış)` : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={badgeStyles}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={dropdownStyles} className="animate-fade-in">
              <div style={{ 
                padding: theme.spacing[4], 
                borderBottom: `1px solid ${theme.colors.border.muted}` 
              }}>
                <h3 style={styles.text('base', 'semibold')}>Bildirişlər</h3>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} style={notificationItemStyles}>
                    <div style={styles.text('sm', 'semibold')}>{notification.title}</div>
                    <div style={{
                      ...styles.text('sm', 'normal', 'secondary'),
                      marginTop: theme.spacing[1]
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      ...styles.text('xs', 'normal', 'tertiary'),
                      marginTop: theme.spacing[2]
                    }}>
                      {notification.timestamp}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: theme.spacing[6], 
                  textAlign: 'center' as const 
                }}>
                  <span style={styles.text('sm', 'normal', 'tertiary')}>
                    Yeni bildiriş yoxdur
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            style={{
              ...iconButtonStyles,
              gap: theme.spacing[2],
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`
            }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Profil menyusu"
          >
            <User size={20} />
            <span style={styles.text('sm', 'normal')}>{user?.firstName}</span>
            <ChevronDown size={16} />
          </button>

          {showProfileMenu && (
            <div style={{ ...dropdownStyles, width: '200px' }} className="animate-fade-in">
              <div style={profileMenuStyles}>
                <div style={{ 
                  padding: theme.spacing[3], 
                  borderBottom: `1px solid ${theme.colors.border.muted}`,
                  marginBottom: theme.spacing[2]
                }}>
                  <div style={styles.text('sm', 'semibold')}>{user?.firstName} {user?.lastName}</div>
                  <div style={styles.text('xs', 'normal', 'secondary')}>{user?.email}</div>
                </div>

                <button style={menuItemStyles} onClick={() => navigate('/settings')}>
                  <Settings size={16} />
                  Parametrlər
                </button>

                <button 
                  style={{
                    ...menuItemStyles,
                    color: theme.colors.status.error
                  }}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Çıxış
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;