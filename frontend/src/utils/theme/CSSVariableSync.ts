/**
 * ATİS CSS Variables Synchronization System
 * JavaScript ↔ CSS variables automatic sync və performance optimization
 */

import React from 'react';
import { Theme } from './ThemeSystem';
import { ZIndexManager } from './ZIndexSystem';

// CSS Variable mapping for theme properties
export interface CSSVariableMap {
  // Colors
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-tertiary': string;
  '--color-bg-elevated': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-text-tertiary': string;
  '--color-text-disabled': string;
  '--color-text-inverse': string;
  '--color-border-default': string;
  '--color-border-muted': string;
  '--color-border-strong': string;
  '--color-border-focus': string;
  '--color-border-danger': string;
  '--color-interactive-primary': string;
  '--color-interactive-primary-hover': string;
  '--color-interactive-secondary': string;
  '--color-interactive-secondary-hover': string;
  '--color-interactive-danger': string;
  '--color-interactive-danger-hover': string;
  '--color-interactive-success': string;
  '--color-interactive-success-hover': string;
  '--color-status-success': string;
  '--color-status-warning': string;
  '--color-status-error': string;
  '--color-status-info': string;
  
  // Spacing
  '--spacing-1': string;
  '--spacing-2': string;
  '--spacing-3': string;
  '--spacing-4': string;
  '--spacing-5': string;
  '--spacing-6': string;
  '--spacing-8': string;
  '--spacing-10': string;
  '--spacing-12': string;
  '--spacing-16': string;
  '--spacing-20': string;
  '--spacing-24': string;
  
  // Typography
  '--font-size-xs': string;
  '--font-size-sm': string;
  '--font-size-base': string;
  '--font-size-lg': string;
  '--font-size-xl': string;
  '--font-size-2xl': string;
  '--font-weight-normal': string;
  '--font-weight-semibold': string;
  '--font-weight-bold': string;
  
  // Border radius
  '--border-radius-sm': string;
  '--border-radius-md': string;
  '--border-radius-lg': string;
  '--border-radius-xl': string;
  '--border-radius-full': string;
  
  // Transitions
  '--transition-colors': string;
  '--transition-all': string;
  '--transition-fast': string;
  '--transition-base': string;
  '--transition-slow': string;
  '--transition-sidebar': string;
}

export class CSSVariableSync {
  private static instance: CSSVariableSync | null = null;
  private currentTheme: Theme | null = null;
  private observer: MutationObserver | null = null;
  private syncCallbacks: Set<() => void> = new Set();

  static getInstance(): CSSVariableSync {
    if (!this.instance) {
      this.instance = new CSSVariableSync();
    }
    return this.instance;
  }

  // Initialize CSS variable synchronization
  initialize(theme: Theme): void {
    this.currentTheme = theme;
    this.syncThemeToCSS(theme);
    this.syncZIndexToCSS();
    this.startObserver();
  }

  // Sync theme to CSS variables
  syncThemeToCSS(theme: Theme): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const variables = this.themeToVariables(theme);

    // Batch CSS variable updates for performance
    requestAnimationFrame(() => {
      Object.entries(variables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      
      // Notify sync callbacks
      this.syncCallbacks.forEach(callback => callback());
    });
  }

  // Sync Z-index system to CSS variables
  syncZIndexToCSS(): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const zIndexVariables = ZIndexManager.getCSSVariables();

