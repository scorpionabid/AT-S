/**
 * ATİS Users Type Definitions
 * Unified type system for user management components
 */

// Re-export main User interface from auth types
export { User } from './auth';

// Extended interfaces specific to user management
export interface UsersResponse {
  users: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
  institution_id: string;
  department_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string;
  gender: string;
  contact_phone: string;
  is_active: boolean;
}

export interface UserEditData {
  username: string;
  email: string;
  role_id: string;
  institution_id: string;
  department_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string;
  gender: string;
  contact_phone: string;
  is_active: boolean;
  // Optional password fields for edit
  password?: string;
  password_confirmation?: string;
}

// Component Props Interfaces
export interface UserCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface UserEditFormProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export interface UserViewModalProps {
  user: User;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusToggle?: () => void;
}

export interface UserDeleteConfirmProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export interface UserStatusConfirmProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

// Supporting Interfaces
export interface Role {
  id: number;
  name: string;
  display_name: string;
  level: number;
}

export interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

export interface Department {
  id: number;
  name: string;
  department_type: string;
  institution_id: number;
}

// Filter and Search Types
export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
  institution_id?: string;
  created_from?: string;
  created_to?: string;
  last_login_from?: string;
  last_login_to?: string;
}

export interface UserSortOptions {
  field: 'username' | 'email' | 'created_at' | 'last_login_at';
  order: 'asc' | 'desc';
}

// Stats and Analytics
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byInstitution: Record<string, number>;
  recentLogins: number;
}