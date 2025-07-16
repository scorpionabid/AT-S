import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface SessionTimeoutConfig {
  warningTimeBeforeExpiry: number; // Minutes before expiry to show warning
  sessionDuration: number; // Total session duration in minutes
  checkInterval: number; // How often to check (in seconds)
  extendSessionBy: number; // Minutes to extend session by
}

export interface SessionTimeoutState {
  isSessionExpiring: boolean;
  timeRemaining: number; // Minutes
  showWarning: boolean;
  isExtending: boolean;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  warningTimeBeforeExpiry: 5, // 5 minutes warning
  sessionDuration: 120, // 2 hours default
  checkInterval: 30, // Check every 30 seconds
  extendSessionBy: 60 // Extend by 1 hour
};

export const useSessionTimeout = (config: Partial<SessionTimeoutConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { user, logout, refreshUser } = useAuth();
  
  const [state, setState] = useState<SessionTimeoutState>({
    isSessionExpiring: false,
    timeRemaining: finalConfig.sessionDuration,
    showWarning: false,
    isExtending: false
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Update last activity time
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Calculate time remaining until session expires
  const calculateTimeRemaining = useCallback((): number => {
    const sessionStart = lastActivityRef.current;
    const sessionDurationMs = finalConfig.sessionDuration * 60 * 1000;
    const currentTime = Date.now();
    const elapsedTime = currentTime - sessionStart;
    const remainingTime = sessionDurationMs - elapsedTime;
    
    return Math.max(0, Math.floor(remainingTime / (60 * 1000))); // Convert to minutes
  }, [finalConfig.sessionDuration]);

  // Extend session
  const extendSession = useCallback(async () => {
    setState(prev => ({ ...prev, isExtending: true }));
    
    try {
      // Refresh user token/session on backend
      await refreshUser();
      
      // Reset local activity time
      lastActivityRef.current = Date.now();
      
      setState(prev => ({
        ...prev,
        isExtending: false,
        showWarning: false,
        isSessionExpiring: false,
        timeRemaining: finalConfig.sessionDuration
      }));
      
      console.log('Session extended successfully');
    } catch (error) {
      console.error('Failed to extend session:', error);
      setState(prev => ({ ...prev, isExtending: false }));
    }
  }, [refreshUser, finalConfig.sessionDuration]);

  // Force logout due to session expiry
  const forceLogout = useCallback(async () => {
    console.log('Session expired - forcing logout');
    setState(prev => ({
      ...prev,
      isSessionExpiring: true,
      showWarning: false,
      timeRemaining: 0
    }));
    
    await logout();
  }, [logout]);

  // Session check logic
  const checkSession = useCallback(() => {
    if (!user) return;

    const timeRemaining = calculateTimeRemaining();
    const shouldShowWarning = timeRemaining <= finalConfig.warningTimeBeforeExpiry && timeRemaining > 0;
    const shouldLogout = timeRemaining <= 0;

    setState(prev => ({
      ...prev,
      timeRemaining,
      showWarning: shouldShowWarning,
      isSessionExpiring: shouldLogout
    }));

    if (shouldLogout) {
      forceLogout();
    }
  }, [user, calculateTimeRemaining, finalConfig.warningTimeBeforeExpiry, forceLogout]);

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Setup session check interval
    intervalRef.current = setInterval(checkSession, finalConfig.checkInterval * 1000);

    // Initial check
    checkSession();

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, updateActivity, checkSession, finalConfig.checkInterval]);

  // Reset session when user changes
  useEffect(() => {
    if (user) {
      lastActivityRef.current = Date.now();
      setState({
        isSessionExpiring: false,
        timeRemaining: finalConfig.sessionDuration,
        showWarning: false,
        isExtending: false
      });
    }
  }, [user, finalConfig.sessionDuration]);

  return {
    ...state,
    extendSession,
    updateActivity,
    config: finalConfig
  };
};