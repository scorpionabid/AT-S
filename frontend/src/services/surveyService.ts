import { api } from './api';

export interface Survey {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  response_count?: number;
  // Add other survey properties as needed
}

export interface SurveyListResponse {
  data: Survey[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface GetSurveysParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const surveyService = {
  /**
   * Get paginated list of surveys with optional filtering
   */
  async getSurveys(params: GetSurveysParams = {}): Promise<SurveyListResponse> {
    try {
      const response = await api.get('/surveys', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw error;
    }
  },

  /**
   * Get a single survey by ID
   */
  async getSurveyById(id: number): Promise<{ data: Survey }> {
    try {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching survey ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new survey
   */
  async createSurvey(surveyData: Partial<Survey>): Promise<{ data: Survey }> {
    try {
      const response = await api.post('/surveys', surveyData);
      return response.data;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  },

  /**
   * Update an existing survey
   */
  async updateSurvey(id: number, surveyData: Partial<Survey>): Promise<{ data: Survey }> {
    try {
      const response = await api.put(`/surveys/${id}`, surveyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating survey ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a survey
   */
  async deleteSurvey(id: number): Promise<void> {
    try {
      await api.delete(`/surveys/${id}`);
    } catch (error) {
      console.error(`Error deleting survey ${id}:`, error);
      throw error;
    }
  },

  /**
   * Change survey status
   */
  async updateSurveyStatus(id: number, status: string): Promise<{ data: Survey }> {
    try {
      const response = await api.patch(`/surveys/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for survey ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get survey responses
   */
  async getSurveyResponses(surveyId: number, params: any = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/responses`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching responses for survey ${surveyId}:`, error);
      throw error;
    }
  }
};

export default surveyService;
