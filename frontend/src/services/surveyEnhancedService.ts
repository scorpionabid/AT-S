import { api } from './api';

// Enhanced Survey Service for FAZA 2 API Integration

export interface SurveyDashboardStatistics {
  overview: {
    total_surveys: number;
    active_surveys: number;
    draft_surveys: number;
    closed_surveys: number;
    archived_surveys: number;
    my_surveys: number;
    my_active_surveys: number;
  };
  response_stats: {
    total_responses: number;
    completed_responses: number;
    completion_rate: number;
    average_response_rate: number;
  };
  breakdowns: {
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    monthly_trend: Array<{
      month: string;
      count: number;
    }>;
  };
  recent_surveys: Array<{
    id: number;
    title: string;
    status: string;
    survey_type: string;
    completion_percentage: number;
    response_count: number;
    created_at: string;
  }>;
  attention_needed: Array<{
    id: number;
    title: string;
    status: string;
    completion_percentage: number;
    end_date: string | null;
    has_expired: boolean;
  }>;
  user_context: {
    user_id: number;
    user_role: string;
    institution_id: number | null;
    can_create_surveys: boolean;
    can_manage_all_surveys: boolean;
  };
}

export interface SurveyAnalytics {
  survey_info: {
    id: number;
    title: string;
    status: string;
    type: string;
    start_date: string | null;
    end_date: string | null;
  };
  response_metrics: {
    total_responses: number;
    completed_responses: number;
    in_progress_responses: number;
    completion_rate: number;
    avg_completion_time_minutes: number;
  };
  timeline: Array<{
    date: string;
    responses: number;
    completed: number;
  }>;
  breakdowns: {
    by_institution: Array<{
      institution: string;
      total_responses: number;
      completed: number;
      avg_progress: number;
    }>;
    by_department: Array<{
      department: string;
      total_responses: number;
      completed: number;
      avg_progress: number;
    }>;
  };
  question_analytics: Array<{
    section: string;
    question: string;
    type: string;
    required: boolean;
    answered_count: number;
    answer_rate: number;
  }>;
  insights: Array<{
    type: 'warning' | 'info' | 'error' | 'success';
    title: string;
    message: string;
    action: string;
  }>;
  generated_at: string;
}

export interface BulkOperationResult {
  message: string;
  success_count: number;
  total_count: number;
  errors: string[];
}

export interface BulkPublishResult extends BulkOperationResult {
  published_count: number;
}

export interface BulkCloseResult extends BulkOperationResult {
  closed_count: number;
}

export interface BulkArchiveResult extends BulkOperationResult {
  archived_count: number;
}

export interface BulkDeleteResult extends BulkOperationResult {
  deleted_count: number;
}

/**
 * Enhanced Survey Service Class
 * Provides advanced functionality for survey management
 */
