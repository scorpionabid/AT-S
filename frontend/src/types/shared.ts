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

// Export all types as a namespace for easier importing
export namespace ATİSTypes {
  export type PaginatedResponse<T> = PaginatedResponse<T>;
  export type ApiResponse<T> = ApiResponse<T>;
  export type BulkOperationResult = BulkOperationResult;
  export type BaseUser = BaseUser;
  export type BaseInstitution = BaseInstitution;
  export type UserRole = UserRole;
  export type Permission = Permission;
  export type SelectOption = SelectOption;
  export type TableColumn<T> = TableColumn<T>;
  export type Notification = Notification;
  export type BaseSurvey = BaseSurvey;
  export type SurveyQuestion = SurveyQuestion;
  export type Theme = Theme;
}