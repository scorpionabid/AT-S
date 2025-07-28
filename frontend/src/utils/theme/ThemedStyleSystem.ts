/**
 * ATİS Themed StyleSystem
 * Theme-aware StyleSystem integration ilə responsive theming
 */

import React from 'react';
import { StyleSystem, styles } from '../StyleSystem';
import { Theme, useTheme, lightTheme } from './ThemeSystem';

// Create a themed version of StyleSystem that automatically uses current theme
export class ThemedStyleSystem {
  private static currentTheme: Theme | null = null;

  // Set the current theme (called by ThemeProvider)
  static setTheme(theme: Theme) {
    this.currentTheme = theme;
  }

  // Get current theme or fallback
  private static getTheme(): Theme {
    if (!this.currentTheme) {
      // Fallback to light theme if no theme is set
      return lightTheme;
    }
    return this.currentTheme;
  }

  // Themed button styles
  static button(
    variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md'
  ): React.CSSProperties {
    const theme = this.getTheme();
    const baseStyle = StyleSystem.button(variant, size);

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.interactive.primary,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.interactive.primary,
        ':hover': {
          backgroundColor: theme.colors.interactive.primaryHover
        },
        ':active': {
          backgroundColor: theme.colors.interactive.primaryPressed
        }
      },
      secondary: {
        backgroundColor: theme.colors.interactive.secondary,
        color: theme.colors.text.primary,
        borderColor: theme.colors.border.default,
        ':hover': {
          backgroundColor: theme.colors.interactive.secondaryHover,
          borderColor: theme.colors.border.strong
        }
      },
      danger: {
        backgroundColor: theme.colors.interactive.danger,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.interactive.danger,
        ':hover': {
          backgroundColor: theme.colors.interactive.dangerHover
        }
      },
      success: {
        backgroundColor: theme.colors.interactive.success,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.interactive.success,
        ':hover': {
          backgroundColor: theme.colors.interactive.successHover
        }
      },
      warning: {
        backgroundColor: theme.colors.interactive.warning,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.interactive.warning,
        ':hover': {
          backgroundColor: theme.colors.interactive.warningHover
        }
      }
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      borderRadius: theme.borderRadius.md,
      transition: theme.animation.enabled ? theme.animation.duration.colors : 'none',
      fontFamily: theme.typography.fontFamily,
      fontSize: {
        sm: theme.typography.fontSize.sm,
        md: theme.typography.fontSize.base,
        lg: theme.typography.fontSize.lg
      }[size]
    };
  }

  // Themed card styles
  static card(
    variant: 'default' | 'elevated' | 'outlined' = 'default',
    padding: keyof Theme['spacing'] = '6'
  ): React.CSSProperties {
    const theme = this.getTheme();
    const baseStyle = StyleSystem.card(variant, padding);

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.background.elevated,
        borderColor: theme.colors.border.default,
        boxShadow: `0 1px 3px ${theme.colors.shadow.light}`
      },
      elevated: {
        backgroundColor: theme.colors.background.elevated,
        borderColor: 'transparent',
        boxShadow: `0 4px 12px ${theme.colors.shadow.medium}`
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border.default,
        boxShadow: 'none'
      }
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[padding]
    };
  }

  // Themed input styles
  static input(
    state: 'default' | 'focus' | 'error' | 'success' | 'disabled' = 'default'
  ): React.CSSProperties {
    const theme = this.getTheme();
    const baseStyle = StyleSystem.input();

    const stateStyles = {
      default: {
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.border.default,
        color: theme.colors.text.primary
      },
      focus: {
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.border.focus,
        color: theme.colors.text.primary,
        boxShadow: `0 0 0 3px ${theme.colors.border.focus}33`
      },
      error: {
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.border.danger,
        color: theme.colors.text.primary,
        boxShadow: `0 0 0 3px ${theme.colors.border.danger}33`
      },
      success: {
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.status.success,
        color: theme.colors.text.primary,
        boxShadow: `0 0 0 3px ${theme.colors.status.success}33`
      },
      disabled: {
        backgroundColor: theme.colors.background.tertiary,
        borderColor: theme.colors.border.muted,
        color: theme.colors.text.disabled,
        cursor: 'not-allowed'
      }
    };

    return {
      ...baseStyle,
      ...stateStyles[state],
      borderRadius: theme.borderRadius.md,
      transition: theme.animation.enabled ? theme.animation.duration.colors : 'none',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize.base,
      '::placeholder': {
        color: theme.colors.text.tertiary
      }
    };
  }

  // Themed badge styles
  static badge(
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default',
    size: 'sm' | 'md' | 'lg' = 'md'
  ): React.CSSProperties {
    const theme = this.getTheme();
    const baseStyle = StyleSystem.badge(variant, size);

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.background.tertiary,
        color: theme.colors.text.primary
      },
      primary: {
        backgroundColor: theme.colors.interactive.primary,
        color: theme.colors.text.inverse
      },
      success: {
        backgroundColor: theme.colors.status.successBg,
        color: theme.colors.status.success
      },
      warning: {
        backgroundColor: theme.colors.status.warningBg,
        color: theme.colors.status.warning
      },
      danger: {
        backgroundColor: theme.colors.status.errorBg,
        color: theme.colors.status.error
      }
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      borderRadius: theme.borderRadius.full,
      fontFamily: theme.typography.fontFamily,
      fontSize: {
        sm: theme.typography.fontSize.xs,
        md: theme.typography.fontSize.sm,
        lg: theme.typography.fontSize.base
      }[size]
    };
  }

  // Themed text styles
  static text(
    size: keyof Theme['typography']['fontSize'] = 'base',
    weight: keyof Theme['typography']['fontWeight'] = 'normal',
    color: keyof Theme['colors']['text'] = 'primary'
  ): React.CSSProperties {
    const theme = this.getTheme();

    return {
      fontSize: theme.typography.fontSize[size],
      fontWeight: theme.typography.fontWeight[weight],
      color: theme.colors.text[color],
      fontFamily: theme.typography.fontFamily,
      lineHeight: theme.typography.lineHeight.normal
    };
  }

  // Themed link styles
  static link(
    variant: 'default' | 'muted' | 'danger' = 'default'
  ): React.CSSProperties {
    const theme = this.getTheme();

    const variantStyles = {
      default: {
        color: theme.colors.interactive.primary,
        ':hover': {
          color: theme.colors.interactive.primaryHover
        }
      },
      muted: {
        color: theme.colors.text.secondary,
        ':hover': {
          color: theme.colors.text.primary
        }
      },
      danger: {
        color: theme.colors.interactive.danger,
        ':hover': {
          color: theme.colors.interactive.dangerHover
        }
      }
    };

    return {
      textDecoration: 'none',
      cursor: 'pointer',
      transition: theme.animation.enabled ? theme.animation.duration.colors : 'none',
      fontFamily: theme.typography.fontFamily,
      ...variantStyles[variant]
    };
  }

  // Themed alert/notification styles
  static alert(
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): React.CSSProperties {
    const theme = this.getTheme();

    const typeStyles = {
      info: {
        backgroundColor: theme.colors.status.infoBg,
        borderColor: theme.colors.status.info,
        color: theme.colors.status.info
      },
      success: {
        backgroundColor: theme.colors.status.successBg,
        borderColor: theme.colors.status.success,
        color: theme.colors.status.success
      },
      warning: {
        backgroundColor: theme.colors.status.warningBg,
        borderColor: theme.colors.status.warning,
        color: theme.colors.status.warning
      },
      error: {
        backgroundColor: theme.colors.status.errorBg,
        borderColor: theme.colors.status.error,
        color: theme.colors.status.error
      }
    };

    return {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderRadius: theme.borderRadius.md,
      border: `1px solid`,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily,
      ...typeStyles[type]
    };
  }

  // Themed modal overlay
  static modalOverlay(): React.CSSProperties {
    const theme = this.getTheme();

    return {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: theme.animation.enabled ? 'fadeIn 0.2s ease-out' : 'none'
    };
  }

  // Themed modal content
  static modalContent(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): React.CSSProperties {
    const theme = this.getTheme();

    const sizeStyles = {
      sm: { maxWidth: '400px' },
      md: { maxWidth: '600px' },
      lg: { maxWidth: '800px' },
      xl: { maxWidth: '1000px' }
    };

    return {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.lg,
      boxShadow: `0 20px 25px -5px ${theme.colors.shadow.strong}`,
      border: `1px solid ${theme.colors.border.default}`,
      padding: theme.spacing[6],
      width: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: theme.animation.enabled ? 'scaleIn 0.2s ease-out' : 'none',
      ...sizeStyles[size]
    };
  }

  // Themed skeleton loader
  static skeleton(
    width: string = '100%',
    height: string = '1rem'
  ): React.CSSProperties {
    const theme = this.getTheme();

    return {
      width,
      height,
      backgroundColor: theme.colors.background.tertiary,
      borderRadius: theme.borderRadius.md,
      animation: theme.animation.enabled ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
      display: 'inline-block'
    };
  }

  // Utility methods using theme
  static spacing = (multiplier: number): string => {
    const theme = this.getTheme();
    return `calc(${theme.spacing[4]} * ${multiplier})`;
  };

  static shadow = (level: 'sm' | 'base' | 'md' | 'lg' | 'xl' = 'base'): string => {
    const theme = this.getTheme();
    const shadows = {
      sm: `0 1px 2px ${theme.colors.shadow.light}`,
      base: `0 1px 3px ${theme.colors.shadow.light}, 0 1px 2px ${theme.colors.shadow.light}`,
      md: `0 4px 6px -1px ${theme.colors.shadow.medium}, 0 2px 4px -1px ${theme.colors.shadow.light}`,
      lg: `0 10px 15px -3px ${theme.colors.shadow.medium}, 0 4px 6px -2px ${theme.colors.shadow.light}`,
      xl: `0 20px 25px -5px ${theme.colors.shadow.strong}, 0 10px 10px -5px ${theme.colors.shadow.medium}`
    };
    return shadows[level];
  };

  static borderColor = (variant: 'default' | 'muted' | 'strong' | 'focus' | 'danger' = 'default'): string => {
    const theme = this.getTheme();
    return theme.colors.border[variant];
  };

  static textColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' = 'primary'): string => {
    const theme = this.getTheme();
    return theme.colors.text[variant];
  };

  static backgroundColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'elevated' = 'primary'): string => {
    const theme = this.getTheme();
    return theme.colors.background[variant];
  };
}

