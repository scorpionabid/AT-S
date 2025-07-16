import { api } from './api';

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  institution_id?: number;
  level?: number;
  type?: string;
  region_code?: string;
  role?: string;
  activity_type?: string;
  status?: string;
  survey_id?: number;
  user_id?: number;
  include_children?: boolean;
  detailed?: boolean;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users: number;
  recent_logins: number;
  engagement_rate: number;
  by_role: Record<string, number>;
}

export interface InstitutionStatistics {
  total_institutions: number;
  active_institutions: number;
  inactive_institutions: number;
  new_institutions: number;
  by_type: Record<string, number>;
  by_level: Record<string, number>;
  by_region: Record<string, number>;
}

export interface SurveyStatistics {
  total_surveys: number;
  published_surveys: number;
  completed_surveys: number;
  draft_surveys: number;
  new_surveys: number;
  by_status: Record<string, number>;
  response_rate: number;
}

export interface SystemActivity {
  total_activities: number;
  by_type: Record<string, number>;
  daily_activity: Array<{
    date: string;
    count: number;
  }>;
  most_active_users: Array<{
    user_id: number;
    username: string;
    activity_count: number;
  }>;
}

export interface PerformanceMetrics {
  average_response_time: string;
  system_uptime: string;
  error_rate: string;
  user_satisfaction: string;
  data_quality_score: string;
}

export interface GrowthTrend {
  period: string;
  users: number;
  institutions: number;
  surveys: number;
  activities: number;
}

export interface OverviewStats {
  user_statistics: UserStatistics;
  institution_statistics: InstitutionStatistics;
  survey_statistics: SurveyStatistics;
  system_activity: SystemActivity;
  performance_metrics: PerformanceMetrics;
  growth_trends: GrowthTrend[];
}

export interface InstitutionRanking {
  id: number;
  name: string;
  type: string;
  level: number;
  region_code: string;
  active_users: number;
  total_users: number;
  engagement_score: number;
}

export interface UserEngagement {
  average_session_duration: string;
  daily_active_users: number;
  weekly_retention_rate: string;
  feature_adoption_rate: string;
}

export interface SurveyParticipation {
  participation_rate: string;
  completion_rate: string;
  average_response_time: string;
  survey_feedback_score: string;
}

export interface ActivityLevels {
  high_activity: number;
  medium_activity: number;
  low_activity: number;
  inactive: number;
}

export interface ComparativeAnalysis {
  performance_vs_average: string;
  ranking_change: string;
  benchmark_score: string;
  improvement_areas: string[];
}

export interface InstitutionalPerformance {
  institution_rankings: InstitutionRanking[];
  user_engagement: UserEngagement;
  survey_participation: SurveyParticipation;
  activity_levels: ActivityLevels;
  comparative_analysis: ComparativeAnalysis;
}

export interface SurveyOverview {
  total_surveys: number;
  response_rate: string;
  completion_rate: string;
  average_time: string;
}

export interface ResponseRates {
  by_institution_type: Record<string, string>;
  by_region: Record<string, string>;
}

export interface CompletionAnalysis {
  completion_trends: {
    improving: number;
    stable: number;
    declining: number;
  };
  drop_off_points: Record<string, string>;
}

export interface TimeAnalytics {
  average_completion_time: string;
  fastest_completion: string;
  slowest_completion: string;
  optimal_time_range: string;
}

export interface GeographicDistribution {
  by_region: Record<string, {
    responses: number;
    rate: string;
  }>;
  coverage: string;
}

export interface SurveyAnalytics {
  survey_overview: SurveyOverview;
  response_rates: ResponseRates;
  completion_analysis: CompletionAnalysis;
  time_analytics: TimeAnalytics;
  geographic_distribution: GeographicDistribution;
  detailed_responses?: any;
}

export interface UserActivitySummary {
  total_activities: number;
  daily_average: number;
}

export interface LoginPatterns {
  peak_hours: string[];
  login_frequency: string;
}

export interface FeatureUsage {
  [feature: string]: string;
}

export interface EngagementMetrics {
  session_duration: string;
  page_views: number;
}

