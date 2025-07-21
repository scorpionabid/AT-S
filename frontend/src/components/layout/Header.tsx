import React, { useState, useEffect } from 'react';
import { FiSearch, FiZap } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MenuToggle from './MenuToggle';
import HeaderActions from './HeaderActions';
import SessionStatus from '../auth/SessionStatus';
import NotificationDropdown from '../dropdown/NotificationDropdown';
import ProfileDropdown from '../dropdown/ProfileDropdown';
import GlobalSearch from '../navigation/GlobalSearch';
import QuickActionsPanel from '../navigation/QuickActionsPanel';

interface HeaderProps {
  themeToggle?: boolean;
  languageSwitcher?: boolean;
  compact?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  themeToggle = true,
  languageSwitcher = true,
  compact = false,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Quick actions shortcut (Cmd+J / Ctrl+J)
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setQuickActionsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="app-header fixed top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm transition-all duration-200" style={{
        left: 'var(--sidebar-width)',
        width: 'calc(100% - var(--sidebar-width))',
        marginLeft: 0
      }}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center h-16 md:h-20">
            {/* Sol hissə: menyu və başlıq */}
            <div className="flex-shrink-0 flex items-center">
              <MenuToggle />
              {!compact && (
                <div className="hidden sm:block ml-3 md:ml-4">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {t('app.name')}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('app.description')}
                  </p>
                </div>
              )}
            </div>

            {/* Genişlənən boşluq (bütün fəaliyyətləri sağa itələyir) */}
            <div className="flex-1"></div>

            {/* Sağ tərəfdəki bütün fəaliyyətlər üçün konteyner (sağdan daha çox məsafə ilə) */}
            <div className="flex items-center gap-4 mr-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors duration-200 min-w-[200px] justify-between"
                title="Axtarış (⌘K)"
              >
                <div className="flex items-center">
                  <FiSearch className="w-4 h-4 mr-2" />
                  <span>Axtarış...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                  ⌘K
                </kbd>
              </button>
              
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Axtarış"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Quick Actions Button */}
              <button
                onClick={() => setQuickActionsOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Tez Əməliyyatlar (⌘J)"
              >
                <FiZap className="w-5 h-5" />
              </button>

              {/* Qrup 1: Tətbiq ikonları + Bildirişlər */}
              <div className="flex items-center gap-2">
                <HeaderActions
                  showThemeToggle={themeToggle}
                  showLanguageSwitcher={languageSwitcher}
                />
                <NotificationDropdown />
              </div>

              {/* Qrup 2: Profil menyusu */}
              <div className="flex items-center">
                <ProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Header üçün boşluq */}
      <div className="h-16 md:h-20" />

      {/* Sessiya statusu */}
      <SessionStatus />
      
      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
      
      {/* Quick Actions Panel */}
      <QuickActionsPanel 
        isOpen={quickActionsOpen} 
        onClose={() => setQuickActionsOpen(false)} 
      />
    </>
  );
};

export default Header;


