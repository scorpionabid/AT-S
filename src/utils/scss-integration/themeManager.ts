/**
 * AT0S Advanced Theme Management System
 * Integrates with SCSS theme system for dynamic theming
 */
import React from 'react';

export type ThemeName = 'light' | 'dark' | 'high-contrast' | 'auto';

export interface ThemeColors {
  'bg-primary': string;
  'bg-secondary': string;
  'bg-tertiary': string;
  'bg-surface': string;
  'bg-overlay': string;
  'text-primary': string;
  'text-secondary': string;
  'text-tertiary': string;
  'text-placeholder': string;
  'text-disabled': string;
  'text-inverse': string;
  'border-primary': string;
  'border-secondary': string;
  'border-focus': string;
  'border-error': string;
  'border-success': string;
  'interactive-primary': string;
  'interactive-primary-hover': string;
  'interactive-primary-active': string;
  'interactive-secondary': string;
  'interactive-secondary-hover': string;
  'interactive-secondary-active': string;
  'shadow-color': string;
  'shadow-color-strong': string;
  'status-success': string;
  'status-warning': string;
  'status-error': string;
  'status-info': string;
}

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  colors: ThemeColors;
  isDark: boolean;
  isHighContrast: boolean;
}

class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeName = 'auto';
  private systemTheme: 'light' | 'dark' = 'light';
  private observers: Set<(theme: ThemeName) => void> = new Set();
  private mediaQuery: MediaQueryList | null = null;
  private storageKey = 'atis-theme';

  private constructor() {
    this.init();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private init(): void {
    // Load saved theme
    this.loadSavedTheme();

    // Listen for system theme changes
    this.setupSystemThemeListener();

    // Apply initial theme
    this.applyTheme();

    // Setup storage listener for multi-tab sync
    this.setupStorageListener();
  }

  private loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && this.isValidTheme(saved)) {
        this.currentTheme = saved as ThemeName;
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
    }
  }

  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
      
      this.mediaQuery.addEventListener('change', (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light';
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
    }
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey && e.newValue) {
          this.setTheme(e.newValue as ThemeName, false);
        }
      });
    }
  }

  private isValidTheme(theme: string): boolean {
    return ['light', 'dark', 'high-contrast', 'auto'].includes(theme);
  }

  setTheme(theme: ThemeName, persist = true): void {
    if (!this.isValidTheme(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;

    if (persist) {
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch (error) {
        console.warn('Failed to save theme:', error);
      }
    }

    this.applyTheme();
    this.notifyObservers();
  }

  getTheme(): ThemeName {
    return this.currentTheme;
  }

  getEffectiveTheme(): 'light' | 'dark' | 'high-contrast' {
    if (this.currentTheme === 'auto') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const effectiveTheme = this.getEffectiveTheme();

    // Add theme switching animation
    root.classList.add('theme-switching');
    
    // Remove old theme attributes
    root.removeAttribute('data-theme');
    
    // Apply new theme
    if (effectiveTheme !== 'light') {
      root.setAttribute('data-theme', effectiveTheme);
    }

    // Remove animation class after transition
    setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 300);

    // Update meta theme-color
    this.updateMetaThemeColor(effectiveTheme);
  }

  private updateMetaThemeColor(theme: 'light' | 'dark' | 'high-contrast'): void {
    if (typeof document === 'undefined') return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: '#ffffff',
        dark: '#1f2937',
        'high-contrast': '#ffffff'
      };
      metaThemeColor.setAttribute('content', colors[theme]);
    }
  }

  toggleTheme(): void {
    const themes: ThemeName[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  subscribe(callback: (theme: ThemeName) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.currentTheme));
  }

  // Get CSS custom property value
  getCSSProperty(property: string): string {
    if (typeof document === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${property}`)
      .trim();
  }

  // Set CSS custom property
  setCSSProperty(property: string, value: string): void {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(`--${property}`, value);
  }

  // Get theme colors
  getThemeColors(): Record<string, string> {
    const properties = [
      'bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-surface',
      'text-primary', 'text-secondary', 'text-tertiary',
      'border-primary', 'border-secondary', 'border-focus',
      'interactive-primary', 'interactive-primary-hover',
      'status-success', 'status-warning', 'status-error', 'status-info'
    ];

    return properties.reduce((colors, prop) => {
      colors[prop] = this.getCSSProperty(prop);
      return colors;
    }, {} as Record<string, string>);
  }

  // Create custom theme
  createCustomTheme(name: string, overrides: Partial<ThemeColors>): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    Object.entries(overrides).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });

    root.setAttribute('data-theme', name);
  }

  // Export theme for sharing
  exportTheme(): string {
    const config = {
      name: this.currentTheme,
      colors: this.getThemeColors(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(config, null, 2);
  }

  // Import theme from config
  importTheme(configString: string): void {
    try {
      const config = JSON.parse(configString);
      if (config.colors) {
        this.createCustomTheme(config.name || 'imported', config.colors);
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  }

  // Check if user prefers dark mode
  prefersColorScheme(): 'light' | 'dark' | null {
    if (typeof window === 'undefined') return null;
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return null;
  }

  // Check if user prefers high contrast
  prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Performance mode for low-end devices
  enablePerformanceMode(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.add('performance-mode');
  }

  disablePerformanceMode(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('performance-mode');
  }

  // Debug mode
  enableDebugMode(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.add('theme-debug');
  }

  disableDebugMode(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('theme-debug');
  }
}

// Create singleton instance
export const themeManager = ThemeManager.getInstance();

// React hook for theme management
export function useTheme() {
  const [theme, setTheme] = React.useState<ThemeName>(themeManager.getTheme());

  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe(setTheme);
    return unsubscribe;
  }, []);

  return {
    theme,
    effectiveTheme: themeManager.getEffectiveTheme(),
    setTheme: (newTheme: ThemeName) => themeManager.setTheme(newTheme),
    toggleTheme: () => themeManager.toggleTheme(),
    getThemeColors: () => themeManager.getThemeColors(),
    prefersColorScheme: themeManager.prefersColorScheme(),
    prefersHighContrast: themeManager.prefersHighContrast(),
    prefersReducedMotion: themeManager.prefersReducedMotion()
  };
}

// Theme component wrapper
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Initialize theme manager
    themeManager.getTheme();
  }, []);

  return React.createElement(React.Fragment, null, children);
}

// Utility functions
export const themeUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Get contrasting color
  getContrastColor: (bgColor: string): string => {
    // Simple contrast calculation
    const color = bgColor.startsWith('#') ? bgColor.slice(1) : bgColor;
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },

  // Darken color
  darken: (color: string, amount: number = 0.1): string => {
    // Implementation would go here
    return color;
  },

  // Lighten color
  lighten: (color: string, amount: number = 0.1): string => {
    // Implementation would go here
    return color;
  }
};

// Export types and constants
export const THEME_NAMES: ThemeName[] = ['light', 'dark', 'high-contrast', 'auto'];
export const THEME_STORAGE_KEY = 'atis-theme';