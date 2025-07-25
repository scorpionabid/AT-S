// ====================
// ATİS Task Statistics Component
// Displays task statistics overview cards
// ====================

import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Timer
} from 'lucide-react';
import { Card } from '../ui/Card';
import { TaskStats as TaskStatsType } from '../../types/shared';

interface TaskStatsProps {
  stats: TaskStatsType | null;
  loading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend 
}) => (
  <Card className={`card-base card-md stat-card ${color} cursor-pointer hover:shadow-lg transition-all`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 mb-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500">
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-2 ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${
              trend.direction === 'down' ? 'rotate-180' : ''
            }`} />
            {trend.value}% ({trend.direction === 'up' ? 'artım' : 'azalma'})
          </div>
        )}
      </div>
      <div className="text-3xl opacity-80">
        {icon}
      </div>
    </div>
  </Card>
);

const LoadingSkeleton: React.FC = () => (
  <div className="stats-overview">
    {[...Array(6)].map((_, index) => (
      <Card key={index} className="card-base card-md animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </Card>
    ))}
  </div>
);

export const TaskStats: React.FC<TaskStatsProps> = ({ 
  stats, 
  loading = false, 
  className = '' 
}) => {
  if (loading || !stats) {
    return <LoadingSkeleton />;
  }

  const completionRate = stats.total_tasks > 0 
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  const onTimeRate = Math.round(stats.on_time_completion_rate);
  
  const avgCompletionDays = stats.avg_completion_time > 0 
    ? Math.round(stats.avg_completion_time / 24) 
    : 0;

  return (
    <div className={`stats-overview ${className}`}>
      {/* Total Tasks */}
      <StatCard
        title="Ümumi Tapşırıqlar"
        value={stats.total_tasks.toLocaleString()}
        icon={<CheckSquare />}
        color="total"
        subtitle="Sistem daxilində"
      />

      {/* Pending Tasks */}
      <StatCard
        title="Gözləyən Tapşırıqlar"
        value={stats.pending_tasks.toLocaleString()}
        icon={<Clock />}
        color="pending"
        subtitle="Başlanmamış"
      />

      {/* In Progress Tasks */}
      <StatCard
        title="İcrada Olan"
        value={stats.in_progress_tasks.toLocaleString()}
        icon={<Timer />}
        color="progress"
        subtitle="Hazırda işlənir"
      />

      {/* Completed Tasks */}
      <StatCard
        title="Tamamlanmış"
        value={stats.completed_tasks.toLocaleString()}
        icon={<Target />}
        color="completed"
        subtitle={`${completionRate}% tamamlanma`}
      />

      {/* Overdue Tasks */}
      <StatCard
        title="Gecikmiş Tapşırıqlar"
        value={stats.overdue_tasks.toLocaleString()}
        icon={<AlertTriangle />}
        color="overdue"
        subtitle="Müddəti keçmiş"
      />

      {/* Urgent Tasks */}
      <StatCard
        title="Təcili Tapşırıqlar"
        value={stats.urgent_tasks.toLocaleString()}
        icon={<Calendar />}
        color="urgent"
        subtitle="Prioritet: Təcili"
      />

      {/* Completion Rate */}
      <StatCard
        title="Tamamlanma Nisbəti"
        value={`${completionRate}%`}
        icon={<TrendingUp />}
        color="success"
        subtitle="Ümumi göstərici"
      />

      {/* On-Time Completion */}
      <StatCard
        title="Vaxtında Tamamlanma"
        value={`${onTimeRate}%`}
        icon={<Timer />}
        color="info"
        subtitle="Müddətə riayət"
      />

      {/* Average Completion Time */}
      <StatCard
        title="Orta Tamamlanma Vaxtı"
        value={avgCompletionDays > 0 ? `${avgCompletionDays} gün` : 'N/A'}
        icon={<Clock />}
        color="neutral"
        subtitle="Orta müddət"
      />

      {/* Top Performer */}
      {stats.performance_metrics.top_performers.length > 0 && (
        <StatCard
          title="Ən Yaxşı İcraçı"
          value={stats.performance_metrics.top_performers[0].username}
          icon={<Users />}
          color="primary"
          subtitle={`${Math.round(stats.performance_metrics.top_performers[0].completion_rate)}% tamamlanma`}
        />
      )}
    </div>
  );
};

// Quick stats summary component
interface QuickStatsProps {
  stats: TaskStatsType | null;
  loading?: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="flex space-x-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600">{stats.total_tasks}</div>
        <div className="text-sm text-blue-600">Ümumi</div>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="text-2xl font-bold text-orange-600">{stats.pending_tasks}</div>
        <div className="text-sm text-orange-600">Gözləyən</div>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-2xl font-bold text-green-600">{stats.completed_tasks}</div>
        <div className="text-sm text-green-600">Tamamlanmış</div>
      </div>
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="text-2xl font-bold text-red-600">{stats.overdue_tasks}</div>
        <div className="text-sm text-red-600">Gecikmiş</div>
      </div>
    </div>
  );
};

// Progress breakdown component
interface ProgressBreakdownProps {
  stats: TaskStatsType | null;
}

export const ProgressBreakdown: React.FC<ProgressBreakdownProps> = ({ stats }) => {
  if (!stats || stats.total_tasks === 0) {
    return (
      <Card className="card-base card-md">
        <h3 className="text-lg font-semibold mb-4">İrəliləyiş Bölgüsü</h3>
        <div className="text-center text-gray-500 py-8">
          Tapşırıq məlumatları mövcud deyil
        </div>
      </Card>
    );
  }

  const getPercentage = (count: number) => Math.round((count / stats.total_tasks) * 100);

  const segments = [
    { label: 'Tamamlanmış', count: stats.completed_tasks, color: '#22c55e' },
    { label: 'İcrada', count: stats.in_progress_tasks, color: '#3b82f6' },
    { label: 'Gözləyən', count: stats.pending_tasks, color: '#f59e0b' },
    { label: 'Gecikmiş', count: stats.overdue_tasks, color: '#ef4444' },
    { label: 'Ləğv edilmiş', count: stats.cancelled_tasks, color: '#6b7280' }
  ];

  return (
    <Card className="card-base card-md">
      <h3 className="text-lg font-semibold mb-4">İrəliləyiş Bölgüsü</h3>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        {segments.map((segment, index) => {
          const percentage = getPercentage(segment.count);
          if (percentage === 0) return null;
          
          return (
            <div
              key={segment.label}
              className="h-full float-left transition-all"
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color
              }}
              title={`${segment.label}: ${segment.count} (${percentage}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{segment.count}</span>
              <span className="text-gray-500">({getPercentage(segment.count)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskStats;