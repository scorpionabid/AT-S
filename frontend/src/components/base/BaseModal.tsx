/**
 * ATİS Base Modal Component
 * Bütün modal-lar üçün universal baza komponenti
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { StyleSystem } from '../../utils/StyleSystem';
import { HookFactory } from '../../hooks/HookFactory';

export interface BaseModalProps {
  // Modal state
  isOpen: boolean;
  onClose: () => void;
  
  // Content
  title?: string;
  children: ReactNode;
  
  // Modal configuration
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success' | 'warning';
  
  // Behavior
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  
  // Footer actions
  primaryAction?: {
    label: string;
    onClick: () => void | Promise<void>;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
  };
  
  // Style overrides
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedby?: string;
  
  // Animation
  animationDuration?: number;
}

const useModalManager = HookFactory.createToggleHook(false);

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  primaryAction,
  secondaryAction,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ariaLabel,
  ariaDescribedby,
  animationDuration = 200
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const submitHook = HookFactory.createSubmitHook(
    async () => {
      if (primaryAction?.onClick) {
        await primaryAction.onClick();
      }
    },
    {
      onSuccess: () => {
        if (!primaryAction?.loading) {
          onClose();
        }
      }
    }
  );

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Size configurations
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1200px' },
    full: { maxWidth: '95vw', height: '95vh' }
  };

  // Variant configurations
  const variantStyles = {
    default: {
      headerBg: StyleSystem.StyleSystem.tokens.colors.gray[50],
      borderColor: StyleSystem.StyleSystem.tokens.colors.primary[200]
    },
    danger: {
      headerBg: StyleSystem.StyleSystem.tokens.colors.danger[50],
      borderColor: StyleSystem.StyleSystem.tokens.colors.danger[200]
    },
    success: {
      headerBg: StyleSystem.StyleSystem.tokens.colors.success[50],
      borderColor: StyleSystem.StyleSystem.tokens.colors.success[200]
    },
    warning: {
      headerBg: StyleSystem.StyleSystem.tokens.colors.warning[50],
      borderColor: StyleSystem.StyleSystem.tokens.colors.warning[200]
    }
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: StyleSystem.StyleSystem.tokens.spacing[4],
    zIndex: 1050,
    animation: `fadeIn ${animationDuration}ms ease-out`
  };

  const modalStyle: React.CSSProperties = {
    ...StyleSystem.StyleSystem.card(),
    ...sizeStyles[size],
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
    position: 'relative',
    borderTop: `3px solid ${variantStyles[variant].borderColor}`,
    animation: `slideUp ${animationDuration}ms ease-out`
  };

  const headerStyle: React.CSSProperties = {
    ...StyleSystem.StyleSystem.layout('flex', 'row', 'center', 'between'),
    ...StyleSystem.StyleSystem.spacing('padding', 'all', '6'),
    backgroundColor: variantStyles[variant].headerBg,
    borderBottom: `1px solid ${StyleSystem.StyleSystem.tokens.colors.gray[200]}`,
    borderRadius: `${StyleSystem.StyleSystem.tokens.borderRadius.lg} ${StyleSystem.StyleSystem.tokens.borderRadius.lg} 0 0`
  };

  const bodyStyle: React.CSSProperties = {
    ...StyleSystem.StyleSystem.spacing('padding', 'all', '6'),
    flex: 1,
    overflow: 'auto'
  };

  const footerStyle: React.CSSProperties = {
    ...StyleSystem.StyleSystem.layout('flex', 'row', 'center', 'end', '3'),
    ...StyleSystem.StyleSystem.spacing('padding', 'all', '6'),
    borderTop: `1px solid ${StyleSystem.StyleSystem.tokens.colors.gray[200]}`,
    backgroundColor: StyleSystem.StyleSystem.tokens.colors.gray[50]
  };

  const closeButtonStyle: React.CSSProperties = {
    ...StyleSystem.StyleSystem.button('secondary', 'sm'),
    padding: StyleSystem.StyleSystem.tokens.spacing[2],
    minWidth: 'auto',
    width: '32px',
    height: '32px'
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
      
      <div
        style={backdropStyle}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedby}
      >
        <div
          ref={modalRef}
          style={modalStyle}
          className={className}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div style={headerStyle} className={headerClassName}>
              {title && (
                <h3 style={StyleSystem.StyleSystem.text('xl', 'semibold')}>
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  style={closeButtonStyle}
                  onClick={onClose}
                  aria-label="Bağla"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div style={bodyStyle} className={bodyClassName}>
            {children}
          </div>

          {/* Footer */}
          {(primaryAction || secondaryAction) && (
            <div style={footerStyle} className={footerClassName}>
              {secondaryAction && (
                <button
                  style={StyleSystem.StyleSystem.button(
                    secondaryAction.variant || 'secondary'
                  )}
                  onClick={secondaryAction.onClick}
                  type="button"
                >
                  {secondaryAction.label}
                </button>
              )}
              
              {primaryAction && (
                <button
                  style={StyleSystem.StyleSystem.button(
                    primaryAction.variant || 'primary'
                  )}
                  onClick={submitHook.submit}
                  disabled={primaryAction.disabled || submitHook.submitting}
                  type="button"
                >
                  {submitHook.submitting ? 'Gözləyin...' : primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Modal Hook for easier usage
export const useModal = () => {
  const { value: isOpen, setTrue: open, setFalse: close, toggle } = useModalManager();

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

// HOC for modal confirmation
export interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void | Promise<void>;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps & { 
  isOpen: boolean; 
  onClose: () => void; 
}> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Təsdiqlə',
  cancelLabel = 'Ləğv et',
  variant = 'danger',
  onConfirm
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: variant === 'danger' ? 'danger' : 'primary'
      }}
      secondaryAction={{
        label: cancelLabel,
        onClick: onClose,
        variant: 'secondary'
      }}
    >
      <p style={StyleSystem.StyleSystem.text('base', 'normal', StyleSystem.StyleSystem.tokens.colors.gray[700])}>
        {message}
      </p>
    </BaseModal>
  );
};

// Modal manager hook for multiple modals
export const useModalManager = () => {
  const [modals, setModals] = React.useState<{ [key: string]: boolean }>({});

  const openModal = (key: string) => {
    setModals(prev => ({ ...prev, [key]: true }));
  };

  const closeModal = (key: string) => {
    setModals(prev => ({ ...prev, [key]: false }));
  };

  const toggleModal = (key: string) => {
    setModals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isModalOpen = (key: string) => !!modals[key];

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen
  };
};

export default BaseModal;