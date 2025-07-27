import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'tel' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  disabled?: boolean;
  dependency?: string; // Field name that this field depends on
  dependencyOptions?: { [key: string]: { value: string | number; label: string }[] };
  gridCols?: 1 | 2 | 3 | 4 | 6 | 12; // Bootstrap-like grid system
  section?: string; // Group fields into sections
  description?: string; // Help text
}

export interface FormSection {
  title: string;
  description?: string;
  fields: string[]; // Field names in this section
}

export interface FormConfig<T> {
  fields: FormField[];
  sections?: FormSection[];
  initialData?: Partial<T>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  submitEndpoint?: string;
  updateEndpoint?: string; // For edit forms
  dependentDataEndpoints?: { [fieldName: string]: string }; // For loading dependent data
}

export interface FormState<T> {
  data: T;
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  loading: boolean;
  submitting: boolean;
  valid: boolean;
  dependentData: { [key: string]: any[] }; // Loaded dependent data
}

export interface FormOperations<T> {
  // State
  state: FormState<T>;
  
  // Data operations
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  reset: () => void;
  setFieldError: (name: keyof T, error: string) => void;
  clearFieldError: (name: keyof T) => void;
  clearAllErrors: () => void;
  
  // Validation
  validateField: (name: keyof T) => string | null;
  validateAll: () => boolean;
  
  // Form operations
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<T | null>;
  
  // Dependent data
  loadDependentData: (fieldName: string, dependencyValue: any) => Promise<void>;
  getDependentOptions: (fieldName: string, dependencyValue?: any) => { value: string | number; label: string }[];
  
  // Utility
  getFieldValue: (name: keyof T) => any;
  isFieldTouched: (name: keyof T) => boolean;
  getFieldError: (name: keyof T) => string | null;
  isDirty: () => boolean;
}

export interface UseFormOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onFieldChange?: (name: keyof T, value: any) => void;
  transformSubmitData?: (data: T) => any;
  transformResponseData?: (data: any) => T;
}

