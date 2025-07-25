// ====================
// ATİS Button Component - Tailwind Migration
// Unified button system with design tokens
// ====================

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500',
        outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-500',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-500',
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500',
        error: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        link: 'text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 
   * Loading state - shows spinner and disables button 
   */
  loading?: boolean;
  /** 
   * Icon to display before text 
   */
  icon?: React.ReactNode;
  /** 
   * Icon to display after text 
   */
  endIcon?: React.ReactNode;
  /** 
   * Full width button 
   */
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    icon, 
    endIcon, 
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && <span className="mr-2">{icon}</span>}
        
        {children}
        
        {!loading && endIcon && <span className="ml-2">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

// ====================
// Button Group Component
// ====================

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  /** 
   * Orientation of button group 
   */
  orientation?: 'horizontal' | 'vertical';
  /** 
   * Size for all buttons in group 
   */
  size?: VariantProps<typeof buttonVariants>['size'];
  /** 
   * Variant for all buttons in group 
   */
  variant?: VariantProps<typeof buttonVariants>['variant'];
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  size,
  variant,
}) => {
  const groupClass = orientation === 'horizontal' 
    ? 'flex'
    : 'flex flex-col';

  // Clone children and apply group props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === Button) {
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      
      let roundedClass = '';
      if (orientation === 'horizontal') {
        if (isFirst) roundedClass = 'rounded-r-none';
        else if (isLast) roundedClass = 'rounded-l-none';
        else roundedClass = 'rounded-none';
      } else {
        if (isFirst) roundedClass = 'rounded-b-none';
        else if (isLast) roundedClass = 'rounded-t-none';
        else roundedClass = 'rounded-none';
      }

      return React.cloneElement(child, {
        size: size || child.props.size,
        variant: variant || child.props.variant,
        className: cn(
          child.props.className,
          roundedClass,
          !isFirst && orientation === 'horizontal' && '-ml-px',
          !isFirst && orientation === 'vertical' && '-mt-px'
        ),
      });
    }
    return child;
  });

  return (
    <div className={cn(groupClass, className)}>
      {enhancedChildren}
    </div>
  );
};

// ====================
// Utility Components
// ====================

/**
 * Icon Button - Square button for icons only
 */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size = 'icon', ...props }, ref) => (
    <Button ref={ref} size={size} {...props}>
      {children}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

/**
 * Link Button - Button that looks like a link
 */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'link', ...props }, ref) => (
    <Button ref={ref} variant={variant} {...props} />
  )
);

LinkButton.displayName = 'LinkButton';