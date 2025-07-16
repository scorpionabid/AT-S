import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MenuToggle from './MenuToggle';
import HeaderActions from './HeaderActions';
import SessionStatus from '../auth/SessionStatus';
import NotificationDropdown from '../dropdown/NotificationDropdown';
import ProfileDropdown from '../dropdown/ProfileDropdown';

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
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
    </>
  );
};

export default Header;


