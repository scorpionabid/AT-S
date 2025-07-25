/**
 * AT0S SCSS Integration Utilities
 * TypeScript utilities for working with SCSS design system
 */

// Design token types
export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  radii: RadiusTokens;
  breakpoints: BreakpointTokens;
  zIndices: ZIndexTokens;
  animations: AnimationTokens;
}

export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface SpacingTokens {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
}

export interface TypographyTokens {
  fontFamilies: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeights: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface BreakpointTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ZIndexTokens {
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  offcanvas: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export interface AnimationTokens {
  durations: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  easings: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
    smooth: string;
  };
}

// SCSS Variable Access
export class SCSSVariableAccess {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map<string, string>();
  }

  private getCSSVariable(name: string): string {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    if (typeof window === 'undefined') return '';

    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();

    if (value) {
      this.cache.set(name, value);
    }

    return value;
  }

  setCSSVariable(name: string, value: string): void {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty(`--${name}`, value);
    this.cache.set(name, value);
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Design token accessors
  getColor(colorName: keyof ColorTokens, shade: keyof ColorScale): string {
    return this.getCSSVariable(`color-${colorName}-${shade}`);
  }

  getSpacing(size: keyof SpacingTokens): string {
    return this.getCSSVariable(`space-${size}`);
  }

  getFontSize(size: keyof TypographyTokens['fontSizes']): string {
    return this.getCSSVariable(`font-size-${size}`);
  }

  getShadow(level: keyof ShadowTokens): string {
    return this.getCSSVariable(`shadow-${level}`);
  }

  getRadius(size: keyof RadiusTokens): string {
    return this.getCSSVariable(`radius-${size}`);
  }

  getBreakpoint(size: keyof BreakpointTokens): string {
    return this.getCSSVariable(`breakpoint-${size}`);
  }

  getDuration(speed: keyof AnimationTokens['durations']): string {
    return this.getCSSVariable(`duration-${speed}`);
  }

  getEasing(type: keyof AnimationTokens['easings']): string {
    return this.getCSSVariable(`ease-${type}`);
  }
}

// CSS-in-JS utilities
export class StyledComponentUtils {
  private prefix: string;

  constructor(prefix: string = 'atis') {
    this.prefix = prefix;
  }

  createClassName(component: string, variant?: string, modifiers?: string[]): string {
    let className = `${this.prefix}-${component}`;
    
    if (variant) {
      className += `--${variant}`;
    }
    
    if (modifiers && modifiers.length > 0) {
      className += ` ${modifiers.map(mod => `${this.prefix}-${component}--${mod}`).join(' ')}`;
    }
    
    return className;
  }

  static generateDataAttributes(props: Record<string, any>): Record<string, string> {
    const dataAttrs: Record<string, string> = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dataAttrs[`data-${key}`] = String(value);
      }
    });
    
    return dataAttrs;
  }

  createStyledProps(props: {
    variant?: string;
    size?: string;
    color?: string;
    spacing?: string;
    radius?: string;
    [key: string]: any;
  }): Record<string, string> {
    const styledProps: Record<string, string> = {};
    
    if (props.variant) styledProps['data-variant'] = props.variant;
    if (props.size) styledProps['data-size'] = props.size;
    if (props.color) styledProps['data-color'] = props.color;
    if (props.spacing) styledProps['data-spacing'] = props.spacing;
    if (props.radius) styledProps['data-radius'] = props.radius;
    
    return styledProps;
  }

  // Static version for backward compatibility
  static createStyledProps(props: {
    variant?: string;
    size?: string;
    color?: string;
    spacing?: string;
    radius?: string;
    [key: string]: any;
  }): Record<string, string> {
    const instance = new StyledComponentUtils();
    return instance.createStyledProps(props);
  }
}

// Animation utilities
export class AnimationUtils {
  static createKeyframes(name: string, frames: Record<string, Record<string, string>>): string {
    const keyframeRules = Object.entries(frames)
      .map(([percentage, styles]) => {
        const styleRules = Object.entries(styles)
          .map(([property, value]) => `${property}: ${value}`)
          .join('; ');
        return `${percentage} { ${styleRules} }`;
      })
      .join(' ');
    
    return `@keyframes ${name} { ${keyframeRules} }`;
  }

