import { apiClient, ApiResponse } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  institution?: {
    id: number;
    name: string;
    type: string;
    level: number;
  };
  region?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expires_at: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Backend expects 'login' field instead of 'email'
    const loginData = {
      login: credentials.email,
      password: credentials.password,
      device_name: 'web-browser',
    };
    
    const response = await apiClient.post<any>('/login', loginData);
    
    if (response.data) {
      // Backend returns data.token and data.user structure
      const userData = response.data.user;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        role: userData.roles?.[0] || 'user', // Take first role from roles array
        permissions: userData.permissions || [],
        institution: userData.institution,
        region: userData.region,
        department: userData.department,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
      
      const loginResponse: LoginResponse = {
        token: response.data.token,
        user: user,
        expires_at: response.data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      
      apiClient.setToken(loginResponse.token);
      return loginResponse;
    }
    
    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } finally {
      apiClient.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>('/me');
    
    if (response.user) {
      // Backend returns user data with roles array, map to single role
      const userData = response.user;
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        role: userData.roles?.[0] || 'user', // Take first role from roles array
        permissions: userData.permissions || [],
        institution: userData.institution,
        region: userData.region,
        department: userData.department,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
      return user;
    }
    
    throw new Error('Failed to get current user');
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/refresh-token');
    
    if (response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }
    
    throw new Error('Token refresh failed');
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.post('/change-password', data);
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getToken(): string | null {
    return apiClient.getToken();
  }

  clearAuth(): void {
    apiClient.clearToken();
  }
}

export const authService = new AuthService();