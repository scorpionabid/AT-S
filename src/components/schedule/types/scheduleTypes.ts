export interface TimeSlot {
  period: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface ScheduleSlot {
  id?: number;
  day_of_week: number; // 1=Monday, 7=Sunday
  period_number: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  room_location: string;
  start_time: string;
  end_time: string;
  slot_type: 'regular' | 'exam' | 'break' | 'special';
  status: 'active' | 'cancelled' | 'moved' | 'substituted';
  notes?: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  grade_level: number;
  section: string;
  max_capacity: number;
  current_enrollment: number;
  classroom_location?: string;
}

export interface TeacherInfo {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  subjects: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  max_weekly_hours: number;
  current_weekly_hours: number;
  preferences?: {
    preferred_days?: number[];
    preferred_times?: string[];
    avoid_times?: string[];
  };
}

export interface SubjectInfo {
  id: number;
  name: string;
  short_name?: string;
  code: string;
  default_weekly_hours: number;
}

export interface ScheduleConflict {
  type: 'teacher_double_booking' | 'room_conflict' | 'class_overload' | 'teacher_overload';
  severity: 'critical' | 'warning' | 'minor';
  description: string;
  affected_slots: ScheduleSlot[];
  suggestions?: string[];
}

export interface GenerationSettings {
  week_start_date: string;
  schedule_type: 'weekly' | 'daily' | 'exam';
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

export interface ScheduleTemplate {
  id?: number;
  name: string;
  description?: string;
  slots: ScheduleSlot[];
  settings: GenerationSettings;
  created_at?: string;
  updated_at?: string;
}