export interface ProductivityTrends {
  trend: string;
  improvement: string;
}

export interface UserActivityReport {
  user_activity_summary: UserActivitySummary;
  login_patterns: LoginPatterns;
  feature_usage: FeatureUsage;
  engagement_metrics: EngagementMetrics;
  productivity_trends: ProductivityTrends;
}

export interface ExportResponse {
  message: string;
  data: {
    report_type: string;
    format: string;
    data: any;
    filters: Record<string, any>;
    date_range: {
      start_date: string;
      end_date: string;
    };
    generated_at: string;
    total_records: number;
  };
}

export interface ReportResponse<T> {
  status: string;
  data: T;
  filters?: Record<string, any>;
  date_range: {
    start_date: string;
    end_date: string;
  };
  generated_at: string;
}

export const reportsService = {
  /**
   * Get overview statistics for reports dashboard
   */
  getOverviewStats: async (filters: ReportFilters = {}): Promise<OverviewStats> => {
    const response = await api.get<ReportResponse<OverviewStats>>('/reports/overview', { 
      params: filters 
    });
    return response.data.data;
  },

  /**
   * Get detailed institutional performance report
   */
  getInstitutionalPerformance: async (filters: ReportFilters = {}): Promise<InstitutionalPerformance> => {
    const response = await api.get<ReportResponse<InstitutionalPerformance>>('/reports/institutional-performance', { 
      params: filters 
    });
    return response.data.data;
  },

  /**
   * Get survey analytics and response data
   */
  getSurveyAnalytics: async (filters: ReportFilters = {}): Promise<SurveyAnalytics> => {
    const response = await api.get<ReportResponse<SurveyAnalytics>>('/reports/survey-analytics', { 
      params: filters 
    });
    return response.data.data;
  },

  /**
   * Get user activity and engagement reports
   */
  getUserActivityReport: async (filters: ReportFilters = {}): Promise<UserActivityReport> => {
    const response = await api.get<ReportResponse<UserActivityReport>>('/reports/user-activity', { 
      params: filters 
    });
    return response.data.data;
  },

  /**
   * Export report data in various formats
   */
  exportReport: async (
    reportType: 'overview' | 'institutional' | 'surveys' | 'users',
    format: 'csv' | 'json' | 'pdf',
    filters: ReportFilters = {}
  ): Promise<ExportResponse> => {
    const response = await api.post<ExportResponse>('/reports/export', {
      report_type: reportType,
      format: format,
      filters: filters
    });
    return response.data;
  },

  /**
   * Get real-time dashboard metrics
   */
  getRealTimeMetrics: async (): Promise<{
    active_users: number;
    system_load: number;
    response_time: number;
    error_rate: number;
    last_updated: string;
  }> => {
    // This would connect to a real-time endpoint or WebSocket
    // For now, return mock data
    return {
      active_users: Math.floor(Math.random() * 200) + 50,
      system_load: Math.floor(Math.random() * 100),
      response_time: Math.floor(Math.random() * 500) + 100,
      error_rate: Math.random() * 2,
      last_updated: new Date().toISOString()
    };
  },

  /**
   * Get custom report based on dynamic filters
   */
  getCustomReport: async (
    reportConfig: {
      metrics: string[];
      dimensions: string[];
      filters: ReportFilters;
      aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
      groupBy?: string;
    }
  ): Promise<any> => {
    // This would be implemented for advanced custom reporting
    const response = await api.post('/reports/custom', reportConfig);
    return response.data;
  },

  /**
   * Schedule automated report generation
   */
  scheduleReport: async (
    schedule: {
      report_type: string;
      format: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
      filters: ReportFilters;
      enabled: boolean;
    }
  ): Promise<{ message: string; schedule_id: number }> => {
    const response = await api.post('/reports/schedule', schedule);
    return response.data;
  },

  /**
   * Get available report templates
   */
  getReportTemplates: async (): Promise<Array<{
    id: number;
    name: string;
    description: string;
    type: string;
    default_filters: ReportFilters;
    created_at: string;
  }>> => {
    const response = await api.get('/reports/templates');
    return response.data;
  }
};

export default reportsService;