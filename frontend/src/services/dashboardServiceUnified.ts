// ====================
// ATİS Unified Dashboard Service
// Eliminates dashboard service duplication with enhanced analytics
// ====================

import { GenericCrudService } from './base/GenericCrudService';
import { ATİSTypes } from '../types/shared';
import { api } from './api';
import { logger } from '../utils/logger';

// Dashboard-specific types
export interface DashboardStats {
  totalUsers: number;
  totalInstitutions: number;
  totalSurveys: number;
  activeSurveys: number;
  pendingSurveys: number;
  completedSurveys: number;
  recentActivities: RecentActivity[];
  systemStatus: SystemStatus;
  usersByRole: Record<string, { display_name: string; count: number }>;
  institutionsByLevel: Record<string, { name: string; count: number }>;
  loading?: boolean;
  error?: string | null;
}

export interface RecentActivity {
  id: string;
  type: 'user_created' | 'survey_completed' | 'institution_added' | 'role_assigned' | 'system_alert';
  user: string;
  action: string;
  target?: string;
  time: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  database: { status: 'online' | 'offline' | 'degraded'; label: string; response_time?: number };
  api: { status: 'online' | 'offline' | 'degraded'; label: string; response_time?: number };
  memory: { status: 'normal' | 'warning' | 'critical'; label: string; usage_percent?: number };
  storage: { status: 'normal' | 'warning' | 'critical'; label: string; usage_percent?: number };
  cache: { status: 'online' | 'offline'; label: string; hit_rate?: number };
}

export interface SuperAdminAnalytics {
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical';
    score: number;
    components: {
      web_server: { status: string; response_time: string; uptime: string };
      database: { status: string; connection_pool: string; query_performance: string };
      file_system: { status: string; space_usage: string; io_performance: string };
      cache: { status: string; hit_rate: string; memory_usage: string };
      network: { status: string; latency: string; throughput: string };
    };
  };
  userEngagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    session_duration: string;
    bounce_rate: string;
    page_views: number;
    feature_usage: Record<string, { name: string; usage_count: number; percentage: number }>;
  };
  institutionPerformance: {
    most_active: Array<{
      id: number;
      name: string;
      activity_score: number;
      survey_completion_rate: number;
      user_engagement: number;
    }>;
    response_rates: {
      high: number;
      medium: number;
      low: number;
    };
    geographic_distribution: Record<string, number>;
  };
  surveyEffectiveness: {
    completion_rate: string;
    average_time: string;
    quality_score: string;
    feedback_satisfaction: string;
    dropout_points: Array<{ step: string; percentage: number }>;
  };
  growthMetrics: {
    user_growth: { current_month: number; previous_month: number; percentage: string };
    institution_growth: { current_month: number; previous_month: number; percentage: string };
    survey_volume: { current_month: number; previous_month: number; percentage: string };
    data_quality: { score: number; trend: string };
  };
  alertsSummary: {
    critical: number;
    warnings: number;
    info: number;
    recent: Array<{
      id: string;
      type: 'critical' | 'warning' | 'info';
      message: string;
      time: string;
      resolved: boolean;
      source: string;
    }>;
  };
}

export interface SystemStatusDetailed {
  timestamp: string;
  server_info: {
    hostname: string;
    version: string;
    environment: string;
    timezone: string;
  };
  services: {
    web: { 
      status: 'online' | 'offline' | 'degraded'; 
      response_time: string; 
      last_check: string;
      active_connections: number;
    };
    database: { 
      status: 'online' | 'offline' | 'degraded'; 
      response_time: string; 
      connections: string; 
      last_check: string;
      pool_usage: number;
    };
    cache: { 
      status: 'online' | 'offline'; 
      hit_rate: string; 
      last_check: string;
      memory_usage: string;
    };
    storage: { 
      status: 'normal' | 'warning' | 'critical'; 
      space_used: string; 
      last_check: string;
      backup_status: string;
    };
  };
  performance: {
    memory: { used: string; total: string; percent: number; status: 'normal' | 'warning' | 'critical' };
    cpu: { usage: number; status: 'normal' | 'warning' | 'critical' };
    disk: { used: string; free: string; total: string; percent: number; status: 'normal' | 'warning' | 'critical' };
    database: { size: string; status: 'normal' | 'warning' | 'critical'; connections: number };
    uptime: string;
    load_average: { one_min: number; five_min: number; fifteen_min: number };
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
    active_incidents: Array<{
      id: string;
      type: string;
      message: string;
      started_at: string;
      severity: string;
    }>;
  };
}

