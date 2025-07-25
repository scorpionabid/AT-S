// ====================
// ATİS Shared Type Definitions
// Eliminates type duplication across components
// ====================

// ===== COMMON API TYPES =====

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface BulkOperationResult {
  message: string;
  success_count: number;
  total_count: number;
  errors: string[];
  successful_items?: any[];
  failed_items?: any[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

// ===== COMMON COMPONENT PROPS =====

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  loading?: boolean;
}

export interface BaseFormProps {
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: any;
}

export interface BaseListProps {
  onItemClick?: (item: any) => void;
  onItemEdit?: (item: any) => void;
  onItemDelete?: (item: any) => void;
  loading?: boolean;
  error?: string;
}

export interface BaseCrudProps {
  onCreate?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
}

// ===== FILTER & SEARCH TYPES =====

export interface BaseFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface StatusFilter {
  is_active?: boolean;
  status?: string;
}

// ===== USER RELATED TYPES =====

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  contact_phone?: string;
  patronymic?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string;
}

export interface UserRole {
  id: number;
  name: string;
  display_name: string;
  level: number;
  permissions?: string[];
}

export interface BaseUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  profile?: UserProfile;
  role?: UserRole;
}

// ===== INSTITUTION RELATED TYPES =====

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  postal_code?: string;
  city?: string;
  region?: string;
}

export interface InstitutionMetadata {
  description?: string;
  website?: string;
  established_date?: string;
  license_number?: string;
  accreditation_status?: string;
}

export interface BaseInstitution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  parent_id: number | null;
  level: number;
  region_code: string;
  institution_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contact_info?: ContactInfo;
  location?: LocationInfo;
  metadata?: InstitutionMetadata;
}

// ===== PERMISSION & ROLE TYPES =====

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  permissions: Permission[];
  users_count?: number;
}

// ===== FORM RELATED TYPES =====

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationRule {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidationRules {
  [fieldName: string]: FormValidationRule;
}

// ===== DROPDOWN & SELECT TYPES =====

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// ===== TABLE & LIST TYPES =====

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  rowKey?: keyof T | string;
  onRowClick?: (record: T, index: number) => void;
  className?: string;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// ===== EXPORT TYPES =====

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  columns?: string[];
  filters?: Record<string, any>;
}

// ===== UPLOAD TYPES =====

export interface FileUploadOptions {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

// ===== DASHBOARD TYPES =====

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'table';
  span?: number;
  data?: any;
  loading?: boolean;
  error?: string;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  gap: number;
}

// ===== SURVEY RELATED TYPES =====

export interface SurveyQuestion {
  id: number;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'date';
  options?: string[];
  required: boolean;
  order: number;
}

export interface BaseSurvey {
  id: number;
  title: string;
  description?: string;
  type: 'form' | 'poll' | 'assessment' | 'feedback';
  status: 'draft' | 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  questions: SurveyQuestion[];
  responses_count?: number;
}

// ===== UTILITY TYPES =====

export type ID = string | number;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

// ===== THEME TYPES =====

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: Record<string, string>;
  typography: {
    fontSizes: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, number>;
  };
}

// ===== TASK RELATED TYPES =====

export type TaskType = 'attendance_report' | 'schedule_review' | 'document_approval' | 'survey_response' | 'inspection' | 'meeting';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface BaseTask {
  id: number;
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: number;
  assigned_by: number;
  institution_id: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  progress_percentage?: number;
  estimated_hours?: number;
  actual_hours?: number;
  is_active: boolean;
}

export interface TaskWithRelations extends BaseTask {
  assignee: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigner: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  institution: {
    id: number;
    name: string;
    type: string;
    level: number;
  };
  task_metadata?: TaskMetadata;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  dependencies?: number[];
  subtasks?: BaseTask[];
}

export interface TaskMetadata {
  requires_approval: boolean;
  approval_level: string;
  approval_chain?: number[];
  related_documents: string[];
  checklist_items: Array<{
    id: string;
    item: string;
    completed: boolean;
    completed_at?: string;
    completed_by?: number;
    notes?: string;
  }>;
  recurring_pattern?: RecurringPattern;
  notification_settings?: NotificationSettings;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  days_of_week?: number[];
  day_of_month?: number;
}

export interface NotificationSettings {
  notify_on_assign: boolean;
  notify_on_due: boolean;
  notify_before_hours: number;
  notify_on_status_change: boolean;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  mentions?: number[];
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  download_url: string;
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
    most_delayed_tasks: BaseTask[];
    top_performers: Array<{
      user_id: number;
      username: string;
      completion_rate: number;
      avg_completion_time: number;
    }>;
  };
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

// Export all types as a namespace for easier importing
// ATİSTypes namespace for external consumption
export namespace ATİSTypes {
  // Basic types - re-export the original types without circular reference
  export type PaginatedResponseType<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  
  export type ApiResponseType<T> = {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    meta?: any;
    errors?: Record<string, string[]>;
  };
  
  export type BulkOperationResultType = {
    success_count: number;
    error_count: number;
    errors: Array<{
      id: number;
      error: string;
    }>;
  };

  // Re-export main types
  export type BaseUserType = BaseUser;
  export type BaseInstitutionType = BaseInstitution;
  export type UserRoleType = UserRole;
  export type PermissionType = Permission;
  export type SelectOptionType = SelectOption;
  export type TableColumnType<T> = TableColumn<T>;
  export type NotificationType = Notification;
  export type BaseSurveyType = BaseSurvey;
  export type SurveyQuestionType = SurveyQuestion;
  export type ThemeType = Theme;
  
  // Task types
  export type BaseTaskType = BaseTask;
  export type TaskWithRelationsType = TaskWithRelations;
  export type TaskTypeEnum = TaskType;
  export type TaskPriorityEnum = TaskPriority;
  export type TaskStatusEnum = TaskStatus;
  export type TaskStatsType = TaskStats; 
  export type TaskFiltersType = TaskFilters;
  export type TaskMetadataType = TaskMetadata;
  export type TaskCommentType = TaskComment;
  export type TaskAttachmentType = TaskAttachment;
}