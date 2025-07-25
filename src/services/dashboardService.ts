import { api } from './api';

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
  type: string;
  user: string;
  action: string;
  time: string;
  timestamp: number;
}

export interface SystemStatus {
  database: { status: string; label: string };
  api: { status: string; label: string };
  memory: { status: string; label: string };
  storage: { status: string; label: string };
}

export interface SuperAdminAnalytics {
  systemHealth: {
    overall: string;
    components: {
      web_server: { status: string; response_time: string };
      database: { status: string; connection_pool: string };
      file_system: { status: string; space_usage: string };
      cache: { status: string; hit_rate: string };
    };
  };
  userEngagement: {
    daily_active_users: number;
    session_duration: string;
    bounce_rate: string;
    feature_usage: Record<string, number>;
  };
  institutionPerformance: {
    most_active: any[];
    response_rates: {
      high: number;
      medium: number;
      low: number;
    };
  };
  surveyEffectiveness: {
    completion_rate: string;
    average_time: string;
    quality_score: string;
    feedback_satisfaction: string;
  };
  growthMetrics: {
    user_growth: string;
    institution_growth: string;
    survey_volume: string;
    data_quality: string;
  };
  alertsSummary: {
    critical: number;
    warnings: number;
    info: number;
    recent: Array<{
      type: string;
      message: string;
      time: string;
    }>;
  };
}

export interface SystemStatusDetailed {
  timestamp: string;
  services: {
    web: { status: string; response_time: string; last_check: string };
    database: { status: string; response_time: string; connections: string; last_check: string };
    cache: { status: string; hit_rate: string; last_check: string };
    storage: { status: string; space_used: string; last_check: string };
  };
  performance: {
    memory: { used: string; total: string; percent: number; status: string };
    disk: { used: string; free: string; total: string; percent: number; status: string };
    database: { size: string; status: string };
    uptime: string;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      console.log('Dashboard Service: Fetching stats...');
      const response = await api.get('/dashboard/stats');
      
      console.log('Dashboard Service: Response received', {
        status: response.status,
        dataKeys: Object.keys(response.data || {})
      });
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        console.log('Dashboard Service: Data parsed successfully', {
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
      console.error('Dashboard service error:', error);
      
      // Provide detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(`Server xətası (${error.response.status}): ${error.response.data?.message || 'Bilinməyən xəta'}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        throw new Error('Şəbəkə xətası: Server əlçatan deyil');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error(`Sorğu xətası: ${error.message}`);
      }
    }
  },

  async getDetailedStats(): Promise<any> {
    try {
      const response = await api.get('/dashboard/detailed-stats');
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Ətraflı statistika API xətası');
      }
    } catch (error: any) {
      console.error('Dashboard detailed stats error:', error);
      throw error;
    }
  },

  async getSuperAdminAnalytics(): Promise<SuperAdminAnalytics> {
    try {
      console.log('Dashboard Service: Fetching SuperAdmin analytics...');
      const response = await api.get('/dashboard/superadmin-analytics');
      
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
      throw error;
    }
  },

  async getSystemStatus(): Promise<SystemStatusDetailed> {
    try {
      console.log('Dashboard Service: Fetching system status...');
      const response = await api.get('/dashboard/system-status');
      
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
      throw error;
    }
  }
};