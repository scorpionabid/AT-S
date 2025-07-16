import React from 'react';
import { FiRefreshCw, FiUsers, FiCheckCircle, FiTrendingUp, FiBarChart2, FiCheckSquare } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from "../../utils/cn";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  className 
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <span className={cn(
            "inline-flex items-center text-sm font-medium",
            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
};

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  quickActions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'refresh' | 'help';
  }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: { id: string; label: string; icon?: React.ReactNode }[];
  metrics?: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }[];
  lastUpdated?: Date;
  className?: string;
}

const EnhancedDashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  quickActions = [],
  activeTab,
  onTabChange,
  tabs = [],
  metrics = [],
  lastUpdated = new Date(),
  className,
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Default metrics if none provided
  const defaultMetrics = [
    {
      title: "Ümumi İstifadəçi",
      value: 0,
      icon: <FiUsers size={20} />,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Aktiv İstifadəçi",
      value: 0,
      icon: <FiCheckCircle size={20} />,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Ümumi Məktəblər",
      value: 0,
      icon: <FiTrendingUp size={20} />
    },
    {
      title: "Aktiv Sorğular",
      value: 0,
      icon: <FiBarChart2 size={20} />,
      trend: { value: 0, isPositive: true }
    }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="mb-6">
            <h1 className="dashboard-title">
              {title}
            </h1>
            {subtitle && (
              <p className="dashboard-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          
          {tabs.length > 0 && (
            <div className="dashboard-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn("tab-button", {
                    active: activeTab === tab.id,
                  })}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="metrics-grid">
            {displayMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                trend={metric.trend}
              />
            ))}
          </div>

          <div className="header-actions">
            <div className="last-updated">
              Son yenilənmə: {lastUpdated.toLocaleTimeString('az-AZ')}
            </div>
            <button 
              onClick={onRefresh} 
              className="refresh-btn"
              title="Məlumatları yenilə"
              aria-label="Yenilə"
            >
              <FiRefreshCw className={cn("w-4 h-4", {
                'animate-spin': false // Add loading state here if needed
              })} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section - Now properly outside the header */}
      {quickActions.length > 0 && (
        <div className="quick-actions-container bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto w-full">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  "whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center",
                  action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                  action.variant === 'secondary' && 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600',
                  action.variant === 'tertiary' && 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
                  action.variant === 'quaternary' && 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
                  action.variant === 'refresh' && 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30',
                  action.variant === 'help' && 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700',
                  !action.variant && 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                )}
                title={action.label}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboardHeader;