  static injectKeyframes(name: string, frames: Record<string, Record<string, string>>): void {
    if (typeof document === 'undefined') return;
    
    const keyframes = this.createKeyframes(name, frames);
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
  }

  static createStaggerDelay(index: number, baseDelay: number = 100): string {
    return `${index * baseDelay}ms`;
  }

  static respectMotionPreference(animation: string): string {
    return `
      ${animation}
      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `;
  }
}

// Responsive utilities
export class ResponsiveUtils {
  private breakpoints: BreakpointTokens;

  constructor(customBreakpoints?: Partial<BreakpointTokens>) {
    this.breakpoints = {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      ...customBreakpoints
    };
  }

  getBreakpointValue(size: keyof BreakpointTokens): string {
    return this.breakpoints[size];
  }

  createMediaQuery(
    minWidth?: keyof BreakpointTokens,
    maxWidth?: keyof BreakpointTokens
  ): string {
    const min = minWidth ? `(min-width: ${this.breakpoints[minWidth]})` : '';
    const max = maxWidth ? `(max-width: ${this.breakpoints[maxWidth]})` : '';

    if (min && max) {
      return `@media ${min} and ${max}`;
    }

    return `@media ${min || max}`;
  }

  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${this.breakpoints.sm})`).matches;
  }

  isTablet(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia(`(min-width: ${this.breakpoints.sm})`).matches &&
      window.matchMedia(`(max-width: ${this.breakpoints.lg})`).matches
    );
  }

  isDesktop(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(min-width: ${this.breakpoints.lg})`).matches;
  }
}

// Performance utilities
export class PerformanceUtils {
  private optimizedElements: Map<HTMLElement, string>;

  constructor() {
    this.optimizedElements = new Map<HTMLElement, string>();
  }

  optimizeForAnimation(element: HTMLElement): void {
    if (this.optimizedElements.has(element)) return;

    // Save original styles
    const originalWillChange = element.style.willChange;
    const originalTransform = element.style.transform;
    const originalBackfaceVisibility = element.style.backfaceVisibility;
    const originalPerspective = element.style.perspective;

    // Apply optimizations
    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';

    // Save original styles for cleanup
    this.optimizedElements.set(element, JSON.stringify({
      willChange: originalWillChange,
      transform: originalTransform,
      backfaceVisibility: originalBackfaceVisibility,
      perspective: originalPerspective
    }));
  }

  cleanupAnimation(element: HTMLElement): void {
    const originalStyles = this.optimizedElements.get(element);
    if (!originalStyles) return;

    const styles = JSON.parse(originalStyles);
    Object.entries(styles).forEach(([property, value]) => {
      (element.style as any)[property] = value;
    });

    this.optimizedElements.delete(element);
  }

  static enableGPUAcceleration(element: HTMLElement): void {
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
  }

  static deferNonCriticalCSS(href: string): void {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  static preloadCriticalImages(urls: string[]): void {
    if (typeof document === 'undefined') return;
    
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Color utilities
export class ColorUtils {
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  adjustBrightness(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const adjust = (color: number) => {
      const adjusted = Math.round(color * (1 + percent / 100));
      return Math.max(0, Math.min(255, adjusted));
    };

    return this.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    );
  }

  getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = this.hexToRgb(hex);
      if (!rgb) return 0;

      const { r, g, b } = rgb;
      const [rNorm, gNorm, bNorm] = [r, g, b].map(c => {
        const normalized = c / 255;
        return normalized <= 0.03928 
          ? normalized / 12.92 
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }
}

// Export main utilities instance
const scssUtils = {
  variables: new SCSSVariableAccess(),
  styled: new StyledComponentUtils(),
  animation: new AnimationUtils(),
  responsive: new ResponsiveUtils(),
  performance: new PerformanceUtils(),
  color: new ColorUtils()
};

export default scssUtils;