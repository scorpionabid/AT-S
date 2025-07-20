// ====================
// ATİS Form Hook
// Eliminates form duplication across create/edit forms
// ====================

import { useState, useCallback } from 'react';

export interface UseFormOptions<T> {
  initialData: T;
  validationRules?: Record<keyof T, (value: any) => string | null>;
  onSubmit?: (data: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
  formData: T;
  errors: Record<string, string>;
  loading: boolean;
  touched: Record<string, boolean>;
  
  // Form actions
  handleChange: (name: keyof T, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFormData: (data: Partial<T>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setLoading: (loading: boolean) => void;
  
  // Validation
  validateField: (name: keyof T) => string | null;
  validateForm: () => boolean;
  clearError: (name: keyof T) => void;
  
  // Helper properties
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSubmit
}: UseFormOptions<T>): UseFormReturn<T> {
  
  const [formData, setFormDataState] = useState<T>(initialData);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle form field changes
  const handleChange = useCallback((name: keyof T, value: any) => {
    setFormDataState(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle input change events
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    handleChange(name as keyof T, finalValue);
  }, [handleChange]);

  // Validate a single field
  const validateField = useCallback((name: keyof T): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    const value = formData[name];
    return rule(value);
  }, [formData, validationRules]);

  // Clear error for a specific field
  const clearError = useCallback((name: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName as keyof T);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }
    
    if (!onSubmit) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      // You might want to set form-level errors here
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormDataState(initialData);
    setErrorsState({});
    setTouched({});
    setLoading(false);
  }, [initialData]);

  // Set form data (useful for edit forms)
  const setFormData = useCallback((data: Partial<T>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  // Set errors programmatically
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  // Computed properties
  const isValid = Object.keys(errors).length === 0;
  const isDirty = Object.keys(touched).length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    errors,
    loading,
    touched,
    
    // Actions
    handleChange,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors,
    setLoading,
    
    // Validation
    validateField,
    validateForm,
    clearError,
    
    // Computed
    isValid,
    isDirty,
    hasErrors
  };
}

// Common validation rules
export const validationRules = {
  required: (value: any) => !value ? 'Bu sahə tələb olunur' : null,
  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Düzgün email formatı daxil edin' : null;
  },
  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    return value.length < min ? `Minimum ${min} simbol olmalıdır` : null;
  },
  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    return value.length > max ? `Maksimum ${max} simbol olmalıdır` : null;
  },
  numeric: (value: any) => {
    if (!value) return null;
    return isNaN(Number(value)) ? 'Yalnız rəqəm daxil edin' : null;
  },
  positive: (value: number) => {
    if (!value) return null;
    return value <= 0 ? 'Müsbət rəqəm daxil edin' : null;
  }
};

export default useForm;