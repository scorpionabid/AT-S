// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  // Legacy role field (kept for backward compatibility)
  role?: string | { id: number; name: string; display_name: string } | null;
  role_display_name?: string | null;
  role_level?: number | null;
  
  // New fields for roles and permissions
  roles: string[];
  permissions: string[];
  
  institution: {
    id: number | null;
    name: string | null;
    type: string | null;
    level: number | null;
  };
  departments: string[];
  last_login_at: string | null;
  profile: {
    first_name: string;
    last_name: string;
    patronymic: string;
    full_name: string;
    birth_date: string;
    gender: string;
    contact_phone: string;
  } | null;
}

// Login credentials interface
export interface LoginCredentials {
  login: string; // Can be username or email
  password: string;
  rememberMe?: boolean; // Remember user for extended period
}

// Login response interface
export interface LoginResponse {
  token: string;
  user: User;
  requires_password_change?: boolean;
  // Backend wraps the response in a data object
  data?: {
    token: string;
    user: User;
    requires_password_change?: boolean;
  };
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials & { rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Protected route props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAll?: boolean; // Default: false (any)
}

// Export types explicitly
export type { User as UserType };
export type { LoginCredentials as LoginCredentialsType };
export type { LoginResponse as LoginResponseType };
export type { AuthContextType as AuthContextTypeType };
export type { ProtectedRouteProps as ProtectedRoutePropsType };