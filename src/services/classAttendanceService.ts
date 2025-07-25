import apiService from './api';

export interface ClassAttendanceData {
  id?: number;
  class_id: number;
  date: string;
  morning_present: number;
  morning_absent_excused: number;
  morning_absent_unexcused: number;
  afternoon_present?: number;
  afternoon_absent_excused?: number;
  afternoon_absent_unexcused?: number;
  class_name?: string;
}

export interface ClassStats {
  id: number;
  name: string;
  capacity: number;
  current_enrollment: number;
  morning_present: number;
  morning_absent_excused: number;
  morning_absent_unexcused: number;
}

class ClassAttendanceService {
  async getAttendanceData(): Promise<ClassAttendanceData[]> {
    const response = await apiService.get('/class-attendance/');
    return response.data.data;
  }

  async updateAttendance(data: ClassAttendanceData): Promise<void> {
    await apiService.post('/class-attendance/', data);
  }

  async getClassStats(): Promise<ClassStats[]> {
    const response = await apiService.get('/class-attendance/stats');
    return response.data.data;
  }

  async getClassHistory(classId: number): Promise<ClassAttendanceData[]> {
    const response = await apiService.get(`/class-attendance/${classId}`);
    return response.data.data;
  }
}

export default new ClassAttendanceService();