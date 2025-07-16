import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLayout } from '../../../contexts/LayoutContext';
import { FiSettings, FiUser, FiLogOut, FiSun, FiMoon, FiMessageSquare, FiBell, FiHelpCircle } from 'react-icons/fi';

interface UserProfileProps {
  isCollapsed: boolean;
}

const UserProfile: React.FC<UserProfileProps> = memo(({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme: currentTheme, toggleTheme } = useLayout();
  const navigate = useNavigate();
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

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
      <div className="sidebar-footer border-t border-neutral-200 dark:border-neutral-700 p-3 mt-auto">
        <div className="user-profile flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-sm" title={user?.username || 'User'}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-footer border-t border-neutral-200 dark:border-neutral-700 p-3 mt-auto">
      <div className="user-profile flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <div className="relative mr-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-800 rounded-full"></span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {user?.username || 'User'}
            </p>
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
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;