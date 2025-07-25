import React from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';

// ====================
// TYPE DEFINITIONS
// ====================

export type FormSize = 'sm' | 'md' | 'lg';
export type FormLayout = 'vertical' | 'horizontal' | 'inline';
export type FieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InputState = 'default' | 'error' | 'success' | 'warning';

// ====================
// FORM COMPONENT
// ====================

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form size */
  size?: FormSize;
  /** Form layout */
  layout?: FormLayout;
  /** Additional CSS classes */
  className?: string;
  /** Form content */
  children: React.ReactNode;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(({
  size = 'md',
  layout = 'vertical',
  className = '',
  children,
  ...props
}, ref) => {
  const formClasses = classNames(
    'form',
    {
      [`form--${size}`]: size !== 'md',
      [`form--${layout}`]: layout !== 'vertical',
    },
    className
  );

  return (
    <form
      ref={ref}
      className={formClasses}
      {...props}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';

// ====================
// FORM SECTION COMPONENT
// ====================

export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Section content */
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  className = '',
  children,
}) => (
  <div className={classNames('form__section', className)}>
    {title && <h3 className="form__section-title">{title}</h3>}
    {description && <p className="form__section-description">{description}</p>}
    {children}
  </div>
);

FormSection.displayName = 'FormSection';

// ====================
// FORM GROUP COMPONENT
// ====================

export interface FormGroupProps {
  /** Layout style */
  layout?: 'default' | 'inline' | 'horizontal';
  /** Full width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Group content */
  children: React.ReactNode;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  layout = 'default',
  fullWidth = false,
  className = '',
  children,
}) => {
  const groupClasses = classNames(
    'form-group',
    {
      'form-group--inline': layout === 'inline',
      'form-group--horizontal': layout === 'horizontal',
      'form-group--full': fullWidth,
    },
    className
  );

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

FormGroup.displayName = 'FormGroup';

// ====================
// FORM LABEL COMPONENT
// ====================

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Required field indicator */
  required?: boolean;
  /** Optional field indicator */
  optional?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Label content */
  children: React.ReactNode;
}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(({
  required = false,
  optional = false,
  disabled = false,
  className = '',
  children,
  ...props
}, ref) => {
  const labelClasses = classNames(
    'form-label',
    {
      'form-label--required': required,
      'form-label--optional': optional,
      'form-label--disabled': disabled,
    },
    className
  );

  return (
    <label
      ref={ref}
      className={labelClasses}
      {...props}
    >
      {children}
    </label>
  );
});

FormLabel.displayName = 'FormLabel';

// ====================
// INPUT COMPONENT
// ====================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize;
  /** Input state */
  state?: InputState;
  /** Left icon */
  leftIcon?: IconName;
  /** Right icon */
  rightIcon?: IconName;
  /** Right icon click handler */
  onRightIconClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Wrapper CSS classes */
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  state = 'default',
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  const hasIcons = leftIcon || rightIcon;
  
  const inputClasses = classNames(
    'form-control',
    'input',
    {
      [`input--${size}`]: size !== 'md',
      [`form-control--${state}`]: state !== 'default',
      'form-control--left-icon': leftIcon,
      'form-control--right-icon': rightIcon,
    },
    className
  );

  const wrapperClasses = classNames(
    {
      'input-with-icon': hasIcons,
    },
    wrapperClassName
  );

  if (hasIcons) {
    return (
      <div className={wrapperClasses}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            className="input-icon input-icon--left"
          />
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <Icon
            name={rightIcon}
            className={classNames(
              'input-icon input-icon--right',
              {
                'input-icon--clickable': onRightIconClick,
              }
            )}
            onClick={onRightIconClick}
          />
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={inputClasses}
      {...props}
    />
  );
});

Input.displayName = 'Input';

// ====================
// TEXTAREA COMPONENT
// ====================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Auto resize */
  autoResize?: boolean;
  /** Disable resize */
  noResize?: boolean;
  /** Input state */
  state?: InputState;
  /** Additional CSS classes */
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  autoResize = false,
  noResize = false,
  state = 'default',
  className = '',
  ...props
}, ref) => {
  const textareaClasses = classNames(
    'form-control',
    'textarea',
    {
      'textarea--auto-resize': autoResize,
      'textarea--no-resize': noResize,
      [`form-control--${state}`]: state !== 'default',
    },
    className
  );

  return (
    <textarea
      ref={ref}
      className={textareaClasses}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

// ====================
// SELECT COMPONENT
// ====================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Input state */
  state?: InputState;
  /** Select options */
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Placeholder option */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children for custom options */
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  state = 'default',
  options = [],
  placeholder,
  className = '',
  children,
  ...props
}, ref) => {
  const selectClasses = classNames(
    'form-control',
    'select',
    {
      [`form-control--${state}`]: state !== 'default',
    },
    className
  );

  return (
    <select
      ref={ref}
      className={selectClasses}
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
        >
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});

Select.displayName = 'Select';

