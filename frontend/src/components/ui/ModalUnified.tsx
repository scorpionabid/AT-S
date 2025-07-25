// ====================
// ATİS Unified Modal Component
// Eliminates modal duplication across components
// ====================

import React from 'react';

// Modal component props interface
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

// Modal header props
export interface ModalHeaderProps {
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Modal footer props
export interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

// Modal body props
export interface ModalBodyProps {
  className?: string;
  children: React.ReactNode;
}

// Size mappings
const SIZE_CLASSES = {
  sm: 'modal-sm',     // max-width: 400px
  md: 'modal-md',     // max-width: 600px (default)
  lg: 'modal-lg',     // max-width: 800px
  xl: 'modal-xl',     // max-width: 1200px
  full: 'modal-full'  // full screen
};

/**
 * Unified Modal Component
 * 
 * Features:
 * - Consistent styling using unified CSS system
 * - Keyboard navigation (ESC to close)
 * - Click outside to close
 * - Multiple size options
 * - Accessibility support
 * - Portal rendering for proper z-index
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  children
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className={`modal-content ${SIZE_CLASSES[size]} ${contentClassName} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <ModalHeader
            title={title}
            onClose={onClose}
            showCloseButton={showCloseButton}
          />
        )}
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Header Component
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  showCloseButton = true,
  className = '',
  children
}) => (
  <div className={`modal-header ${className}`}>
    {title && (
      <h2 id="modal-title" className="modal-title">
        {title}
      </h2>
    )}
    {children}
    {showCloseButton && onClose && (
      <button
        onClick={onClose}
        className="modal-close btn-base btn-ghost btn-icon"
        aria-label="Bağla"
        type="button"
      >
        ×
      </button>
    )}
  </div>
);

/**
 * Modal Body Component
 */
export const ModalBody: React.FC<ModalBodyProps> = ({
  className = '',
  children
}) => (
  <div className={`modal-body ${className}`}>
    {children}
  </div>
);

/**
 * Modal Footer Component
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({
  className = '',
  children
}) => (
  <div className={`modal-footer ${className}`}>
    {children}
  </div>
);

/**
 * Confirmation Modal Component
 * Pre-configured modal for common confirmation dialogs
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Təsdiq et',
  cancelText = 'Ləğv et',
  variant = 'danger',
  loading = false
}) => {
  const buttonVariant = variant === 'danger' ? 'btn-danger' : 
                       variant === 'warning' ? 'btn-warning' : 'btn-primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      className="confirmation-modal"
    >
      <div className="confirmation-content">
        <p className="confirmation-message">{message}</p>
        
        <div className="form-button-group">
          <button
            onClick={onClose}
            className="btn-base btn-secondary"
            disabled={loading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-base ${buttonVariant}`}
            disabled={loading}
            type="button"
          >
            {loading ? 'Yüklənir...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Form Modal Component
 * Pre-configured modal for forms with consistent styling
 */
export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  loading = false
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size={size}
    className="form-modal"
    closeOnOverlayClick={!loading}
    closeOnEscape={!loading}
  >
    {children}
  </Modal>
);

/**
 * Hook for modal state management
 * Provides consistent modal state handling
 */
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    modalProps: {
      isOpen,
      onClose: closeModal
    }
  };
};

// Default export for backward compatibility
export default Modal;