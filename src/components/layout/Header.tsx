import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FiMenu, 
  FiSearch, 
  FiCommand, 
  FiMoon, 
  FiSun, 
  FiMonitor,
  FiGlobe 
} from 'react-icons/fi';
import ProfileDropdown from '../dropdown/ProfileDropdown';
import NotificationDropdown from '../dropdown/NotificationDropdown';
import SessionStatus from '../auth/SessionStatus';
import CommandPalette from '../navigation/CommandPalette';
import QuickSearch from '../navigation/QuickSearch';

interface HeaderProps {
  commandPalette?: boolean;
  quickSearch?: boolean;
  themeToggle?: boolean;
  languageSwitcher?: boolean;
  compact?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  commandPalette = true,
  quickSearch = true,
  themeToggle = true,
  languageSwitcher = true,
  compact = false
}) => {
  const { user } = useAuth();
  const { toggleMobile, toggleCollapse, screenSize } = useLayout();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Toggle mobile menu or sidebar
  const handleMenuToggle = () => {
    if (screenSize === 'mobile') {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };

  // Get appropriate theme icon
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <FiSun size={20} />;
      case 'dark':
        return <FiMoon size={20} />;
      default:
        return <FiMonitor size={20} />;
    }
  };

  // Get language display text
  const getLanguageDisplay = () => {
    return language === 'az' ? 'AZ' : 'EN';
  };

  // Open/close quick search
  const handleQuickSearchToggle = () => {
    setIsQuickSearchOpen(!isQuickSearchOpen);
  };

  // Open/close command palette
  const handleCommandPaletteToggle = () => {
    setIsCommandPaletteOpen(!isCommandPaletteOpen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle command palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleCommandPaletteToggle();
      }
      // Toggle quick search with /
      if (e.key === '/') {
        e.preventDefault();
        handleQuickSearchToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" style={{ zIndex: 'var(--z-index-header, 1010)' }}>
        {/* Left section - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            aria-label={screenSize === 'mobile' ? 'Toggle menu' : 'Toggle sidebar'}
          >
            <FiMenu size={20} />
          </button>

          {!compact && (
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('app.name')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('app.description')}
              </p>
            </div>
          )}
        </div>

        {/* Center section - Search (desktop) */}
        {quickSearch && !compact && (
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('common.search')}
                onClick={handleQuickSearchToggle}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 text-xs font-sans font-medium text-gray-500 dark:text-gray-400">
                  /
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center space-x-1">
          {/* Command palette button */}
          {commandPalette && (
            <button
              onClick={handleCommandPaletteToggle}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Open command palette"
            >
              <FiCommand size={20} />
            </button>
          )}

          {/* Theme toggle */}
          {themeToggle && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
            </button>
          )}

          {/* Language switcher */}
          {languageSwitcher && (
            <button
              onClick={toggleLanguage}
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Change language"
            >
              <FiGlobe size={20} />
              <span className="ml-1 text-xs font-medium">
                {getLanguageDisplay()}
              </span>
            </button>
          )}

          {/* Notifications */}
          <NotificationDropdown />

          {/* User profile */}
          <ProfileDropdown user={user} />
        </div>
      </header>

      {/* Session status */}
      <SessionStatus />

      {/* Command palette modal */}
      {isCommandPaletteOpen && (
        <CommandPalette onClose={handleCommandPaletteToggle} />
      )}

      {/* Quick search modal */}
      {quickSearch && isQuickSearchOpen && (
        <QuickSearch isOpen={isQuickSearchOpen} onClose={handleQuickSearchToggle} />
      )}
    </>
  );
};

export default Header;
