/**
 * ATİS StyleSystem Production Configuration
 * Production environment üçün optimized settings
 */

import { tokens, createTheme } from '../utils/StyleSystem';

// Production theme configuration
export const productionTheme = createTheme({
  ...tokens,
  
  // Performance-optimized colors (reduced variants)
  colors: {
    ...tokens.colors,
    // Pre-computed frequently used colors for performance
    computed: {
      primaryButton: tokens.colors.primary[600],
      primaryButtonHover: tokens.colors.primary[700],
      secondaryButton: tokens.colors.gray[200],
      secondaryButtonHover: tokens.colors.gray[300],
      dangerButton: tokens.colors.danger[600],
      dangerButtonHover: tokens.colors.danger[700],
      successButton: tokens.colors.success[600],
      successButtonHover: tokens.colors.success[700],
      
      // Common text colors
      textPrimary: tokens.colors.gray[900],
      textSecondary: tokens.colors.gray[600],
      textMuted: tokens.colors.gray[500],
      
      // Background colors
      backgroundPrimary: '#ffffff',
      backgroundSecondary: tokens.colors.gray[50],
      backgroundMuted: tokens.colors.gray[100],
      
      // Border colors
      borderDefault: tokens.colors.gray[200],
      borderMuted: tokens.colors.gray[100],
      borderFocus: tokens.colors.primary[500]
    }
  }
});

// Environment-specific configurations
export const styleSystemConfig = {
  development: {
    enablePerformanceTracking: true,
    logStyleUsage: true,
    validateTokenUsage: true,
    enableDebugMode: true
  },
  
  production: {
    enablePerformanceTracking: false,
    logStyleUsage: false,
    validateTokenUsage: false,
    enableDebugMode: false,
    enableCSSOptimization: true,
    enableTreeShaking: true
  },
  
  test: {
    enablePerformanceTracking: false,
    logStyleUsage: false,
    validateTokenUsage: true,
    enableDebugMode: false
  }
};

// Current environment configuration
export const currentConfig = styleSystemConfig[process.env.NODE_ENV as keyof typeof styleSystemConfig] || styleSystemConfig.development;

// CSS-in-JS optimization for production
export const cssOptimizations = {
  // Minify style objects in production
  minifyStyles: process.env.NODE_ENV === 'production',
  
  // Cache computed styles
  enableStyleCache: true,
  
  // Pre-generate common style combinations
  preGeneratedStyles: process.env.NODE_ENV === 'production' ? {
    // Common button styles pre-computed
    primaryButton: {
      backgroundColor: productionTheme.colors.computed.primaryButton,
      color: '#ffffff',
      border: 'none',
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      cursor: 'pointer',
      transition: tokens.transition.colors,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[2]
    },
    
    secondaryButton: {
      backgroundColor: productionTheme.colors.computed.secondaryButton,
      color: productionTheme.colors.computed.textPrimary,
      border: `1px solid ${productionTheme.colors.computed.borderDefault}`,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      cursor: 'pointer',
      transition: tokens.transition.colors,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[2]
    },
    
    defaultCard: {
      backgroundColor: productionTheme.colors.computed.backgroundPrimary,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.boxShadow.base,
      border: `1px solid ${productionTheme.colors.computed.borderDefault}`,
      padding: tokens.spacing[6]
    },
    
    defaultInput: {
      border: `1px solid ${productionTheme.colors.computed.borderDefault}`,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      fontSize: tokens.fontSize.sm,
      backgroundColor: productionTheme.colors.computed.backgroundPrimary,
      color: productionTheme.colors.computed.textPrimary,
      transition: tokens.transition.colors
    }
  } : {}
};

// Performance monitoring configuration
export const performanceConfig = {
  enableBundleAnalysis: process.env.NODE_ENV === 'development',
  enableRenderTracking: currentConfig.enablePerformanceTracking,
  enableMemoryTracking: currentConfig.enablePerformanceTracking,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0 // Sample 10% in production
};

// Accessibility configuration
export const a11yConfig = {
  enableFocusRings: true,
  enableHighContrast: false, // Can be toggled by user preference
  enableReducedMotion: false, // Can be toggled by user preference
  minimumTouchTarget: 44, // px - WCAG AA standard
  minimumColorContrast: 4.5 // WCAG AA standard
};

// Export default configuration
export default {
  theme: productionTheme,
  config: currentConfig,
  cssOptimizations,
  performanceConfig,
  a11yConfig
};