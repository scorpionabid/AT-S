/**
 * ATİS Advanced API Service Layer
 * Real API integration with fallback data support
 */

import { api } from './api';

// Base interfaces
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

export interface Institution {
  id: number;
  name: string;
  code: string;
  type: 'school' | 'kindergarten' | 'college' | 'vocational';
  region: string;
  district: string;
  address: string;
  principal: string;
  phone: string;
  email: string;
  student_count: number;
  teacher_count: number;
  class_count: number;
  establishment_date: string;
  status: 'active' | 'inactive' | 'suspended';
  performance_score: number;
  budget_allocated: number;
  budget_used: number;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: number;
  institution_id: number;
  institution_name: string;
  type: 'bsq' | 'ksq' | 'performance' | 'security' | 'innovation';
  title: string;
  description: string;
  assessor_name: string;
  assessment_date: string;
  total_score: number;
  max_score: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  areas: {
    name: string;
    score: number;
    max_score: number;
    percentage: number;
  }[];
  improvement_areas: string[];
  recommendations: string[];
  next_assessment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  institution_id?: number;
  institution_name?: string;
  region?: string;
  permissions: string[];
  last_login: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  type: 'finance' | 'administrative' | 'facility' | 'academic' | 'hr';
  head_name: string;
  head_email: string;
  budget_allocated: number;
  budget_used: number;
  staff_count: number;
  active_projects: number;
  performance_score: number;
  description: string;
  responsibilities: string[];
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  type: 'satisfaction' | 'feedback' | 'evaluation' | 'research';
  target_audience: string;
  creator_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  total_questions: number;
  total_responses: number;
  target_responses: number;
  response_rate: number;
  average_completion_time: number;
  created_at: string;
  updated_at: string;
}

// API Service Class
class ApiService {
  private baseURL = '/api/v1';
  private fallbackEnabled = true;

