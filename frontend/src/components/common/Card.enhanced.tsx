import React from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';

// ====================
// ENHANCED TYPE DEFINITIONS
// ====================

export type CardVariant = 'default' | 'stats' | 'feature' | 'notification';
export type CardElevation = 'flat' | 'raised' | 'elevated' | 'floating';
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CardSpacing = 'none' | 'compact' | 'comfortable' | 'spacious';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card visual style variant */
  variant?: CardVariant;
  /** Card elevation level */
  elevation?: CardElevation;
  /** Card size */
  size?: CardSize;
  /** Card internal spacing */
  spacing?: CardSpacing;
  /** Make card hoverable with hover effects */
  hoverable?: boolean;
  /** Make card clickable */
  clickable?: boolean;
  /** Make card selectable */
  selectable?: boolean;
  /** Selected state for selectable cards */
  selected?: boolean;
  /** Full width card */
  fullWidth?: boolean;
  /** Full height card */
  fullHeight?: boolean;
  /** Horizontal layout */
  horizontal?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children: React.ReactNode;
  /** Click handler for clickable cards */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// ====================
// MAIN CARD COMPONENT
// ====================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  elevation = 'raised',
  size = 'md',
  spacing = 'comfortable',
  hoverable = false,
  clickable = false,
  selectable = false,
  selected = false,
  fullWidth = false,
  fullHeight = false,
  horizontal = false,
  className = '',
  children,
  onClick,
  ...props
}, ref) => {
  
  // ====================
  // CLASS NAME GENERATION
  // ====================
  
  const cardClasses = classNames(
    'card',
    `card--${elevation}`,
    `card--${size}`,
    {
      [`card--${variant}`]: variant !== 'default',
      [`card--${spacing}`]: spacing !== 'comfortable',
      'card--hoverable': hoverable,
      'card--clickable': clickable,
      'card--selectable': selectable,
      'card--selected': selected && selectable,
      'card--full-width': fullWidth,
      'card--full-height': fullHeight,
      'card--horizontal': horizontal,
    },
    className
  );

  // ====================
  // ACCESSIBILITY PROPS
  // ====================
  
  const accessibilityProps = {
    role: clickable || selectable ? 'button' : undefined,
    tabIndex: clickable || selectable ? 0 : undefined,
    'aria-pressed': selectable ? selected : undefined,
    'aria-disabled': props['aria-disabled'],
  };

  // ====================
  // EVENT HANDLERS
  // ====================
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (clickable || selectable) {
      onClick?.(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((clickable || selectable) && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
  };

  // ====================
  // COMPONENT RENDER
  // ====================
  
  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// ====================
// CARD HEADER COMPONENT
// ====================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Header content */
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={classNames('card__header', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

// ====================
// CARD TITLE COMPONENT
// ====================

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** HTML heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Additional CSS classes */
  className?: string;
  /** Title content */
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({
  as: Component = 'h3',
  className = '',
  children,
  ...props
}, ref) => (
  <Component
    ref={ref}
    className={classNames('card__title', className)}
    {...props}
  >
    {children}
  </Component>
));

CardTitle.displayName = 'CardTitle';

// ====================
// CARD SUBTITLE COMPONENT
// ====================

export interface CardSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional CSS classes */
  className?: string;
  /** Subtitle content */
  children: React.ReactNode;
}

export const CardSubtitle = React.forwardRef<HTMLParagraphElement, CardSubtitleProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={classNames('card__subtitle', className)}
    {...props}
  >
    {children}
  </p>
));

CardSubtitle.displayName = 'CardSubtitle';

// ====================
// CARD DESCRIPTION COMPONENT
// ====================

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional CSS classes */
  className?: string;
  /** Description content */
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={classNames('card__description', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

// ====================
// CARD CONTENT COMPONENT
// ====================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Content */
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={classNames('card__content', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

// ====================
// CARD FOOTER COMPONENT
// ====================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Footer content */
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={classNames('card__footer', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

// ====================
// CARD ACTIONS COMPONENT
// ====================

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Actions alignment */
  align?: 'start' | 'center' | 'end' | 'between';
  /** Additional CSS classes */
  className?: string;
  /** Actions content */
  children: React.ReactNode;
}

export const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(({
  align = 'end',
  className = '',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={classNames(
      'card__actions',
      {
        'card__actions--center': align === 'center',
        'card__actions--between': align === 'between',
        'card__actions--end': align === 'end',
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
));

CardActions.displayName = 'CardActions';

// ====================
// CARD IMAGE COMPONENT
// ====================

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image fit style */
  fit?: 'cover' | 'contain';
  /** Additional CSS classes */
  className?: string;
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(({
  fit = 'cover',
  className = '',
  ...props
}, ref) => (
  <img
    ref={ref}
    className={classNames(
      'card__image',
      {
        'card__image--cover': fit === 'cover',
        'card__image--contain': fit === 'contain',
      },
      className
    )}
    {...props}
  />
));

CardImage.displayName = 'CardImage';

// ====================
// CARD AVATAR COMPONENT
// ====================

export interface CardAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Additional CSS classes */
  className?: string;
}

export const CardAvatar = React.forwardRef<HTMLImageElement, CardAvatarProps>(({
  className = '',
  ...props
}, ref) => (
  <img
    ref={ref}
    className={classNames('card__avatar', className)}
    {...props}
  />
));

CardAvatar.displayName = 'CardAvatar';

// ====================
// CARD ICON COMPONENT
// ====================

export interface CardIconProps {
  /** Icon name */
  name: IconName;
  /** Additional CSS classes */
  className?: string;
}

export const CardIcon: React.FC<CardIconProps> = ({
  name,
  className = '',
}) => (
  <Icon
    name={name}
    className={classNames('card__icon', className)}
  />
);

CardIcon.displayName = 'CardIcon';

// ====================
// CARD META COMPONENT
// ====================

export interface CardMetaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Meta content */
  children: React.ReactNode;
}

export const CardMeta = React.forwardRef<HTMLDivElement, CardMetaProps>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={classNames('card__meta', className)}
    {...props}
  >
    {children}
  </div>
));

CardMeta.displayName = 'CardMeta';

// ====================
// CARD BADGE COMPONENT
// ====================

export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  /** Additional CSS classes */
  className?: string;
  /** Badge content */
  children: React.ReactNode;
}

export const CardBadge = React.forwardRef<HTMLSpanElement, CardBadgeProps>(({
  variant = 'neutral',
  className = '',
  children,
  ...props
}, ref) => (
  <span
    ref={ref}
    className={classNames(
      'card__badge',
      `card__badge--${variant}`,
      className
    )}
    {...props}
  >
    {children}
  </span>
));

CardBadge.displayName = 'CardBadge';

// ====================
// CARD DIVIDER COMPONENT
// ====================

export interface CardDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Additional CSS classes */
  className?: string;
}

export const CardDivider = React.forwardRef<HTMLHRElement, CardDividerProps>(({
  className = '',
  ...props
}, ref) => (
  <hr
    ref={ref}
    className={classNames('card__divider', className)}
    {...props}
  />
));

CardDivider.displayName = 'CardDivider';

// ====================
// SPECIALIZED CARD COMPONENTS
// ====================

// Stats Card Component
export interface StatsCardProps extends Omit<CardProps, 'variant' | 'children'> {
  /** Main statistic value */
  value: string | number;
  /** Statistic label */
  label: string;
  /** Change indicator */
  change?: {
    value: string | number;
    type: 'positive' | 'negative';
    label?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(({
  value,
  label,
  change,
  className = '',
  ...props
}, ref) => (
  <Card
    ref={ref}
    variant="stats"
    className={className}
    {...props}
  >
    <CardContent>
      <div className="card__value">{value}</div>
      <div className="card__label">{label}</div>
      {change && (
        <div className={classNames(
          'card__change',
          `card__change--${change.type}`
        )}>
          {change.value} {change.label}
        </div>
      )}
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

// Feature Card Component
export interface FeatureCardProps extends Omit<CardProps, 'variant' | 'children'> {
  /** Feature icon */
  icon: IconName;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Additional CSS classes */
  className?: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(({
  icon,
  title,
  description,
  className = '',
  ...props
}, ref) => (
  <Card
    ref={ref}
    variant="feature"
    className={className}
    {...props}
  >
    <CardContent>
      <CardIcon name={icon} />
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

// ====================
// EXPORT ALL COMPONENTS
// ====================

export default Card;