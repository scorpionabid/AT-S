import React from 'react';
import classNames from 'classnames';

type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark'
  | 'outline';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  dotClassName?: string;
  className?: string;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
  light: 'bg-gray-50 text-gray-800',
  dark: 'bg-gray-800 text-white',
  outline: 'bg-white text-gray-700 border border-gray-300',
};

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  pill = false,
  dot = false,
  dotClassName = '',
  className = '',
  children,
  ...props
}) => {
  const badgeClasses = classNames(
    'inline-flex items-center font-medium leading-5',
    variantClasses[variant],
    sizeClasses[size],
    {
      'rounded-full': pill,
      'rounded-md': !pill,
    },
    className
  );

  const dotSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const dotVariantClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500',
    light: 'bg-gray-400',
    dark: 'bg-gray-600',
    outline: 'bg-gray-500',
  };

  const dotClasses = classNames(
    'rounded-full mr-1.5 flex-shrink-0',
    dotSizeClasses[size],
    dotVariantClasses[variant],
    dotClassName
  );

  return (
    <span className={badgeClasses} {...props}>
      {dot && <span className={dotClasses} aria-hidden="true" />}
      {children}
    </span>
  );
};

// Status Badge Component
type StatusVariant = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'published' | 'archived';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: StatusVariant;
  showText?: boolean;
  children?: React.ReactNode;
}

const statusVariants: Record<StatusVariant, { variant: BadgeVariant; icon: string; text: string }> = {
  active: { variant: 'success', icon: '✓', text: 'Aktiv' },
  inactive: { variant: 'secondary', icon: '○', text: 'Qeyri-aktiv' },
  pending: { variant: 'warning', icon: '…', text: 'Gözləyir' },
  approved: { variant: 'success', icon: '✓', text: 'Təsdiqlənib' },
  rejected: { variant: 'danger', icon: '✕', text: 'Rədd edilib' },
  draft: { variant: 'secondary', icon: '✎', text: 'Qaralama' },
  published: { variant: 'success', icon: '✓', text: 'Dərc edilib' },
  archived: { variant: 'dark', icon: '🗄', text: 'Arxivləşdirilib' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = true,
  children,
  className = '',
  ...props
}) => {
  const statusConfig = statusVariants[status] || statusVariants.inactive;
  
  return (
    <Badge
      variant={statusConfig.variant}
      className={`inline-flex items-center ${className}`}
      {...props}
    >
      <span className="mr-1" aria-hidden="true">
        {statusConfig.icon}
      </span>
      {showText ? statusConfig.text : null}
      {children}
    </Badge>
  );
};

export default Badge;
