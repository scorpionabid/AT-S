import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Select variants using design tokens
const selectVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer appearance-none bg-white pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>,
  VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  description?: string;
  options: Option[];
  isLoading?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  description,
  options,
  isLoading = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  disabled,
  variant = 'default',
  size = 'md',
  placeholder,
  ...props
}, ref) => {
  const selectId = id || useId();
  
  const selectVariant = error ? 'error' : variant;
  const isDisabled = disabled || isLoading;
  
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
        <label htmlFor={selectId} className={labelClasses}>
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            selectVariants({ variant: selectVariant, size }),
            className,
            selectClassName
          )}
          disabled={isDisabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={option.disabled ? 'text-neutral-400' : ''}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
          ) : (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          )}
        </div>
      </div>
      
      {description && !error && (
        <p className={descriptionClasses} id={`${selectId}-description`}>
          {description}
        </p>
      )}
      
      {error && (
        <p className={errorClasses} id={`${selectId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;