export interface DashboardFilters {
  date_range?: {
    start_date: string;
    end_date: string;
  };
  institution_level?: number;
  region?: string;
  user_role?: string;
  survey_type?: string;
}

export interface PerformanceMetrics {
  response_times: {
    api: number[];
    database: number[];
    cache: number[];
  };
  throughput: {
    requests_per_second: number;
    queries_per_second: number;
  };
  error_rates: {
    api_errors: number;
    database_errors: number;
    system_errors: number;
  };
  resource_usage: {
    memory: number[];
    cpu: number[];
    disk: number[];
  };
}

// Unified Dashboard Service with enhanced analytics
class DashboardServiceUnified extends GenericCrudService<any, any, any> {
  constructor() {
    super('/dashboard');
  }

  /**
   * Get basic dashboard statistics
   */
  async getStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      logger.service.request('DashboardService', '/stats', filters);
      const response = await api.get<{
        status: string;
        data: DashboardStats;
        message?: string;
      }>(`${this.endpoint}/stats`, { params: filters });
      
      logger.service.response('DashboardService', '/stats', response.status, Object.keys(response.data?.data || {}));
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        logger.debug('DashboardService', 'Stats data parsed successfully', {
          totalUsers: data.totalUsers,
          totalInstitutions: data.totalInstitutions,
          totalSurveys: data.totalSurveys,
          activitiesCount: data.recentActivities?.length || 0
        });
        
