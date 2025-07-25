/**
 * Performance Monitor Utility
 * 
 * This utility provides comprehensive performance monitoring
 * for the ATİS application including metrics collection,
 * performance budgets, and real-time monitoring.
 */

interface PerformanceMetrics {
  navigationTiming: NavigationTiming;
  resourceTiming: PerformanceResourceTiming[];
  paintTiming: PerformancePaintTiming[];
  userTiming: PerformanceEntry[];
  vitals: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

interface PerformanceBudget {
  metric: string;
  budget: number;
  actual: number;
  status: 'pass' | 'fail' | 'warn';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private budgets: PerformanceBudget[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private vitals: any = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  };

  constructor() {
    this.metrics = {
      navigationTiming: performance.timing,
      resourceTiming: [],
      paintTiming: [],
      userTiming: [],
      vitals: this.vitals
    };

    this.initializeObservers();
    this.setupPerformanceBudgets();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        this.metrics.paintTiming = list.getEntries() as PerformancePaintTiming[];
        this.updateVitals();
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);

      // Resource timing observer
      const resourceObserver = new PerformanceObserver((list) => {
        this.metrics.resourceTiming = [
          ...this.metrics.resourceTiming,
          ...list.getEntries() as PerformanceResourceTiming[]
        ];
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);

      // User timing observer
      const userObserver = new PerformanceObserver((list) => {
        this.metrics.userTiming = [
          ...this.metrics.userTiming,
          ...list.getEntries()
        ];
      });
      userObserver.observe({ entryTypes: ['measure', 'mark'] });
      this.observers.set('user', userObserver);

      // Largest Contentful Paint observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.vitals.lcp = lastEntry.startTime;
        this.updateVitals();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // Layout shift observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.vitals.cls = clsValue;
        this.updateVitals();
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);

