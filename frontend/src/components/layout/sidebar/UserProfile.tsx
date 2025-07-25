import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLayout } from '../../../contexts/LayoutContext';
import { FiSettings, FiUser, FiLogOut, FiSun, FiMoon, FiMessageSquare, FiBell, FiHelpCircle } from 'react-icons/fi';
import Badge from './Badge';

interface UserProfileProps {
  isCollapsed: boolean;
}

const UserProfile: React.FC<UserProfileProps> = memo(({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme: currentTheme, toggleTheme } = useLayout();
  const navigate = useNavigate();
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [messages, setMessages] = useState(2);
  
  // Hover effects for interactive elements (simplified)
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const settingsHover = {
    handlers: {
      onMouseEnter: () => setIsSettingsHovered(true),
      onMouseLeave: () => setIsSettingsHovered(false),
      onClick: (e: React.MouseEvent) => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onFocus: () => {},
      onBlur: () => {}
    },
    styles: {
      transform: isSettingsHovered ? 'scale(1.05)' : 'scale(1)',
      opacity: 1,
      boxShadow: isSettingsHovered ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s ease-out'
    }
  };
  
  const actionButtonHover = {
    handlers: {
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      onClick: (e: React.MouseEvent) => {},
      onMouseDown: () => {},
      onMouseUp: () => {},
      onFocus: () => {},
      onBlur: () => {}
    },
    styles: {
      transform: 'scale(1)',
      opacity: 1,
      boxShadow: 'none',
      transition: 'all 0.2s ease-out'
    }
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsToggle = useCallback(() => {
    setShowSettingsMenu(!showSettingsMenu);
  }, [showSettingsMenu]);

  const handleMenuAction = useCallback((action: () => void) => {
    action();
    setShowSettingsMenu(false);
  }, []);

  if (isCollapsed) {
    return (
      <div className="sidebar-footer border-t border-[var(--sidebar-border)] p-3 mt-auto">
        <div className="user-profile flex items-center justify-center relative group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center text-white font-medium shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg" title={user?.username || 'User'}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <Badge
              type="indicator"
              variant="success"
              className="absolute -bottom-0.5 -right-0.5"
              pulse={true}
            />
            
            {/* Notification indicators for collapsed state */}
            {notifications > 0 && (
              <Badge
                type="count"
                variant="error"
                count={notifications}
                size="sm"
                className="absolute -top-1 -right-1"
                pulse={true}
              />
            )}
          </div>
          
          {/* Tooltip for collapsed state */}
          <div className="absolute left-full ml-2 px-3 py-2 bg-[var(--color-neutral-900)] text-white text-sm rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50">
            {user?.username || 'User'}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-[var(--color-neutral-900)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-user-profile">
      <div className="sidebar-user-profile-content group">
        <div className="sidebar-user-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
          <div className="sidebar-status-indicator online"></div>
        </div>
        
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {user?.username || 'User'}
          </div>
          <div className="sidebar-user-role">
            {typeof user?.role === 'string' ? user.role : (user?.role?.name || user?.role?.display_name || 'User')}
          </div>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {user?.email || 'user@example.com'}
          </p>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
            <button 
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800"
              aria-label="Messages"
            >
              <FiMessageSquare className="h-4 w-4" />
            </button>
            
            <button 
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors relative"
              aria-label="Notifications"
            >
              <FiBell className="h-4 w-4" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-800"></span>
            </button>
            
            <button 
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800"
              aria-label="Help"
            >
              <FiHelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative" ref={settingsRef}>
          <button 
            className={`p-1 rounded-full transition-colors ${
              showSettingsMenu 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50' 
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
            aria-label="Settings"
            aria-expanded={showSettingsMenu}
            aria-haspopup="true"
            aria-controls="user-menu"
            id="user-menu-button"
            onClick={handleSettingsToggle}
          >
            <FiSettings className="h-4 w-4" />
          </button>
          
          {showSettingsMenu && (
            <div 
              className="absolute bottom-full right-0 mb-2 w-56 z-50 bg-[var(--sidebar-bg)] rounded-lg shadow-lg py-1 border border-[var(--sidebar-border)]"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
              tabIndex={-1}
            >
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Account</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              
              <button
                onClick={() => handleMenuAction(() => navigate('/profile'))}
                className="w-full text-left px-4 py-2 text-sm text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] transition-smooth"
                role="menuitem"
                tabIndex={-1}
              >
                <FiUser className="inline-block mr-3 h-4 w-4" />
                Profile
              </button>
              
              <button
                onClick={() => handleMenuAction(() => toggleTheme())}
                className="w-full text-left px-4 py-2 text-sm text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] transition-smooth"
                role="menuitem"
                tabIndex={-1}
              >
                {currentTheme === 'dark' ? (
                  <>
                    <FiSun className="inline-block mr-3 h-4 w-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FiMoon className="inline-block mr-3 h-4 w-4" />
                    Dark Mode
                  </>
                )}
              </button>
              
              <div className="border-t border-neutral-100 dark:border-neutral-700 my-1"></div>
              
              <button
                onClick={() => handleMenuAction(() => logout())}
                className="w-full text-left px-4 py-2 text-sm text-[var(--color-error-600)] hover:bg-[var(--sidebar-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-error-500)] focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] transition-smooth"
                role="menuitem"
                tabIndex={-1}
              >
                <FiLogOut className="inline-block mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;