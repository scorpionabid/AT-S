export interface TeacherInfo {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  position: string;
  department?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'substitute';
  max_weekly_hours: number;
  subjects: Array<{
    id: number;
    name: string;
    code: string;
    qualified_for: boolean;
  }>;
  preferences?: {
    preferred_subjects: number[];
    preferred_grades: number[];
    max_classes_per_day: number;
    avoid_early_morning: boolean;
    avoid_late_afternoon: boolean;
  };
}

export interface TeachingLoad {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
  academic_year_id: number;
  weekly_hours: number;
  total_hours: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'completed';
  teacher: TeacherInfo;
  class_info: {
    id: number;
    name: string;
    grade_level: number;
    section: string;
    current_enrollment: number;
  };
  subject: {
    id: number;
    name: string;
    short_name?: string;
    code: string;
    default_weekly_hours: number;
  };
  schedule_slots?: Array<{
    day_of_week: number;
    period_number: number;
    start_time: string;
    end_time: string;
    room_location: string;
  }>;
  workload_metrics?: {
    difficulty_score: number;
    student_count: number;
    preparation_hours: number;
    grading_hours: number;
  };
}

export interface WorkloadSummary {
  teacher_id: number;
  teacher_name: string;
  total_weekly_hours: number;
  max_weekly_hours: number;
  utilization_percentage: number;
  class_count: number;
  subject_count: number;
  student_count: number;
  difficulty_average: number;
  workload_balance_score: number;
  total_preparation_hours: number;
  total_grading_hours: number;
  schedule_conflicts: number;
  preferred_subject_percentage: number;
  employment_type: string;
  status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
}

export interface LoadDistributionRule {
  id: number;
  name: string;
  description: string;
  rule_type: 'subject_specialization' | 'workload_balance' | 'preference_priority' | 'conflict_avoidance';
  weight: number;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface DistributionSettings {
  prioritize_specialization: boolean;
  balance_workload: boolean;
  respect_preferences: boolean;
  avoid_conflicts: boolean;
  max_classes_per_teacher: number;
  max_subjects_per_teacher: number;
  preferred_utilization_min: number;
  preferred_utilization_max: number;
  rules: LoadDistributionRule[];
}

export interface AnalyticsData {
  overall_statistics: {
    total_teachers: number;
    total_loads: number;
    average_utilization: number;
    optimal_teachers: number;
    overloaded_teachers: number;
    underloaded_teachers: number;
  };
  utilization_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  subject_distribution: Array<{
    subject_name: string;
    teacher_count: number;
    total_hours: number;
    average_hours_per_teacher: number;
  }>;
  workload_trends: Array<{
    date: string;
    average_utilization: number;
    optimal_count: number;
    overloaded_count: number;
  }>;
  teacher_performance: Array<{
    teacher_id: number;
    teacher_name: string;
    efficiency_score: number;
    student_satisfaction: number;
    workload_stability: number;
  }>;
}