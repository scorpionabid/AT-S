// ====================
// ATİS Modal Components - Tailwind Migration
// Unified modal and overlay system with accessibility
// ====================

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// ====================
// Portal Component
// ====================

interface PortalProps {
  children: React.ReactNode;
  container?: Element | null;
}

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = useState(false);
  const defaultContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!defaultContainer.current) {
      defaultContainer.current = document.createElement('div');
      defaultContainer.current.id = 'modal-portal';
      document.body.appendChild(defaultContainer.current);
    }
    setMounted(true);

    return () => {
      if (defaultContainer.current && document.body.contains(defaultContainer.current)) {
        document.body.removeChild(defaultContainer.current);
      }
    };
  }, []);

  if (!mounted) return null;

  const targetContainer = container || defaultContainer.current;
  return targetContainer ? createPortal(children, targetContainer) : null;
};

// ====================
// Overlay Component
// ====================

const overlayVariants = cva(
  'fixed inset-0 transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-black/50 backdrop-blur-sm',
        dark: 'bg-black/70 backdrop-blur-md',
        light: 'bg-white/80 backdrop-blur-sm',
        blur: 'bg-neutral-900/20 backdrop-blur-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface OverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof overlayVariants> {
  /** 
   * Whether to close on overlay click 
   */
  closeOnClick?: boolean;
  /** 
   * Callback when overlay is clicked 
   */
  onClose?: () => void;
}

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ 
    className, 
    variant,
    closeOnClick = true,
    onClose,
    children,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      if (closeOnClick && e.target === e.currentTarget && onClose) {
        onClose();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(overlayVariants({ variant }), 'z-modal-backdrop', className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Overlay.displayName = 'Overlay';

// ====================
// Modal Component
// ====================

const modalVariants = cva(
  'relative bg-white rounded-lg shadow-modal transition-all duration-200 ease-out',
  {
    variants: {
      size: {
        xs: 'max-w-xs w-full mx-4',
        sm: 'max-w-sm w-full mx-4',
        md: 'max-w-md w-full mx-4',
        lg: 'max-w-lg w-full mx-4',
        xl: 'max-w-screen-lg w-full mx-4',
        '2xl': 'max-w-screen-lg w-full mx-4',
        '3xl': 'max-w-3xl w-full mx-4',
        '4xl': 'max-w-screen-lg w-full mx-4',
        '5xl': 'max-w-5xl w-full mx-4',
        full: 'max-w-[95vw] max-h-[95vh] w-full mx-4',
      },
      position: {
        center: 'flex items-center justify-center min-h-screen p-4',
        top: 'flex items-start justify-center pt-16 pb-4',
        bottom: 'flex items-end justify-center pb-4',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  /** 
   * Whether modal is open 
   */
  open: boolean;
  /** 
   * Callback when modal should close 
   */
  onClose?: () => void;
  /** 
   * Whether to close on overlay click 
   */
  closeOnOverlayClick?: boolean;
  /** 
   * Whether to close on escape key 
   */
  closeOnEscape?: boolean;
  /** 
   * Overlay variant 
   */
  overlayVariant?: VariantProps<typeof overlayVariants>['variant'];
  /** 
   * Portal container 
   */
  container?: Element | null;
  /** 
   * Initial focus element ref 
   */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** 
   * Return focus element ref 
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className,
    size,
    position,
    open,
    onClose,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    overlayVariant = 'default',
    container,
    initialFocusRef,
    returnFocusRef,
    children,
    ...props 
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Handle focus management
    useEffect(() => {
      if (!open) return;

      // Store previously focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Focus initial element or modal
      const elementToFocus = initialFocusRef?.current || modalRef.current;
      if (elementToFocus) {
        elementToFocus.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to previously focused element
        const elementToReturn = returnFocusRef?.current || previouslyFocusedElement.current;
        if (elementToReturn && document.body.contains(elementToReturn)) {
          elementToReturn.focus();
        }
      };
    }, [open, initialFocusRef, returnFocusRef]);

    // Handle focus trap
    useEffect(() => {
      if (!open) return;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }, [open]);

    if (!open) return null;

    return (
      <Portal container={container}>
        <Overlay
          variant={overlayVariant}
          closeOnClick={closeOnOverlayClick}
          onClose={onClose}
          className={cn(modalVariants({ position }))}
        >
          <div
            ref={modalRef}
            className={cn(modalVariants({ size }), 'z-modal', className)}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            {...props}
          >
            {children}
          </div>
        </Overlay>
      </Portal>
    );
  }
);

Modal.displayName = 'Modal';

// ====================
// Modal Sub-components
// ====================

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 
   * Show close button 
   */
  showCloseButton?: boolean;
  /** 
   * Close button callback 
   */
  onClose?: () => void;
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, showCloseButton = true, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-6 border-b border-neutral-200',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
);

ModalHeader.displayName = 'ModalHeader';

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, children, level = 3, ...props }, ref) => {
    const Heading = `h${level}` as keyof JSX.IntrinsicElements;
    
    return (
      <Heading
        ref={ref}
        className={cn(
          'text-lg font-semibold text-neutral-900 leading-6',
          className
        )}
        {...props}
      >
        {children}
      </Heading>
    );
  }
);

ModalTitle.displayName = 'ModalTitle';

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('mt-1 text-sm text-neutral-600', className)}
      {...props}
    >
      {children}
    </p>
  )
);

ModalDescription.displayName = 'ModalDescription';

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
);

ModalContent.displayName = 'ModalContent';

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, justify = 'end', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50',
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

// ====================
// Specialized Modal Components
// ====================

interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  /** 
   * Confirmation title 
   */
  title: string;
  /** 
   * Confirmation message 
   */
  message: string;
  /** 
   * Confirm button text 
   */
  confirmText?: string;
  /** 
   * Cancel button text 
   */
  cancelText?: string;
  /** 
   * Confirm button variant 
   */
  confirmVariant?: 'primary' | 'error' | 'warning';
  /** 
   * Confirm callback 
   */
  onConfirm?: () => void;
  /** 
   * Cancel callback 
   */
  onCancel?: () => void;
  /** 
   * Loading state 
   */
  loading?: boolean;
}

const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(
  ({ 
    title,
    message,
    confirmText = 'Təsdiq et',
    cancelText = 'Ləğv et',
    confirmVariant = 'primary',
    onConfirm,
    onCancel,
    loading = false,
    ...props 
  }, ref) => {
    return (
      <Modal ref={ref} size="sm" {...props}>
        <ModalHeader onClose={onCancel}>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p className="text-neutral-700">{message}</p>
        </ModalContent>
        <ModalFooter>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50',
              confirmVariant === 'primary' && 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
              confirmVariant === 'error' && 'bg-error-600 hover:bg-error-700 focus:ring-error-500',
              confirmVariant === 'warning' && 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500'
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gözləyin...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </ModalFooter>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  ConfirmModal,
  Overlay,
  Portal,
  modalVariants,
  overlayVariants,
};