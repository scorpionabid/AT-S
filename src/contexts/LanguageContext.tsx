import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { preferencesService } from '../services/preferencesService';

export type Language = 'az' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isLoading: boolean;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Simple translation system
const translations: Record<Language, Record<string, string>> = {
  az: {
    // Dashboard
    'dashboard.title': 'ATİS Dashboard',
    'dashboard.subtitle': 'Azərbaycan Təhsil İdarəetmə Sistemi',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'İstifadəçilər',
    'nav.institutions': 'Müəssisələr',
    'nav.surveys': 'Anketlər',
    'nav.assessments': 'Qiymətləndirmələr',
    'nav.tasks': 'Tapşırıqlar',
    'nav.documents': 'Sənədlər',
    'nav.reports': 'Hesabatlar',
    'nav.roles': 'Rollar',
    'nav.settings': 'Tənzimləmələr',
    
    // Common
    'common.search': 'Axtarış...',
    'common.loading': 'Yüklənir...',
    'common.save': 'Saxla',
    'common.cancel': 'İmtina',
    'common.delete': 'Sil',
    'common.edit': 'Redaktə et',
    'common.view': 'Bax',
    'common.create': 'Yarat',
    'common.update': 'Yenilə',
    
    // Theme
    'theme.light': 'İşıqlı tema',
    'theme.dark': 'Qaranlıq tema',
    'theme.auto': 'Sistem teması',
    
    // Language
    'language.azerbaijani': 'Azərbaycan dili',
    'language.english': 'İngilis dili',
    
    // Actions
    'action.logout': 'Çıxış',
    'action.profile': 'Profil',
    'action.notifications': 'Bildirişlər',
    'action.help': 'Kömək',
    'action.toggle_sidebar': 'Sidebar-ı aç/bağla',
    'action.toggle_menu': 'Menyu aç/bağla',
  },
  en: {
    // Dashboard
    'dashboard.title': 'ATİS Dashboard',
    'dashboard.subtitle': 'Azerbaijan Education Management System',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.institutions': 'Institutions',
    'nav.surveys': 'Surveys',
    'nav.assessments': 'Assessments',
    'nav.tasks': 'Tasks',
    'nav.documents': 'Documents',
    'nav.reports': 'Reports',
    'nav.roles': 'Roles',
    'nav.settings': 'Settings',
    
    // Common
    'common.search': 'Search...',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.create': 'Create',
    'common.update': 'Update',
    
    // Theme
    'theme.light': 'Light theme',
    'theme.dark': 'Dark theme',
    'theme.auto': 'System theme',
    
    // Language
    'language.azerbaijani': 'Azerbaijani',
    'language.english': 'English',
    
    // Actions
    'action.logout': 'Logout',
    'action.profile': 'Profile',
    'action.notifications': 'Notifications',
    'action.help': 'Help',
    'action.toggle_sidebar': 'Toggle sidebar',
    'action.toggle_menu': 'Toggle menu',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('az');
  const [isLoading, setIsLoading] = useState(true);

  // Set language and persist to localStorage and server
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Set document language attribute
    document.documentElement.lang = newLanguage;
    
    // Sync with server (async, don't block UI)
    preferencesService.syncLanguage(newLanguage).catch(() => {
      console.warn('Failed to sync language with server, using local storage fallback');
    });
    
    // Log language change
    console.log(`🌐 Language changed: ${newLanguage}`);
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const newLanguage: Language = language === 'az' ? 'en' : 'az';
    setLanguage(newLanguage);
  };

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const initialLanguage = savedLanguage || 'az';
    
    setLanguageState(initialLanguage);
    document.documentElement.lang = initialLanguage;
    
    setIsLoading(false);
    
    console.log(`🌐 Language initialized: ${initialLanguage}`);
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    isLoading,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;