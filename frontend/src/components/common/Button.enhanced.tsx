import React from 'react';
import classNames from 'classnames';
import { Icon, IconName, LoadingIcon } from './Icon';

// ====================
// ENHANCED TYPE DEFINITIONS
// ====================

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonShape = 'default' | 'rounded';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button shape */
  shape?: ButtonShape;
  /** Show loading state */
  isLoading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Icon to show on the left */
  leftIcon?: IconName;
  /** Icon to show on the right */
  rightIcon?: IconName;
  /** Icon-only button (hides text content) */
  iconOnly?: boolean;
  /** Custom loading text */
  loadingText?: string;
  /** Tooltip text for accessibility */
  tooltip?: string;
  /** Button content */
  children: React.ReactNode;
}

// ====================
// COMPONENT IMPLEMENTATION
// ====================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  loadingText,
  tooltip,
  children,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  
  // ====================
  // CLASS NAME GENERATION
  // ====================
  
  const buttonClasses = classNames(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    {
      'btn--rounded': shape === 'rounded',
      'btn--full-width': fullWidth,
      'btn--loading': isLoading,
      'btn--disabled': disabled,
      'btn--icon-only': iconOnly,
    },
    className
  );

  // ====================
  // ICON SIZE CALCULATION
  // ====================
  
  const getIconSize = (): number => {
    switch (size) {
      case 'xs': return 12;
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 20;
      case 'xl': return 24;
      default: return 16;
    }
  };

  const iconSize = getIconSize();

  // ====================
  // ACCESSIBILITY PROPS
  // ====================
  
  const accessibilityProps = {
    'aria-label': ariaLabel || tooltip || (iconOnly ? String(children) : undefined),
    'aria-disabled': isLoading || disabled,
    'aria-busy': isLoading,
    'title': tooltip,
  };

  // ====================
  // CONTENT RENDERING
  // ====================
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingIcon size={iconSize} className="btn__loading-icon" />
          {!iconOnly && (
            <span className="btn__content">
              {loadingText || children}
            </span>
          )}
        </>
      );
    }

    if (iconOnly) {
      // Icon-only button: show only the icon
      const iconToShow = leftIcon || rightIcon;
      return iconToShow ? (
        <Icon 
          name={iconToShow} 
          size={iconSize} 
          className="btn__icon" 
        />
      ) : null;
    }

    // Regular button with optional icons
    return (
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
    );
  };

  // ====================
  // COMPONENT RENDER
  // ====================
  
  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...accessibilityProps}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// ====================
// BUTTON GROUP COMPONENT
// ====================

export interface ButtonGroupProps {
  /** Group orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size for all buttons in group */
  size?: ButtonSize;
  /** Variant for all buttons in group */
  variant?: ButtonVariant;
  /** Full width group */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Button group content */
  children: React.ReactNode;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  orientation = 'horizontal',
  size,
  variant,
  fullWidth = false,
  className = '',
  children,
}) => {
  const groupClasses = classNames(
    'btn-group',
    {
      'btn-group--vertical': orientation === 'vertical',
      'btn-group--full-width': fullWidth,
    },
    className
  );

  // Clone children to pass down size and variant props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === Button) {
      return React.cloneElement(child, {
        size: child.props.size || size,
        variant: child.props.variant || variant,
        fullWidth: fullWidth ? true : child.props.fullWidth,
      });
    }
    return child;
  });

  return (
    <div className={groupClasses} role="group">
      {enhancedChildren}
    </div>
  );
};

// ====================
// SPECIALIZED BUTTON COMPONENTS
// ====================

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconOnly'> {
  /** Icon to display */
  icon: IconName;
  /** Accessible label */
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      leftIcon={icon}
      iconOnly
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

// ====================
// FLOATING ACTION BUTTON
// ====================

export interface FABProps extends Omit<ButtonProps, 'variant' | 'shape'> {
  /** FAB position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Extend FAB with text */
  extended?: boolean;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  position = 'bottom-right',
  extended = false,
  className = '',
  ...props
}) => {
  const fabClasses = classNames(
    'fab',
    `fab--${position}`,
    {
      'fab--extended': extended,
    },
    className
  );

  return (
    <Button
      variant="primary"
      shape="rounded"
      size={extended ? 'lg' : 'md'}
      className={fabClasses}
      {...props}
    />
  );
};

FloatingActionButton.displayName = 'FloatingActionButton';

// ====================
// EXPORT DEFAULT
// ====================

export default Button;