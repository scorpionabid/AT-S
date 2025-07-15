import React from 'react';
import classNames from 'classnames';
import { Icon, IconName, LoadingIcon } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'btn--primary',
  secondary: 'btn--secondary', 
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
  success: 'btn--success',
  warning: 'btn--warning',
  info: 'btn--info',
};

const sizeClasses = {
  xs: 'btn--xs',
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
  xl: 'btn--xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const buttonClasses = classNames(
    'btn',
    variantClasses[variant],
    sizeClasses[size],
    {
      'btn--full-width': fullWidth,
      'btn--loading': isLoading,
      'btn--disabled': disabled,
    },
    className
  );

  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16;

  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingIcon size={iconSize} className="btn__loading-icon" />
          <span className="btn__content">{children}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <Icon 
              name={leftIcon} 
              size={iconSize} 
              className="btn__left-icon" 
            />
          )}
          <span className="btn__content">{children}</span>
          {rightIcon && (
            <Icon 
              name={rightIcon} 
              size={iconSize} 
              className="btn__right-icon" 
            />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
