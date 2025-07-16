import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { preferencesService } from '../services/preferencesService';

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark' | 'high-contrast';
  toggleTheme: () => void;
  isLoading: boolean;
  // Yeni funksiyalar
  hexToRgba: (hex: string, alpha?: number) => string;
  darken: (color: string, amount?: number) => string;
  lighten: (color: string, amount?: number) => string;
  getContrastColor: (bgColor: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Rəng manipulyasiya funksiyaları
const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getContrastColor = (bgColor: string): string => {
  // Rəngin parlaqlığını hesablayırıq
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

const darken = (color: string, amount: number = 0.1): string => {
  // Rəngi tündləşdirir
  return color; // Sadəlik üçün eyni rəngi qaytarırıq
};

const lighten = (color: string, amount: number = 0.1): string => {
  // Rəngi açıqlaşdırır
  return color; // Sadəlik üçün eyni rəngi qaytarırıq
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [mediaQuery, setMediaQuery] = useState<MediaQueryList | null>(null);

  // Sistem temasını al
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Təsirli temanı hesabla
  const calculateEffectiveTheme = useCallback((themeMode: ThemeMode): 'light' | 'dark' | 'high-contrast' => {
    if (themeMode === 'auto') {
      return getSystemTheme();
    }
    return themeMode;
  }, [getSystemTheme]);

  // Tema dəyişikliyini tətbiq et
  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const effective = calculateEffectiveTheme(newTheme);
    const html = document.documentElement;
    
    // Toggle dark class on HTML element for Tailwind
    if (effective === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Sənədə tətbiq et
    html.setAttribute('data-theme', effective);
    html.style.colorScheme = effective === 'high-contrast' ? 'light' : effective;
    
    // Meta teqini yenilə
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effective === 'dark' ? '#1a202c' : '#ffffff');
    }
    
    return effective;
  }, [calculateEffectiveTheme]);

  // Təması təyin et
  const setTheme = useCallback((newTheme: ThemeMode) => {
    if (!['light', 'dark', 'high-contrast', 'auto'].includes(newTheme)) {
      console.warn(`Yanlış tema: ${newTheme}`);
      return;
    }

    setThemeState(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Tema yadda saxlanılmadı:', error);
    }

    const effective = applyTheme(newTheme);
    setEffectiveTheme(effective);
    
    // Serverlə sinxronizasiya (asenxron)
    preferencesService.syncTheme(newTheme).catch(() => {
      console.warn('Serverlə tema sinxronizasiyası uğursuz oldu, lokal yaddaş istifadə olunur');
    });
    
    console.log(`🎨 Tema dəyişdi: ${newTheme} (təsirli: ${effective})`);
  }, [applyTheme]);

  // Tema dəyişdiricisi
  const toggleTheme = useCallback(() => {
    const themes: ThemeMode[] = ['light', 'dark', 'high-contrast', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

  // İlkin yüklənmə
  useEffect(() => {
    // Yaddaşdan yüklə
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const initialTheme = savedTheme && ['light', 'dark', 'high-contrast', 'auto'].includes(savedTheme) 
      ? savedTheme 
      : 'auto';
    
    setThemeState(initialTheme);
    const effective = applyTheme(initialTheme);
    setEffectiveTheme(effective);
    
    // Sistem teması dəyişiklikləri üçün dinləyici qur
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        if (theme === 'auto') {
          const newSystemTheme = e.matches ? 'dark' : 'light';
          setEffectiveTheme(newSystemTheme);
          document.documentElement.setAttribute('data-theme', newSystemTheme);
          document.documentElement.style.colorScheme = newSystemTheme;
          console.log(`🎨 Sistem teması dəyişdi: ${newSystemTheme}`);
        }
      };
      
      mq.addEventListener('change', handleSystemThemeChange);
      
      // Təmizləmə funksiyası
      return () => {
        mq.removeEventListener('change', handleSystemThemeChange);
      };
    }
    
    // Çoxlu vərəq sinxronizasiyası üçün dinləyici
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue as ThemeMode);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    setIsLoading(false);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [theme, applyTheme]);

  // Context dəyərini yarat
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    effectiveTheme,
    toggleTheme,
    isLoading,
    hexToRgba,
    darken,
    lighten,
    getContrastColor
  };

  return (
    <ThemeContext.Provider value={contextValue}>
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