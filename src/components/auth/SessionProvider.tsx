import React, { createContext, useContext, ReactNode } from 'react';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import SessionTimeoutWarning from './SessionTimeoutWarning';

interface SessionContextType {
  isActive: boolean;
  showWarning: boolean;
  timeLeft: number;
  autoLogoutIn: number;
  isExpired: boolean;
  extendSession: () => Promise<boolean>;
  dismissWarning: () => void;
  forceLogout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
  warningThreshold?: number;
  checkInterval?: number;
  autoLogoutDelay?: number;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  warningThreshold = 5,
  checkInterval = 60000,
  autoLogoutDelay = 300
}) => {
  const sessionTimeout = useSessionTimeout({
    warningTimeBeforeExpiry: warningThreshold,
    checkInterval: checkInterval / 1000, // Convert to seconds
    extendSessionBy: autoLogoutDelay / 60 // Convert to minutes
  });

  const contextValue: SessionContextType = {
    isActive: !sessionTimeout.isSessionExpiring,
    showWarning: sessionTimeout.showWarning,
    timeLeft: sessionTimeout.timeRemaining,
    autoLogoutIn: sessionTimeout.timeRemaining,
    isExpired: sessionTimeout.isSessionExpiring,
    extendSession: sessionTimeout.extendSession,
    dismissWarning: () => Promise.resolve(true),
    forceLogout: () => Promise.resolve()
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutWarning />
    </SessionContext.Provider>
  );
};