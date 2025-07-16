import type { User } from '../../types/auth';

/**
 * Get stored auth token
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set auth token in storage
 */
export const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove auth token from storage
 */
export const removeStoredToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data in storage
 */
export const setStoredUser = (user: User): void => {
  localStorage.setItem('user_data', JSON.stringify(user));
};

/**
 * Remove user data from storage
 */
export const removeStoredUser = (): void => {
  localStorage.removeItem('user_data');
};

/**
 * Clear all auth data from storage
 */
export const clearAuthStorage = (): void => {
  removeStoredToken();
  removeStoredUser();
};

/**
 * Check if user session is expired
 */
export const isSessionExpired = (user: User | null): boolean => {
  if (!user || !user.last_login_at) return true;
  
  const lastLogin = new Date(user.last_login_at);
  const now = new Date();
  const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  
  return (now.getTime() - lastLogin.getTime()) > sessionDuration;
};

/**
 * Get session remaining time in minutes
 */
export const getSessionRemainingTime = (user: User | null): number => {
  if (!user || !user.last_login_at) return 0;
  
  const lastLogin = new Date(user.last_login_at);
  const now = new Date();
  const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  
  const elapsed = now.getTime() - lastLogin.getTime();
  const remaining = sessionDuration - elapsed;
  
  return Math.max(0, Math.floor(remaining / (60 * 1000))); // Convert to minutes
};

/**
 * Check if session warning should be shown (30 minutes before expiry)
 */
export const shouldShowSessionWarning = (user: User | null): boolean => {
  const remainingTime = getSessionRemainingTime(user);
  return remainingTime > 0 && remainingTime <= 30;
};

/**
 * Format session time for display
 */
export const formatSessionTime = (minutes: number): string => {
  if (minutes <= 0) return '0 minutes';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }
  
  return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Check if user is currently active (based on last activity)
 */
export const isUserActive = (user: User | null): boolean => {
  if (!user) return false;
  
  const lastActivity = localStorage.getItem('last_activity');
  if (!lastActivity) return false;
  
  const lastActivityTime = new Date(lastActivity);
  const now = new Date();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
  
  return (now.getTime() - lastActivityTime.getTime()) < inactiveThreshold;
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = (): void => {
  localStorage.setItem('last_activity', new Date().toISOString());
};

/**
 * Get user's current device info
 */
export const getDeviceInfo = (): {
  device_name: string;
  device_type: string;
  os_version: string;
  browser: string;
} => {
  const userAgent = navigator.userAgent;
  
  return {
    device_name: `${navigator.platform} Device`,
    device_type: /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop',
    os_version: navigator.platform,
    browser: getBrowserName(userAgent)
  };
};

/**
 * Get browser name from user agent
 */
const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
};