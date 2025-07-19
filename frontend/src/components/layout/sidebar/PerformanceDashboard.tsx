import React, { memo, useState, useEffect } from 'react';
import { FiActivity, FiCpu, FiMemoryStick, FiAlertTriangle, FiCheckCircle, FiX, FiBarChart, FiRefreshCw } from 'react-icons/fi';
import { cn } from '../../../utils/cn';
import { useSidebarPerformance, usePerformanceDashboard } from '../../../hooks/useSidebarPerformance';

// Performance metric card component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'error';
  icon: React.ComponentType<any>;
  onClick?: () => void;
}> = memo(({ title, value, unit, status, icon: Icon, onClick }) => {
  const statusColors = {
    good: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        statusColors[status],
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </p>
        </div>
        <Icon className="w-6 h-6 opacity-60" />
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

// Performance score gauge
const PerformanceScore: React.FC<{
  score: number;
  className?: string;
}> = memo(({ score, className }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={cn('text-center', className)}>
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-300 dark:text-gray-600"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={getScoreColor(score)}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xl font-bold', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {getScoreStatus(score)}
      </p>
    </div>
  );
});

PerformanceScore.displayName = 'PerformanceScore';

// Issues list component
const IssuesList: React.FC<{
  issues: string[];
  onDismiss?: (index: number) => void;
}> = memo(({ issues, onDismiss }) => {
  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-green-600 dark:text-green-400">
        <FiCheckCircle className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">No performance issues detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div
          key={index}
          className="flex items-start justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <FiAlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {issue}
            </span>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(index)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

IssuesList.displayName = 'IssuesList';

// Main performance dashboard component
export const PerformanceDashboard: React.FC<{
  className?: string;
  minimal?: boolean;
}> = memo(({ className, minimal = false }) => {
  const [isExpanded, setIsExpanded] = useState(!minimal);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const performance = useSidebarPerformance('SidebarDashboard');
  const dashboard = usePerformanceDashboard();

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Trigger a performance measurement
        performance.startRenderTiming();
        performance.endRenderTiming();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, performance]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  const globalMetrics = dashboard.getGlobalMetrics();
  const performanceScore = dashboard.getPerformanceScore();

  const getMetricStatus = (value: number, threshold: number): 'good' | 'warning' | 'error' => {
    if (value <= threshold) return 'good';
    if (value <= threshold * 1.5) return 'warning';
    return 'error';
  };

  if (minimal && !isExpanded) {
    return (
      <div className={cn('p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <FiActivity className="w-4 h-4" />
          <span>Performance: {performanceScore}/100</span>
          <span className={cn(
            'w-2 h-2 rounded-full',
            performanceScore >= 80 ? 'bg-green-500' : performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          )} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FiBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Dashboard
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              autoRefresh
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
            aria-label={autoRefresh ? 'Disable auto refresh' : 'Enable auto refresh'}
          >
            <FiRefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
          </button>
          {minimal && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Performance Score */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <PerformanceScore score={performanceScore} />
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <MetricCard
          title="Render Time"
          value={formatTime(performance.metrics.renderTime)}
          status={getMetricStatus(performance.metrics.renderTime, 16)}
          icon={FiCpu}
        />
        <MetricCard
          title="Memory Usage"
          value={formatBytes(performance.metrics.memoryUsage)}
          status={getMetricStatus(performance.metrics.memoryUsage, 50 * 1024 * 1024)}
          icon={FiMemoryStick}
        />
        <MetricCard
          title="Re-renders"
          value={performance.metrics.reRenders}
          status={getMetricStatus(performance.metrics.reRenders, 10)}
          icon={FiActivity}
        />
        <MetricCard
          title="Errors"
          value={performance.metrics.errorCount}
          status={performance.metrics.errorCount === 0 ? 'good' : 'error'}
          icon={FiAlertTriangle}
        />
      </div>

      {/* Performance Issues */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Performance Issues
        </h4>
        <IssuesList
          issues={performance.performanceIssues}
          onDismiss={(index) => {
            // Remove specific issue (you might want to implement this in the hook)
            performance.clearPerformanceIssues();
          }}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Detailed Metrics
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
            <span className="font-medium">{formatTime(performance.metrics.loadTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Interaction Delay:</span>
            <span className="font-medium">{formatTime(performance.metrics.interactionDelay)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Component Mounts:</span>
            <span className="font-medium">{performance.metrics.componentMounts}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Bundle Size Impact:</span>
            <span className="font-medium">{formatBytes(performance.metrics.bundleSize)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex space-x-3">
          <button
            onClick={performance.clearPerformanceIssues}
            className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
          >
            Clear Issues
          </button>
          <button
            onClick={performance.resetMetrics}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
          >
            Reset Metrics
          </button>
          <button
            onClick={() => {
              const report = performance.getPerformanceReport();
              console.log('Performance Report:', report);
            }}
            className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

// Floating performance indicator
export const PerformanceIndicator: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = memo(({ position = 'bottom-right', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const performance = useSidebarPerformance('FloatingIndicator');
  const dashboard = usePerformanceDashboard();

  const performanceScore = dashboard.getPerformanceScore();
  const hasIssues = performance.hasPerformanceIssues;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // Auto-show if there are performance issues
  useEffect(() => {
    if (hasIssues) {
      setIsVisible(true);
    }
  }, [hasIssues]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={cn(
          'fixed z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg transition-all hover:shadow-xl',
          positionClasses[position],
          className
        )}
      >
        <FiActivity className={cn(
          'w-4 h-4',
          performanceScore >= 80 ? 'text-green-600' : performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
        )} />
      </button>
    );
  }

  return (
    <div className={cn(
      'fixed z-50 w-80',
      positionClasses[position],
      className
    )}>
      <PerformanceDashboard minimal={true} />
    </div>
  );
});

PerformanceIndicator.displayName = 'PerformanceIndicator';

export default PerformanceDashboard;