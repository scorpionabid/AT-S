// ====================
// ATİS Card Component - Tailwind Migration
// Unified card system with variants and compositions
// ====================

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Card variants using class-variance-authority
const cardVariants = cva(
  // Base styles
  'bg-white rounded-lg border transition-colors',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 shadow-card',
        elevated: 'border-neutral-200 shadow-card-elevated',
        outlined: 'border-neutral-300 shadow-none',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'border-transparent shadow-card bg-gradient-to-br from-primary-500 to-primary-600 text-white',
        success: 'border-success-200 bg-success-50 shadow-sm',
        warning: 'border-warning-200 bg-warning-50 shadow-sm',
        error: 'border-error-200 bg-error-50 shadow-sm',
        info: 'border-info-200 bg-info-50 shadow-sm',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-card-elevated transition-all duration-200',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** 
   * Card content 
   */
  children: React.ReactNode;
  /** 
   * Whether card is clickable/interactive 
   */
  interactive?: boolean;
  /** 
   * Loading state 
   */
  loading?: boolean;
  /** 
   * Disabled state 
   */
  disabled?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive = false,
    loading = false,
    disabled = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(
          cardVariants({ variant, size, interactive }),
          disabled && 'opacity-50 pointer-events-none',
          loading && 'animate-pulse',
          className
        )}
        ref={ref}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ====================
// Card Sub-components
// ====================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 
   * Actions for the header (buttons, etc.) 
   */
  actions?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, actions, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between space-y-1.5 pb-4 border-b border-neutral-100',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {children}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  /** 
   * Title level (h1-h6) 
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, level = 3, ...props }, ref) => {
    const Heading = `h${level}` as keyof JSX.IntrinsicElements;
    
    const titleClasses = {
      1: 'text-2xl font-bold tracking-tight',
      2: 'text-xl font-semibold tracking-tight',
      3: 'text-lg font-semibold leading-none tracking-tight',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold uppercase tracking-wide',
    };

    return (
      <Heading
        ref={ref}
        className={cn(
          titleClasses[level],
          'text-neutral-900',
          className
        )}
        {...props}
      >
        {children}
      </Heading>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-600 leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 
   * Justify content alignment 
   */
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, justify = 'end', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-4 border-t border-neutral-100',
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ====================
// Specialized Card Components
// ====================

interface StatsCardProps extends Omit<CardProps, 'children'> {
  /** 
   * Main statistic value 
   */
  value: string | number;
  /** 
   * Label for the statistic 
   */
  label: string;
  /** 
   * Optional change indicator 
   */
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  /** 
   * Optional icon 
   */
  icon?: React.ReactNode;
  /** 
   * Trend direction 
   */
  trend?: 'up' | 'down' | 'flat';
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ value, label, change, icon, trend, className, ...props }, ref) => (
    <Card ref={ref} className={cn('text-center', className)} {...props}>
      <div className="space-y-3">
        {icon && (
          <div className="flex justify-center">
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
              {icon}
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-neutral-900">
            {value}
          </div>
          <div className="text-sm text-neutral-600">
            {label}
          </div>
        </div>

        {change && (
          <div className="flex items-center justify-center space-x-1">
            <span
              className={cn(
                'text-sm font-medium',
                change.type === 'increase' && 'text-success-600',
                change.type === 'decrease' && 'text-error-600',
                change.type === 'neutral' && 'text-neutral-600'
              )}
            >
              {change.type === 'increase' && '↗'}
              {change.type === 'decrease' && '↘'}
              {change.type === 'neutral' && '→'}
              {change.value}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
);

StatsCard.displayName = 'StatsCard';

interface FeatureCardProps extends Omit<CardProps, 'children'> {
  /** 
   * Feature title 
   */
  title: string;
  /** 
   * Feature description 
   */
  description: string;
  /** 
   * Optional icon 
   */
  icon?: React.ReactNode;
  /** 
   * Optional image 
   */
  image?: string;
  /** 
   * Optional actions 
   */
  actions?: React.ReactNode;
  /** 
   * Feature status 
   */
  status?: 'active' | 'inactive' | 'coming-soon';
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    title, 
    description, 
    icon, 
    image, 
    actions, 
    status = 'active',
    className, 
    ...props 
  }, ref) => (
    <Card 
      ref={ref} 
      className={cn(
        'relative overflow-hidden',
        status === 'inactive' && 'opacity-60',
        className
      )} 
      {...props}
    >
      {status === 'coming-soon' && (
        <div className="absolute top-2 right-2 bg-warning-500 text-white text-xs px-2 py-1 rounded-full">
          Gələcəkdə
        </div>
      )}

      {image && (
        <div className="aspect-video bg-neutral-100 rounded-t-lg mb-4 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          {icon && (
            <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg text-primary-600">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <CardTitle level={4}>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>

        {actions && (
          <div className="pt-3 border-t border-neutral-100">
            {actions}
          </div>
        )}
      </div>
    </Card>
  )
);

FeatureCard.displayName = 'FeatureCard';

// ====================
// Card Grid Layout
// ====================

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 
   * Grid columns configuration 
   */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** 
   * Gap between cards 
   */
  gap?: 'sm' | 'md' | 'lg';
}

const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ 
    children, 
    cols = { default: 1, md: 2, lg: 3 },
    gap = 'md',
    className, 
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    };

    const gridCols = [
      cols.default && `grid-cols-${cols.default}`,
      cols.sm && `sm:grid-cols-${cols.sm}`,
      cols.md && `md:grid-cols-${cols.md}`,
      cols.lg && `lg:grid-cols-${cols.lg}`,
      cols.xl && `xl:grid-cols-${cols.xl}`,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardGrid.displayName = 'CardGrid';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatsCard,
  FeatureCard,
  CardGrid,
  cardVariants,
};