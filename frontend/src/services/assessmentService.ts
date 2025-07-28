import { api } from './api';

export interface KSQResult {
  id?: number;
  teacher_id: number;
  academic_year_id: number;
  assessment_date: string;
  subject_knowledge_score: number;
  pedagogical_knowledge_score: number;
  practical_skills_score: number;
  total_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations?: string;
  follow_up_required: boolean;
  assessor_id: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  teacher_name?: string;
  assessor_name?: string;
}

export interface BSQResult {
  id?: number;
  school_id: number;
  academic_year_id: number;
  assessment_date: string;
  infrastructure_score: number;
  teaching_quality_score: number;
  management_score: number;
  student_outcomes_score: number;
  total_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  improvement_areas?: string;
  action_plan?: string;
  assessor_id: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  school_name?: string;
  assessor_name?: string;
}

export interface AssessmentAnalytics {
  ksq_analytics: {
    total_assessments: number;
    average_score: number;
    grade_distribution: { grade: string; count: number }[];
    follow_up_required: number;
    completed_this_month: number;
  };
  bsq_analytics: {
    total_assessments: number;
    average_score: number;
    grade_distribution: { grade: string; count: number }[];
    schools_needing_improvement: number;
    completed_this_month: number;
  };
  trends: {
    monthly_scores: { month: string; ksq_avg: number; bsq_avg: number }[];
    improvement_trends: { category: string; change: number }[];
  };
}

class AssessmentService {
  // KSQ Results Management
  async getKSQResults(filters?: {
    teacher_id?: number;
    academic_year_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: KSQResult[]; meta: any }> {
    try {
      const response = await api.get('/assessments/ksq-results', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch KSQ results:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            teacher_id: 1,
            academic_year_id: 1,
            assessment_date: '2024-01-15',
            subject_knowledge_score: 85,
            pedagogical_knowledge_score: 90,
            practical_skills_score: 88,
            total_score: 87.7,
            grade: 'B',
            recommendations: 'Təkmilləşdirmə proqramında iştirak tövsiyə olunur',
            follow_up_required: true,
            assessor_id: 2,
            status: 'approved',
            teacher_name: 'Əli Məmmədov',
            assessor_name: 'Regional Ekspert'
          }
        ],
        meta: { total: 1, page: 1, limit: 10 }
      };
    }
  }

  async createKSQResult(data: Omit<KSQResult, 'id'>): Promise<KSQResult> {
    try {
      const response = await api.post('/assessments/ksq-results', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create KSQ result:', error);
      throw error;
    }
  }

  async updateKSQResult(id: number, data: Partial<KSQResult>): Promise<KSQResult> {
    try {
      const response = await api.put(`/assessments/ksq-results/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update KSQ result:', error);
      throw error;
    }
  }

  // BSQ Results Management
  async getBSQResults(filters?: {
    school_id?: number;
    academic_year_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BSQResult[]; meta: any }> {
    try {
      const response = await api.get('/assessments/bsq-results', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch BSQ results:', error);
      // Return mock data for development
      return {
        data: [
          {
            id: 1,
            school_id: 1,
            academic_year_id: 1,
            assessment_date: '2024-02-20',
            infrastructure_score: 75,
            teaching_quality_score: 82,
            management_score: 78,
            student_outcomes_score: 85,
            total_score: 80,
            grade: 'B',
            improvement_areas: 'İnfrastruktur təkmilləşdirilməsi',
            action_plan: '6 ay ərzində təmir işləri',
            assessor_id: 3,
            status: 'approved',
            school_name: '123 saylı məktəb',
            assessor_name: 'Sektor Eksperti'
          }
        ],
        meta: { total: 1, page: 1, limit: 10 }
      };
    }
  }

  async createBSQResult(data: Omit<BSQResult, 'id'>): Promise<BSQResult> {
    try {
      const response = await api.post('/assessments/bsq-results', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create BSQ result:', error);
      throw error;
    }
  }

  async updateBSQResult(id: number, data: Partial<BSQResult>): Promise<BSQResult> {
    try {
      const response = await api.put(`/assessments/bsq-results/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update BSQ result:', error);
      throw error;
    }
  }

  // Analytics
  async getAssessmentAnalytics(): Promise<AssessmentAnalytics> {
    try {
      const response = await api.get('/assessments/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch assessment analytics:', error);
      // Return mock analytics for development
      return {
        ksq_analytics: {
          total_assessments: 45,
          average_score: 87.5,
          grade_distribution: [
            { grade: 'A', count: 12 },
            { grade: 'B', count: 18 },
            { grade: 'C', count: 10 },
            { grade: 'D', count: 4 },
            { grade: 'F', count: 1 }
          ],
          follow_up_required: 15,
          completed_this_month: 8
        },
        bsq_analytics: {
          total_assessments: 23,
          average_score: 82.3,
          grade_distribution: [
            { grade: 'A', count: 5 },
            { grade: 'B', count: 12 },
            { grade: 'C', count: 4 },
            { grade: 'D', count: 2 },
            { grade: 'F', count: 0 }
          ],
          schools_needing_improvement: 6,
          completed_this_month: 4
        },
        trends: {
          monthly_scores: [
            { month: '2024-01', ksq_avg: 85.2, bsq_avg: 80.1 },
            { month: '2024-02', ksq_avg: 87.1, bsq_avg: 82.3 },
            { month: '2024-03', ksq_avg: 87.5, bsq_avg: 82.3 }
          ],
          improvement_trends: [
            { category: 'Subject Knowledge', change: 2.3 },
            { category: 'Teaching Quality', change: 1.8 },
            { category: 'Management', change: -0.5 }
          ]
        }
      };
    }
  }

  // Teacher Performance Analysis
  async getTeacherPerformance(teacherId: number): Promise<{
    teacher: any;
    assessments: KSQResult[];
    performance_trend: { date: string; score: number }[];
    improvement_areas: string[];
  }> {
    try {
      const response = await api.get(`/assessments/teacher-performance/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teacher performance:', error);
      throw error;
    }
  }

  // School Performance Analysis
  async getSchoolPerformance(schoolId: number): Promise<{
    school: any;
    assessments: BSQResult[];
    performance_trend: { date: string; score: number }[];
    improvement_areas: string[];
  }> {
    try {
      const response = await api.get(`/assessments/school-performance/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch school performance:', error);
      throw error;
    }
  }
}

export default new AssessmentService();