// ====================
// ATİS Form Components - Tailwind Migration
// Unified form system with validation and accessibility
// ====================

import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// ====================
// Input Components
// ====================

const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 bg-white focus-visible:ring-primary-500 focus-visible:border-primary-500',
        success: 'border-success-300 bg-success-50 focus-visible:ring-success-500 focus-visible:border-success-500',
        warning: 'border-warning-300 bg-warning-50 focus-visible:ring-warning-500 focus-visible:border-warning-500',
        error: 'border-error-300 bg-error-50 focus-visible:ring-error-500 focus-visible:border-error-500',
        ghost: 'border-transparent bg-neutral-100 focus-visible:ring-primary-500 focus-visible:border-primary-500',
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

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /** 
   * Error state 
   */
  error?: boolean;
  /** 
   * Success state 
   */
  success?: boolean;
  /** 
   * Loading state 
   */
  loading?: boolean;
  /** 
   * Left icon 
   */
  leftIcon?: React.ReactNode;
  /** 
   * Right icon 
   */
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    variant = 'default',
    size,
    error,
    success,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    const inputVariant = error ? 'error' : success ? 'success' : variant;
    const isDisabled = disabled || loading;

    if (leftIcon || rightIcon || loading) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || loading) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={isDisabled}
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
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: inputVariant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// ====================
// Textarea Component
// ====================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  /** 
   * Error state 
   */
  error?: boolean;
  /** 
   * Success state 
   */
  success?: boolean;
  /** 
   * Auto resize based on content 
   */
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = 'default',
    size,
    error,
    success,
    autoResize = false,
    ...props 
  }, ref) => {
    const textareaVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <textarea
        className={cn(
          inputVariants({ variant: textareaVariant, size }),
          'min-h-[80px] resize-y',
          autoResize && 'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

// ====================
// Select Component
// ====================

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof inputVariants> {
  /** 
   * Error state 
   */
  error?: boolean;
  /** 
   * Success state 
   */
  success?: boolean;
  /** 
   * Placeholder option 
   */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant = 'default',
    size,
    error,
    success,
    placeholder,
    children,
    ...props 
  }, ref) => {
    const selectVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="relative">
        <select
          className={cn(
            inputVariants({ variant: selectVariant, size }),
            'cursor-pointer appearance-none bg-white pr-8',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

// ====================
// Checkbox Component
// ====================

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 
   * Label text 
   */
  label?: string;
  /** 
   * Error state 
   */
  error?: boolean;
  /** 
   * Success state 
   */
  success?: boolean;
  /** 
   * Size variant 
   */
  size?: 'sm' | 'md' | 'lg';
  /** 
   * Description text 
   */
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label,
    error,
    success,
    size = 'md',
    description,
    id,
    ...props 
  }, ref) => {
    const checkboxId = useId();
    const finalId = id || checkboxId;

    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const checkboxClasses = cn(
      'rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
      error && 'border-error-300 text-error-600 focus:ring-error-500',
      success && 'border-success-300 text-success-600 focus:ring-success-500',
      sizeClasses[size],
      className
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={finalId}
            className={checkboxClasses}
            ref={ref}
            {...props}
          />
          <div className="flex-1">
            {label && (
              <label
                htmlFor={finalId}
                className={cn(
                  'text-sm font-medium text-neutral-700 cursor-pointer',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <input
        type="checkbox"
        id={finalId}
        className={checkboxClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ====================
// Radio Component
// ====================

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 
   * Label text 
   */
  label?: string;
  /** 
   * Error state 
   */
  error?: boolean;
  /** 
   * Success state 
   */
  success?: boolean;
  /** 
   * Size variant 
   */
  size?: 'sm' | 'md' | 'lg';
  /** 
   * Description text 
   */
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className, 
    label,
    error,
    success,
    size = 'md',
    description,
    id,
    ...props 
  }, ref) => {
    const radioId = useId();
    const finalId = id || radioId;

    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const radioClasses = cn(
      'border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
      error && 'border-error-300 text-error-600 focus:ring-error-500',
      success && 'border-success-300 text-success-600 focus:ring-success-500',
      sizeClasses[size],
      className
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-2">
          <input
            type="radio"
            id={finalId}
            className={radioClasses}
            ref={ref}
            {...props}
          />
          <div className="flex-1">
            {label && (
              <label
                htmlFor={finalId}
                className={cn(
                  'text-sm font-medium text-neutral-700 cursor-pointer',
                  props.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <input
        type="radio"
        id={finalId}
        className={radioClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

Radio.displayName = 'Radio';

// ====================
// Form Field Components
// ====================

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  )
);

FormField.displayName = 'FormField';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, error, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        error ? 'text-error-600' : 'text-neutral-700',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  )
);

FormLabel.displayName = 'FormLabel';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  error?: boolean;
  success?: boolean;
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, error, success, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        className={cn(
          'text-xs',
          error && 'text-error-600',
          success && 'text-success-600',
          !error && !success && 'text-neutral-500',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormMessage.displayName = 'FormMessage';

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-neutral-500', className)}
      {...props}
    >
      {children}
    </p>
  )
);

FormDescription.displayName = 'FormDescription';

// ====================
// Form Layout Components
// ====================

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  gap?: 'sm' | 'md' | 'lg';
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ 
    className, 
    children, 
    orientation = 'vertical',
    gap = 'md',
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
      md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
      lg: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6',
    };

    const flexClasses = orientation === 'horizontal' ? 'flex flex-wrap items-end' : 'flex flex-col';

    return (
      <div
        ref={ref}
        className={cn(flexClasses, gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const FormGrid = forwardRef<HTMLDivElement, FormGridProps>(
  ({ 
    className, 
    children, 
    cols = { default: 1, md: 2 },
    gap = 'md',
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    const gridCols = [
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={cn('grid', gridCols, gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGrid.displayName = 'FormGrid';

export {
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
  FormGroup,
  FormGrid,
  inputVariants,
};