export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>,
  options: UseFormOptions<T> = {}
): FormOperations<T> {
  const {
    fields,
    initialData = {} as Partial<T>,
    validationMode = 'onBlur',
    submitEndpoint,
    updateEndpoint,
    dependentDataEndpoints = {}
  } = config;

  const {
    onSuccess,
    onError,
    onFieldChange,
    transformSubmitData,
    transformResponseData
  } = options;

  // Initialize form data with default values
  const getInitialData = useCallback(() => {
    const defaultData = {} as T;
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        defaultData[field.name as keyof T] = false as any;
      } else if (field.type === 'number') {
        defaultData[field.name as keyof T] = 0 as any;
      } else {
        defaultData[field.name as keyof T] = '' as any;
      }
    });
    return { ...defaultData, ...initialData };
  }, [fields, initialData]);

  // Form state
  const [state, setState] = useState<FormState<T>>({
    data: getInitialData(),
    errors: {},
    touched: {},
    loading: false,
    submitting: false,
    valid: false,
    dependentData: {}
  });

  // Validation function for a single field
  const validateField = useCallback((name: keyof T): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field) return null;

    const value = state.data[name];

    // Required validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} tələb olunur`;
    }

    // Skip other validations if empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    const validation = field.validation;
    if (!validation) return null;

    // Length validations
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.label} ən azı ${validation.minLength} simvol olmalıdır`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.label} ən çox ${validation.maxLength} simvol ola bilər`;
      }
    }

    // Number validations
    if (field.type === 'number') {
      const numValue = Number(value);
      if (validation.min !== undefined && numValue < validation.min) {
        return `${field.label} ən azı ${validation.min} olmalıdır`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `${field.label} ən çox ${validation.max} ola bilər`;
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
      return `${field.label} düzgün formatda deyil`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, [fields, state.data]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name as keyof T);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setState(prev => ({
      ...prev,
      errors: newErrors,
      valid: isValid
    }));

    return isValid;
  }, [fields, validateField]);

  // Set single field value
  const setValue = useCallback((name: keyof T, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [name]: value };
      
      // Clear error if validation mode is onChange
      let newErrors = prev.errors;
      if (validationMode === 'onChange') {
        const error = validateField(name);
        newErrors = { ...prev.errors };
        if (error) {
          newErrors[name as string] = error;
        } else {
          delete newErrors[name as string];
        }
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        touched: { ...prev.touched, [name]: true }
      };
    });

    // Trigger change callback
    onFieldChange?.(name, value);

    // Load dependent data if needed
    const field = fields.find(f => f.name === name);
    if (field && dependentDataEndpoints[field.name]) {
      loadDependentData(field.name, value);
    }
  }, [validationMode, validateField, onFieldChange, fields, dependentDataEndpoints]);

  // Set multiple field values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...values },
      touched: Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, { ...prev.touched })
    }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setState({
      data: getInitialData(),
      errors: {},
      touched: {},
      loading: false,
      submitting: false,
      valid: false,
      dependentData: {}
    });
  }, [getInitialData]);

  // Error management
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error }
    }));
  }, []);

  const clearFieldError = useCallback((name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name as string];
      return { ...prev, errors: newErrors };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }

    setValue(name as keyof T, processedValue);
  }, [setValue]);

  // Load dependent data
  const loadDependentData = useCallback(async (fieldName: string, dependencyValue: any) => {
    const endpoint = dependentDataEndpoints[fieldName];
    if (!endpoint) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await api.get(endpoint, {
        params: { [fieldName]: dependencyValue }
      });
      
      setState(prev => ({
        ...prev,
        dependentData: {
          ...prev.dependentData,
          [fieldName]: response.data.data || response.data || []
        },
        loading: false
      }));
    } catch (error) {
      console.error(`Error loading dependent data for ${fieldName}:`, error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [dependentDataEndpoints]);

  // Get dependent options
  const getDependentOptions = useCallback((fieldName: string, dependencyValue?: any): { value: string | number; label: string }[] => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return [];

    // If field has dependency, use dependent data
    if (field.dependency && field.dependencyOptions && dependencyValue) {
      return field.dependencyOptions[dependencyValue] || [];
    }

    // Use loaded dependent data
    const dependentData = state.dependentData[fieldName];
    if (dependentData) {
      return dependentData.map((item: any) => ({
        value: item.id || item.value,
        label: item.name || item.label || item.title
      }));
    }

    // Use static options
    return field.options || [];
  }, [fields, state.dependentData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<T | null> => {
    e.preventDefault();

    // Validate all fields
    if (!validateAll()) {
      onError?.('Formdakı xətaları düzəldin');
      return null;
    }

    setState(prev => ({ ...prev, submitting: true }));

    try {
      let submitData = state.data;
      if (transformSubmitData) {
        submitData = transformSubmitData(state.data);
      }

      const endpoint = updateEndpoint || submitEndpoint;
      if (!endpoint) {
        throw new Error('Submit endpoint not configured');
      }

      const method = updateEndpoint ? 'put' : 'post';
      const response = await api[method](endpoint, submitData);
      
      let responseData = response.data.data || response.data;
      if (transformResponseData) {
        responseData = transformResponseData(responseData);
      }

      setState(prev => ({ ...prev, submitting: false }));
      onSuccess?.(responseData);
      
      return responseData;
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      setState(prev => ({ ...prev, submitting: false }));
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const serverErrors: { [key: string]: string } = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          serverErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setState(prev => ({ ...prev, errors: { ...prev.errors, ...serverErrors } }));
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Form göndərilərkən xəta baş verdi';
      onError?.(errorMessage);
      
      return null;
    }
  }, [validateAll, state.data, transformSubmitData, updateEndpoint, submitEndpoint, transformResponseData, onSuccess, onError]);

  // Utility functions
  const getFieldValue = useCallback((name: keyof T) => state.data[name], [state.data]);
  const isFieldTouched = useCallback((name: keyof T) => !!state.touched[name as string], [state.touched]);
  const getFieldError = useCallback((name: keyof T) => state.errors[name as string] || null, [state.errors]);
  const isDirty = useCallback(() => Object.keys(state.touched).length > 0, [state.touched]);

  // Load initial dependent data
  useEffect(() => {
    Object.entries(dependentDataEndpoints).forEach(([fieldName, endpoint]) => {
      const field = fields.find(f => f.name === fieldName);
      if (field && !field.dependency) {
        // Load initial data for non-dependent fields
        loadDependentData(fieldName, null);
      }
    });
  }, []);

  return {
    state,
    setValue,
    setValues,
    reset,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    validateField,
    validateAll,
    handleInputChange,
    handleSubmit,
    loadDependentData,
    getDependentOptions,
    getFieldValue,
    isFieldTouched,
    getFieldError,
    isDirty
  };
}

export default useForm;