import React, { ReactNode } from 'react';
import { FormField, FormSection, FormOperations } from '../../hooks/useForm';

export interface BaseFormProps<T> {
  // Form configuration
  fields: FormField[];
  sections?: FormSection[];
  form: FormOperations<T>;
  
  // UI configuration
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  loading?: boolean;
  
  // Layout
  columns?: 1 | 2 | 3 | 4;
  modalMode?: boolean;
  
  // Events
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  
  // Custom components
  headerComponent?: ReactNode;
  footerComponent?: ReactNode;
  
  // Style customization
  className?: string;
  style?: React.CSSProperties;
}

const BaseForm = <T extends Record<string, any>>({
  fields,
  sections,
  form,
  title,
  description,
  submitText = 'Yadda saxla',
  cancelText = 'Ləğv et',
  showCancelButton = true,
  loading = false,
  columns = 1,
  modalMode = false,
  onCancel,
  onSubmit,
  headerComponent,
  footerComponent,
  className = '',
  style
}: BaseFormProps<T>) => {
  
  // Helper to get grid column class
  const getGridClass = (fieldCols?: number) => {
    const cols = fieldCols || 12 / columns;
    const percentage = (cols / 12) * 100;
    return {
      width: `${percentage}%`,
      paddingRight: cols < 12 ? '12px' : '0px'
    };
  };

  // Render a single field
  const renderField = (field: FormField) => {
    const value = form.getFieldValue(field.name as keyof T);
    const error = form.getFieldError(field.name as keyof T);
    const touched = form.isFieldTouched(field.name as keyof T);
    const showError = touched && error;

    const fieldStyle = {
      marginBottom: '20px',
      ...getGridClass(field.gridCols)
    };

    const labelStyle = {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    };

    const inputBaseStyle = {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid ${showError ? '#dc2626' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      backgroundColor: field.disabled ? '#f9fafb' : 'white'
    };

    const errorStyle = {
      marginTop: '4px',
      fontSize: '12px',
      color: '#dc2626'
    };

    const descriptionStyle = {
      marginTop: '4px',
      fontSize: '12px',
      color: '#6b7280'
    };

    // Get options for select fields
    const options = field.dependency 
      ? form.getDependentOptions(field.name, form.getFieldValue(field.dependency as keyof T))
      : form.getDependentOptions(field.name) || field.options || [];

    return (
      <div key={field.name} style={fieldStyle}>
        <label style={labelStyle}>
          {field.label}
          {field.required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
        </label>
        
        {field.type === 'text' && (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'email' && (
          <input
            type="email"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'password' && (
          <input
            type="password"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'number' && (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'date' && (
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'tel' && (
          <input
            type="tel"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'url' && (
          <input
            type="url"
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            style={inputBaseStyle}
          />
        )}
        
        {field.type === 'select' && (
          <select
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            disabled={field.disabled}
            style={inputBaseStyle}
          >
            <option value="">
              {field.placeholder || `${field.label} seçin`}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {field.type === 'textarea' && (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={form.handleInputChange}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
            style={{
              ...inputBaseStyle,
              resize: 'vertical',
              minHeight: '80px'
            }}
          />
        )}
        
        {field.type === 'checkbox' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={form.handleInputChange}
              disabled={field.disabled}
              style={{ marginRight: '8px', width: 'auto' }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {field.description || field.label}
            </span>
          </div>
        )}
        
        {showError && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        {field.description && field.type !== 'checkbox' && (
          <div style={descriptionStyle}>
            {field.description}
          </div>
        )}
      </div>
    );
  };

  // Render fields grouped by sections
  const renderSections = () => {
    if (!sections || sections.length === 0) {
      // Render all fields without sections
      return (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          marginRight: '-12px' 
        }}>
          {fields.map(renderField)}
        </div>
      );
    }

    return sections.map((section) => (
      <div key={section.title} style={{ marginBottom: '32px' }}>
        <div style={{ 
          marginBottom: '20px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            {section.title}
          </h3>
          {section.description && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {section.description}
            </p>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          marginRight: '-12px' 
        }}>
          {section.fields
            .map(fieldName => fields.find(f => f.name === fieldName))
            .filter(Boolean)
            .map(field => renderField(field!))}
        </div>
      </div>
    ));
  };

  const containerStyle = {
    ...style,
    background: 'white',
    padding: modalMode ? '24px' : '32px',
    borderRadius: modalMode ? '12px' : '8px',
    border: modalMode ? 'none' : '1px solid #e5e7eb',
    boxShadow: modalMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : 'none'
  };

  const overlayStyle = modalMode ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  } : undefined;

  const modalContentStyle = modalMode ? {
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const
  } : undefined;

  const formContent = (
    <div style={modalMode ? modalContentStyle : undefined}>
      <div className={className} style={containerStyle}>
        {/* Header */}
        {(title || description || headerComponent) && (
          <div style={{ marginBottom: '32px' }}>
            {headerComponent || (
              <>
                {title && (
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 8px 0'
                  }}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit || form.handleSubmit}>
          {renderSections()}
          
          {/* Footer */}
          {!footerComponent && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
              marginTop: '32px'
            }}>
              {showCancelButton && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={form.state.submitting || loading}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: form.state.submitting || loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cancelText}
                </button>
              )}
              
              <button
                type="submit"
                disabled={form.state.submitting || loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: form.state.submitting || loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: form.state.submitting || loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {(form.state.submitting || loading) && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {submitText}
              </button>
            </div>
          )}
          
          {footerComponent}
        </form>
      </div>
      
      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  // Return with or without modal overlay
  if (modalMode) {
    return (
      <div style={overlayStyle} onClick={onCancel}>
        <div onClick={(e) => e.stopPropagation()}>
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
};

export default BaseForm;