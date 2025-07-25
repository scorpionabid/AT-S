import React, { useEffect, useRef, useCallback, useState } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentMounts: number;
  reRenders: number;
  errorCount: number;
  loadTime: number;
  interactionDelay: number;
  bundleSize: number;
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  renderTime: 16, // 60fps threshold
  memoryUsage: 50 * 1024 * 1024, // 50MB
  loadTime: 1000, // 1 second
  interactionDelay: 100, // 100ms
} as const;

// Performance monitoring hook
export const useSidebarPerformance = (componentName: string = 'Sidebar') => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    reRenders: 0,
    errorCount: 0,
    loadTime: 0,
    interactionDelay: 0,
    bundleSize: 0
  });

  const [performanceIssues, setPerformanceIssues] = useState<string[]>([]);
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End render timing
  const endRenderTiming = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        reRenders: renderCount.current
      }));

      // Check for performance issues
      if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
        setPerformanceIssues(prev => [
          ...prev,
          `Slow render detected: ${renderTime.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.renderTime}ms)`
        ]);
      }

      renderStartTime.current = 0;
    }
  }, []);

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));

      if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
        setPerformanceIssues(prev => [
          ...prev,
          `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`
        ]);
      }
    }
  }, []);

  // Measure component load time
  const measureLoadTime = useCallback(() => {
    if (mountTime.current > 0) {
      const loadTime = performance.now() - mountTime.current;
      
      setMetrics(prev => ({
        ...prev,
        loadTime
      }));

      if (loadTime > PERFORMANCE_THRESHOLDS.loadTime) {
        setPerformanceIssues(prev => [
          ...prev,
          `Slow component load: ${loadTime.toFixed(2)}ms`
        ]);
      }
    }
  }, []);

  // Start interaction timing
  const startInteractionTiming = useCallback(() => {
    interactionStartTime.current = performance.now();
  }, []);

  // End interaction timing
  const endInteractionTiming = useCallback((interactionType: string) => {
    if (interactionStartTime.current > 0) {
      const interactionDelay = performance.now() - interactionStartTime.current;
      
      setMetrics(prev => ({
        ...prev,
        interactionDelay
      }));

      if (interactionDelay > PERFORMANCE_THRESHOLDS.interactionDelay) {
        setPerformanceIssues(prev => [
          ...prev,
          `Slow ${interactionType} interaction: ${interactionDelay.toFixed(2)}ms`
        ]);
      }

      interactionStartTime.current = 0;
    }
  }, []);

  // Track error occurrences
  const trackError = useCallback((error: Error) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));

    // Log performance context when error occurs
    if (process.env.NODE_ENV === 'development') {
      console.error(`${componentName} Error Context:`, {
        error: error.message,
        metrics: metrics,
        performanceIssues: performanceIssues
      });
    }
  }, [componentName, metrics, performanceIssues]);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    return {
      component: componentName,
      metrics: metrics,
      issues: performanceIssues,
      recommendations: generateRecommendations(metrics, performanceIssues),
      timestamp: new Date().toISOString()
    };
  }, [componentName, metrics, performanceIssues]);

  // Clear performance issues
  const clearPerformanceIssues = useCallback(() => {
    setPerformanceIssues([]);
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      componentMounts: 0,
      reRenders: 0,
      errorCount: 0,
      loadTime: 0,
      interactionDelay: 0,
      bundleSize: 0
    });
    setPerformanceIssues([]);
    renderCount.current = 0;
  }, []);

  // Component mount tracking
  useEffect(() => {
    mountTime.current = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      componentMounts: prev.componentMounts + 1
    }));

    return () => {
      measureLoadTime();
    };
  }, [measureLoadTime]);

  // Periodic memory monitoring
  useEffect(() => {
    const interval = setInterval(measureMemoryUsage, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [measureMemoryUsage]);

  // Bundle size estimation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Estimate bundle size impact
      const estimatedBundleSize = 
        (metrics.componentMounts * 15) + // Base component size
        (performanceIssues.length * 5) + // Issue tracking overhead
        50; // Base hooks and utilities

      setMetrics(prev => ({
        ...prev,
        bundleSize: estimatedBundleSize
      }));
    }
  }, [metrics.componentMounts, performanceIssues.length]);

  return {
    metrics,
    performanceIssues,
    startRenderTiming,
    endRenderTiming,
    startInteractionTiming,
    endInteractionTiming,
    trackError,
    getPerformanceReport,
    clearPerformanceIssues,
    resetMetrics,
    hasPerformanceIssues: performanceIssues.length > 0,
    isHealthy: performanceIssues.length === 0 && metrics.errorCount === 0
  };
};

