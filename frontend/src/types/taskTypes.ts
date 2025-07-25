// ====================
// ATİS Task Type Definitions
// Centralized task-related type definitions
// ====================

import { 
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskMetadata,
  RecurringPattern
} from './shared';

export interface CreateTaskData {
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  assigned_to: number;
  institution_id: number;
  due_date: string;
  estimated_hours?: number;
  task_metadata?: Partial<TaskMetadata>;
  parent_task_id?: number;
  dependencies?: number[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  task_type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigned_to?: number;
  due_date?: string;
  progress_percentage?: number;
  actual_hours?: number;
  task_metadata?: Partial<TaskMetadata>;
}

export interface TaskFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  task_type?: TaskType | TaskType[];
  assigned_to?: number | number[];
  assigned_by?: number;
  institution_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  created_from?: string;
  created_to?: string;
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'status' | 'title';
  sort_direction?: 'asc' | 'desc';
  include_completed?: boolean;
  include_overdue?: boolean;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  cancelled_tasks: number;
  overdue_tasks: number;
  urgent_tasks: number;
  avg_completion_time: number;
  completion_rate: number;
  on_time_completion_rate: number;
  by_type: Record<TaskType, number>;
  by_priority: Record<TaskPriority, number>;
  by_status: Record<TaskStatus, number>;
  by_assignee: Array<{
    user_id: number;
    username: string;
    full_name: string;
    task_count: number;
    completion_rate: number;
  }>;
  performance_metrics: {
    avg_estimated_vs_actual: number;
    most_delayed_tasks: any[];
    top_performers: Array<{
      user_id: number;
      username: string;
      completion_rate: number;
      avg_completion_time: number;
    }>;
  };
}

export interface TaskWorkflowAction {
  action: 'start' | 'pause' | 'resume' | 'complete' | 'cancel' | 'approve' | 'reject';
  comment?: string;
  progress_percentage?: number;
  actual_hours?: number;
}

export interface BulkTaskOperation {
  task_ids: number[];
  operation: 'assign' | 'update_status' | 'update_priority' | 'delete' | 'duplicate';
  data?: {
    assigned_to?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
  };
}

export interface CreateRecurringTaskData extends CreateTaskData {
  recurring_pattern: RecurringPattern;
}

export interface BulkExportOptions {
  include_comments?: boolean;
  include_attachments?: boolean;
  include_metadata?: boolean;
}