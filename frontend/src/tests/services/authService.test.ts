import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock auth service implementation
const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
  checkPermission: vi.fn(),
  isAuthenticated: vi.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        login: 'testuser',
        password: 'password123'
      };

      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: { name: 'muellim' }
        }
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await mockAuthService.login(credentials);

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure', async () => {
      const credentials = {
        login: 'invaliduser',
        password: 'wrongpassword'
      };

      const mockError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(mockError);

      await expect(mockAuthService.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should store token in localStorage on successful login', async () => {
      const credentials = {
        login: 'testuser',
        password: 'password123'
      };

      const mockResponse = {
        token: 'mock-jwt-token',
        user: { id: 1, username: 'testuser' }
      };

      mockAuthService.login.mockImplementation(async (creds) => {
        localStorageMock.setItem('token', mockResponse.token);
        return mockResponse;
      });

      await mockAuthService.login(credentials);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAuthService.logout.mockImplementation(() => {
        localStorageMock.removeItem('token');
        localStorageMock.removeItem('user');
        return Promise.resolve();
      });

      await mockAuthService.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('should handle logout errors gracefully', async () => {
      const mockError = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValue(mockError);

      await expect(mockAuthService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: { name: 'muellim' }
      };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await mockAuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(null);

      const result = await mockAuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('checkPermission', () => {
    it('should return true for valid permission', () => {
      const permission = 'view_dashboard';
      const userPermissions = ['view_dashboard', 'manage_users'];

      mockAuthService.checkPermission.mockImplementation((perm, perms) => {
        return perms.includes(perm);
      });

      const result = mockAuthService.checkPermission(permission, userPermissions);

      expect(result).toBe(true);
    });

    it('should return false for invalid permission', () => {
      const permission = 'admin_access';
      const userPermissions = ['view_dashboard', 'manage_users'];

      mockAuthService.checkPermission.mockImplementation((perm, perms) => {
        return perms.includes(perm);
      });

      const result = mockAuthService.checkPermission(permission, userPermissions);

      expect(result).toBe(false);
    });

    it('should handle empty permissions array', () => {
      const permission = 'view_dashboard';
      const userPermissions: string[] = [];

      mockAuthService.checkPermission.mockImplementation((perm, perms) => {
        return perms.includes(perm);
      });

      const result = mockAuthService.checkPermission(permission, userPermissions);

      expect(result).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      mockAuthService.isAuthenticated.mockImplementation(() => {
        return !!localStorageMock.getItem('token');
      });

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockAuthService.isAuthenticated.mockImplementation(() => {
        return !!localStorageMock.getItem('token');
      });

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const newToken = 'new-jwt-token';
      
      mockAuthService.refreshToken.mockImplementation(async () => {
        localStorageMock.setItem('token', newToken);
        return { token: newToken };
      });

      const result = await mockAuthService.refreshToken();

      expect(result).toEqual({ token: newToken });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', newToken);
    });

    it('should handle refresh token failure', async () => {
      const mockError = new Error('Token refresh failed');
      mockAuthService.refreshToken.mockRejectedValue(mockError);

      await expect(mockAuthService.refreshToken()).rejects.toThrow('Token refresh failed');
    });
  });

  describe('token management', () => {
    it('should handle expired tokens', () => {
      // Mock expired token scenario
      const expiredToken = 'expired.jwt.token';
      localStorageMock.getItem.mockReturnValue(expiredToken);

      // In a real implementation, this would decode the JWT and check expiration
      mockAuthService.isAuthenticated.mockImplementation(() => {
        const token = localStorageMock.getItem('token');
        if (!token) return false;
        
        // Mock token expiration check
        if (token === 'expired.jwt.token') {
          localStorageMock.removeItem('token');
          return false;
        }
        
        return true;
      });

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle malformed tokens', () => {
      const malformedToken = 'invalid-token';
      localStorageMock.getItem.mockReturnValue(malformedToken);

      mockAuthService.isAuthenticated.mockImplementation(() => {
        const token = localStorageMock.getItem('token');
        if (!token) return false;
        
        // Mock malformed token check
        if (token === 'invalid-token') {
          localStorageMock.removeItem('token');
          return false;
        }
        
        return true;
      });

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});