        return data;
      } else {
        throw new Error(response.data.message || 'API xətası');
      }
    } catch (error: any) {
      logger.service.error('DashboardService', 'Get stats', error);
      this.handleError(error, 'Dashboard statistikaları');
      throw error;
    }
  }

  /**
   * Get detailed dashboard statistics with enhanced filtering
   */
  async getDetailedStats(filters?: DashboardFilters): Promise<any> {
    try {
      const response = await api.get<{
        status: string;
        data: any;
        message?: string;
      }>(`${this.endpoint}/detailed-stats`, { params: filters });
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Ətraflı statistika API xətası');
      }
    } catch (error: any) {
      console.error('Dashboard detailed stats error:', error);
      this.handleError(error, 'Ətraflı statistikalar');
      throw error;
    }
  }

  /**
   * Get SuperAdmin analytics with comprehensive metrics
   */
  async getSuperAdminAnalytics(filters?: DashboardFilters): Promise<SuperAdminAnalytics> {
    try {
      console.log('Dashboard Service: Fetching SuperAdmin analytics...', filters);
      const response = await api.get<{
        status: string;
        data: SuperAdminAnalytics;
        message?: string;
      }>(`${this.endpoint}/superadmin-analytics`, { params: filters });
      
      if (response.data.status === 'success') {
        console.log('SuperAdmin analytics received:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'SuperAdmin analytics API xətası');
      }
    } catch (error: any) {
      console.error('SuperAdmin analytics error:', error);
      if (error.response?.status === 403) {
        throw new Error('SuperAdmin səlahiyyəti tələb olunur');
      }
      this.handleError(error, 'SuperAdmin analitikası');
      throw error;
    }
  }

  /**
   * Get detailed system status
   */
  async getSystemStatus(): Promise<SystemStatusDetailed> {
    try {
      console.log('Dashboard Service: Fetching system status...');
      const response = await api.get<{
        status: string;
        data: SystemStatusDetailed;
        message?: string;
      }>(`${this.endpoint}/system-status`);
      
      if (response.data.status === 'success') {
        console.log('System status received:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'System status API xətası');
      }
    } catch (error: any) {
      console.error('System status error:', error);
      if (error.response?.status === 403) {
        throw new Error('SuperAdmin səlahiyyəti tələb olunur');
      }
      this.handleError(error, 'Sistem statusu');
      throw error;
    }
  }

  /**
   * Get performance metrics over time
   */
  async getPerformanceMetrics(
    timeframe: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<PerformanceMetrics> {
    const response = await api.get<{
      status: string;
      data: PerformanceMetrics;
    }>(`${this.endpoint}/performance-metrics`, {
      params: { timeframe }
    });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Performans metrikaları yüklənə bilmədi');
  }

  /**
   * Get real-time dashboard updates
   */
  async getRealTimeUpdates(): Promise<{
    timestamp: string;
    active_users: number;
    system_load: number;
    recent_activities: RecentActivity[];
    alerts: any[];
  }> {
    const response = await api.get<{
      status: string;
      data: any;
    }>(`${this.endpoint}/real-time`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Real-time yeniliklər yüklənə bilmədi');
  }

  /**
   * Export dashboard data in various formats
   */
  async exportDashboardData(
    format: 'csv' | 'excel' | 'pdf',
    options: {
      include_charts?: boolean;
      date_range?: { start_date: string; end_date: string };
      sections?: string[];
    } = {}
  ): Promise<Blob> {
    const response = await api.post<Blob>(
      `${this.endpoint}/export`,
      { format, ...options },
      { responseType: 'blob' }
    );
    
    return response.data;
  }

  /**
   * Get dashboard widgets configuration
   */
  async getWidgetsConfig(): Promise<ATİSTypes.DashboardWidget[]> {
    const response = await api.get<{
      status: string;
      data: ATİSTypes.DashboardWidget[];
    }>(`${this.endpoint}/widgets`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Widget konfiqurasiyası yüklənə bilmədi');
  }

  /**
   * Update dashboard layout
   */
  async updateDashboardLayout(layout: ATİSTypes.DashboardLayout): Promise<void> {
    const response = await api.put<{
      status: string;
      message: string;
    }>(`${this.endpoint}/layout`, layout);
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Layout yenilənə bilmədi');
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId?: number,
    timeframe: '1d' | '7d' | '30d' = '7d'
  ): Promise<RecentActivity[]> {
    const response = await api.get<{
      status: string;
      data: RecentActivity[];
    }>(`${this.endpoint}/user-activity`, {
      params: { user_id: userId, timeframe }
    });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('İstifadəçi fəaliyyəti yüklənə bilmədi');
  }

  /**
   * Get system alerts with filtering
   */
  async getSystemAlerts(filters: {
    type?: 'critical' | 'warning' | 'info';
    resolved?: boolean;
    limit?: number;
  } = {}): Promise<any[]> {
    const response = await api.get<{
      status: string;
      data: any[];
    }>(`${this.endpoint}/alerts`, { params: filters });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Sistem xəbərdarlıqları yüklənə bilmədi');
  }

  /**
   * Acknowledge/resolve system alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<void> {
    const response = await api.patch<{
      status: string;
      message: string;
    }>(`${this.endpoint}/alerts/${alertId}/resolve`, { resolution });
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Xəbərdarlıq həll edilə bilmədi');
    }
  }

  /**
   * Handle errors consistently across dashboard operations
   */
  private handleError(error: any, operation: string): void {
    if (error.response) {
      console.error(`${operation} error response:`, {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error(`${operation} network error:`, error.request);
    } else {
      console.error(`${operation} request setup error:`, error.message);
    }
  }
}

// Export unified service instance
export const dashboardService = new DashboardServiceUnified();

// Dashboard utilities
export const dashboardUtils = {
  /**
   * Format activity timestamp
   */
  formatActivityTime(activity: RecentActivity): string {
    const now = new Date();
    const activityTime = new Date(activity.timestamp);
    const diffMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'İndi';
    if (diffMinutes < 60) return `${diffMinutes} dəqiqə əvvəl`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} saat əvvəl`;
    return activityTime.toLocaleDateString('az-AZ');
  },

  /**
   * Get status color for system components
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'normal':
        return '#22c55e';
      case 'warning':
      case 'degraded':
        return '#f59e0b';
      case 'critical':
      case 'offline':
        return '#ef4444';
      default:
        return '#64748b';
    }
  },

  /**
   * Calculate system health score
   */
  calculateHealthScore(components: Record<string, { status: string }>): number {
    const statuses = Object.values(components).map(c => c.status);
    const healthyCount = statuses.filter(s => s === 'online' || s === 'healthy' || s === 'normal').length;
    return Math.round((healthyCount / statuses.length) * 100);
  },

  /**
   * Format metric value with units
   */
  formatMetric(value: number, unit: 'bytes' | 'percentage' | 'time' | 'count'): string {
    switch (unit) {
      case 'bytes':
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        let size = value;
        while (size >= 1024 && i < sizes.length - 1) {
          size /= 1024;
          i++;
        }
        return `${size.toFixed(1)} ${sizes[i]}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${value.toFixed(0)}ms`;
      case 'count':
        return value.toLocaleString('az-AZ');
      default:
        return value.toString();
    }
  }
};

export default dashboardService;