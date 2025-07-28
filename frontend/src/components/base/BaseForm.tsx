/**
 * ATİS Base Form Component
 * Universal form component useForm hook ilə inteqrasiya
 */

import React, { ReactNode } from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';
import { useForm, FormConfig, FormField, FormSection } from '../../hooks/useForm';

export interface BaseFormProps<T extends Record<string, any>> {
  // Form configuration
  config: FormConfig<T>;
  
  // Form options
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFieldChange?: (name: keyof T, value: any) => void;
  transformSubmitData?: (data: T) => any;
  transformResponseData?: (data: any) => T;
  
  // Styling
  variant?: 'default' | 'minimal' | 'sectioned';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  
  // Behavior
  showSubmitButton?: boolean;
  submitButtonText?: string;
  showResetButton?: boolean;
  resetButtonText?: string;
  disabled?: boolean;
  
  // Custom rendering
  renderField?: (field: FormField, value: any, onChange: (value: any) => void, error?: string) => ReactNode;
  renderSection?: (section: FormSection, fields: ReactNode[]) => ReactNode;
  renderActions?: (submitButton: ReactNode, resetButton: ReactNode) => ReactNode;
  
  // Additional content
  header?: ReactNode;
  footer?: ReactNode;
  
  // CSS
  className?: string;
}