// ====================
// CHECKBOX COMPONENT
// ====================

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  className = '',
  labelClassName = '',
  disabled,
  children,
  ...props
}, ref) => {
  const checkboxClasses = classNames(
    'checkbox',
    {
      'checkbox--disabled': disabled,
    },
    className
  );

  const labelClasses = classNames(
    'checkbox__label',
    {
      'checkbox__label--disabled': disabled,
    },
    labelClassName
  );

  return (
    <div className={checkboxClasses}>
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        {...props}
      />
      {(label || children) && (
        <span className={labelClasses}>
          {label || children}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// ====================
// RADIO COMPONENT
// ====================

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Radio label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({
  label,
  className = '',
  labelClassName = '',
  disabled,
  children,
  ...props
}, ref) => {
  const radioClasses = classNames(
    'radio',
    {
      'radio--disabled': disabled,
    },
    className
  );

  const labelClasses = classNames(
    'radio__label',
    {
      'radio__label--disabled': disabled,
    },
    labelClassName
  );

  return (
    <div className={radioClasses}>
      <input
        ref={ref}
        type="radio"
        disabled={disabled}
        {...props}
      />
      {(label || children) && (
        <span className={labelClasses}>
          {label || children}
        </span>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

// ====================
// SWITCH COMPONENT
// ====================

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Switch label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  className = '',
  labelClassName = '',
  disabled,
  children,
  ...props
}, ref) => {
  const switchClasses = classNames(
    'switch',
    {
      'switch--disabled': disabled,
    },
    className
  );

  const labelClasses = classNames(
    'switch__label',
    {
      'switch__label--disabled': disabled,
    },
    labelClassName
  );

  return (
    <div className={switchClasses}>
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        {...props}
      />
      {(label || children) && (
        <span className={labelClasses}>
          {label || children}
        </span>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

// ====================
// FORM FEEDBACK COMPONENTS
// ====================

export interface FormHelpProps {
  /** Additional CSS classes */
  className?: string;
  /** Help content */
  children: React.ReactNode;
}

export const FormHelp: React.FC<FormHelpProps> = ({
  className = '',
  children,
}) => (
  <div className={classNames('form-help', className)}>
    {children}
  </div>
);

FormHelp.displayName = 'FormHelp';

export interface FormErrorProps {
  /** Additional CSS classes */
  className?: string;
  /** Error content */
  children: React.ReactNode;
}

export const FormError: React.FC<FormErrorProps> = ({
  className = '',
  children,
}) => (
  <div className={classNames('form-error', className)}>
    <Icon name="alert-circle" />
    {children}
  </div>
);

FormError.displayName = 'FormError';

export interface FormSuccessProps {
  /** Additional CSS classes */
  className?: string;
  /** Success content */
  children: React.ReactNode;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({
  className = '',
  children,
}) => (
  <div className={classNames('form-success', className)}>
    <Icon name="check-circle" />
    {children}
  </div>
);

FormSuccess.displayName = 'FormSuccess';

export interface FormWarningProps {
  /** Additional CSS classes */
  className?: string;
  /** Warning content */
  children: React.ReactNode;
}

export const FormWarning: React.FC<FormWarningProps> = ({
  className = '',
  children,
}) => (
  <div className={classNames('form-warning', className)}>
    <Icon name="alert-triangle" />
    {children}
  </div>
);

FormWarning.displayName = 'FormWarning';

// ====================
// FORM ACTIONS COMPONENT
// ====================

export interface FormActionsProps {
  /** Actions alignment */
  align?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Additional CSS classes */
  className?: string;
  /** Actions content */
  children: React.ReactNode;
}

export const FormActions: React.FC<FormActionsProps> = ({
  align = 'end',
  className = '',
  children,
}) => {
  const actionsClasses = classNames(
    'form-actions',
    {
      [`form-actions--${align}`]: align !== 'end',
    },
    className
  );

  return (
    <div className={actionsClasses}>
      {children}
    </div>
  );
};

FormActions.displayName = 'FormActions';

// ====================
// FIELDSET COMPONENT
// ====================

export interface FieldsetProps {
  /** Fieldset legend */
  legend?: string;
  /** Additional CSS classes */
  className?: string;
  /** Legend CSS classes */
  legendClassName?: string;
  /** Fieldset content */
  children: React.ReactNode;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  legend,
  className = '',
  legendClassName = '',
  children,
}) => (
  <fieldset className={classNames('fieldset', className)}>
    {legend && (
      <legend className={classNames('fieldset__legend', legendClassName)}>
        {legend}
      </legend>
    )}
    <div className="fieldset__content">
      {children}
    </div>
  </fieldset>
);

Fieldset.displayName = 'Fieldset';

// ====================
// FORM GRID COMPONENT
// ====================

export interface FormGridProps {
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4 | 'auto-fit';
  /** Additional CSS classes */
  className?: string;
  /** Grid content */
  children: React.ReactNode;
}

export const FormGrid: React.FC<FormGridProps> = ({
  columns = 2,
  className = '',
  children,
}) => {
  const gridClasses = classNames(
    'form-grid',
    {
      [`form-grid--cols-${columns}`]: typeof columns === 'number',
      'form-grid--auto-fit': columns === 'auto-fit',
    },
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

FormGrid.displayName = 'FormGrid';

// ====================
// COMPOUND FIELD COMPONENT
// ====================

export interface FieldProps {
  /** Field label */
  label?: string;
  /** Required field */
  required?: boolean;
  /** Optional field */
  optional?: boolean;
  /** Help text */
  help?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Warning message */
  warning?: string;
  /** Field layout */
  layout?: 'default' | 'inline' | 'horizontal';
  /** Additional CSS classes */
  className?: string;
  /** Field content */
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  required = false,
  optional = false,
  help,
  error,
  success,
  warning,
  layout = 'default',
  className = '',
  children,
}) => (
  <FormGroup layout={layout} className={className}>
    {label && (
      <FormLabel required={required} optional={optional}>
        {label}
      </FormLabel>
    )}
    {children}
    {help && !error && !success && !warning && (
      <FormHelp>{help}</FormHelp>
    )}
    {error && <FormError>{error}</FormError>}
    {success && <FormSuccess>{success}</FormSuccess>}
    {warning && <FormWarning>{warning}</FormWarning>}
  </FormGroup>
);

Field.displayName = 'Field';

// ====================
// EXPORT ALL COMPONENTS
// ====================

export default Form;