import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
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
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = classNames(
    'block w-full rounded-md shadow-sm focus:ring-1 focus:ring-offset-1 transition duration-150 ease-in-out sm:text-sm',
    'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    {
      'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500': error,
      'opacity-70 bg-gray-100 cursor-not-allowed': disabled,
    },
    className,
    inputClassName
  );

  const containerClasses = classNames('space-y-1', containerClassName);
  const labelClasses = classNames(
    'block text-sm font-medium text-gray-700',
    labelClassName
  );
  const errorClasses = classNames('mt-1 text-sm text-red-600', errorClassName);
  const descriptionClasses = classNames('mt-1 text-sm text-gray-500', descriptionClassName);

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={classNames(inputClasses, {
            'pl-10': leftIcon,
            'pr-10': rightIcon,
          })}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
