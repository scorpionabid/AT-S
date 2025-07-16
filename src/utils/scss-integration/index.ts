/**
 * AT0S SCSS Integration - Main Export File
 * Complete integration between SCSS design system and TypeScript/React
 */

// Theme Management
export {
  themeManager,
  useTheme,
  ThemeProvider,
  themeUtils,
  THEME_NAMES,
  THEME_STORAGE_KEY
} from './themeManager';

export type {
  ThemeName,
  ThemeColors,
  ThemeConfig
} from './themeManager';

// SCSS Utilities
export {
  scssUtils,
  SCSSVariableAccess,
  StyledComponentUtils,
  AnimationUtils,
  ResponsiveUtils,
  PerformanceUtils,
  ColorUtils
} from './scssUtils';

export type {
  DesignTokens,
  ColorTokens,
  ColorScale,
  SpacingTokens,
  TypographyTokens,
  ShadowTokens,
  RadiusTokens,
  BreakpointTokens,
  ZIndexTokens,
  AnimationTokens
} from './scssUtils';

// Additional React hooks and utilities
import React from 'react';
import { scssUtils } from './scssUtils';

/**
 * Hook for accessing SCSS design tokens
 */
export function useDesignTokens() {
  const [tokens, setTokens] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    // Load design tokens from CSS variables
    const loadTokens = () => {
      const newTokens: Record<string, string> = {};
      
      // Common design tokens
      const tokenKeys = [
        'color-primary-500',
        'color-secondary-500',
        'space-4',
        'space-8',
        'font-size-base',
        'font-size-lg',
        'radius-md',
        'shadow-md',
        'duration-200',
        'ease-out'
      ];

      tokenKeys.forEach(key => {
        newTokens[key] = scssUtils.variables.getCSSVariable(key);
      });

      setTokens(newTokens);
    };

    loadTokens();

    // Update on theme change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          loadTokens();
        }
      });
    });

    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    return () => observer.disconnect();
  }, []);

  return tokens;
}

/**
 * Hook for responsive utilities
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<{
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    width: number;
    height: number;
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200,
    height: 800
  });

  React.useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: scssUtils.responsive.isMobile(),
        isTablet: scssUtils.responsive.isTablet(),
        isDesktop: scssUtils.responsive.isDesktop(),
        width,
        height
      });
    };

    updateScreenSize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateScreenSize);
      return () => window.removeEventListener('resize', updateScreenSize);
    }
  }, []);

  return screenSize;
}

/**
 * Hook for managing animations with performance optimization
 */
export function useAnimation(element: React.RefObject<HTMLElement>) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const startAnimation = React.useCallback((properties: string[] = ['transform', 'opacity']) => {
    if (!element.current) return;

    setIsAnimating(true);
    scssUtils.performance.optimizeForAnimation(element.current, properties);
  }, [element]);

  const endAnimation = React.useCallback(() => {
    if (!element.current) return;

    setIsAnimating(false);
    scssUtils.performance.cleanupAnimation(element.current);
  }, [element]);

  React.useEffect(() => {
    return () => {
      if (element.current) {
        scssUtils.performance.cleanupAnimation(element.current);
      }
    };
  }, [element]);

  return {
    isAnimating,
    startAnimation,
    endAnimation
  };
}

/**
 * Hook for intersection observer animations
 */
export function useIntersectionAnimation(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          element.classList.add('in-view');
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasAnimated, options]);

  return {
    elementRef,
    isVisible,
    hasAnimated
  };
}

/**
 * Styled component factory hook
 */
export function useStyledComponent(baseComponent: string) {
  const createClassName = React.useCallback((
    variant?: string,
    modifiers?: string[],
    customClasses?: string[]
  ) => {
    const base = scssUtils.styled.createClassName(baseComponent, variant, modifiers);
    const custom = customClasses ? customClasses.join(' ') : '';
    return `${base} ${custom}`.trim();
  }, [baseComponent]);

  const createProps = React.useCallback((props: Record<string, any>) => {
    return scssUtils.styled.createStyledProps(props);
  }, []);

  return {
    createClassName,
    createProps
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<{
    fps: number;
    memoryUsage?: number;
    renderTime?: number;
  }>({
    fps: 60
  });

  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    let rafId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    // Start monitoring
    rafId = requestAnimationFrame(measureFPS);

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }));
      }, 5000);

      return () => {
        cancelAnimationFrame(rafId);
        clearInterval(interval);
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return metrics;
}

/**
 * Color accessibility hook
 */
export function useColorAccessibility() {
  const checkContrast = React.useCallback((foreground: string, background: string) => {
    const ratio = scssUtils.color.getContrastRatio(foreground, background);
    
    return {
      ratio,
      aaSmall: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaSmall: ratio >= 7,
      aaaLarge: ratio >= 4.5
    };
  }, []);

  const suggestAccessibleColor = React.useCallback((
    baseColor: string,
    background: string,
    targetRatio: number = 4.5
  ) => {
    let adjustedColor = baseColor;
    let adjustment = 0;
    const step = 5;

    while (scssUtils.color.getContrastRatio(adjustedColor, background) < targetRatio && adjustment <= 100) {
      adjustment += step;
      adjustedColor = scssUtils.color.adjustBrightness(baseColor, -adjustment);
    }

    return adjustedColor;
  }, []);

  return {
    checkContrast,
    suggestAccessibleColor
  };
}

/**
 * Main utility object for easy access
 */
export const atisDesignSystem = {
  theme: themeUtils,
  scss: scssUtils,
  hooks: {
    useTheme: useTheme,
    useDesignTokens,
    useResponsive,
    useAnimation,
    useIntersectionAnimation,
    useStyledComponent,
    usePerformanceMonitoring,
    useColorAccessibility
  }
};

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

/**
 * Configuration
 */
export const CONFIG = {
  enablePerformanceMonitoring: import.meta.env.MODE === 'development',
  enableDebugMode: import.meta.env.MODE === 'development',
  themeStorageKey: 'atis-theme',
  cssPrefix: 'atis'
};

// Default export
export default atisDesignSystem;