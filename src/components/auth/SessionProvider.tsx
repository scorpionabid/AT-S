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
    warningThreshold,
    checkInterval,
    autoLogoutDelay
  });

  const contextValue: SessionContextType = {
    isActive: sessionTimeout.isActive,
    showWarning: sessionTimeout.showWarning,
    timeLeft: sessionTimeout.timeLeft,
    autoLogoutIn: sessionTimeout.autoLogoutIn,
    isExpired: sessionTimeout.isExpired,
    extendSession: sessionTimeout.extendSession,
    dismissWarning: sessionTimeout.dismissWarning,
    forceLogout: sessionTimeout.forceLogout
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      <SessionTimeoutWarning />
    </SessionContext.Provider>
  );
};