/**
 * Frontend Performance Utilities
 * Provides tools for monitoring and optimizing frontend performance
 */

import React from 'react';

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static observers: PerformanceObserver[] = [];

  static startTimer(label: string): void {
    this.metrics.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.metrics.get(label);
    if (startTime === undefined) {
      console.warn(`No start time found for timer: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    if (duration > 100) { // Log slow operations
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    return fn().finally(() => {
      this.endTimer(label);
    });
  }

  static initObservers(): void {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.debug('Long task observer not supported');
      }

      // Observe layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let totalScore = 0;
        list.getEntries().forEach((entry: any) => {
          totalScore += entry.value;
        });
        
        if (totalScore > 0.1) {
          console.warn(`Cumulative Layout Shift detected: ${totalScore.toFixed(4)}`);
        }
      });

      try {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        console.debug('Layout shift observer not supported');
      }
    }
  }

  static disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Component lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const FallbackComponent = fallback || (() => <div>Loading...</div>);
    return (
      <React.Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} ref={ref} />
      </React.Suspense>
    );
  });
}

// Image optimization utilities
export class ImageOptimizer {
  private static cache = new Map<string, HTMLImageElement>();

  static preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  static createResponsiveImageUrl(
    baseUrl: string,
    width: number,
    quality: number = 80
  ): string {
    // This would integrate with a CDN or image optimization service
    return `${baseUrl}?w=${width}&q=${quality}`;
  }
}

// Memory management utilities
export class MemoryManager {
  private static observers: Set<() => void> = new Set();

  static addCleanupObserver(cleanup: () => void): void {
    this.observers.add(cleanup);
  }

  static removeCleanupObserver(cleanup: () => void): void {
    this.observers.delete(cleanup);
  }

  static cleanup(): void {
    this.observers.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
  }

  static getMemoryUsage(): number | null {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  }

  static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        if (usage > 0.9) {
          console.warn(`High memory usage detected: ${(usage * 100).toFixed(2)}%`);
          this.cleanup();
        }
      };

      setInterval(checkMemory, 30000); // Check every 30 seconds
    }
  }
}

// API request optimization
export class APIOptimizer {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static pendingRequests = new Map<string, Promise<any>>();

  static async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Make new request
    const promise = requestFn().then(data => {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  static invalidateCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
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

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): React.RefCallback<Element> {
  const [observer, setObserver] = React.useState<IntersectionObserver | null>(null);

  const ref = React.useCallback((element: Element | null) => {
    if (observer) {
      observer.disconnect();
    }

    if (element) {
      const newObserver = new IntersectionObserver(callback, options);
      newObserver.observe(element);
      setObserver(newObserver);
    }
  }, [callback, options]);

  React.useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer]);

  return ref;
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.initObservers();
  MemoryManager.monitorMemoryUsage();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    PerformanceMonitor.disconnect();
    MemoryManager.cleanup();
    APIOptimizer.cleanup();
  });
}