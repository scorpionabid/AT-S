/**
 * ATİS Universal Style System
 * 6,670 className və 347 inline style istifadəsini birləşdirən sistem
 */

// Design Tokens
export const tokens = {
  // Colors
  colors: {
    // Primary palette
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Gray palette
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb', 
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    
    // Status colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63'
    },

    // Semantic colors
    semantic: {
      background: '#ffffff',
      foreground: '#111827',
      muted: '#f9fafb',
      mutedForeground: '#6b7280',
      border: '#e5e7eb',
      input: '#ffffff',
      ring: '#3b82f6',
      accent: '#f3f4f6',
      accentForeground: '#111827'
    },

    // Dark mode variants
    dark: {
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      border: '#334155',
      input: '#1e293b',
      ring: '#3b82f6',
      accent: '#1e293b',
      accentForeground: '#f8fafc'
    }
  },
  
  // Typography
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'   // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem'      // 80px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Border widths
  borderWidth: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },
  
  // Shadows
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  // Transitions
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Z-index scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070'
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};

// Component Style Variants
export const variants = {
  // Button variants
  button: {
    primary: {
      backgroundColor: tokens.colors.primary[600],
      color: 'white',
      '&:hover': { backgroundColor: tokens.colors.primary[700] },
      '&:disabled': { backgroundColor: tokens.colors.gray[400] }
    },
    secondary: {
      backgroundColor: 'white',
      color: tokens.colors.gray[700],
      border: `1px solid ${tokens.colors.gray[300]}`,
      '&:hover': { backgroundColor: tokens.colors.gray[50] }
    },
    danger: {
      backgroundColor: tokens.colors.danger[600],
      color: 'white',
      '&:hover': { backgroundColor: tokens.colors.danger[700] }
    },
    success: {
      backgroundColor: tokens.colors.success[600],
      color: 'white',
      '&:hover': { backgroundColor: tokens.colors.success[700] }
    }
  },
  
  // Input variants
  input: {
    default: {
      border: `1px solid ${tokens.colors.gray[300]}`,
      borderRadius: tokens.borderRadius.md,
      padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      fontSize: tokens.fontSize.sm,
      '&:focus': {
        outline: 'none',
        borderColor: tokens.colors.primary[500],
        boxShadow: `0 0 0 1px ${tokens.colors.primary[500]}`
      },
      '&:disabled': {
        backgroundColor: tokens.colors.gray[50],
        color: tokens.colors.gray[500]
      }
    },
    error: {
      borderColor: tokens.colors.danger[500],
      '&:focus': {
        borderColor: tokens.colors.danger[500],
        boxShadow: `0 0 0 1px ${tokens.colors.danger[500]}`
      }
    }
  },
  
  // Card variants
  card: {
    default: {
      backgroundColor: 'white',
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.boxShadow.base,
      border: `1px solid ${tokens.colors.gray[200]}`
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: tokens.borderRadius.xl,
      boxShadow: tokens.boxShadow.lg
    }
  },
  
  // Badge/Tag variants
  badge: {
    primary: {
      backgroundColor: tokens.colors.primary[100],
      color: tokens.colors.primary[800],
      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium
    },
    success: {
      backgroundColor: tokens.colors.success[100],
      color: tokens.colors.success[800]
    },
    danger: {
      backgroundColor: tokens.colors.danger[100],
      color: tokens.colors.danger[800]
    },
    warning: {
      backgroundColor: tokens.colors.warning[100],
      color: tokens.colors.warning[800]
    },
    gray: {
      backgroundColor: tokens.colors.gray[100],
      color: tokens.colors.gray[800]
    }
  }
};

// Style Generation Functions
export class StyleSystem {
  // Generate component styles
  static component(
    baseStyles: React.CSSProperties,
    variant?: keyof typeof variants,
    size?: 'sm' | 'md' | 'lg',
    state?: 'default' | 'hover' | 'focus' | 'disabled'
  ): React.CSSProperties {
    let styles = { ...baseStyles };
    
    // Apply size modifiers
    if (size) {
      styles = { ...styles, ...this.getSizeStyles(size) };
    }
    
    return styles;
  }
  
  // Generate button styles
  static button(
    variant: keyof typeof variants.button = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md',
    fullWidth: boolean = false
  ): React.CSSProperties {
    const base = {
      border: 'none',
      borderRadius: tokens.borderRadius.md,
      cursor: 'pointer',
      fontWeight: tokens.fontWeight.semibold,
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing[2],
      textDecoration: 'none'
    };
    
    const sizeStyles = {
      sm: {
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        fontSize: tokens.fontSize.sm
      },
      md: {
        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        fontSize: tokens.fontSize.sm
      },
      lg: {
        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
        fontSize: tokens.fontSize.base
      }
    };
    
    return {
      ...base,
      ...variants.button[variant],
      ...sizeStyles[size],
      ...(fullWidth && { width: '100%' })
    };
  }
  
