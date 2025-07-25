import React from 'react';
import { FiCommand, FiMoon, FiSun, FiMonitor, FiGlobe } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types/auth';

// Reusable ActionButton component from previous refactoring
interface ActionButtonProps {
  onClick: () => void;
  'aria-label': string;
  children: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, 'aria-label': ariaLabel, children, className = '' }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10 flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);


interface HeaderActionsProps {
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
}

// This component now ONLY renders app-related actions.
// User actions (Notifications, Profile) have been moved to Header.tsx for better layout control.
const HeaderActions: React.FC<HeaderActionsProps> = ({
  showThemeToggle = true,
  showLanguageSwitcher = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

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

  const getLanguageDisplay = () => {
    return language === 'az' ? 'AZ' : 'EN';
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {showThemeToggle && (
        <ActionButton onClick={toggleTheme} aria-label="Toggle theme">
          {getThemeIcon()}
        </ActionButton>
      )}

      {showLanguageSwitcher && (
        <button
          onClick={toggleLanguage}
          aria-label="Change language"
          className="p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 h-10 flex items-center gap-1.5 px-3"
        >
          <FiGlobe size={18} />
          <span className="text-sm font-medium">{getLanguageDisplay()}</span>
        </button>
      )}
    </div>
  );
};

export default HeaderActions;

