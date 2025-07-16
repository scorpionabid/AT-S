import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'default';

export const ToastVariant = {
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  DEFAULT: 'default' as const,
};

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  isDismissible?: boolean;
  onDismiss?: (id: string) => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, options?: Omit<Toast, 'id' | 'message'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 5 seconds

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    
    // Clear the timeout if it exists
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const addToast = useCallback((
    message: string, 
    {
      variant = ToastVariant.DEFAULT,
      duration = DEFAULT_DURATION,
      isDismissible = true,
      onDismiss,
    }: Omit<Toast, 'id' | 'message'> = { variant: ToastVariant.DEFAULT }
  ) => {
    const id = uuidv4();
    
    const newToast: Toast = {
      id,
      message,
      variant,
      duration,
      isDismissible,
      onDismiss: () => {
        onDismiss?.(id);
        removeToast(id);
      },
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss if duration is greater than 0
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      timeoutsRef.current[id] = timeoutId;
    }

    return id;
  }, [removeToast]);

  const clearToasts = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    
    // Remove all toasts
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