  // Generate input styles
  static input(
    hasError: boolean = false,
    disabled: boolean = false
  ): React.CSSProperties {
    return {
      ...variants.input.default,
      ...(hasError && variants.input.error),
      ...(disabled && {
        backgroundColor: tokens.colors.gray[50],
        color: tokens.colors.gray[500],
        cursor: 'not-allowed'
      })
    };
  }
  
  // Generate card styles
  static card(
    variant: keyof typeof variants.card = 'default',
    padding: keyof typeof tokens.spacing = '6'
  ): React.CSSProperties {
    return {
      ...variants.card[variant],
      padding: tokens.spacing[padding]
    };
  }
  
  // Generate badge styles
  static badge(
    variant: keyof typeof variants.badge = 'primary'
  ): React.CSSProperties {
    return variants.badge[variant];
  }
  
  // Generate text styles
  static text(
    size: keyof typeof tokens.fontSize = 'base',
    weight: keyof typeof tokens.fontWeight = 'normal',
    color: string = tokens.colors.gray[900]
  ): React.CSSProperties {
    return {
      fontSize: tokens.fontSize[size],
      fontWeight: tokens.fontWeight[weight],
      color,
      margin: 0
    };
  }
  
  // Generate spacing utilities
  static spacing(
    type: 'padding' | 'margin',
    sides: 'all' | 'x' | 'y' | 't' | 'r' | 'b' | 'l',
    size: keyof typeof tokens.spacing
  ): React.CSSProperties {
    const value = tokens.spacing[size];
    
    const mappings = {
      all: { [type]: value },
      x: { [`${type}Left`]: value, [`${type}Right`]: value },
      y: { [`${type}Top`]: value, [`${type}Bottom`]: value },
      t: { [`${type}Top`]: value },
      r: { [`${type}Right`]: value },
      b: { [`${type}Bottom`]: value },
      l: { [`${type}Left`]: value }
    };
    
    return mappings[sides];
  }
  
  // Generate layout utilities
  static layout(
    display: 'flex' | 'grid' | 'block' | 'inline' = 'flex',
    direction?: 'row' | 'column',
    align?: 'start' | 'center' | 'end' | 'stretch',
    justify?: 'start' | 'center' | 'end' | 'between' | 'around',
    gap?: keyof typeof tokens.spacing
  ): React.CSSProperties {
    const styles: React.CSSProperties = { display };
    
    if (display === 'flex') {
      if (direction) styles.flexDirection = direction;
      if (align) {
        const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' };
        styles.alignItems = alignMap[align];
      }
      if (justify) {
        const justifyMap = { 
          start: 'flex-start', center: 'center', end: 'flex-end', 
          between: 'space-between', around: 'space-around' 
        };
        styles.justifyContent = justifyMap[justify];
      }
      if (gap) styles.gap = tokens.spacing[gap];
    }
    
    return styles;
  }
  
  // Generate responsive grid
  static grid(
    columns: number = 1,
    gap: keyof typeof tokens.spacing = '4',
    responsive: boolean = true
  ): React.CSSProperties {
    return {
      display: 'grid',
      gridTemplateColumns: responsive 
        ? `repeat(auto-fit, minmax(250px, 1fr))`
        : `repeat(${columns}, 1fr)`,
      gap: tokens.spacing[gap]
    };
  }
  
  // Generate responsive styles
  static responsive(
    breakpoint: keyof typeof tokens.breakpoints,
    styles: React.CSSProperties
  ): string {
    return `@media (min-width: ${tokens.breakpoints[breakpoint]}) { ${Object.entries(styles).map(([key, value]) => `${key}: ${value};`).join(' ')} }`;
  }

  // Generate transition styles
  static transition(
    type: keyof typeof tokens.transition = 'all'
  ): React.CSSProperties {
    return {
      transition: tokens.transition[type]
    };
  }

  // Generate border styles
  static border(
    width: keyof typeof tokens.borderWidth = '1',
    color: string = tokens.colors.gray[300],
    radius?: keyof typeof tokens.borderRadius
  ): React.CSSProperties {
    return {
      border: `${tokens.borderWidth[width]} solid ${color}`,
      ...(radius && { borderRadius: tokens.borderRadius[radius] })
    };
  }

  // Generate shadow with transition
  static shadow(
    size: keyof typeof tokens.boxShadow = 'base',
    hover?: keyof typeof tokens.boxShadow
  ): React.CSSProperties {
    return {
      boxShadow: tokens.boxShadow[size],
      transition: tokens.transition.shadow,
      ...(hover && {
        '&:hover': {
          boxShadow: tokens.boxShadow[hover]
        }
      })
    };
  }

