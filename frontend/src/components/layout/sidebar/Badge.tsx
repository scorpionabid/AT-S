import React, { memo } from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps {
  type?: 'count' | 'status' | 'notification' | 'indicator';
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  text?: string;
  pulse?: boolean;
  show?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = memo(({
  type = 'count',
  variant = 'primary',
  size = 'md',
  count,
  text,
  pulse = false,
  show = true,
  className = ''
}) => {
  if (!show) return null;

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]',
      success: 'bg-[var(--color-success-100)] text-[var(--color-success-700)] border-[var(--color-success-200)]',
      warning: 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)] border-[var(--color-warning-200)]',
      error: 'bg-[var(--color-error-100)] text-[var(--color-error-700)] border-[var(--color-error-200)]',
      info: 'bg-[var(--color-info-100)] text-[var(--color-info-700)] border-[var(--color-info-200)]',
      neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)]'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-4 min-w-4 text-xs px-1',
      md: 'h-5 min-w-5 text-xs px-1.5',
      lg: 'h-6 min-w-6 text-sm px-2'
    };
    return sizes[size];
  };

  const getContent = () => {
    if (type === 'count') {
      if (count === undefined || count === null) return null;
      if (count === 0) return null;
      return count > 99 ? '99+' : count.toString();
    }
    
    if (type === 'status' || type === 'notification') {
      return text || '';
    }
    
    if (type === 'indicator') {
      return null; // Just a dot
    }
    
    return text || count?.toString() || '';
  };

  const content = getContent();
  
  // Don't render if no content (except for indicator type)
  if (content === null && type !== 'indicator') return null;

  const baseClasses = cn(
    'inline-flex items-center justify-center',
    'font-medium leading-none',
    'border',
    'transition-all duration-200 ease-out',
    getSizeClasses(),
    getVariantClasses(),
    {
      'rounded-full': type === 'count' || type === 'indicator',
      'rounded-md': type === 'status' || type === 'notification',
      'pulse-animation': pulse,
      'badge-bounce': pulse && type === 'count'
    },
    className
  );

  // Special styling for indicator type
  if (type === 'indicator') {
    return (
      <span 
        className={cn(
          'w-2.5 h-2.5 rounded-full border-2 border-[var(--sidebar-bg)]',
          {
            'bg-[var(--sidebar-online-indicator)]': variant === 'success',
            'bg-[var(--sidebar-offline-indicator)]': variant === 'neutral',
            'bg-[var(--sidebar-away-indicator)]': variant === 'warning',
            'bg-[var(--color-error-500)]': variant === 'error',
            'bg-[var(--color-info-500)]': variant === 'info',
            'bg-[var(--color-primary-500)]': variant === 'primary',
            'pulse-animation': pulse
          },
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <span 
      className={baseClasses}
      title={type === 'count' ? `${count} items` : text}
      aria-label={type === 'count' ? `${count} items` : text}
    >
      {content}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;