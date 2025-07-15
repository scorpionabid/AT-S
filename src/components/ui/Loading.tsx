// ====================
// ATİS Loading Components - Tailwind Migration
// Unified loading states and animations
// ====================

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// ====================
// Spinner Component
// ====================

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-t-transparent',
  {
    variants: {
      size: {
        xs: 'w-3 h-3 border',
        sm: 'w-4 h-4 border',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-2',
        xl: 'w-12 h-12 border-2',
        '2xl': 'w-16 h-16 border-4',
        // Legacy size mappings for backward compatibility
        large: 'w-8 h-8 border-2',
        small: 'w-4 h-4 border',
      },
      variant: {
        primary: 'border-primary-200 border-t-primary-600',
        secondary: 'border-secondary-200 border-t-secondary-600',
        neutral: 'border-neutral-200 border-t-neutral-600',
        white: 'border-white/30 border-t-white',
        success: 'border-success-200 border-t-success-600',
        warning: 'border-warning-200 border-t-warning-600',
        error: 'border-error-200 border-t-error-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** 
   * Accessible label for screen readers 
   */
  label?: string;
}

// Export type for size prop - includes legacy compatibility
export type SpinnerSize = VariantProps<typeof spinnerVariants>['size'] | 'large' | 'small';

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label = 'Yüklənir...', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
);

Spinner.displayName = 'Spinner';

// ====================
// Dots Spinner Component
// ====================

const dotsVariants = cva(
  'flex space-x-1',
  {
    variants: {
      size: {
        sm: 'space-x-1',
        md: 'space-x-1.5',
        lg: 'space-x-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface DotsSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotsVariants> {
  /** 
   * Color variant 
   */
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';
  /** 
   * Accessible label 
   */
  label?: string;
}

const DotsSpinner = forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ className, size, variant = 'primary', label = 'Yüklənir...', ...props }, ref) => {
    const dotSizes = {
      sm: 'w-1 h-1',
      md: 'w-1.5 h-1.5',
      lg: 'w-2 h-2',
    };

    const dotColors = {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      neutral: 'bg-neutral-600',
      white: 'bg-white',
    };

    return (
      <div
        ref={ref}
        className={cn(dotsVariants({ size }), className)}
        role="status"
        aria-label={label}
        {...props}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full animate-pulse',
              dotSizes[size!],
              dotColors[variant]
            )}
            style={{
              animationDelay: `${index * 200}ms`,
              animationDuration: '1400ms',
            }}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

DotsSpinner.displayName = 'DotsSpinner';

// ====================
// Progress Bar Component
// ====================

const progressVariants = cva(
  'w-full bg-neutral-200 rounded-full overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /** 
   * Progress value (0-100) 
   */
  value?: number;
  /** 
   * Maximum value 
   */
  max?: number;
  /** 
   * Color variant 
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** 
   * Show percentage text 
   */
  showValue?: boolean;
  /** 
   * Indeterminate animation 
   */
  indeterminate?: boolean;
  /** 
   * Accessible label 
   */
  label?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    size,
    value = 0,
    max = 100,
    variant = 'primary',
    showValue = false,
    indeterminate = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const barColors = {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
    };

    return (
      <div className="space-y-1">
        {(showValue || label) && (
          <div className="flex justify-between text-sm text-neutral-700">
            {label && <span>{label}</span>}
            {showValue && !indeterminate && (
              <span>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              barColors[variant],
              indeterminate && 'animate-pulse'
            )}
            style={{
              width: indeterminate ? '100%' : `${percentage}%`,
              animation: indeterminate 
                ? 'indeterminate 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' 
                : undefined,
            }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// ====================
// Skeleton Component
// ====================

const skeletonVariants = cva(
  'animate-pulse bg-neutral-200 rounded',
  {
    variants: {
      variant: {
        default: 'bg-neutral-200',
        light: 'bg-neutral-100',
        dark: 'bg-neutral-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** 
   * Width (CSS value or preset) 
   */
  width?: string | number;
  /** 
   * Height (CSS value or preset) 
   */
  height?: string | number;
  /** 
   * Show shimmer effect 
   */
  shimmer?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant,
    width,
    height,
    shimmer = false,
    style,
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        skeletonVariants({ variant }),
        shimmer && 'relative overflow-hidden',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </div>
  )
);

Skeleton.displayName = 'Skeleton';

// ====================
// Loading Overlay Component
// ====================

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 
   * Whether overlay is visible 
   */
  visible: boolean;
  /** 
   * Loading message 
   */
  message?: string;
  /** 
   * Spinner variant 
   */
  variant?: VariantProps<typeof spinnerVariants>['variant'];
  /** 
   * Spinner size 
   */
  size?: VariantProps<typeof spinnerVariants>['size'];
  /** 
   * Overlay opacity 
   */
  opacity?: 'light' | 'medium' | 'dark';
  /** 
   * Use dots spinner instead 
   */
  dots?: boolean;
}

const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className,
    visible,
    message = 'Yüklənir...',
    variant = 'white',
    size = 'lg',
    opacity = 'medium',
    dots = false,
    ...props 
  }, ref) => {
    if (!visible) return null;

    const opacityClasses = {
      light: 'bg-black/20',
      medium: 'bg-black/50',
      dark: 'bg-black/70',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 flex items-center justify-center z-50',
          opacityClasses[opacity],
          className
        )}
        {...props}
      >
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
          <div className="flex flex-col items-center space-y-4">
            {dots ? (
              <DotsSpinner size={size} variant={variant === 'white' ? 'primary' : variant} />
            ) : (
              <Spinner size={size} variant={variant === 'white' ? 'primary' : variant} />
            )}
            {message && (
              <p className="text-sm text-neutral-600 text-center">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// ====================
// Loading States for Components
// ====================

interface LoadingStateProps {
  /** 
   * Number of skeleton lines 
   */
  lines?: number;
  /** 
   * Show avatar skeleton 
   */
  avatar?: boolean;
  /** 
   * Custom layout 
   */
  layout?: 'card' | 'list' | 'table' | 'custom';
  /** 
   * Custom className 
   */
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  lines = 3, 
  avatar = false, 
  layout = 'custom',
  className 
}) => {
  if (layout === 'card') {
    return (
      <div className={cn('p-6 space-y-4', className)}>
        <Skeleton height="1.5rem" width="75%" />
        <Skeleton height="1rem" width="100%" />
        <Skeleton height="1rem" width="85%" />
        <div className="flex space-x-2 pt-2">
          <Skeleton height="2rem" width="4rem" />
          <Skeleton height="2rem" width="4rem" />
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex items-center space-x-3">
            {avatar && <Skeleton height="2.5rem" width="2.5rem" className="rounded-full" />}
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="60%" />
              <Skeleton height="0.75rem" width="40%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <Skeleton height="1rem" />
            <Skeleton height="1rem" />
            <Skeleton height="1rem" />
            <Skeleton height="1rem" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton 
          key={i} 
          height="1rem" 
          width={`${Math.random() * 40 + 60}%`} 
        />
      ))}
    </div>
  );
};

// ====================
// CSS Animation Styles
// ====================

const LoadingStyles = () => (
  <style jsx global>{`
    @keyframes indeterminate {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `}</style>
);

// Legacy compatibility exports
export const LoadingSpinner = Spinner;
export const LoadingSkeleton = Skeleton;

export {
  Spinner,
  DotsSpinner,
  Progress,
  Skeleton,
  LoadingOverlay,
  LoadingState,
  LoadingStyles,
  spinnerVariants,
  progressVariants,
  skeletonVariants,
  type SpinnerSize,
  // Legacy compatibility
  LoadingSpinner,
  LoadingSkeleton,
};