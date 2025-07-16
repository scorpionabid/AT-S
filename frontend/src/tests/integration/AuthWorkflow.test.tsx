import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import Dashboard from '../../components/dashboard/Dashboard';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import * as authService from '../../services/authService';

// Mock API responses
const mockApiResponses = {
  loginSuccess: {
    success: true,
    data: {
      user: {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        roles: ['müəllim'],
        institution: {
          id: 1,
          name: 'Test School',
          type: 'school'
        }
      },
      token: 'mock-jwt-token'
    }
  },
  loginFailure: {
    success: false,
    message: 'İstifadəçi adı və ya parol yanlışdır',
    errors: {
      username: ['İstifadəçi adı tələb olunur']
    }
  },
  dashboardData: {
    success: true,
    data: {
      stats: {
        total_students: 150,
        total_teachers: 12,
        active_classes: 8,
        pending_tasks: 3
      },
      recent_activities: [
        {
          id: 1,
          type: 'attendance',
          description: 'Davamiyyət qeydi yaradıldı',
          created_at: new Date().toISOString()
        }
      ]
    }
  }
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication Workflow Integration Tests', () => {
  let mockLogin: any;
  let mockLogout: any;
  let mockGetDashboardData: any;

  beforeEach(() => {
    // Mock API functions
    mockLogin = vi.spyOn(authService, 'login');
    mockLogout = vi.spyOn(authService, 'logout');
    mockGetDashboardData = vi.fn();

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      mockLogin.mockResolvedValue(mockApiResponses.loginSuccess);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Fill in login form
      const usernameInput = screen.getByLabelText(/istifadəçi adı/i);
      const passwordInput = screen.getByLabelText(/parol/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for API call and success
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });

      // Verify token is stored
      expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
    });

    it('should handle login failure with error messages', async () => {
      mockLogin.mockRejectedValue(mockApiResponses.loginFailure);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText(/istifadəçi adı/i);
      const passwordInput = screen.getByLabelText(/parol/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/istifadəçi adı və ya parol yanlışdır/i)).toBeInTheDocument();
      });

      // Verify no token is stored
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should validate form fields before submission', async () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /daxil ol/i });
      fireEvent.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/istifadəçi adı tələb olunur/i)).toBeInTheDocument();
        expect(screen.getByText(/parol tələb olunur/i)).toBeInTheDocument();
      });

      // Verify API is not called
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Protected Route Access', () => {
    it('should redirect unauthenticated users to login', () => {
      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['müəllim']}>
            <Dashboard />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login (in real app, this would be handled by router)
      expect(screen.getByText(/daxil ol/i)).toBeInTheDocument();
    });

    it('should allow access to users with correct roles', async () => {
      // Set up authenticated user
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify(mockApiResponses.loginSuccess.data.user));

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['müəllim']}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should deny access to users without required roles', () => {
      // Set up user with different role
      const userData = {
        ...mockApiResponses.loginSuccess.data.user,
        roles: ['student']
      };
      
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify(userData));

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['müəllim']}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText(/bu səhifəyə daxil olmaq icazəniz yoxdur/i)).toBeInTheDocument();
    });
  });

  describe('User Logout Flow', () => {
    it('should successfully logout and clear authentication data', async () => {
      mockLogout.mockResolvedValue({ success: true });

      // Set up authenticated state
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_data', JSON.stringify(mockApiResponses.loginSuccess.data.user));

      render(
        <TestWrapper>
          <button onClick={() => authService.logout()}>
            Çıxış
          </button>
        </TestWrapper>
      );

      const logoutButton = screen.getByText(/çıxış/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      // Verify authentication data is cleared
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should handle token expiration gracefully', async () => {
      // Mock expired token scenario
      mockLogin.mockRejectedValue({
        response: { status: 401, data: { message: 'Token expired' } }
      });

      // Set expired token
      localStorage.setItem('auth_token', 'expired-token');

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['müəllim']}>
            <Dashboard />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login due to expired token
      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(screen.getByText(/daxil ol/i)).toBeInTheDocument();
      });
    });

    it('should maintain session across page refreshes', () => {
      // Set up authenticated state
      const userData = mockApiResponses.loginSuccess.data.user;
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('user_data', JSON.stringify(userData));

      render(
        <TestWrapper>
          <ProtectedRoute requiredRoles={['müəllim']}>
            <div data-testid="user-welcome">
              Xoş gəlmisiniz, {userData.first_name}!
            </div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByTestId('user-welcome')).toBeInTheDocument();
      expect(screen.getByText(/xoş gəlmisiniz, test!/i)).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    const testCases = [
      {
        userRole: 'superadmin',
        requiredRoles: ['superadmin'],
        shouldHaveAccess: true
      },
      {
        userRole: 'müəllim',
        requiredRoles: ['müəllim', 'schooladmin'],
        shouldHaveAccess: true
      },
      {
        userRole: 'student',
        requiredRoles: ['müəllim'],
        shouldHaveAccess: false
      }
    ];

    testCases.forEach(({ userRole, requiredRoles, shouldHaveAccess }) => {
      it(`should ${shouldHaveAccess ? 'allow' : 'deny'} access for ${userRole} role`, () => {
        const userData = {
          ...mockApiResponses.loginSuccess.data.user,
          roles: [userRole]
        };

        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(userData));

        render(
          <TestWrapper>
            <ProtectedRoute requiredRoles={requiredRoles}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          </TestWrapper>
        );

        if (shouldHaveAccess) {
          expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        } else {
          expect(screen.getByText(/bu səhifəyə daxil olmaq icazəniz yoxdur/i)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      mockLogin.mockRejectedValue(new Error('Network Error'));

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText(/istifadəçi adı/i);
      const passwordInput = screen.getByLabelText(/parol/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/şəbəkə xətası baş verdi/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      mockLogin.mockRejectedValue({
        response: { status: 500, data: { message: 'Server Error' } }
      });

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const usernameInput = screen.getByLabelText(/istifadəçi adı/i);
      const passwordInput = screen.getByLabelText(/parol/i);
      const submitButton = screen.getByRole('button', { name: /daxil ol/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server xətası baş verdi/i)).toBeInTheDocument();
      });
    });
  });
});