// React hook for themed styles (alternative approach)
export const useThemedStyles = () => {
  const { theme } = useTheme();

  // Update the static theme reference
  React.useEffect(() => {
    ThemedStyleSystem.setTheme(theme);
  }, [theme]);

  return {
    // Themed style functions that automatically use current theme
    button: (variant?: Parameters<typeof ThemedStyleSystem.button>[0], size?: Parameters<typeof ThemedStyleSystem.button>[1]) =>
      ThemedStyleSystem.button(variant, size),
    
    card: (variant?: Parameters<typeof ThemedStyleSystem.card>[0], padding?: Parameters<typeof ThemedStyleSystem.card>[1]) =>
      ThemedStyleSystem.card(variant, padding),
    
    input: (state?: Parameters<typeof ThemedStyleSystem.input>[0]) =>
      ThemedStyleSystem.input(state),
    
    badge: (variant?: Parameters<typeof ThemedStyleSystem.badge>[0], size?: Parameters<typeof ThemedStyleSystem.badge>[1]) =>
      ThemedStyleSystem.badge(variant, size),
    
    text: (size?: Parameters<typeof ThemedStyleSystem.text>[0], weight?: Parameters<typeof ThemedStyleSystem.text>[1], color?: Parameters<typeof ThemedStyleSystem.text>[2]) =>
      ThemedStyleSystem.text(size, weight, color),
    
    link: (variant?: Parameters<typeof ThemedStyleSystem.link>[0]) =>
      ThemedStyleSystem.link(variant),
    
    alert: (type?: Parameters<typeof ThemedStyleSystem.alert>[0]) =>
      ThemedStyleSystem.alert(type),
    
    modalOverlay: () => ThemedStyleSystem.modalOverlay(),
    
    modalContent: (size?: Parameters<typeof ThemedStyleSystem.modalContent>[0]) =>
      ThemedStyleSystem.modalContent(size),
    
    skeleton: (width?: string, height?: string) =>
      ThemedStyleSystem.skeleton(width, height),

    // Utility functions
    spacing: ThemedStyleSystem.spacing,
    shadow: ThemedStyleSystem.shadow,
    borderColor: ThemedStyleSystem.borderColor,
    textColor: ThemedStyleSystem.textColor,
    backgroundColor: ThemedStyleSystem.backgroundColor,

    // Direct theme access
    theme
  };
};

// HOC for automatic theme style updates
export function withThemedStyles<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return React.memo((props: P) => {
    const { theme } = useTheme();
    
    // Update static theme reference
    React.useEffect(() => {
      ThemedStyleSystem.setTheme(theme);
    }, [theme]);

    return React.createElement(Component, props);
  });
}

export default ThemedStyleSystem;