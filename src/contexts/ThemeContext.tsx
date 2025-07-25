import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { preferencesService } from '../services/preferencesService';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate effective theme based on theme mode
  const calculateEffectiveTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      return getSystemTheme();
    }
    return themeMode;
  };

  // Set theme and persist to localStorage and server
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const effective = calculateEffectiveTheme(newTheme);
    setEffectiveTheme(effective);
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.style.colorScheme = effective;
    
    // Sync with server (async, don't block UI)
    preferencesService.syncTheme(newTheme).catch(() => {
      console.warn('Failed to sync theme with server, using local storage fallback');
    });
    
    // Log theme change
    console.log(`🎨 Theme changed: ${newTheme} (effective: ${effective})`);
  };

  // Toggle through theme modes
  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const initialTheme = savedTheme || 'auto';
    
    setThemeState(initialTheme);
    const effective = calculateEffectiveTheme(initialTheme);
    setEffectiveTheme(effective);
    
    // Apply to document
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.style.colorScheme = effective;
    
    setIsLoading(false);
    
    console.log(`🎨 Theme initialized: ${initialTheme} (effective: ${effective})`);
  }, []);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newSystemTheme);
      document.documentElement.setAttribute('data-theme', newSystemTheme);
      document.documentElement.style.colorScheme = newSystemTheme;
      
      console.log(`🎨 System theme changed: ${newSystemTheme}`);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    effectiveTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;