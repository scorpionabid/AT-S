// ====================
// ATİS Alert Components - Tailwind Migration
// Unified alert, notification and toast system
// ====================

import React, { forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// ====================
// Alert Component
// ====================

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-50 border-neutral-200 text-neutral-900',
        success: 'bg-success-50 border-success-200 text-success-900',
        warning: 'bg-warning-50 border-warning-200 text-warning-900',
        error: 'bg-error-50 border-error-200 text-error-900',
        info: 'bg-info-50 border-info-200 text-info-900',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4',
        lg: 'p-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** 
   * Alert icon 
   */
  icon?: React.ReactNode;
  /** 
   * Show close button 
   */
  dismissible?: boolean;
  /** 
   * Close callback 
   */
  onClose?: () => void;
  /** 
   * Alert title 
   */
  title?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant, 
    size,
    icon,
    dismissible = false,
    onClose,
    title,
    children,
    ...props 
  }, ref) => {
    const iconColors = {
      default: 'text-neutral-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-info-600',
    };

    const defaultIcons = {
      success: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    };

    const displayIcon = icon || (variant && variant !== 'default' ? defaultIcons[variant] : null);

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, size }), className)}
        role="alert"
        {...props}
      >
        <div className="flex">
          {displayIcon && (
            <div className={cn('flex-shrink-0 mr-3', iconColors[variant!])}>
              {displayIcon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm font-medium mb-1">
                {title}
              </h3>
            )}
            <div className={cn('text-sm', title && 'text-opacity-90')}>
              {children}
            </div>
          </div>

          {dismissible && onClose && (
            <div className="flex-shrink-0 ml-3">
              <button
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'success' && 'text-success-500 hover:bg-success-100 focus:ring-success-600',
                  variant === 'warning' && 'text-warning-500 hover:bg-warning-100 focus:ring-warning-600',
                  variant === 'error' && 'text-error-500 hover:bg-error-100 focus:ring-error-600',
                  variant === 'info' && 'text-info-500 hover:bg-info-100 focus:ring-info-600',
                  variant === 'default' && 'text-neutral-500 hover:bg-neutral-100 focus:ring-neutral-600'
                )}
                aria-label="Close alert"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// ====================
// Toast Component
// ====================

const toastVariants = cva(
  'relative flex w-full max-w-sm rounded-lg shadow-lg pointer-events-auto overflow-hidden transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-white border border-neutral-200',
        success: 'bg-white border border-success-200',
        warning: 'bg-white border border-warning-200',
        error: 'bg-white border border-error-200',
        info: 'bg-white border border-info-200',
        dark: 'bg-neutral-800 text-white border border-neutral-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  /** 
   * Toast title 
   */
  title?: string;
  /** 
   * Toast description 
   */
  description?: string;
  /** 
   * Toast icon 
   */
  icon?: React.ReactNode;
  /** 
   * Auto dismiss duration (ms) 
   */
  duration?: number;
  /** 
   * Show close button 
   */
  dismissible?: boolean;
  /** 
   * Close callback 
   */
  onClose?: () => void;
  /** 
   * Toast action 
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant,
    title,
    description,
    icon,
    duration = 5000,
    dismissible = true,
    onClose,
    action,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    // Auto dismiss
    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    };

    const iconColors = {
      default: 'text-neutral-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-info-600',
      dark: 'text-neutral-300',
    };

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          !isVisible && 'transform translate-x-full opacity-0',
          className
        )}
        {...props}
      >
        <div className="flex-1 p-4">
          <div className="flex items-start">
            {icon && (
              <div className={cn('flex-shrink-0 mr-3 mt-0.5', iconColors[variant!])}>
                {icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {title && (
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {title}
                </p>
              )}
              {description && (
                <p className={cn(
                  'text-sm text-neutral-600 dark:text-neutral-300',
                  title && 'mt-1'
                )}>
                  {description}
                </p>
              )}
              
              {action && (
                <div className="mt-3">
                  <button
                    onClick={action.onClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none"
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>

            {dismissible && (
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={handleClose}
                  className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-neutral-600 transition-colors"
                  aria-label="Close toast"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// ====================
// Toast Container
// ====================

export interface ToastContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Container position 
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** 
   * Maximum number of toasts 
   */
  limit?: number;
}

const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ 
    className, 
    position = 'top-right',
    limit = 3,
    children,
    ...props 
  }, ref) => {
    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col space-y-2 pointer-events-none',
          positionClasses[position],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

// ====================
// Notification Component
// ====================

export interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Notification variant 
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** 
   * Notification title 
   */
  title: string;
  /** 
   * Notification message 
   */
  message?: string;
  /** 
   * Show timestamp 
   */
  showTime?: boolean;
  /** 
   * Timestamp 
   */
  timestamp?: Date;
  /** 
   * Avatar/icon 
   */
  avatar?: React.ReactNode;
  /** 
   * Actions 
   */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  /** 
   * Read state 
   */
  read?: boolean;
  /** 
   * Close callback 
   */
  onClose?: () => void;
}

const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  ({ 
    className,
    variant = 'default',
    title,
    message,
    showTime = true,
    timestamp = new Date(),
    avatar,
    actions,
    read = false,
    onClose,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'border-neutral-200',
      success: 'border-l-4 border-l-success-500 border-t-neutral-200 border-r-neutral-200 border-b-neutral-200',
      warning: 'border-l-4 border-l-warning-500 border-t-neutral-200 border-r-neutral-200 border-b-neutral-200',
      error: 'border-l-4 border-l-error-500 border-t-neutral-200 border-r-neutral-200 border-b-neutral-200',
      info: 'border-l-4 border-l-info-500 border-t-neutral-200 border-r-neutral-200 border-b-neutral-200',
    };

    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `${days}g əvvəl`;
      if (hours > 0) return `${hours}s əvvəl`;
      if (minutes > 0) return `${minutes}d əvvəl`;
      return 'İndi';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-white border rounded-lg p-4 shadow-sm transition-colors hover:bg-neutral-50',
          variantClasses[variant],
          !read && 'bg-blue-50/30',
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {avatar && (
            <div className="flex-shrink-0">
              {avatar}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  'text-sm font-medium text-neutral-900',
                  !read && 'font-semibold'
                )}>
                  {title}
                </h3>
                {message && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-3">
                {showTime && (
                  <span className="text-xs text-neutral-500">
                    {formatTime(timestamp)}
                  </span>
                )}
                {!read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Close notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {actions && actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded transition-colors',
                      action.variant === 'primary' 
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Notification.displayName = 'Notification';

export {
  Alert,
  Toast,
  ToastContainer,
  Notification,
  alertVariants,
  toastVariants,
};