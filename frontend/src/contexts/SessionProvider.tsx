import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessionTimeoutWarning: boolean;
  remainingTime: number;
  extendSession: () => void;
  clearSessionWarning: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  useEffect(() => {
    if (!user) {
      setSessionTimeoutWarning(false);
      return;
    }

    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);

      // Set warning timer
      warningTimer = setTimeout(() => {
        setSessionTimeoutWarning(true);
        setRemainingTime(WARNING_TIME);

        // Start countdown
        countdownInterval = setInterval(() => {
          setRemainingTime(prev => {
            if (prev <= 1000) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Set logout timer
      logoutTimer = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
    };

    // Initialize timers
    resetTimers();

    // Reset timers on user activity
    const handleActivity = () => {
      if (user) {
        resetTimers();
        setSessionTimeoutWarning(false);
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, logout]);

  const extendSession = () => {
    setSessionTimeoutWarning(false);
    setRemainingTime(0);
    // Timers will be reset by the activity handler
  };

  const clearSessionWarning = () => {
    setSessionTimeoutWarning(false);
    setRemainingTime(0);
  };

  const value: SessionContextType = {
    sessionTimeoutWarning,
    remainingTime,
    extendSession,
    clearSessionWarning,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};