  /**
   * Generic API call with fallback data support
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData?: T
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(endpoint, options);
      return {
        data: response.data,
        success: true,
        message: 'Data retrieved successfully'
      };
    } catch (error) {
      console.warn(`API call failed for ${endpoint}:`, error);
      
      if (this.fallbackEnabled && fallbackData) {
        console.info(`Using fallback data for ${endpoint}`);
        return {
          data: fallbackData,
          success: true,
          message: 'Using fallback data (development mode)'
        };
      }
      
      throw error;
    }
  }

  // Institution Services
  async getInstitutions(params?: {
    page?: number;
    per_page?: number;
    region?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Institution[]>> {
    const fallbackData: Institution[] = [
      {
        id: 1,
        name: 'Bakı 23 saylı məktəb',
        code: 'BTI-M023',
        type: 'school',
        region: 'Bakı',
        district: 'Nəsimi',
        address: 'Ü.Hacıbəyov küç. 123',
        principal: 'Rəşad Məmmədov',
        phone: '+994 12 555 0123',
        email: 'director@bti-m023.edu.az',
        student_count: 1250,
        teacher_count: 78,
        class_count: 42,
        establishment_date: '1985-09-01',
        status: 'active',
        performance_score: 85.5,
        budget_allocated: 450000,
        budget_used: 387500,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Gəncə 45 saylı məktəb',
        code: 'GTI-M045',
        type: 'school',
        region: 'Gəncə',
        district: 'Kəpəz',
        address: 'Nizami küç. 67',
        principal: 'Leyla Həsənova',
        phone: '+994 22 444 0456',
        email: 'director@gti-m045.edu.az',
        student_count: 980,
        teacher_count: 65,
        class_count: 35,
        establishment_date: '1992-09-01',
        status: 'active',
        performance_score: 78.2,
        budget_allocated: 380000,
        budget_used: 342000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-10T14:20:00Z'
      }
    ];

    return this.makeRequest('/institutions', { method: 'GET' }, fallbackData);
  }

  async getInstitution(id: number): Promise<ApiResponse<Institution>> {
    const fallbackData: Institution = {
      id,
      name: 'Bakı 23 saylı məktəb',
      code: 'BTI-M023',
      type: 'school',
      region: 'Bakı',
      district: 'Nəsimi',
      address: 'Ü.Hacıbəyov küç. 123',
      principal: 'Rəşad Məmmədov',
      phone: '+994 12 555 0123',
      email: 'director@bti-m023.edu.az',
      student_count: 1250,
      teacher_count: 78,
      class_count: 42,
      establishment_date: '1985-09-01',
      status: 'active',
      performance_score: 85.5,
      budget_allocated: 450000,
      budget_used: 387500,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };

    return this.makeRequest(`/institutions/${id}`, { method: 'GET' }, fallbackData);
  }

  // Assessment Services
  async getAssessments(params?: {
    page?: number;
    per_page?: number;
    institution_id?: number;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<Assessment[]>> {
    const fallbackData: Assessment[] = [
      {
        id: 1,
        institution_id: 1,
        institution_name: 'Bakı 23 saylı məktəb',
        type: 'bsq',
        title: 'Başçılıq və Səlahiyyət Qiymətləndirməsi',
        description: 'İdarəetmə bacarıqları və liderlik keyfiyyətlərinin qiymətləndirilməsi',
        assessor_name: 'Dr. Rəşad Məmmədov',
        assessment_date: '2024-01-15',
        total_score: 342,
        max_score: 400,
        percentage: 85.5,
        grade: 'A',
        status: 'approved',
        areas: [
          { name: 'Liderlik', score: 87, max_score: 100, percentage: 87 },
          { name: 'İdarəetmə', score: 92, max_score: 100, percentage: 92 },
          { name: 'İnnovasiya', score: 78, max_score: 100, percentage: 78 },
          { name: 'Kommunikasiya', score: 85, max_score: 100, percentage: 85 }
        ],
        improvement_areas: ['Texnoloji innovasiya', 'Kadr inkişafı'],
        recommendations: [
          'Rəqəmsal texnologiyalar üzrə treninqlər təşkil edin',
          'Müəllimlərin peşəkarlıq səviyyəsini artırın'
        ],
        next_assessment_date: '2024-07-15',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T16:30:00Z'
      }
    ];

    return this.makeRequest('/assessments', { method: 'GET' }, fallbackData);
  }

  // User Services
  async getUsers(params?: {
    page?: number;
    per_page?: number;
    role?: string;
    institution_id?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    const fallbackData: User[] = [
      {
        id: 1,
        first_name: 'Rəşad',
        last_name: 'Məmmədov',
        email: 'rashad.mammadov@atis.edu.az',
        phone: '+994 50 123 45 67',
        role: 'regionadmin',
        institution_id: 1,
        institution_name: 'Bakı 23 saylı məktəb',
        region: 'Bakı',
        permissions: ['read_institutions', 'manage_assessments', 'view_reports'],
        last_login: '2024-01-20T08:30:00Z',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T08:30:00Z'
      }
    ];

    return this.makeRequest('/users', { method: 'GET' }, fallbackData);
  }

  // Department Services
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    const fallbackData: Department[] = [
      {
        id: 1,
        name: 'Maliyyə Şöbəsi',
        type: 'finance',
        head_name: 'Əli Məmmədov',
        head_email: 'ali.mammadov@finance.atis.az',
        budget_allocated: 2450000,
        budget_used: 1876000,
        staff_count: 15,
        active_projects: 8,
        performance_score: 92,
        description: 'Büdcə planlaşdırması və maliyyə idarəetməsi',
        responsibilities: ['Büdcə hazırlanması', 'Xərclərin izlənməsi', 'Maliyyə hesabatları'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T12:00:00Z'
      },
      {
        id: 2,
        name: 'İnzibati Şöbə',
        type: 'administrative',
        head_name: 'Gülay Həsənova',
        head_email: 'gulay.hasanova@admin.atis.az',
        budget_allocated: 850000,
        budget_used: 634000,
        staff_count: 22,
        active_projects: 12,
        performance_score: 88,
        description: 'İnsan resursları və inzibati işlər',
        responsibilities: ['Kadr siyasəti', 'Təlimlər', 'İnzibati prosedurlar'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-12T09:15:00Z'
      }
    ];

    return this.makeRequest('/departments', { method: 'GET' }, fallbackData);
  }

  // Survey Services  
  async getSurveys(params?: {
    page?: number;
    per_page?: number;
    type?: string;
    status?: string;
    target_audience?: string;
  }): Promise<ApiResponse<Survey[]>> {
    const fallbackData: Survey[] = [
      {
        id: 1,
        title: 'Məktəb Məmnuniyyət Araşdırması',
        description: 'Valideynlərin məktəbdən məmnunluq səviyyəsinin ölçülməsi',
        type: 'satisfaction',
        target_audience: 'Valideynlər',
        creator_name: 'Dr. Səbinə Əliyeva',
        start_date: '2024-01-10',
        end_date: '2024-01-25',
        status: 'active',
        total_questions: 25,
        total_responses: 487,
        target_responses: 800,
        response_rate: 60.9,
        average_completion_time: 8.5,
        created_at: '2024-01-08T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      }
    ];

    return this.makeRequest('/surveys', { method: 'GET' }, fallbackData);
  }

  // Analytics Services
  async getAnalytics(type: 'institutions' | 'assessments' | 'users' | 'surveys', params?: {
    date_from?: string;
    date_to?: string;
    region?: string;
    institution_id?: number;
  }) {
    const endpoint = `/analytics/${type}`;
    
    // Fallback analytics data based on type
    let fallbackData;
    switch (type) {
      case 'assessments':
        fallbackData = {
          overview: {
            total_assessments: 156,
            completed_assessments: 142,
            average_score: 78.5,
            participation_rate: 91.0,
            improvement_rate: 12.3
          },
          trends: [
            { month: '2024-08', assessments: 23, average_score: 75.2, participation_rate: 88 },
            { month: '2024-09', assessments: 28, average_score: 76.8, participation_rate: 89 },
            { month: '2024-10', assessments: 31, average_score: 78.1, participation_rate: 92 },
            { month: '2024-11', assessments: 26, average_score: 79.3, participation_rate: 90 },
            { month: '2024-12', assessments: 22, average_score: 80.1, participation_rate: 93 },
            { month: '2025-01', assessments: 18, average_score: 81.2, participation_rate: 94 }
          ],
          categories: [
            { name: 'BSQ (Başçılıq)', value: 45, percentage: 28.8, color: '#8B5CF6' },
            { name: 'Performans', value: 38, percentage: 24.4, color: '#10B981' },
            { name: 'Təhlükəsizlik', value: 32, percentage: 20.5, color: '#F59E0B' },
            { name: 'İnnovasiya', value: 25, percentage: 16.0, color: '#3B82F6' }
          ]
        };
        break;
      default:
        fallbackData = {};
    }

    return this.makeRequest(endpoint, { method: 'GET' }, fallbackData);
  }

  // Toggle fallback mode (for development)
  setFallbackMode(enabled: boolean) {
    this.fallbackEnabled = enabled;
  }

  // Check if API is available
  async checkApiHealth(): Promise<boolean> {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;