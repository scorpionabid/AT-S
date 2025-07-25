import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType, LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { preloadUserPermissions, invalidateUserCache } from '../utils/auth/cachedPermissionUtils';
import SessionTimeoutWarning from '../components/auth/SessionTimeoutWarning';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Log auth state changes
  useEffect(() => {
    logger.debug('AuthContext', 'Auth state changed', {
      hasUser: !!user,
      hasToken: !!token,
      userId: user?.id,
      userRoles: user?.roles || [],
      userPermissions: user?.permissions?.length || 0
    });
  }, [user, token]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      logger.info('AuthContext', 'Initializing auth state');
      
      try {
        const storedToken = authService.getStoredToken();
        const storedUser = authService.getStoredUser();

        logger.debug('AuthContext', 'Retrieved stored auth data', {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          userId: storedUser?.id,
          userRoles: storedUser?.roles || [],
          userPermissions: storedUser?.permissions?.length || 0
        });

        if (storedToken && storedUser) {
          logger.debug('AuthContext', 'Found stored auth data, validating token');
          setToken(storedToken);
          setUser(storedUser);
          
          // Verify token by fetching current user
          try {
            logger.debug('AuthContext', 'Fetching current user to validate token');
            const currentUser = await authService.getCurrentUser();
            
            logger.info('AuthContext', 'Token validated, user authenticated', {
              userId: currentUser.id,
              email: currentUser.email
            });
            
            // Normalize user data
            const normalizedUser = {
              ...currentUser,
              roles: Array.isArray(currentUser.roles) ? currentUser.roles : [],
              permissions: Array.isArray(currentUser.permissions) ? currentUser.permissions : []
            };
            
            setUser(normalizedUser);
            // Update stored user data
            localStorage.setItem('user_data', JSON.stringify(normalizedUser));
            // Preload user permissions in cache
            preloadUserPermissions(normalizedUser);
          } catch (error) {
            logger.warn('AuthContext', 'Token validation failed, logging out', {
              error: error.message
            });
            // Token is invalid, clear auth state
            await logout();
          }
        } else {
          logger.debug('AuthContext', 'No stored auth data found');
        }
      } catch (error) {
        logger.error('AuthContext', 'Error initializing auth state', {
          error: error.message,
          stack: error.stack
        });
        await logout();
      } finally {
        logger.debug('AuthContext', 'Auth initialization completed');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    logger.info('AuthContext', 'Login initiated', {
      username: credentials.login,
      hasPassword: !!credentials.password
    });
    
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Backend response structure check
      logger.debug('AuthContext', 'Login response structure', {
        hasData: !!response.data,
        hasUser: !!response.user,
        userRoles: response.user?.roles,
        userPermissions: response.user?.permissions
      });
      
      // Ensure arrays are properly formatted
      const user = {
        ...response.user,
        roles: Array.isArray(response.user.roles) ? response.user.roles : [],
        permissions: Array.isArray(response.user.permissions) ? response.user.permissions : []
      };
      
      logger.debug('AuthContext', 'Login successful, updating auth state');
      setUser(user);
      setToken(response.token);
      
      // Preload user permissions in cache
      preloadUserPermissions(user);
      
      logger.info('AuthContext', 'User logged in successfully', {
        userId: user.id,
        email: user.email,
        rolesCount: user.roles.length,
        permissionsCount: user.permissions.length
      });
      
      if (response.requires_password_change) {
        logger.info('AuthContext', 'Password change required for user', {
          userId: user.id
        });
      }
    } catch (error) {
      logger.error('AuthContext', 'Login failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    logger.info('AuthContext', 'Logout initiated from context');
    
    const currentUserId = user?.id;
    
    try {
      setIsLoading(true);
      await authService.logout();
      
      logger.info('AuthContext', 'Logout completed successfully');
    } catch (error) {
      logger.error('AuthContext', 'Error during logout', {
        error: error.message,
        stack: error.stack
      });
      // Continue with local logout even if there was an error
    } finally {
      logger.debug('AuthContext', 'Clearing auth state');
      
      // Clear user cache
      if (currentUserId) {
        invalidateUserCache(currentUserId);
      }
      
      setUser(null);
      setToken(null);
      setIsLoading(false);
      
      logger.info('AuthContext', 'Auth state cleared, user logged out');
    }
  }, [user]);

  const refreshUser = async (): Promise<void> => {
    logger.debug('AuthContext', 'Refreshing user data');
    
    try {
      if (token) {
        const currentUser = await authService.getCurrentUser();
        
        logger.debug('AuthContext', 'User data refreshed', {
          userId: currentUser.id,
          email: currentUser.email
        });
        
        setUser(currentUser);
        localStorage.setItem('user_data', JSON.stringify(currentUser));
        // Preload updated user permissions
        preloadUserPermissions(currentUser);
      } else {
        logger.warn('AuthContext', 'Cannot refresh user: No token available');
      }
    } catch (error) {
      logger.error('AuthContext', 'Error refreshing user data', {
        error: error.message,
        stack: error.stack
      });
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Session timeout warning for authenticated users */}
      {user && (
        <SessionTimeoutWarning
          onExtend={() => {
            logger.info('AuthContext', 'Session extended by user');
          }}
          onLogout={logout}
          onDismiss={() => {
            logger.debug('AuthContext', 'Session warning dismissed');
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};