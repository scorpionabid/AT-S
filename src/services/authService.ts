import api from './api';
import type { User, LoginCredentials, LoginResponse } from '../types/auth';
import { logger } from '../utils/logger';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data'
} as const;

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    logger.info('AuthService', 'Login attempt', { username: credentials.login });
    
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      logger.debug('AuthService', 'Login response received', { 
        status: response.status,
        hasData: !!response.data 
      });
      
      // Handle both response formats (nested and flat)
      const responseData = response.data.data || response.data;
      const token = responseData.token;
      const user = responseData.user;
      
      if (token && user) {
        // Ensure roles and permissions are arrays
        const normalizedUser = {
          ...user,
          roles: Array.isArray(user.roles) ? user.roles : [],
          permissions: Array.isArray(user.permissions) ? user.permissions : []
        };
        
        logger.debug('AuthService', 'Storing auth data in localStorage', {
          userId: normalizedUser.id,
          roles: normalizedUser.roles,
          permissions: normalizedUser.permissions
        });
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
        
        logger.info('AuthService', 'Login successful', { 
          userId: normalizedUser.id,
          email: normalizedUser.email,
          roles: normalizedUser.roles,
          permissions: normalizedUser.permissions.length
        });
        
        return {
          token,
          user,
          requires_password_change: responseData.requires_password_change || false
        };
      }
      
      const error = new Error('Invalid response format from server');
      logger.error('AuthService', 'Login failed: Invalid response format', { 
        responseData: responseData 
      });
      throw error;
      
    } catch (error) {
      logger.error('AuthService', 'Login error', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    logger.info('AuthService', 'Logout initiated');
    
    try {
      const token = this.getStoredToken();
      if (token) {
        logger.debug('AuthService', 'Sending logout request to server');
        await api.post('/logout');
      }
    } catch (error) {
      logger.error('AuthService', 'Logout error', { 
        error: error.message,
        stack: error.stack 
      });
      // Continue with local logout even if server logout fails
    } finally {
      logger.debug('AuthService', 'Clearing auth data from localStorage');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      logger.info('AuthService', 'Logout completed');
    }
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    logger.debug('AuthService', 'Fetching current user info');
    
    try {
      const response = await api.get<{ user: User }>('/me');
      logger.debug('AuthService', 'Received current user info', { 
        userId: response.data.user?.id 
      });
      return response.data.user;
      
    } catch (error) {
      logger.error('AuthService', 'Failed to fetch current user', { 
        error: error.message 
      });
      throw error;
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>('/refresh-token');
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<void> {
    await api.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        logger.debug('AuthService', 'No user data found in localStorage');
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      logger.error('AuthService', 'Error parsing stored user data', { 
        error: error.message 
      });
      return null;
    }
  },

  // Get stored token
  getStoredToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    logger.debug('AuthService', 'Retrieved stored token', { 
      hasToken: !!token,
      tokenPrefix: token ? `${token.substring(0, 10)}...` : null
    });
    return token;
  },
};