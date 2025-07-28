import { api } from './api';

export interface ScheduleSlot {
  id?: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  room_id?: number;
  day_of_week: number; // 1-7 (Monday to Sunday)
  period_number: number;
  start_time: string;
  end_time: string;
  week_start_date: string;
  schedule_type: 'regular' | 'exam' | 'substitute' | 'event';
  status: 'active' | 'cancelled' | 'completed';
  notes?: string;
  created_by: number;
  // Relations
  class_name?: string;
  subject_name?: string;
  teacher_name?: string;
  room_name?: string;
}

export interface ScheduleConflict {
  id: string;
  type: 'teacher_conflict' | 'room_conflict' | 'class_conflict';
  severity: 'high' | 'medium' | 'low';
  message: string;
  affected_slots: ScheduleSlot[];
  suggested_resolution?: string;
}

export interface GenerationSettings {
  week_start_date: string;
  schedule_type: 'weekly' | 'monthly' | 'semester';
  working_days: number[];
  periods_per_day: number;
  break_periods: number[];
  lunch_period?: number;
  respect_teacher_preferences: boolean;
  avoid_conflicts: boolean;
  allow_room_sharing: boolean;
  max_consecutive_periods: number;
  min_break_between_subjects: number;
}

export interface ClassInfo {
  id: number;
  name: string;
  grade_level: number;
  section: string;
  max_capacity: number;
  current_enrollment: number;
  classroom_location?: string;
  class_teacher_id?: number;
}

export interface TeacherInfo {
  id: number;
  name: string;
  subjects: number[];
  max_hours_per_week: number;
  preferred_days?: number[];
  unavailable_periods?: { day: number; period: number }[];
}

export interface SubjectInfo {
  id: number;
  name: string;
  short_name: string;
  code: string;
  hours_per_week: number;
  requires_special_room: boolean;
  preferred_periods?: number[];
}

export interface TimeSlot {
  id: number;
  period_number: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
  name: string;
}