export function BaseForm<T extends Record<string, any>>({
  config,
  onSuccess,
  onError,
  onFieldChange,
  transformSubmitData,
  transformResponseData,
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  showSubmitButton = true,
  submitButtonText = 'Yadda saxla',
  showResetButton = false,
  resetButtonText = 'Sıfırla',
  disabled = false,
  renderField,
  renderSection,
  renderActions,
  header,
  footer,
  className = ''
}: BaseFormProps<T>) {
  
  // Use form hook
  const form = useForm(config, {
    onSuccess,
    onError,
    onFieldChange,
    transformSubmitData,
    transformResponseData
  });

  // Size configurations
  const sizeConfigs = {
    sm: {
      input: 'sm' as const,
      button: 'sm' as const,
      text: 'sm' as const,
      spacing: '3' as const
    },
    md: {
      input: 'md' as const,
      button: 'md' as const,
      text: 'base' as const,
      spacing: '4' as const
    },
    lg: {
      input: 'lg' as const,
      button: 'lg' as const,
      text: 'lg' as const,
      spacing: '6' as const
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Render individual field
  const renderFormField = (field: FormField) => {
    const value = form.getFieldValue(field.name as keyof T);
    const error = form.getFieldError(field.name as keyof T);
    const touched = form.isFieldTouched(field.name as keyof T);
    const showError = touched && error;
    
    // Custom field renderer
    if (renderField) {
      return renderField(field, value, (newValue) => form.setValue(field.name as keyof T, newValue), error || undefined);
    }

    // Grid column classes
    const gridCols = field.gridCols || 12;
    const gridStyle = {
      flex: layout === 'horizontal' ? `0 0 ${(gridCols / 12) * 100}%` : '1 1 auto'
    };

    // Dependent options for select fields
    const options = field.type === 'select' ? 
      (field.dependency ? 
        form.getDependentOptions(field.name, form.getFieldValue(field.dependency as keyof T)) :
        form.getDependentOptions(field.name)
      ) : [];

    return (
      <div key={field.name} style={gridStyle}>
        <div style={styles.mb(sizeConfig.spacing)}>
          {/* Label */}
          <label 
            htmlFor={field.name}
            style={{
              ...styles.text(sizeConfig.text, 'medium'),
              ...styles.mb('2'),
              display: 'block',
              color: showError ? StyleSystem.tokens.colors.danger[600] : StyleSystem.tokens.colors.gray[700]
            }}
          >
            {field.label}
            {field.required && (
              <span style={{ color: StyleSystem.tokens.colors.danger[500] }}>*</span>
            )}
          </label>

          {/* Description */}
          {field.description && (
            <p style={{
              ...styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600]),
              ...styles.mb('2')
            }}>
              {field.description}
            </p>
          )}

          {/* Input Field */}
          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={value || ''}
              onChange={form.handleInputChange}
              disabled={disabled || field.disabled}
              style={{
                ...StyleSystem.input(!!showError, disabled || field.disabled),
                ...styles.fullW()
              }}
            >
              <option value="">{field.placeholder || `${field.label} seçin`}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={value || ''}
              onChange={form.handleInputChange}
              placeholder={field.placeholder}
              disabled={disabled || field.disabled}
              rows={4}
              style={{
                ...StyleSystem.input(!!showError, disabled || field.disabled),
                ...styles.fullW(),
                resize: 'vertical'
              }}
            />
          ) : field.type === 'checkbox' ? (
            <label style={styles.flex('row', 'center', '2')}>
              <input
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={!!value}
                onChange={form.handleInputChange}
                disabled={disabled || field.disabled}
                style={StyleSystem.focusRing()}
              />
              <span style={styles.text('sm')}>
                {field.placeholder || field.label}
              </span>
            </label>
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={value || ''}
              onChange={form.handleInputChange}
              placeholder={field.placeholder}
              disabled={disabled || field.disabled}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern?.source}
              style={{
                ...StyleSystem.input(!!showError, disabled || field.disabled),
                ...styles.fullW()
              }}
            />
          )}

          {/* Error Message */}
          {showError && (
            <p style={{
              ...styles.text('sm', 'normal', StyleSystem.tokens.colors.danger[600]),
              ...styles.mt('1')
            }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render fields grouped by sections
  const renderSectionedFields = () => {
    if (!config.sections || config.sections.length === 0) {
      // No sections, render all fields
      const fieldsElements = config.fields.map(renderFormField);
      return (
        <div style={layout === 'horizontal' ? styles.flex('row', 'start', '4') : undefined}>
          {fieldsElements}
        </div>
      );
    }

    // Render with sections
    return config.sections.map((section) => {
      const sectionFields = config.fields
        .filter(field => section.fields.includes(field.name))
        .map(renderFormField);

      const sectionContent = (
        <div key={section.title}>
          {/* Section Header */}
          <div style={styles.mb(sizeConfig.spacing)}>
            <h3 style={{
              ...styles.text('lg', 'semibold'),
              ...styles.mb('2')
            }}>
              {section.title}
            </h3>
            {section.description && (
              <p style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>
                {section.description}
              </p>
            )}
          </div>

          {/* Section Fields */}
          <div style={layout === 'horizontal' ? styles.flex('row', 'start', '4') : undefined}>
            {sectionFields}
          </div>
        </div>
      );

      return renderSection ? renderSection(section, sectionFields) : sectionContent;
    });
  };

  // Render action buttons
  const renderActionButtons = () => {
    const submitButton = showSubmitButton ? (
      <button
        type="submit"
        disabled={disabled || form.state.submitting || !form.state.valid}
        style={StyleSystem.button('primary', sizeConfig.button)}
      >
        {form.state.submitting ? 'Yadda saxlanır...' : submitButtonText}
      </button>
    ) : null;

    const resetButton = showResetButton ? (
      <button
        type="button"
        onClick={form.reset}
        disabled={disabled || form.state.submitting}
        style={StyleSystem.button('secondary', sizeConfig.button)}
      >
        {resetButtonText}
      </button>
    ) : null;

    if (!submitButton && !resetButton) return null;

    const defaultActions = (
      <div style={styles.flex('row', 'center', '3')}>
        {resetButton}
        {submitButton}
      </div>
    );

    return renderActions ? renderActions(submitButton!, resetButton!) : defaultActions;
  };

  // Form styles based on variant
  const formStyles = {
    default: {
      ...StyleSystem.card(),
      ...styles.p(sizeConfig.spacing)
    },
    minimal: {
      ...styles.p(sizeConfig.spacing)
    },
    sectioned: {
      ...StyleSystem.card(),
      ...styles.p(sizeConfig.spacing)
    }
  };

  return (
    <div style={formStyles[variant]} className={className}>
      {header}
      
      <form onSubmit={form.handleSubmit} noValidate>
        {/* Form Fields */}
        <div style={variant === 'sectioned' ? styles.space('6') : undefined}>
          {renderSectionedFields()}
        </div>

        {/* Loading State */}
        {form.state.loading && (
          <div style={{
            ...styles.center(),
            ...styles.py('4')
          }}>
            <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>
              Məlumatlar yüklənir...
            </span>
          </div>
        )}

        {/* Form Actions */}
        {(showSubmitButton || showResetButton) && (
          <div style={{
            ...styles.pt(sizeConfig.spacing),
            ...styles.mt(sizeConfig.spacing),
            borderTop: `1px solid ${StyleSystem.tokens.colors.gray[200]}`
          }}>
            {renderActionButtons()}
          </div>
        )}
      </form>

      {footer}
    </div>
  );
}

// Form wrapper with common patterns
export interface FormWrapperProps<T extends Record<string, any>> extends BaseFormProps<T> {
  title?: string;
  subtitle?: string;
  isModal?: boolean;
  onCancel?: () => void;
}

export function FormWrapper<T extends Record<string, any>>({
  title,
  subtitle,
  isModal = false,
  onCancel,
  ...formProps
}: FormWrapperProps<T>) {
  const header = (title || subtitle) ? (
    <div style={styles.mb('6')}>
      {title && (
        <h2 style={styles.text('xl', 'semibold')}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p style={{
          ...styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600]),
          ...styles.mt('2')
        }}>
          {subtitle}
        </p>
      )}
    </div>
  ) : undefined;

  const customRenderActions = isModal ? (
    (submitButton: ReactNode, resetButton: ReactNode) => (
      <div style={styles.flex('row', 'center', '3')}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={StyleSystem.button('secondary')}
          >
            Ləğv et
          </button>
        )}
        {resetButton}
        {submitButton}
      </div>
    )
  ) : undefined;

  return (
    <BaseForm
      {...formProps}
      header={header}
      renderActions={customRenderActions}
    />
  );
}

export default BaseForm;