    Object.entries(zIndexVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // Convert theme to CSS variables
  private themeToVariables(theme: Theme): Partial<CSSVariableMap> {
    return {
      // Background colors
      '--color-bg-primary': theme.colors.background.primary,
      '--color-bg-secondary': theme.colors.background.secondary,
      '--color-bg-tertiary': theme.colors.background.tertiary,
      '--color-bg-elevated': theme.colors.background.elevated,
      
      // Text colors
      '--color-text-primary': theme.colors.text.primary,
      '--color-text-secondary': theme.colors.text.secondary,
      '--color-text-tertiary': theme.colors.text.tertiary,
      '--color-text-disabled': theme.colors.text.disabled,
      '--color-text-inverse': theme.colors.text.inverse,
      
      // Border colors
      '--color-border-default': theme.colors.border.default,
      '--color-border-muted': theme.colors.border.muted,
      '--color-border-strong': theme.colors.border.strong,
      '--color-border-focus': theme.colors.border.focus,
      '--color-border-danger': theme.colors.border.danger,
      
      // Interactive colors
      '--color-interactive-primary': theme.colors.interactive.primary,
      '--color-interactive-primary-hover': theme.colors.interactive.primaryHover,
      '--color-interactive-secondary': theme.colors.interactive.secondary,
      '--color-interactive-secondary-hover': theme.colors.interactive.secondaryHover,
      '--color-interactive-danger': theme.colors.interactive.danger,
      '--color-interactive-danger-hover': theme.colors.interactive.dangerHover,
      '--color-interactive-success': theme.colors.interactive.success,
      '--color-interactive-success-hover': theme.colors.interactive.successHover,
      
      // Status colors
      '--color-status-success': theme.colors.status.success,
      '--color-status-warning': theme.colors.status.warning,
      '--color-status-error': theme.colors.status.error,
      '--color-status-info': theme.colors.status.info,
      
      // Spacing
      '--spacing-1': theme.spacing[1],
      '--spacing-2': theme.spacing[2],
      '--spacing-3': theme.spacing[3],
      '--spacing-4': theme.spacing[4],
      '--spacing-5': theme.spacing[5],
      '--spacing-6': theme.spacing[6],
      '--spacing-8': theme.spacing[8],
      '--spacing-10': theme.spacing[10],
      '--spacing-12': theme.spacing[12],
      '--spacing-16': theme.spacing[16],
      '--spacing-20': theme.spacing[20],
      '--spacing-24': theme.spacing[24],
      
      // Typography
      '--font-size-xs': theme.typography.fontSize.xs,
      '--font-size-sm': theme.typography.fontSize.sm,
      '--font-size-base': theme.typography.fontSize.base,
      '--font-size-lg': theme.typography.fontSize.lg,
      '--font-size-xl': theme.typography.fontSize.xl,
      '--font-size-2xl': theme.typography.fontSize['2xl'],
      '--font-weight-normal': theme.typography.fontWeight.normal,
      '--font-weight-semibold': theme.typography.fontWeight.semibold,
      '--font-weight-bold': theme.typography.fontWeight.bold,
      
      // Border radius
      '--border-radius-sm': theme.borderRadius.sm,
      '--border-radius-md': theme.borderRadius.md,
      '--border-radius-lg': theme.borderRadius.lg,
      '--border-radius-xl': theme.borderRadius.xl,
      '--border-radius-full': theme.borderRadius.full,
      
      // Transitions
      '--transition-colors': theme.animation.duration.colors,
      '--transition-all': theme.animation.duration.all,
      '--transition-fast': '0.15s ease',
      '--transition-base': '0.2s ease',
      '--transition-slow': '0.3s ease',
      '--transition-sidebar': '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  }

  // Get CSS variable value
  getCSSVariable(property: string): string {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  }

  // Set CSS variable value
  setCSSVariable(property: string, value: string): void {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(property, value);
  }

  // Get all current CSS variables
  getAllCSSVariables(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const variables: Record<string, string> = {};
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    // Get all custom properties (CSS variables)
    Array.from(document.styleSheets).forEach(styleSheet => {
      try {
        Array.from(styleSheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
            Array.from(rule.style).forEach(property => {
              if (property.startsWith('--')) {
                variables[property] = styles.getPropertyValue(property).trim();
              }
            });
          }
        });
      } catch (e) {
        // Cross-origin or other access issues
      }
    });

    return variables;
  }

  // Watch for CSS variable changes
  private startObserver(): void {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          this.syncCallbacks.forEach(callback => callback());
        }
      });
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  // Stop watching for changes
  stopObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // Add sync callback
  onSync(callback: () => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  // Validate CSS variables match theme
  validateSync(theme: Theme): { isValid: boolean; mismatches: string[] } {
    const expectedVariables = this.themeToVariables(theme);
    const currentVariables = this.getAllCSSVariables();
    const mismatches: string[] = [];

    Object.entries(expectedVariables).forEach(([property, expectedValue]) => {
      const currentValue = currentVariables[property];
      if (currentValue !== expectedValue) {
        mismatches.push(`${property}: expected "${expectedValue}", got "${currentValue}"`);
      }
    });

    return {
      isValid: mismatches.length === 0,
      mismatches
    };
  }

  // Debug helper
  debugSync(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎨 CSS Variable Sync Debug');
      
      if (this.currentTheme) {
        const validation = this.validateSync(this.currentTheme);
        console.log('Sync Valid:', validation.isValid);
        
        if (validation.mismatches.length > 0) {
          console.warn('Mismatches:', validation.mismatches);
        }
      }
      
      console.table(this.getAllCSSVariables());
      console.groupEnd();
    }
  }

  // Cleanup
  destroy(): void {
    this.stopObserver();
    this.syncCallbacks.clear();
    this.currentTheme = null;
  }
}

// React hook for CSS variable sync
export const useCSSVariableSync = (theme: Theme) => {
  const sync = React.useMemo(() => CSSVariableSync.getInstance(), []);

  React.useEffect(() => {
    sync.initialize(theme);
    return () => sync.destroy();
  }, [theme, sync]);

  return {
    getCSSVariable: sync.getCSSVariable.bind(sync),
    setCSSVariable: sync.setCSSVariable.bind(sync),
    getAllCSSVariables: sync.getAllCSSVariables.bind(sync),
    validateSync: () => sync.validateSync(theme),
    debugSync: sync.debugSync.bind(sync),
    onSync: sync.onSync.bind(sync)
  };
};

// CSS variable utility functions
export const cssVar = {
  // Get CSS variable value
  get: (property: string): string => {
    return CSSVariableSync.getInstance().getCSSVariable(property);
  },
  
  // Set CSS variable value
  set: (property: string, value: string): void => {
    CSSVariableSync.getInstance().setCSSVariable(property, value);
  },
  
  // Use CSS variable in styles
  use: (property: string, fallback?: string): string => {
    return `var(${property}${fallback ? `, ${fallback}` : ''})`;
  }
};

export default {
  CSSVariableSync,
  useCSSVariableSync,
  cssVar
};