      // First Input Delay observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        this.vitals.fid = (firstEntry as any).processingStart - firstEntry.startTime;
        this.updateVitals();
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    }
  }

  /**
   * Update core web vitals
   */
  private updateVitals(): void {
    // First Contentful Paint
    const fcpEntry = this.metrics.paintTiming.find(entry => 
      entry.name === 'first-contentful-paint'
    );
    if (fcpEntry) {
      this.vitals.fcp = fcpEntry.startTime;
    }

    // Time to First Byte
    this.vitals.ttfb = this.metrics.navigationTiming.responseStart - 
                       this.metrics.navigationTiming.requestStart;

    this.metrics.vitals = { ...this.vitals };
  }

  /**
   * Setup performance budgets
   */
  private setupPerformanceBudgets(): void {
    const budgets = [
      { metric: 'fcp', budget: 1800, description: 'First Contentful Paint' },
      { metric: 'lcp', budget: 2500, description: 'Largest Contentful Paint' },
      { metric: 'fid', budget: 100, description: 'First Input Delay' },
      { metric: 'cls', budget: 0.1, description: 'Cumulative Layout Shift' },
      { metric: 'ttfb', budget: 800, description: 'Time to First Byte' }
    ];

    this.budgets = budgets.map(budget => ({
      metric: budget.metric,
      budget: budget.budget,
      actual: 0,
      status: 'pass' as const
    }));
  }

  /**
   * Collect all performance metrics
   */
  public collectMetrics(): PerformanceMetrics {
    // Update navigation timing
    this.metrics.navigationTiming = performance.timing;

    // Update resource timing
    this.metrics.resourceTiming = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Update memory usage if available
    if ('memory' in performance) {
      this.metrics.memoryUsage = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      };
    }

    // Update network info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }

    return this.metrics;
  }

  /**
   * Check performance budgets
   */
  public checkBudgets(): PerformanceBudget[] {
    const metrics = this.collectMetrics();
    
    return this.budgets.map(budget => {
      const actual = metrics.vitals[budget.metric as keyof typeof metrics.vitals];
      let status: 'pass' | 'fail' | 'warn' = 'pass';
      
      if (actual > budget.budget) {
        status = 'fail';
      } else if (actual > budget.budget * 0.8) {
        status = 'warn';
      }
      
      return {
        ...budget,
        actual,
        status
      };
    });
  }

  /**
   * Get resource performance analysis
   */
  public getResourceAnalysis(): any {
    const resources = this.metrics.resourceTiming;
    const analysis = {
      totalResources: resources.length,
      totalSize: 0,
      totalDuration: 0,
      slowestResources: [],
      largestResources: [],
      resourcesByType: {}
    };

    resources.forEach(resource => {
      const duration = resource.responseEnd - resource.requestStart;
      const size = resource.transferSize || 0;
      
      analysis.totalDuration += duration;
      analysis.totalSize += size;
      
      // Group by resource type
      const type = this.getResourceType(resource.name);
      if (!analysis.resourcesByType[type]) {
        analysis.resourcesByType[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        };
      }
      analysis.resourcesByType[type].count++;
      analysis.resourcesByType[type].totalSize += size;
      analysis.resourcesByType[type].totalDuration += duration;
    });

    // Find slowest resources
    analysis.slowestResources = resources
      .map(resource => ({
        name: resource.name,
        duration: resource.responseEnd - resource.requestStart,
        size: resource.transferSize || 0
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    // Find largest resources
    analysis.largestResources = resources
      .map(resource => ({
        name: resource.name,
        duration: resource.responseEnd - resource.requestStart,
        size: resource.transferSize || 0
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    return analysis;
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectMetrics();
        this.reportPerformance();
      }, 0);
    });

    // Monitor route changes (SPA)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.onRouteChange();
      }
    });
    observer.observe(document, { subtree: true, childList: true });

    // Monitor user interactions
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackUserInteraction(event);
      });
    });
  }

  /**
   * Handle route changes
   */
  private onRouteChange(): void {
    performance.mark('route-change-start');
    
    // Wait for route to load
    setTimeout(() => {
      performance.mark('route-change-end');
      performance.measure('route-change', 'route-change-start', 'route-change-end');
      
      this.collectMetrics();
      this.reportPerformance();
    }, 100);
  }

  /**
   * Track user interactions
   */
  private trackUserInteraction(event: Event): void {
    const target = event.target as HTMLElement;
    const timestamp = performance.now();
    
    // Track interaction timing
    performance.mark(`interaction-${event.type}-${timestamp}`);
    
    // Track specific interactions
    if (event.type === 'click' && target.tagName === 'BUTTON') {
      performance.mark(`button-click-${timestamp}`);
    }
    
    if (event.type === 'keydown' && target.tagName === 'INPUT') {
      performance.mark(`input-keydown-${timestamp}`);
    }
  }

  /**
   * Report performance metrics
   */
  public reportPerformance(): void {
    const metrics = this.collectMetrics();
    const budgets = this.checkBudgets();
    const resourceAnalysis = this.getResourceAnalysis();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Performance Report');
      console.log('📊 Core Web Vitals:', metrics.vitals);
      console.log('💰 Budget Status:', budgets);
      console.log('📦 Resource Analysis:', resourceAnalysis);
      console.groupEnd();
    }
    
    // Send to monitoring service
    this.sendToMonitoringService({
      metrics,
      budgets,
      resourceAnalysis,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent
    });
  }

  /**
   * Send metrics to monitoring service
   */
  private sendToMonitoringService(data: any): void {
    // In production, send to your monitoring service
    // This could be Google Analytics, DataDog, New Relic, etc.
    
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Failed to send performance metrics:', error);
      });
    }
  }

  /**
   * Create performance report
   */
  public createReport(): string {
    const metrics = this.collectMetrics();
    const budgets = this.checkBudgets();
    const resourceAnalysis = this.getResourceAnalysis();
    
    let report = '# Performance Report\n\n';
    
    // Core Web Vitals
    report += '## Core Web Vitals\n\n';
    report += '| Metric | Value | Budget | Status |\n';
    report += '|--------|-------|--------|--------|\n';
    budgets.forEach(budget => {
      const status = budget.status === 'pass' ? '✅' : 
                    budget.status === 'warn' ? '⚠️' : '❌';
      report += `| ${budget.metric.toUpperCase()} | ${budget.actual.toFixed(2)} | ${budget.budget} | ${status} |\n`;
    });
    
    // Resource Analysis
    report += '\n## Resource Analysis\n\n';
    report += `- Total Resources: ${resourceAnalysis.totalResources}\n`;
    report += `- Total Size: ${(resourceAnalysis.totalSize / 1024).toFixed(2)} KB\n`;
    report += `- Total Duration: ${resourceAnalysis.totalDuration.toFixed(2)} ms\n\n`;
    
    // Resource by type
    report += '### Resources by Type\n\n';
    Object.entries(resourceAnalysis.resourcesByType).forEach(([type, data]: [string, any]) => {
      report += `- **${type}**: ${data.count} resources, ${(data.totalSize / 1024).toFixed(2)} KB, ${data.totalDuration.toFixed(2)} ms\n`;
    });
    
    // Slowest resources
    report += '\n### Slowest Resources\n\n';
    resourceAnalysis.slowestResources.forEach((resource: any, index: number) => {
      report += `${index + 1}. ${resource.name} (${resource.duration.toFixed(2)} ms)\n`;
    });
    
    // Memory usage
    if (metrics.memoryUsage) {
      report += '\n## Memory Usage\n\n';
      report += `- Used: ${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
      report += `- Total: ${(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
      report += `- Limit: ${(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n`;
    }
    
    return report;
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}

export default PerformanceMonitor;