// Generate performance recommendations
const generateRecommendations = (metrics: PerformanceMetrics, issues: string[]): string[] => {
  const recommendations: string[] = [];

  if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
    recommendations.push('Consider memoizing expensive calculations or using React.memo()');
    recommendations.push('Check for unnecessary re-renders caused by props changes');
  }

  if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
    recommendations.push('Review memory usage - consider cleaning up unused references');
    recommendations.push('Check for memory leaks in event listeners or timers');
  }

  if (metrics.reRenders > 10) {
    recommendations.push('High re-render count detected - review dependencies in useEffect');
    recommendations.push('Consider using useCallback and useMemo for expensive operations');
  }

  if (metrics.loadTime > PERFORMANCE_THRESHOLDS.loadTime) {
    recommendations.push('Consider code splitting or lazy loading for heavy components');
    recommendations.push('Optimize initial data loading strategy');
  }

  if (metrics.errorCount > 0) {
    recommendations.push('Address error handling to improve user experience');
    recommendations.push('Implement error boundaries to prevent cascading failures');
  }

  if (issues.length > 5) {
    recommendations.push('Multiple performance issues detected - consider performance audit');
  }

  return recommendations;
};

// Performance monitoring wrapper HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const PerformanceMonitoredComponent = (props: P) => {
    const performance = useSidebarPerformance(componentName || WrappedComponent.name);

    useEffect(() => {
      performance.startRenderTiming();
      return () => {
        performance.endRenderTiming();
      };
    });

    return React.createElement(WrappedComponent, props);
  };

  PerformanceMonitoredComponent.displayName = 
    `withPerformanceMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return PerformanceMonitoredComponent;
};

// Performance dashboard hook
export const usePerformanceDashboard = () => {
  const [components, setComponents] = useState<Map<string, PerformanceMetrics>>(new Map());
  const [globalIssues, setGlobalIssues] = useState<string[]>([]);

  const registerComponent = useCallback((name: string, metrics: PerformanceMetrics) => {
    setComponents(prev => new Map(prev).set(name, metrics));
  }, []);

  const unregisterComponent = useCallback((name: string) => {
    setComponents(prev => {
      const newMap = new Map(prev);
      newMap.delete(name);
      return newMap;
    });
  }, []);

  const getGlobalMetrics = useCallback(() => {
    const allMetrics = Array.from(components.values());
    
    if (allMetrics.length === 0) {
      return {
        avgRenderTime: 0,
        totalMemoryUsage: 0,
        totalErrors: 0,
        totalReRenders: 0,
        componentCount: 0
      };
    }

    return {
      avgRenderTime: allMetrics.reduce((sum, m) => sum + m.renderTime, 0) / allMetrics.length,
      totalMemoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      totalErrors: allMetrics.reduce((sum, m) => sum + m.errorCount, 0),
      totalReRenders: allMetrics.reduce((sum, m) => sum + m.reRenders, 0),
      componentCount: allMetrics.length
    };
  }, [components]);

  const getPerformanceScore = useCallback(() => {
    const globalMetrics = getGlobalMetrics();
    let score = 100;

    // Deduct points for performance issues
    if (globalMetrics.avgRenderTime > PERFORMANCE_THRESHOLDS.renderTime) {
      score -= 20;
    }
    if (globalMetrics.totalMemoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) {
      score -= 25;
    }
    if (globalMetrics.totalErrors > 0) {
      score -= globalMetrics.totalErrors * 10;
    }
    if (globalMetrics.totalReRenders > 50) {
      score -= 15;
    }

    return Math.max(0, score);
  }, [getGlobalMetrics]);

  return {
    components,
    globalIssues,
    registerComponent,
    unregisterComponent,
    getGlobalMetrics,
    getPerformanceScore,
    hasGlobalIssues: globalIssues.length > 0
  };
};

export default useSidebarPerformance;