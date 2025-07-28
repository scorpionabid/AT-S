/**
 * ATİS Universal Theme System
 * Dark/Light mode switching və comprehensive theme management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StyleSystem, tokens } from '../StyleSystem';
import { CSSVariableSync } from './CSSVariableSync';

// Theme type definitions
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeVariant = 'default' | 'blue' | 'green' | 'purple' | 'orange';

// Theme configuration interface
export interface ThemeConfig {
  mode: ThemeMode;
  variant: ThemeVariant;
  primaryColor: string;
  customizations?: {
    borderRadius?: 'sharp' | 'normal' | 'rounded';
    density?: 'compact' | 'normal' | 'comfortable';
    animations?: boolean;
    reducedMotion?: boolean;
  };
}

// Complete theme definition
export interface Theme {
  mode: ThemeMode;
  variant: ThemeVariant;
  colors: {
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
      overlay: string;
    };
    
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    
    // Border colors
    border: {
      default: string;
      muted: string;
      strong: string;
      focus: string;
      danger: string;
    };
    
    // Interactive colors
    interactive: {
      primary: string;
      primaryHover: string;
      primaryPressed: string;
      secondary: string;
      secondaryHover: string;
      danger: string;
      dangerHover: string;
      success: string;
      successHover: string;
      warning: string;
      warningHover: string;
    };
    
    // Status colors
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
      successBg: string;
      warningBg: string;
      errorBg: string;
      infoBg: string;
    };
    
    // Shadow colors
    shadow: {
      light: string;
      medium: string;
      strong: string;
    };
  };
  
  // Spacing adjustments based on density
  spacing: typeof tokens.spacing;
  
  // Typography adjustments
  typography: {
    fontFamily: string;
    fontSize: typeof tokens.fontSize;
    fontWeight: typeof tokens.fontWeight;
    lineHeight: typeof tokens.lineHeight;
  };
  
  // Border radius based on customization
  borderRadius: typeof tokens.borderRadius;
  
  // Animation settings
  animation: {
    enabled: boolean;
    duration: typeof tokens.transition;
    easing: string;
  };
}

// Light theme definition
export const lightTheme: Theme = {
  mode: 'light',
  variant: 'default',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: tokens.colors.gray[50],
      tertiary: tokens.colors.gray[100],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: tokens.colors.gray[900],
      secondary: tokens.colors.gray[600],
      tertiary: tokens.colors.gray[500],
      disabled: tokens.colors.gray[400],
      inverse: '#ffffff'
    },
    border: {
      default: tokens.colors.gray[200],
      muted: tokens.colors.gray[100],
      strong: tokens.colors.gray[300],
      focus: tokens.colors.primary[500],
      danger: tokens.colors.danger[500]
    },
    interactive: {
      primary: tokens.colors.primary[600],
      primaryHover: tokens.colors.primary[700],
      primaryPressed: tokens.colors.primary[800],
      secondary: tokens.colors.gray[200],
      secondaryHover: tokens.colors.gray[300],
      danger: tokens.colors.danger[600],
      dangerHover: tokens.colors.danger[700],
      success: tokens.colors.success[600],
      successHover: tokens.colors.success[700],
      warning: tokens.colors.warning[600],
      warningHover: tokens.colors.warning[700]
    },
    status: {
      success: tokens.colors.success[600],
      warning: tokens.colors.warning[600],
      error: tokens.colors.danger[600],
      info: tokens.colors.info[600],
      successBg: tokens.colors.success[50],
      warningBg: tokens.colors.warning[50],
      errorBg: tokens.colors.danger[50],
      infoBg: tokens.colors.info[50]
    },
    shadow: {
      light: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      strong: 'rgba(0, 0, 0, 0.15)'
    }
  },
  spacing: tokens.spacing,
  typography: {
    fontFamily: tokens.fontFamily.sans,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    lineHeight: tokens.lineHeight
  },
  borderRadius: tokens.borderRadius,
  animation: {
    enabled: true,
    duration: tokens.transition,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Dark theme definition
export const darkTheme: Theme = {
  mode: 'dark',
  variant: 'default',
  colors: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      elevated: '#1e293b',
      overlay: 'rgba(0, 0, 0, 0.7)'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      disabled: '#64748b',
      inverse: '#0f172a'
    },
    border: {
      default: '#475569',
      muted: '#334155',
      strong: '#64748b',
      focus: tokens.colors.primary[400],
      danger: tokens.colors.danger[400]
    },
    interactive: {
      primary: tokens.colors.primary[500],
      primaryHover: tokens.colors.primary[400],
      primaryPressed: tokens.colors.primary[600],
      secondary: '#475569',
      secondaryHover: '#64748b',
      danger: tokens.colors.danger[500],
      dangerHover: tokens.colors.danger[400],
      success: tokens.colors.success[500],
      successHover: tokens.colors.success[400],
      warning: tokens.colors.warning[500],
      warningHover: tokens.colors.warning[400]
    },
    status: {
      success: tokens.colors.success[400],
      warning: tokens.colors.warning[400],
      error: tokens.colors.danger[400],
      info: tokens.colors.info[400],
      successBg: 'rgba(34, 197, 94, 0.1)',
      warningBg: 'rgba(251, 191, 36, 0.1)',
      errorBg: 'rgba(239, 68, 68, 0.1)',
      infoBg: 'rgba(59, 130, 246, 0.1)'
    },
    shadow: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.4)',
      strong: 'rgba(0, 0, 0, 0.5)'
    }
  },
  spacing: tokens.spacing,
  typography: {
    fontFamily: tokens.fontFamily.sans,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    lineHeight: tokens.lineHeight
  },
  borderRadius: tokens.borderRadius,
  animation: {
    enabled: true,
    duration: tokens.transition,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Theme variants with different color schemes
export const themeVariants: Record<ThemeVariant, { primary: string; name: string }> = {
  default: { primary: tokens.colors.primary[600], name: 'Default Blue' },
  blue: { primary: tokens.colors.blue[600], name: 'Ocean Blue' },
  green: { primary: tokens.colors.success[600], name: 'Forest Green' },
  purple: { primary: tokens.colors.purple[600], name: 'Royal Purple' },
  orange: { primary: tokens.colors.warning[600], name: 'Sunset Orange' }
};

// Theme context
interface ThemeContextType {
  theme: Theme;
  config: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeVariant: (variant: ThemeVariant) => void;
  toggleTheme: () => void;
  updateCustomizations: (customizations: Partial<ThemeConfig['customizations']>) => void;
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Storage key for persisting theme preferences
const THEME_STORAGE_KEY = 'atis-theme-config';

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    // Load saved theme config from localStorage
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (error) {
          console.warn('Failed to parse saved theme config:', error);
        }
      }
    }
    
    return {
      mode: 'auto' as ThemeMode,
      variant: 'default' as ThemeVariant,
      primaryColor: tokens.colors.primary[600],
      customizations: {
        borderRadius: 'normal',
        density: 'normal',
        animations: true,
        reducedMotion: false
      }
    };
  });

  const [systemDarkMode, setSystemDarkMode] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = mediaQuery.matches;

    if (reducedMotion !== config.customizations?.reducedMotion) {
      updateCustomizations({ reducedMotion });
    }

    const handleChange = (e: MediaQueryListEvent) => {
      updateCustomizations({ reducedMotion: e.matches });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  // Determine current theme mode
  const effectiveMode = config.mode === 'auto' 
    ? (systemDarkMode ? 'dark' : 'light')
    : config.mode;

  // Create theme object based on current config
  const theme: Theme = React.useMemo(() => {
    const baseTheme = effectiveMode === 'dark' ? darkTheme : lightTheme;
    
    // Apply variant customizations
    if (config.variant !== 'default') {
      const variantColor = themeVariants[config.variant].primary;
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          interactive: {
            ...baseTheme.colors.interactive,
            primary: variantColor,
            primaryHover: adjustBrightness(variantColor, effectiveMode === 'dark' ? 0.1 : -0.1),
            primaryPressed: adjustBrightness(variantColor, effectiveMode === 'dark' ? -0.1 : -0.2)
          },
          border: {
            ...baseTheme.colors.border,
            focus: variantColor
          }
        }
      };
    }

    // Apply customizations
    const customizedTheme = { ...baseTheme };
    
    if (config.customizations?.borderRadius) {
      const radiusMultiplier = {
        sharp: 0,
        normal: 1,
        rounded: 1.5
      }[config.customizations.borderRadius];
      
      customizedTheme.borderRadius = Object.entries(tokens.borderRadius).reduce((acc, [key, value]) => {
        acc[key as keyof typeof tokens.borderRadius] = radiusMultiplier === 0 ? '0' : 
          typeof value === 'string' ? `${parseFloat(value) * radiusMultiplier}rem` : value;
        return acc;
      }, {} as typeof tokens.borderRadius);
    }

    if (config.customizations?.density) {
      const spacingMultiplier = {
        compact: 0.75,
        normal: 1,
        comfortable: 1.25
      }[config.customizations.density];
      
      customizedTheme.spacing = Object.entries(tokens.spacing).reduce((acc, [key, value]) => {
        acc[key as keyof typeof tokens.spacing] = `${parseFloat(value) * spacingMultiplier}rem`;
        return acc;
      }, {} as typeof tokens.spacing);
    }

    if (config.customizations?.animations === false || config.customizations?.reducedMotion) {
      customizedTheme.animation = {
        ...customizedTheme.animation,
        enabled: false,
        duration: { ...tokens.transition, colors: 'none', all: 'none' }
      };
    }

    return customizedTheme;
  }, [effectiveMode, config.variant, config.customizations]);

  // Theme control functions
  const setThemeMode = (mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const setThemeVariant = (variant: ThemeVariant) => {
    setConfig(prev => ({ ...prev, variant, primaryColor: themeVariants[variant].primary }));
  };

  const toggleTheme = () => {
    if (config.mode === 'auto') {
      setThemeMode(systemDarkMode ? 'light' : 'dark');
    } else {
      setThemeMode(config.mode === 'light' ? 'dark' : 'light');
    }
  };

  const updateCustomizations = (customizations: Partial<ThemeConfig['customizations']>) => {
    setConfig(prev => ({
      ...prev,
      customizations: { ...prev.customizations, ...customizations }
    }));
  };

  // Initialize CSS variable synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sync = CSSVariableSync.getInstance();
    sync.initialize(theme);

    // Set mode class on body
    document.body.className = document.body.className
      .replace(/theme-(light|dark)/g, '')
      .trim() + ` theme-${effectiveMode}`;
      
    // Set theme-color meta tag for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme.colors.background.primary);
    }

    return () => {
      sync.stopObserver();
    };
  }, [theme, effectiveMode]);

  const contextValue: ThemeContextType = {
    theme,
    config,
    setThemeMode,
    setThemeVariant,
    toggleTheme,
    updateCustomizations,
    isDark: effectiveMode === 'dark',
    isLight: effectiveMode === 'light',
    isAuto: config.mode === 'auto'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to adjust color brightness
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(255 * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Theme-aware StyleSystem extension
export const createThemedStyles = (theme: Theme) => ({
  // Themed button styles
  button: (variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary') => ({
    ...StyleSystem.button(variant),
    backgroundColor: theme.colors.interactive[variant === 'primary' ? 'primary' : 
                     variant === 'secondary' ? 'secondary' :
                     variant === 'danger' ? 'danger' : 'success'],
    color: variant === 'secondary' ? theme.colors.text.primary : theme.colors.text.inverse,
    borderColor: variant === 'secondary' ? theme.colors.border.default : 'transparent',
    transition: theme.animation.enabled ? theme.animation.duration.colors : 'none',
    ':hover': {
      backgroundColor: theme.colors.interactive[`${variant}Hover` as keyof typeof theme.colors.interactive]
    }
  }),

  // Themed card styles  
  card: (elevation: 'flat' | 'low' | 'medium' | 'high' = 'low') => ({
    ...StyleSystem.card(),
    backgroundColor: theme.colors.background.elevated,
    borderColor: theme.colors.border.default,
    boxShadow: {
      flat: 'none',
      low: `0 1px 3px ${theme.colors.shadow.light}`,
      medium: `0 4px 12px ${theme.colors.shadow.medium}`,
      high: `0 8px 25px ${theme.colors.shadow.strong}`
    }[elevation]
  }),

  // Themed input styles
  input: (state: 'default' | 'focus' | 'error' | 'disabled' = 'default') => ({
    ...StyleSystem.input(),
    backgroundColor: theme.colors.background.primary,
    borderColor: {
      default: theme.colors.border.default,
      focus: theme.colors.border.focus,
      error: theme.colors.border.danger,
      disabled: theme.colors.border.muted
    }[state],
    color: state === 'disabled' ? theme.colors.text.disabled : theme.colors.text.primary,
    transition: theme.animation.enabled ? theme.animation.duration.colors : 'none'
  }),

  // Themed text styles
  text: (variant: 'primary' | 'secondary' | 'tertiary' | 'disabled' = 'primary') => ({
    color: theme.colors.text[variant],
    fontFamily: theme.typography.fontFamily
  })
});

export default {
  ThemeProvider,
  useTheme,
  lightTheme,
  darkTheme,
  themeVariants,
  createThemedStyles
};