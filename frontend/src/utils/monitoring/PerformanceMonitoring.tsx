/**
 * ATİS Real-time Performance Monitoring System
 * Production-ready performance tracking və monitoring
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { styleSystemConfig } from '../../config/StyleSystemConfig';

// Performance metrics interface
interface PerformanceMetrics {
  componentRenderTime: Map<string, number[]>;
  styleApplicationTime: Map<string, number>;
  memoryUsage: number[];
  bundleLoadTime: number;
  routeChangeTime: Map<string, number>;
  errorCount: number;
  userInteractionTime: Map<string, number>;
}

// Performance context
interface PerformanceContextType {
  metrics: PerformanceMetrics;
  startMeasurement: (name: string) => () => void;
  recordInteraction: (type: string, duration: number) => void;
  getPerformanceReport: () => PerformanceReport;
  isMonitoringEnabled: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Performance report interface
interface PerformanceReport {
  summary: {
    averageRenderTime: number;
    averageStyleTime: number;
    currentMemoryUsage: number;
    errorRate: number;
    performanceScore: number;
  };
  recommendations: string[];
  trends: {
    renderPerformance: 'improving' | 'stable' | 'degrading';
    memoryUsage: 'stable' | 'increasing' | 'decreasing';
    errorRate: 'improving' | 'stable' | 'degrading';
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

// Performance monitoring provider
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentRenderTime: new Map(),
    styleApplicationTime: new Map(),
    memoryUsage: [],
    bundleLoadTime: 0,
    routeChangeTime: new Map(),
    errorCount: 0,
    userInteractionTime: new Map()
  });

  const isMonitoringEnabled = styleSystemConfig[process.env.NODE_ENV as keyof typeof styleSystemConfig]?.enablePerformanceTracking || false;

  // Memory monitoring
  useEffect(() => {
    if (!isMonitoringEnabled || typeof window === 'undefined') return;

    const trackMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: [...prev.memoryUsage.slice(-10), memory.usedJSHeapSize]
        }));
      }
    };

    const interval = setInterval(trackMemory, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isMonitoringEnabled]);

  // Bundle load time tracking
  useEffect(() => {
    if (!isMonitoringEnabled || typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        bundleLoadTime: navigation.loadEventEnd - navigation.navigationStart
      }));
    }
  }, [isMonitoringEnabled]);

  // Start measurement function
  const startMeasurement = useCallback((name: string) => {
    if (!isMonitoringEnabled) return () => {};

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMetrics(prev => {
        const currentTimes = prev.componentRenderTime.get(name) || [];
        return {
          ...prev,
          componentRenderTime: prev.componentRenderTime.set(name, [...currentTimes.slice(-9), duration])
        };
      });
    };
  }, [isMonitoringEnabled]);

  // Record user interaction
  const recordInteraction = useCallback((type: string, duration: number) => {
    if (!isMonitoringEnabled) return;

    setMetrics(prev => ({
      ...prev,
      userInteractionTime: prev.userInteractionTime.set(type, duration)
    }));
  }, [isMonitoringEnabled]);

  // Generate performance report
  const getPerformanceReport = useCallback((): PerformanceReport => {
    const renderTimes = Array.from(metrics.componentRenderTime.values()).flat();
    const averageRenderTime = renderTimes.length > 0 ? 
      renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length : 0;

    const styleTimes = Array.from(metrics.styleApplicationTime.values());
    const averageStyleTime = styleTimes.length > 0 ?
      styleTimes.reduce((sum, time) => sum + time, 0) / styleTimes.length : 0;

    const currentMemoryUsage = metrics.memoryUsage[metrics.memoryUsage.length - 1] || 0;
    const errorRate = metrics.errorCount / Math.max(renderTimes.length, 1);

    // Calculate performance score (0-100)
    const performanceScore = Math.max(0, Math.min(100, 
      100 - (averageRenderTime * 2) - (averageStyleTime * 5) - (errorRate * 20)
    ));

    // Determine trends
    const recentRenderTimes = renderTimes.slice(-5);
    const olderRenderTimes = renderTimes.slice(-10, -5);
    const renderTrend = recentRenderTimes.length > 0 && olderRenderTimes.length > 0 ?
      (recentRenderTimes.reduce((s, t) => s + t, 0) / recentRenderTimes.length) >
      (olderRenderTimes.reduce((s, t) => s + t, 0) / olderRenderTimes.length) ?
      'degrading' : 'improving' : 'stable';

    const memoryTrend = metrics.memoryUsage.length >= 2 ?
      metrics.memoryUsage[metrics.memoryUsage.length - 1] > metrics.memoryUsage[metrics.memoryUsage.length - 2] ?
      'increasing' : 'decreasing' : 'stable';

    // Generate recommendations
    const recommendations: string[] = [];
    if (averageRenderTime > 16) {
      recommendations.push('Component render time yüksək - React.memo istifadə edin');
    }
    if (averageStyleTime > 5) {
      recommendations.push('Style application yavaş - StyleSystem cache istifadə edin');
    }
    if (currentMemoryUsage > 50 * 1024 * 1024) {
      recommendations.push('Yaddaş istifadəsi yüksək - component cleanup yoxlayın');
    }
    if (errorRate > 0.05) {
      recommendations.push('Error rate yüksək - error handling təkmilləşdirin');
    }

    // Generate alerts
    const alerts: PerformanceReport['alerts'] = [];
    if (averageRenderTime > 50) {
      alerts.push({
        type: 'error',
        message: 'Render performansı kritik səviyyədə',
        severity: 'high'
      });
    }
    if (currentMemoryUsage > 100 * 1024 * 1024) {
      alerts.push({
        type: 'warning',
        message: 'Yaddaş istifadəsi yüksək səviyyədə',
        severity: 'medium'
      });
    }
    if (performanceScore < 50) {
      alerts.push({
        type: 'warning',
        message: 'Ümumi performans göstəriciləri aşağıdır',
        severity: 'medium'
      });
    }

    return {
      summary: {
        averageRenderTime,
        averageStyleTime,
        currentMemoryUsage: currentMemoryUsage / 1024 / 1024, // Convert to MB
        errorRate,
        performanceScore
      },
      recommendations,
      trends: {
        renderPerformance: renderTrend,
        memoryUsage: memoryTrend,
        errorRate: 'stable'
      },
      alerts
    };
  }, [metrics]);

  const value: PerformanceContextType = {
    metrics,
    startMeasurement,
    recordInteraction,
    getPerformanceReport,
    isMonitoringEnabled
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMonitoring must be used within PerformanceProvider');
  }
  return context;
};

// Performance monitoring HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.memo<P>((props) => {
    const { startMeasurement, recordInteraction, isMonitoringEnabled } = usePerformanceMonitoring();

    useEffect(() => {
      if (!isMonitoringEnabled) return;

      const endMeasurement = startMeasurement(`${componentName}_mount`);
      
      return () => {
        endMeasurement();
      };
    }, [startMeasurement, isMonitoringEnabled]);

    const handleInteraction = useCallback((type: string) => {
      if (!isMonitoringEnabled) return;

      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        recordInteraction(`${componentName}_${type}`, duration);
      };
    }, [recordInteraction, isMonitoringEnabled]);

    // Measure render performance
    const measureRender = isMonitoringEnabled ? startMeasurement(`${componentName}_render`) : () => {};
    
    useEffect(() => {
      measureRender();
    });

    return React.createElement(WrappedComponent, {
      ...props,
      onPerformanceInteraction: handleInteraction
    });
  });
}

// Performance dashboard component
export const PerformanceDashboard: React.FC = () => {
  const { getPerformanceReport, isMonitoringEnabled } = usePerformanceMonitoring();
  const [report, setReport] = useState<PerformanceReport | null>(null);

  useEffect(() => {
    if (!isMonitoringEnabled) return;

    const updateReport = () => {
      setReport(getPerformanceReport());
    };

    const interval = setInterval(updateReport, 10000); // Update every 10 seconds
    updateReport(); // Initial update

    return () => clearInterval(interval);
  }, [getPerformanceReport, isMonitoringEnabled]);

  if (!isMonitoringEnabled || !report) {
    return null;
  }

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Performance Monitor</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Score: {report.summary.performanceScore.toFixed(0)}/100</strong>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        Render: {report.summary.averageRenderTime.toFixed(1)}ms<br/>
        Memory: {report.summary.currentMemoryUsage.toFixed(1)}MB<br/>
        Errors: {(report.summary.errorRate * 100).toFixed(1)}%
      </div>

      {report.alerts.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'red' }}>Alerts:</strong>
          {report.alerts.map((alert, i) => (
            <div key={i} style={{ color: alert.type === 'error' ? 'red' : 'orange' }}>
              • {alert.message}
            </div>
          ))}
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <strong>Recommendations:</strong>
          {report.recommendations.slice(0, 2).map((rec, i) => (
            <div key={i} style={{ color: 'blue' }}>
              • {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Performance metrics collection hook
export const useComponentPerformance = (componentName: string) => {
  const { startMeasurement, isMonitoringEnabled } = usePerformanceMonitoring();

  return {
    measureRender: useCallback(() => {
      return isMonitoringEnabled ? startMeasurement(`${componentName}_render`) : () => {};
    }, [startMeasurement, componentName, isMonitoringEnabled]),

    measureOperation: useCallback((operationName: string) => {
      return isMonitoringEnabled ? startMeasurement(`${componentName}_${operationName}`) : () => {};
    }, [startMeasurement, componentName, isMonitoringEnabled])
  };
};

export default {
  PerformanceProvider,
  usePerformanceMonitoring,
  withPerformanceMonitoring,
  PerformanceDashboard,
  useComponentPerformance
};