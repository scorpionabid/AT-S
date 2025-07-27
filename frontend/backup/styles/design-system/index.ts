// ====================
// ATİS Design System - TypeScript Exports
// Version: 1.0.0
// ====================

// Design tokens as TypeScript constants
export const designTokens = {
  // Colors
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#b9ddff',
      300: '#7cbeff',
      400: '#3b9eff',
      500: '#0872e8',
      600: '#0056c7',
      700: '#0043a1',
      800: '#053984',
      900: '#0a306e',
      950: '#071f47',
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Georgia', 'Times New Roman', 'serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',    // 2px
    1: '0.25rem',       // 4px
    1.5: '0.375rem',    // 6px
    2: '0.5rem',        // 8px
    2.5: '0.625rem',    // 10px
    3: '0.75rem',       // 12px
    3.5: '0.875rem',    // 14px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    7: '1.75rem',       // 28px
    8: '2rem',          // 32px
    9: '2.25rem',       // 36px
    10: '2.5rem',       // 40px
    11: '2.75rem',      // 44px
    12: '3rem',         // 48px
    14: '3.5rem',       // 56px
    16: '4rem',         // 64px
    20: '5rem',         // 80px
    24: '6rem',         // 96px
    28: '7rem',         // 112px
    32: '8rem',         // 128px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',      // 4px
    default: '0.375rem', // 6px
    md: '0.5rem',       // 8px
    lg: '0.75rem',      // 12px
    xl: '1rem',         // 16px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    default: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    offcanvas: 1050,
    modal: 1060,
    popover: 1070,
    tooltip: 1080,
    toast: 1090,
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },

  // Layout
  layout: {
    sidebar: {
      width: '280px',
      collapsedWidth: '80px',
    },
    header: {
      height: '70px',
    },
    footer: {
      height: '60px',
    },
    content: {
      padding: '2rem',
      maxWidth: '1440px',
    },
  },
} as const;

// Semantic token helpers
export const semanticTokens = {
  background: {
    primary: designTokens.colors.neutral[50],
    secondary: designTokens.colors.neutral[100],
    tertiary: designTokens.colors.neutral[200],
    surface: '#ffffff',
    overlay: 'rgb(0 0 0 / 0.5)',
  },
  text: {
    primary: designTokens.colors.neutral[900],
    secondary: designTokens.colors.neutral[600],
    tertiary: designTokens.colors.neutral[500],
    placeholder: designTokens.colors.neutral[400],
    disabled: designTokens.colors.neutral[300],
    inverse: '#ffffff',
  },
  border: {
    primary: designTokens.colors.neutral[200],
    secondary: designTokens.colors.neutral[300],
    focus: designTokens.colors.primary[500],
    error: designTokens.colors.error[500],
    success: designTokens.colors.success[500],
  },
  interactive: {
    primary: designTokens.colors.primary[500],
    primaryHover: designTokens.colors.primary[600],
    primaryActive: designTokens.colors.primary[700],
    secondary: designTokens.colors.neutral[100],
    secondaryHover: designTokens.colors.neutral[200],
    secondaryActive: designTokens.colors.neutral[300],
  },
} as const;

// Component-specific token sets
export const componentTokens = {
  button: {
    padding: {
      xs: `${designTokens.spacing[1]} ${designTokens.spacing[2]}`,
      sm: `${designTokens.spacing[1.5]} ${designTokens.spacing[3]}`,
      md: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
      lg: `${designTokens.spacing[2.5]} ${designTokens.spacing[6]}`,
      xl: `${designTokens.spacing[3]} ${designTokens.spacing[8]}`,
    },
    fontSize: {
      xs: designTokens.typography.fontSize.xs,
      sm: designTokens.typography.fontSize.sm,
      md: designTokens.typography.fontSize.base,
      lg: designTokens.typography.fontSize.lg,
      xl: designTokens.typography.fontSize.xl,
    },
  },
  card: {
    padding: designTokens.spacing[6],
    borderRadius: designTokens.borderRadius.lg,
    shadow: designTokens.boxShadow.default,
  },
  input: {
    padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.base,
  },
} as const;

// Utility functions
export const utils = {
  // Get color value with fallback
  getColor: (path: string, fallback: string = '#000000'): string => {
    const keys = path.split('.');
    let value: any = designTokens.colors;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return typeof value === 'string' ? value : fallback;
  },

  // Get spacing value with fallback
  getSpacing: (size: keyof typeof designTokens.spacing): string => {
    return designTokens.spacing[size] || '0';
  },

  // Get font size value with fallback
  getFontSize: (size: keyof typeof designTokens.typography.fontSize): string => {
    return designTokens.typography.fontSize[size] || designTokens.typography.fontSize.base;
  },

  // Generate media query
  mediaQuery: (breakpoint: keyof typeof designTokens.breakpoints): string => {
    return `@media (min-width: ${designTokens.breakpoints[breakpoint]})`;
  },

  // Generate CSS custom property
  cssVar: (name: string, value?: string): string => {
    return value ? `--${name}: ${value}` : `var(--${name})`;
  },
} as const;

// Type exports
export type DesignTokens = typeof designTokens;
export type SemanticTokens = typeof semanticTokens;
export type ComponentTokens = typeof componentTokens;
export type ColorScale = keyof typeof designTokens.colors.primary;
export type SpacingScale = keyof typeof designTokens.spacing;
export type FontSizeScale = keyof typeof designTokens.typography.fontSize;
export type BreakpointScale = keyof typeof designTokens.breakpoints;

// Default export
export default {
  designTokens,
  semanticTokens,
  componentTokens,
  utils,
};