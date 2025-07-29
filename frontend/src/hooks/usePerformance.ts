/**
 * ATİS Performance Hooks
 * Performance monitoring and optimization utilities
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Performance monitoring hook
export interface PerformanceMetrics {
  renderTime: number;
  rerenderCount: number;
  memoryUsage?: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const renderStart = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    rerenderCount: 0,
    componentName
  });

  // Track render start
  renderStart.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    // Track render end
    const renderTime = performance.now() - renderStart.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      rerenderCount: renderCount.current,
      memoryUsage: (performance as any)?.memory?.usedJSHeapSize || undefined
    }));

    // Log performance in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return metrics;
};

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  );
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T => {
  const lastCall = useRef(0);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay, ...deps] // eslint-disable-line react-hooks/exhaustive-deps
  );
};

// Memoized expensive calculations
export const useExpensiveComputation = <T>(
  computeFn: () => T,
  deps: any[]
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = computeFn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development' && (end - start) > 5) {
      console.info(`💡 Expensive computation took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
      visibleItems: items.slice(
        Math.max(0, startIndex),
        endIndex
      )
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems: visibleRange.visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected
  };
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ((performance as any)?.memory) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    // Update immediately
    updateMemoryInfo();

    // Update every 5 seconds in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(updateMemoryInfo, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const MB = bytes / (1024 * 1024);
    return `${MB.toFixed(2)} MB`;
  };

  return {
    ...memoryInfo,
    formatted: {
      used: formatBytes(memoryInfo.usedJSHeapSize),
      total: formatBytes(memoryInfo.totalJSHeapSize),
      limit: formatBytes(memoryInfo.jsHeapSizeLimit)
    }
  };
};

// Bundle size analyzer (development only)
export const useBundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    chunks: string[];
    totalSize: number;
    gzipSize: number;
  } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This would integrate with webpack-bundle-analyzer in a real app
      // For now, just provide mock data
      setBundleInfo({
        chunks: ['main.js', 'vendor.js', 'runtime.js'],
        totalSize: 1200000, // 1.2MB
        gzipSize: 350000    // 350KB
      });
    }
  }, []);

  return bundleInfo;
};

// Performance budget checker
export const usePerformanceBudget = (budgets: {
  renderTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}) => {
  const [violations, setViolations] = useState<string[]>([]);
  const metrics = usePerformanceMonitor('PerformanceBudget');
  const memory = useMemoryMonitor();
  
  useEffect(() => {
    const newViolations: string[] = [];
    
    if (budgets.renderTime && metrics.renderTime > budgets.renderTime) {
      newViolations.push(`Render time exceeded: ${metrics.renderTime}ms > ${budgets.renderTime}ms`);
    }
    
    if (budgets.memoryUsage && memory.usedJSHeapSize && 
        memory.usedJSHeapSize > budgets.memoryUsage) {
      newViolations.push(`Memory usage exceeded: ${memory.formatted.used} > ${(budgets.memoryUsage / (1024 * 1024)).toFixed(2)} MB`);
    }
    
    setViolations(newViolations);
    
    // Log violations in development
    if (process.env.NODE_ENV === 'development' && newViolations.length > 0) {
      console.warn('🚨 Performance budget violations:', newViolations);
    }
  }, [budgets, metrics.renderTime, memory.usedJSHeapSize, memory.formatted.used]);
  
  return {
    violations,
    isWithinBudget: violations.length === 0,
    metrics
  };
};

export default {
  usePerformanceMonitor,
  useDebouncedCallback,
  useThrottledCallback,
  useExpensiveComputation,
  useVirtualScroll,
  useIntersectionObserver,
  useMemoryMonitor,
  useBundleAnalyzer,
  usePerformanceBudget
};