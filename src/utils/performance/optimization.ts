// ====================
// Performance Optimization Utilities
// ====================

// ====================
// DEBOUNCE UTILITY
// ====================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// ====================
// THROTTLE UTILITY
// ====================

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ====================
// MEMOIZATION UTILITY
// ====================

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// ====================
// LAZY LOADING UTILITIES
// ====================

export const preloadResource = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

export const preloadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// ====================
// INTERSECTION OBSERVER UTILITIES
// ====================

export interface IntersectionObserverOptions extends IntersectionObserverInit {
  /** Freeze the observer after first intersection */
  freezeOnceVisible?: boolean;
}

export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverOptions = {}
): IntersectionObserver => {
  const { freezeOnceVisible = false, ...observerOptions } = options;

  return new IntersectionObserver((entries) => {
    callback(entries);
    
    // Note: observer reference will be handled externally
  }, observerOptions);
};

// ====================
// VIRTUAL SCROLLING UTILITIES
// ====================

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export const calculateVirtualScrollItems = ({
  itemHeight,
  containerHeight,
  itemCount,
  overscan = 5,
  scrollTop = 0,
}: VirtualScrollOptions & { scrollTop?: number }) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    itemCount - 1
  );

  const paddedStart = Math.max(0, visibleStart - overscan);
  const paddedEnd = Math.min(itemCount - 1, visibleEnd + overscan);

  const totalHeight = itemCount * itemHeight;
  const offsetY = paddedStart * itemHeight;

  const visibleItems = Array.from(
    { length: paddedEnd - paddedStart + 1 },
    (_, index) => paddedStart + index
  );

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleStart: paddedStart,
    visibleEnd: paddedEnd,
  };
};

// ====================
// IMAGE OPTIMIZATION UTILITIES
// ====================

export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

export const generateSizes = (
  breakpoints: { [key: string]: string } = {
    '(max-width: 768px)': '100vw',
    '(max-width: 1200px)': '50vw',
    default: '33vw',
  }
): string => {
  const entries = Object.entries(breakpoints);
  const conditions = entries.slice(0, -1).map(([bp, size]) => `${bp} ${size}`);
  const defaultSize = breakpoints.default || '100vw';
  
  return [...conditions, defaultSize].join(', ');
};

// ====================
// BUNDLE SPLITTING UTILITIES
// ====================

export const createAsyncChunk = <T>(
  importFn: () => Promise<T>,
  chunkName?: string
): (() => Promise<T>) => {
  if (chunkName && typeof importFn === 'function') {
    // Add webpack magic comment for chunk naming
    return () => import(/* webpackChunkName: "[request]" */ `${importFn.toString()}`);
  }
  return importFn;
};

// ====================
// MEMORY MANAGEMENT UTILITIES
// ====================

export const getMemoryUsage = (): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

export const createWeakMapCache = <K extends object, V>() => {
  const cache = new WeakMap<K, V>();

  return {
    get: (key: K): V | undefined => cache.get(key),
    set: (key: K, value: V): void => {
      cache.set(key, value);
    },
    has: (key: K): boolean => cache.has(key),
    delete: (key: K): boolean => cache.delete(key),
  };
};

// ====================
// PERFORMANCE MONITORING
// ====================

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export const measurePerformance = (): Promise<PerformanceMetrics> => {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Web Vitals
    if ('web-vitals' in window) {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          if (fidEntry.processingStart && fidEntry.startTime) {
            metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as any;
          if (clsEntry.hadRecentInput !== undefined && !clsEntry.hadRecentInput) {
            clsValue += clsEntry.value || 0;
          }
        }
        metrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Resolve after a short delay to ensure metrics are collected
    setTimeout(() => {
      resolve(metrics as PerformanceMetrics);
    }, 1000);
  });
};

// ====================
// RESOURCE HINTS
// ====================

export const prefetchResource = (href: string, as?: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  if (as) link.setAttribute('as', as);
  document.head.appendChild(link);
};

export const preloadAsset = (href: string, as: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.setAttribute('as', as);
  document.head.appendChild(link);
};

export const preconnectToOrigin = (origin: string): void => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  document.head.appendChild(link);
};

// ====================
// CRITICAL CSS LOADING
// ====================

export const loadCriticalCSS = (cssText: string): void => {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
};

export const loadNonCriticalCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    
    link.onload = () => {
      link.media = 'all';
      resolve();
    };
    
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

// ====================
// SERVICE WORKER UTILITIES
// ====================

export const registerServiceWorker = async (
  swPath: string = '/sw.js'
): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      return null;
    }
  }
  return null;
};

export const updateServiceWorker = async (
  registration: ServiceWorkerRegistration
): Promise<void> => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  await registration.update();
};

// ====================
// PROGRESSIVE WEB APP UTILITIES
// ====================

export const addToHomeScreen = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        resolve(choiceResult.outcome === 'accepted');
        deferredPrompt = null;
      });
    } else {
      resolve(false);
    }
  });
};

export const detectPWADisplay = (): 'standalone' | 'browser' => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isStandalone ? 'standalone' : 'browser';
};

// ====================
// NETWORK OPTIMIZATION
// ====================

export const getNetworkInformation = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  
  return null;
};

export const adaptToNetworkCondition = (
  slowCallback: () => void,
  fastCallback: () => void
): void => {
  const networkInfo = getNetworkInformation();
  
  if (networkInfo) {
    const isSlowConnection = networkInfo.effectiveType === 'slow-2g' || 
                            networkInfo.effectiveType === '2g' ||
                            networkInfo.saveData;
    
    if (isSlowConnection) {
      slowCallback();
    } else {
      fastCallback();
    }
  } else {
    fastCallback(); // Default to fast
  }
};

// ====================
// ERROR BOUNDARIES
// ====================

export interface ErrorInfo {
  componentStack: string;
}

export const logError = (error: Error, errorInfo: ErrorInfo): void => {
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }
  
  // Send to error reporting service in production
  if (import.meta.env.MODE === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // errorReportingService.captureException(error, { extra: errorInfo });
  }
};

// ====================
// EXPORT ALL UTILITIES
// ====================

export default {
  debounce,
  throttle,
  memoize,
  preloadResource,
  preloadScript,
  createIntersectionObserver,
  calculateVirtualScrollItems,
  generateSrcSet,
  generateSizes,
  getMemoryUsage,
  measurePerformance,
  prefetchResource,
  preloadAsset,
  registerServiceWorker,
  getNetworkInformation,
  adaptToNetworkCondition,
};