class SurveyEnhancedService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStatistics(): Promise<SurveyDashboardStatistics> {
    try {
      const response = await api.get('/surveys/dashboard/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get detailed analytics for a specific survey
   */
  async getSurveyAnalytics(surveyId: number): Promise<SurveyAnalytics> {
    try {
      const response = await api.get(`/surveys/${surveyId}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for survey ${surveyId}:`, error);
      throw error;
    }
  }

  /**
   * Bulk publish surveys
   */
  async bulkPublishSurveys(surveyIds: number[]): Promise<BulkPublishResult> {
    try {
      const response = await api.post('/surveys/bulk/publish', {
        survey_ids: surveyIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk publishing surveys:', error);
      throw error;
    }
  }

  /**
   * Bulk close surveys
   */
  async bulkCloseSurveys(surveyIds: number[]): Promise<BulkCloseResult> {
    try {
      const response = await api.post('/surveys/bulk/close', {
        survey_ids: surveyIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk closing surveys:', error);
      throw error;
    }
  }

  /**
   * Bulk archive surveys
   */
  async bulkArchiveSurveys(surveyIds: number[]): Promise<BulkArchiveResult> {
    try {
      const response = await api.post('/surveys/bulk/archive', {
        survey_ids: surveyIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk archiving surveys:', error);
      throw error;
    }
  }

  /**
   * Bulk delete surveys (with confirmation)
   */
  async bulkDeleteSurveys(
    surveyIds: number[], 
    confirmDelete: boolean = true
  ): Promise<BulkDeleteResult> {
    try {
      const response = await api.post('/surveys/bulk/delete', {
        survey_ids: surveyIds,
        confirm_delete: confirmDelete
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting surveys:', error);
      throw error;
    }
  }

  /**
   * Enhanced survey filtering with advanced parameters
   */
  async getFilteredSurveys(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    survey_type?: string;
    date_filter?: string;
    creator_filter?: string;
    my_surveys?: boolean;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/surveys?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered surveys:', error);
      throw error;
    }
  }

  /**
   * Get survey statistics for header display
   */
  async getSurveyHeaderStats(): Promise<{
    total: number;
    active: number;
    selected: number;
  }> {
    try {
      const stats = await this.getDashboardStatistics();
      return {
        total: stats.overview.total_surveys,
        active: stats.overview.active_surveys,
        selected: 0 // This will be updated by UI component
      };
    } catch (error) {
      console.error('Error fetching header stats:', error);
      return {
        total: 0,
        active: 0,
        selected: 0
      };
    }
  }

  /**
   * Validate bulk operation permissions
   */
  async validateBulkOperationPermissions(
    surveyIds: number[], 
    operation: 'publish' | 'close' | 'archive' | 'delete'
  ): Promise<{
    valid_surveys: number[];
    invalid_surveys: Array<{
      id: number;
      title: string;
      reason: string;
    }>;
  }> {
    try {
      // This would need to be implemented in the backend
      // For now, we'll return a placeholder response
      return {
        valid_surveys: surveyIds,
        invalid_surveys: []
      };
    } catch (error) {
      console.error('Error validating bulk operation permissions:', error);
      throw error;
    }
  }

  /**
   * Get surveys that need attention (low response rates, expiring, etc.)
   */
  async getSurveysNeedingAttention(): Promise<Array<{
    id: number;
    title: string;
    issue_type: 'low_response' | 'expiring' | 'expired' | 'no_responses';
    issue_message: string;
    urgency: 'low' | 'medium' | 'high';
    action_required: string;
  }>> {
    try {
      const stats = await this.getDashboardStatistics();
      return stats.attention_needed.map(survey => ({
        id: survey.id,
        title: survey.title,
        issue_type: survey.has_expired ? 'expired' : 
                   survey.completion_percentage < 25 ? 'low_response' : 'expiring',
        issue_message: survey.has_expired 
          ? 'Survey has expired' 
          : `Low completion rate: ${survey.completion_percentage}%`,
        urgency: survey.has_expired ? 'high' : 
                survey.completion_percentage < 10 ? 'high' : 'medium',
        action_required: survey.has_expired 
          ? 'Extend deadline or close survey'
          : 'Review survey structure or increase promotion'
      }));
    } catch (error) {
      console.error('Error fetching surveys needing attention:', error);
      return [];
    }
  }

  /**
   * Export survey data (placeholder for future implementation)
   */
  async exportSurveyData(
    surveyId: number, 
    format: 'excel' | 'pdf' | 'csv' = 'excel'
  ): Promise<Blob> {
    try {
      const response = await api.get(`/surveys/${surveyId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error exporting survey ${surveyId} as ${format}:`, error);
      throw error;
    }
  }

  /**
   * Get real-time survey metrics for dashboard
   */
  async getRealTimeSurveyMetrics(): Promise<{
    active_responses_count: number;
    recent_completions: number;
    pending_approvals: number;
    expiring_soon: number;
  }> {
    try {
      const stats = await this.getDashboardStatistics();
      return {
        active_responses_count: stats.response_stats.total_responses - stats.response_stats.completed_responses,
        recent_completions: stats.response_stats.completed_responses,
        pending_approvals: 0, // Would need backend implementation
        expiring_soon: stats.attention_needed.length
      };
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      return {
        active_responses_count: 0,
        recent_completions: 0,
        pending_approvals: 0,
        expiring_soon: 0
      };
    }
  }
}

// Export singleton instance
export const surveyEnhancedService = new SurveyEnhancedService();
export default surveyEnhancedService;