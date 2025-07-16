import api from './api';

// Types for RegionAdmin dashboard
export interface RegionOverview {
  region_name: string;
  total_sectors: number;
  total_schools: number;
  total_users: number;
  active_users: number;
  user_activity_rate: number;
}

export interface SurveyMetrics {
  total_surveys: number;
  active_surveys: number;
  total_responses: number;
  response_rate: number;
}

export interface TaskMetrics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
}

export interface SectorPerformance {
  sector_name: string;
  schools_count: number;
  users_count: number;
  surveys_count: number;
  tasks_count: number;
  completion_rate: number;
}

export interface RegionActivity {
  id: number;
  type: 'survey' | 'task' | 'user' | 'system';
  action: string;
  user: string;
  time: string;
  timestamp: string;
}

export interface RegionNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
}

export interface RegionDashboardData {
  region_overview: RegionOverview;
  survey_metrics: SurveyMetrics;
  task_metrics: TaskMetrics;
  sector_performance: SectorPerformance[];
  recent_activities: RegionActivity[];
  notifications: RegionNotification[];
  user_role: string;
  region_id: number;
}

// Institution statistics
export interface SchoolData {
  id: number;
  name: string;
  user_count: number;
  active_users: number;
  activity_rate: number;
}

export interface SectorData {
  id: number;
  name: string;
  schools_count: number;
  total_users: number;
  active_users: number;
  surveys_count: number;
  activity_rate: number;
  schools: SchoolData[];
}

export interface RegionInstitutionStats {
  sectors: SectorData[];
  total_sectors: number;
  total_schools: number;
  total_users: number;
  total_active_users: number;
}

// User statistics
export interface UserRole {
  name: string;
  display_name: string;
  count: number;
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
  role: string;
  institution: string;
  created_at: string;
  last_login: string;
}

export interface RegionUserStats {
  users_by_role: Record<string, UserRole>;
  users_by_level: Record<string, number>;
  recent_users: RecentUser[];
  total_users: number;
  active_users: number;
  new_users_this_month: number;
}

// Survey analytics
export interface SectorSurveyData {
  sector_name: string;
  surveys_count: number;
  responses_count: number;
  response_rate: number;
}

export interface SurveyTotals {
  total: number;
  published: number;
  draft: number;
  total_responses: number;
}

export interface RegionSurveyAnalytics {
  survey_totals: SurveyTotals;
  surveys_by_sector: SectorSurveyData[];
  average_response_rate: number;
  most_active_sector: SectorSurveyData | null;
}

class RegionAdminService {
  // Dashboard data
  async getDashboardStats(): Promise<RegionDashboardData> {
    const response = await api.get('/regionadmin/dashboard');
    return response.data;
  }

  // Institution statistics
  async getInstitutionStats(): Promise<RegionInstitutionStats> {
    const response = await api.get('/regionadmin/institutions');
    return response.data;
  }

  // User statistics
  async getUserStats(): Promise<RegionUserStats> {
    const response = await api.get('/regionadmin/users');
    return response.data;
  }

  // Survey analytics
  async getSurveyAnalytics(): Promise<RegionSurveyAnalytics> {
    const response = await api.get('/regionadmin/surveys');
    return response.data;
  }

  // Sector-specific operations
  async getSectorDetails(sectorId: number): Promise<SectorData> {
    const institutionStats = await this.getInstitutionStats();
    const sector = institutionStats.sectors.find(s => s.id === sectorId);
    if (!sector) {
      throw new Error('Sector not found');
    }
    return sector;
  }

  // Export functions for regional data
  async exportRegionReport(
    type: 'overview' | 'institutions' | 'users' | 'surveys',
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const response = await api.post('/reports/export', {
      report_type: `region_${type}`,
      format: format,
      filters: {
        scope: 'region'
      }
    }, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Sector comparison analytics
  async compareSectors(): Promise<{
    performance_comparison: SectorPerformance[];
    best_performing: SectorPerformance;
    needs_attention: SectorPerformance[];
  }> {
    const dashboardData = await this.getDashboardStats();
    const sectors = dashboardData.sector_performance;
    
    const bestPerforming = sectors.reduce((best, current) => 
      current.completion_rate > best.completion_rate ? current : best
    );
    
    const needsAttention = sectors.filter(sector => 
      sector.completion_rate < 50 || sector.surveys_count === 0
    );

    return {
      performance_comparison: sectors,
      best_performing: bestPerforming,
      needs_attention: needsAttention
    };
  }

  // Regional performance trends
  async getPerformanceTrends(
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{
    user_growth: Array<{ date: string; count: number }>;
    survey_activity: Array<{ date: string; count: number }>;
    task_completion: Array<{ date: string; rate: number }>;
  }> {
    // This would typically come from a dedicated analytics endpoint
    // For now, return mock trend data based on current stats
    const dashboardData = await this.getDashboardStats();
    
    // Generate mock trend data
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const userGrowth = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(dashboardData.region_overview.total_users * (0.8 + (i / days) * 0.2))
    }));

    const surveyActivity = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(dashboardData.survey_metrics.total_surveys * (0.6 + (i / days) * 0.4))
    }));

    const taskCompletion = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rate: Math.floor(dashboardData.task_metrics.completion_rate * (0.7 + (i / days) * 0.3))
    }));

    return {
      user_growth: userGrowth,
      survey_activity: surveyActivity,
      task_completion: taskCompletion
    };
  }

  // School performance within a sector
  async getSchoolPerformance(sectorId: number): Promise<SchoolData[]> {
    const institutionStats = await this.getInstitutionStats();
    const sector = institutionStats.sectors.find(s => s.id === sectorId);
    return sector?.schools || [];
  }

  // Regional notifications and alerts
  async getRegionAlerts(): Promise<{
    critical: RegionNotification[];
    warnings: RegionNotification[];
    info: RegionNotification[];
  }> {
    const dashboardData = await this.getDashboardStats();
    const notifications = dashboardData.notifications;

    return {
      critical: notifications.filter(n => n.type === 'critical'),
      warnings: notifications.filter(n => n.type === 'warning'),
      info: notifications.filter(n => n.type === 'info')
    };
  }
}

export const regionAdminService = new RegionAdminService();
export default regionAdminService;