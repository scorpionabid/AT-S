import { useCallback } from 'react';
import { useToast as useToastContext, ToastVariant } from '../contexts/ToastContext';

export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useToastContext();

  const showToast = useCallback((
    message: string, 
    options: { variant?: ToastVariant; duration?: number; isDismissible?: boolean } = {}
  ) => {
    return addToast(message, {
      variant: options.variant || ToastVariant.DEFAULT,
      duration: options.duration,
      isDismissible: options.isDismissible,
    });
  }, [addToast]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return showToast(message, { variant: ToastVariant.SUCCESS, duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    return showToast(message, { variant: ToastVariant.ERROR, duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return showToast(message, { variant: ToastVariant.WARNING, duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return showToast(message, { variant: ToastVariant.INFO, duration });
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
  };
};

export default useToast;
