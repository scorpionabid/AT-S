import apiService from './api';

export interface TeachingLoad {
  id?: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
  hours_per_week: number;
  academic_year_id: number;
  teacher_name?: string;
  subject_name?: string;
  class_name?: string;
}

export interface TeacherWorkload {
  loads: TeachingLoad[];
  total_hours: number;
  max_hours: number;
  remaining_hours: number;
  is_overloaded: boolean;
}

class TeachingLoadService {
  async getTeachingLoads(): Promise<TeachingLoad[]> {
    const response = await apiService.get('/teaching-loads/');
    return response.data.data;
  }

  async createTeachingLoad(data: Omit<TeachingLoad, 'id'>): Promise<void> {
    await apiService.post('/teaching-loads/', data);
  }

  async updateTeachingLoad(id: number, data: { hours_per_week: number }): Promise<void> {
    await apiService.put(`/teaching-loads/${id}`, data);
  }

  async deleteTeachingLoad(id: number): Promise<void> {
    await apiService.delete(`/teaching-loads/${id}`);
  }

  async getTeacherWorkload(teacherId: number): Promise<TeacherWorkload> {
    const response = await apiService.get(`/teaching-loads/teacher/${teacherId}`);
    return response.data.data;
  }
}

export default new TeachingLoadService();