  // Generate focus ring styles
  static focusRing(
    color: string = tokens.colors.primary[500],
    width: string = '2px'
  ): React.CSSProperties {
    return {
      outline: 'none',
      '&:focus': {
        outline: `${width} solid ${color}`,
        outlineOffset: '2px'
      }
    };
  }

  // Generate truncate text styles
  static truncate(lines?: number): React.CSSProperties {
    if (lines && lines > 1) {
      return {
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      };
    }
    
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };
  }

  // Generate absolute positioning
  static absolute(
    top?: string,
    right?: string,
    bottom?: string,
    left?: string
  ): React.CSSProperties {
    return {
      position: 'absolute',
      ...(top && { top }),
      ...(right && { right }),
      ...(bottom && { bottom }),
      ...(left && { left })
    };
  }

  // Generate fixed positioning
  static fixed(
    top?: string,
    right?: string,
    bottom?: string,
    left?: string,
    zIndex?: keyof typeof tokens.zIndex
  ): React.CSSProperties {
    return {
      position: 'fixed',
      ...(top && { top }),
      ...(right && { right }),
      ...(bottom && { bottom }),
      ...(left && { left }),
      ...(zIndex && { zIndex: tokens.zIndex[zIndex] })
    };
  }

  // Generate aspect ratio styles
  static aspectRatio(ratio: string = '1/1'): React.CSSProperties {
    return {
      aspectRatio: ratio
    };
  }

  // Generate overlay styles
  static overlay(
    opacity: number = 0.5,
    color: string = tokens.colors.gray[900]
  ): React.CSSProperties {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: color,
      opacity
    };
  }

  // Helper methods
  private static getSizeStyles(size: 'sm' | 'md' | 'lg'): React.CSSProperties {
    const sizeMap = {
      sm: { fontSize: tokens.fontSize.sm },
      md: { fontSize: tokens.fontSize.base },
      lg: { fontSize: tokens.fontSize.lg }
    };
    return sizeMap[size];
  }
}

// Utility functions for quick access
export const styles = {
  // Quick button styles
  btn: StyleSystem.button,
  
  // Quick input styles  
  input: StyleSystem.input,
  
  // Quick card styles
  card: StyleSystem.card,
  
  // Quick badge styles
  badge: StyleSystem.badge,
  
  // Quick text styles
  text: StyleSystem.text,
  
  // Quick layout styles
  flex: (direction: 'row' | 'column' = 'row', align: 'start' | 'center' | 'end' = 'center', gap: keyof typeof tokens.spacing = '4') =>
    StyleSystem.layout('flex', direction, align, 'start', gap),
  
  grid: StyleSystem.grid,
    
  // Quick spacing
  p: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('padding', 'all', size),
  m: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('margin', 'all', size),
  px: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('padding', 'x', size),
  py: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('padding', 'y', size),
  mx: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('margin', 'x', size),
  my: (size: keyof typeof tokens.spacing) => StyleSystem.spacing('margin', 'y', size),
  
  // Quick utilities
  shadow: StyleSystem.shadow,
  border: StyleSystem.border,
  transition: StyleSystem.transition,
  truncate: StyleSystem.truncate,
  absolute: StyleSystem.absolute,
  fixed: StyleSystem.fixed,
  overlay: StyleSystem.overlay,
  focusRing: StyleSystem.focusRing,
  
  // Quick positioning
  center: (): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  
  // Quick visibility
  hidden: (): React.CSSProperties => ({ display: 'none' }),
  visible: (): React.CSSProperties => ({ display: 'block' }),
  
  // Quick sizing
  full: (): React.CSSProperties => ({ width: '100%', height: '100%' }),
  fullW: (): React.CSSProperties => ({ width: '100%' }),
  fullH: (): React.CSSProperties => ({ height: '100%' }),
  
  // Quick colors
  bg: (color: string): React.CSSProperties => ({ backgroundColor: color }),
  color: (color: string): React.CSSProperties => ({ color }),
  
  // Quick borders
  rounded: (size: keyof typeof tokens.borderRadius = 'md'): React.CSSProperties => ({
    borderRadius: tokens.borderRadius[size]
  }),
  
  // Quick z-index
  z: (level: keyof typeof tokens.zIndex): React.CSSProperties => ({
    zIndex: tokens.zIndex[level]
  })
};

// CSS-in-JS animation keyframes
export const animations = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  
  slideDown: `
    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateY(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from { 
        opacity: 0; 
        transform: scale(0.9); 
      }
      to { 
        opacity: 1; 
        transform: scale(1); 
      }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% { 
        transform: translateY(0); 
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1); 
      }
      50% { 
        transform: translateY(-25%); 
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1); 
      }
    }
  `
};

// Theme configuration
export const createTheme = (customTokens?: Partial<typeof tokens>) => {
  return {
    ...tokens,
    ...customTokens
  };
};

export default StyleSystem;