class ScheduleService {
  // Schedule Slots Management
  async getScheduleSlots(filters?: {
    week_start_date?: string;
    class_id?: number;
    teacher_id?: number;
    subject_id?: number;
  }): Promise<ScheduleSlot[]> {
    try {
      const response = await api.get('/schedules/slots', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule slots:', error);
      // Return mock data for development
      return this.getMockScheduleSlots();
    }
  }

  private getMockScheduleSlots(): ScheduleSlot[] {
    return [
      {
        id: 1,
        class_id: 1,
        subject_id: 1,
        teacher_id: 1,
        room_id: 1,
        day_of_week: 1,
        period_number: 1,
        start_time: '08:00',
        end_time: '08:45',
        week_start_date: '2024-01-15',
        schedule_type: 'regular',
        status: 'active',
        created_by: 1,
        class_name: '7A',
        subject_name: 'Riyaziyyat',
        teacher_name: 'Əli Məmmədov',
        room_name: 'Otaq 101'
      },
      {
        id: 2,
        class_id: 1,
        subject_id: 2,
        teacher_id: 2,
        room_id: 2,
        day_of_week: 1,
        period_number: 2,
        start_time: '08:50',
        end_time: '09:35',
        week_start_date: '2024-01-15',
        schedule_type: 'regular',
        status: 'active',
        created_by: 1,
        class_name: '7A',
        subject_name: 'Azərbaycan dili',
        teacher_name: 'Leyla Əliyeva',
        room_name: 'Otaq 102'
      }
    ];
  }

  async createScheduleSlot(data: Omit<ScheduleSlot, 'id'>): Promise<ScheduleSlot> {
    try {
      const response = await api.post('/schedules/slots', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create schedule slot:', error);
      throw error;
    }
  }

  async updateScheduleSlot(id: number, data: Partial<ScheduleSlot>): Promise<ScheduleSlot> {
    try {
      const response = await api.put(`/schedules/slots/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update schedule slot:', error);
      throw error;
    }
  }

  async deleteScheduleSlot(id: number): Promise<void> {
    try {
      await api.delete(`/schedules/slots/${id}`);
    } catch (error) {
      console.error('Failed to delete schedule slot:', error);
      throw error;
    }
  }

  // Schedule Generation
  async generateSchedule(settings: GenerationSettings): Promise<{
    slots: ScheduleSlot[];
    conflicts: ScheduleConflict[];
    success: boolean;
    message: string;
  }> {
    try {
      const response = await api.post('/schedules/generate', settings);
      return response.data;
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      // Return mock generation result
      return {
        slots: this.getMockScheduleSlots(),
        conflicts: this.getMockConflicts(),
        success: true,
        message: 'Cədvəl uğurla yaradıldı (Mock data)'
      };
    }
  }

  private getMockConflicts(): ScheduleConflict[] {
    return [
      {
        id: 'conflict-1',
        type: 'teacher_conflict',
        severity: 'high',
        message: 'Əli Məmmədov eyni vaxtda 2 sinifdə dərs aparmalıdır',
        affected_slots: [],
        suggested_resolution: 'Birinci dərsi başqa müəllimə təyin edin'
      }
    ];
  }

  // Conflict Detection
  async detectConflicts(slots: ScheduleSlot[]): Promise<ScheduleConflict[]> {
    try {
      const response = await api.post('/schedules/detect-conflicts', { slots });
      return response.data;
    } catch (error) {
      console.error('Failed to detect conflicts:', error);
      return this.getMockConflicts();
    }
  }

  // Template Management
  async getScheduleTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/schedules/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule templates:', error);
      return [];
    }
  }

  async saveScheduleTemplate(name: string, slots: ScheduleSlot[]): Promise<any> {
    try {
      const response = await api.post('/schedules/templates', { name, slots });
      return response.data;
    } catch (error) {
      console.error('Failed to save schedule template:', error);
      throw error;
    }
  }

  // Master Data
  async getClasses(): Promise<ClassInfo[]> {
    try {
      const response = await api.get('/schedules/classes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      return [
        { id: 1, name: '7A', grade_level: 7, section: 'A', max_capacity: 30, current_enrollment: 28 },
        { id: 2, name: '7B', grade_level: 7, section: 'B', max_capacity: 30, current_enrollment: 25 },
        { id: 3, name: '8A', grade_level: 8, section: 'A', max_capacity: 28, current_enrollment: 27 }
      ];
    }
  }

  async getTeachers(): Promise<TeacherInfo[]> {
    try {
      const response = await api.get('/schedules/teachers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      return [
        { id: 1, name: 'Əli Məmmədov', subjects: [1, 3], max_hours_per_week: 20 },
        { id: 2, name: 'Leyla Əliyeva', subjects: [2], max_hours_per_week: 18 },
        { id: 3, name: 'Rəşad Quliyev', subjects: [4, 5], max_hours_per_week: 22 }
      ];
    }
  }

  async getSubjects(): Promise<SubjectInfo[]> {
    try {
      const response = await api.get('/schedules/subjects');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      return [
        { id: 1, name: 'Riyaziyyat', short_name: 'RİY', code: 'MATH', hours_per_week: 5, requires_special_room: false },
        { id: 2, name: 'Azərbaycan dili', short_name: 'AZD', code: 'LANG', hours_per_week: 4, requires_special_room: false },
        { id: 3, name: 'Fizika', short_name: 'FİZ', code: 'PHYS', hours_per_week: 3, requires_special_room: true },
        { id: 4, name: 'Kimya', short_name: 'KİM', code: 'CHEM', hours_per_week: 2, requires_special_room: true },
        { id: 5, name: 'Biologiya', short_name: 'BİO', code: 'BIOL', hours_per_week: 2, requires_special_room: false }
      ];
    }
  }

  async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      const response = await api.get('/schedules/time-slots');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      return [
        { id: 1, period_number: 1, start_time: '08:00', end_time: '08:45', is_break: false, name: '1-ci dərs' },
        { id: 2, period_number: 2, start_time: '08:50', end_time: '09:35', is_break: false, name: '2-ci dərs' },
        { id: 3, period_number: 3, start_time: '09:40', end_time: '10:25', is_break: false, name: '3-cü dərs' },
        { id: 4, period_number: 0, start_time: '10:25', end_time: '10:40', is_break: true, name: 'Böyük fasilə' },
        { id: 5, period_number: 4, start_time: '10:40', end_time: '11:25', is_break: false, name: '4-cü dərs' },
        { id: 6, period_number: 5, start_time: '11:30', end_time: '12:15', is_break: false, name: '5-ci dərs' },
        { id: 7, period_number: 6, start_time: '12:20', end_time: '13:05', is_break: false, name: '6-cı dərs' },
        { id: 8, period_number: 0, start_time: '13:05', end_time: '14:00', is_break: true, name: 'Nahar fasiləsi' },
        { id: 9, period_number: 7, start_time: '14:00', end_time: '14:45', is_break: false, name: '7-ci dərs' },
        { id: 10, period_number: 8, start_time: '14:50', end_time: '15:35', is_break: false, name: '8-ci dərs' }
      ];
    }
  }

  // Bulk Operations
  async bulkUpdateSchedule(updates: { id: number; data: Partial<ScheduleSlot> }[]): Promise<void> {
    try {
      await api.put('/schedules/bulk-update', { updates });
    } catch (error) {
      console.error('Failed to bulk update schedule:', error);
      throw error;
    }
  }

  async copySchedule(fromWeek: string, toWeek: string): Promise<void> {
    try {
      await api.post('/schedules/copy', { from_week: fromWeek, to_week: toWeek });
    } catch (error) {
      console.error('Failed to copy schedule:', error);
      throw error;
    }
  }

  // Export/Import
  async exportSchedule(weekStartDate: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    try {
      const response = await api.get(`/schedules/export`, {
        params: { week_start_date: weekStartDate, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export schedule:', error);
      throw error;
    }
  }

  async importSchedule(file: File): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/schedules/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to import schedule:', error);
      throw error;
    }
  }
}

export default new ScheduleService();