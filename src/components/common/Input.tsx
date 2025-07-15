import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Input variants using design tokens
const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 bg-white focus-visible:ring-primary-500 focus-visible:border-primary-500',
        success: 'border-success-300 bg-success-50 focus-visible:ring-success-500 focus-visible:border-success-500',
        warning: 'border-warning-300 bg-warning-50 focus-visible:ring-warning-500 focus-visible:border-warning-500',
        error: 'border-error-300 bg-error-50 focus-visible:ring-error-500 focus-visible:border-error-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  description,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  disabled,
  variant = 'default',
  size = 'md',
  loading,
  ...props
}, ref) => {
  const inputId = id || useId();
  
  const inputVariant = error ? 'error' : variant;
  const isDisabled = disabled || loading;
  
  const containerClasses = cn('space-y-1', containerClassName);
  const labelClasses = cn(
    'block text-sm font-medium text-neutral-700',
    error && 'text-error-600',
    labelClassName
  );
  const errorClasses = cn('mt-1 text-sm text-error-600', errorClassName);
  const descriptionClasses = cn('mt-1 text-sm text-neutral-500', descriptionClassName);

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            inputVariants({ variant: inputVariant, size }),
            leftIcon && 'pl-10',
            (rightIcon || loading) && 'pr-10',
            className,
            inputClassName
          )}
          disabled={isDisabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
          </div>
        )}
        
        {!loading && rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {rightIcon}
          </div>
        )}
      </div>
      
      {description && !error && (
        <p className={descriptionClasses} id={`${inputId}-description`}>
          {description}
        </p>
      )}
      
      {error && (
        <p className={errorClasses} id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;