import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  as?: React.ElementType;
  hoverable?: boolean;
  bordered?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | 'none';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className = '',
  as: Component = 'div',
  hoverable = false,
  bordered = true,
  shadow = 'md',
  rounded = 'lg',
  padding = 'md',
  fullWidth = false,
  fullHeight = false,
  children,
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg',
    '2xl': 'shadow-xl',
    inner: 'shadow-inner',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const classes = classNames(
    'bg-white',
    bordered && 'border border-gray-200',
    shadowClasses[shadow],
    roundedClasses[rounded],
    paddingClasses[padding],
    {
      'w-full': fullWidth,
      'h-full': fullHeight,
      'transition-all duration-200 ease-in-out': hoverable,
      'hover:shadow-lg hover:-translate-y-0.5': hoverable && shadow !== 'none',
      'hover:border-gray-300': hoverable && bordered,
    },
    className
  );

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  as?: React.ElementType;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', as: Component = 'div', ...props }, ref) => (
    <Component
      ref={ref}
      className={classNames('px-4 py-5 sm:px-6', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={classNames('text-lg font-medium leading-6 text-gray-900', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  as?: React.ElementType;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', as: Component = 'p', ...props }, ref) => (
    <Component
      ref={ref}
      className={classNames('mt-1 text-sm text-gray-500', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  as?: React.ElementType;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', as: Component = 'div', padding = 'md', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
      xl: 'px-8 py-6',
    };

    return (
      <Component
        ref={ref}
        className={classNames(paddingClasses[padding], className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  as?: React.ElementType;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', as: Component = 'div', ...props }, ref) => (
    <Component
      ref={ref}
      className={classNames('px-4 py-4 sm:px-6 bg-gray-50 rounded-b-lg', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

export default Card;
