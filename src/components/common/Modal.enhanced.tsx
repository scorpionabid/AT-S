import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';

// ====================
// TYPE DEFINITIONS
// ====================

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ModalVariant = 'center' | 'top' | 'bottom' | 'sidebar' | 'sidebar-right' | 'drawer' | 'alert';
export type ModalAnimation = 'fade' | 'slide' | 'zoom' | 'none';

// ====================
// MODAL HOOK FOR BODY SCROLL MANAGEMENT
// ====================

const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock body scroll
      document.body.classList.add('modal-open');
      document.body.style.setProperty('--scrollbar-width', `${scrollBarWidth}px`);
      
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('--scrollbar-width');
      };
    }
  }, [isOpen]);
};

// ====================
// FOCUS TRAP HOOK
// ====================

const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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

    // Focus first element
    firstElement?.focus();

    // Add event listener
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, containerRef]);
};

// ====================
// MODAL PORTAL COMPONENT
// ====================

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

// ====================
// MODAL BACKDROP COMPONENT
// ====================

interface ModalBackdropProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  isOpen,
  onClick,
  className = '',
}) => {
  const backdropClasses = classNames(
    'modal-backdrop',
    {
      'modal-backdrop--entering': isOpen,
    },
    className
  );

  return (
    <div
      className={backdropClasses}
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

// ====================
// MAIN MODAL COMPONENT
// ====================

export interface ModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal size */
  size?: ModalSize;
  /** Modal variant */
  variant?: ModalVariant;
  /** Animation type */
  animation?: ModalAnimation;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Remove padding from content */
  noPadding?: boolean;
  /** Compact spacing */
  compact?: boolean;
  /** Mobile fullscreen */
  mobileFullscreen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Content CSS classes */
  contentClassName?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Initial focus element selector */
  initialFocus?: string;
  /** Return focus element after close */
  returnFocus?: HTMLElement;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({
  isOpen,
  onClose,
  size = 'md',
  variant = 'center',
  animation = 'fade',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  noPadding = false,
  compact = false,
  mobileFullscreen = false,
  className = '',
  contentClassName = '',
  children,
  initialFocus,
  returnFocus,
}, ref) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use hooks
  useBodyScrollLock(isOpen);
  useFocusTrap(isOpen, contentRef);

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

  // Handle initial focus
  useEffect(() => {
    if (isOpen && initialFocus && contentRef.current) {
      const element = contentRef.current.querySelector(initialFocus) as HTMLElement;
      element?.focus();
    }
  }, [isOpen, initialFocus]);

  // Handle return focus
  useEffect(() => {
    if (!isOpen && returnFocus) {
      returnFocus.focus();
    }
  }, [isOpen, returnFocus]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === modalRef.current) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Class names
  const modalClasses = classNames(
    'modal',
    `modal--${variant}`,
    {
      'modal--mobile-fullscreen': mobileFullscreen,
      'modal--loading': loading,
      'modal--no-backdrop-click': !closeOnBackdrop,
    },
    className
  );

  const contentClasses = classNames(
    'modal__content',
    `modal__content--${size}`,
    {
      'modal__content--no-padding': noPadding,
      'modal__content--compact': compact,
      'modal__content--entering': isOpen,
    },
    contentClassName
  );

  return (
    <ModalPortal>
      <div
        ref={modalRef}
        className={modalClasses}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalBackdrop
          isOpen={isOpen}
          onClick={closeOnBackdrop ? onClose : undefined}
        />
        
        <div
          ref={contentRef}
          className={contentClasses}
          role="document"
        >
          {children}
        </div>
      </div>
    </ModalPortal>
  );
});

Modal.displayName = 'Modal';

// ====================
// MODAL HEADER COMPONENT
// ====================

export interface ModalHeaderProps {
  /** Modal title */
  title?: string;
  /** Modal subtitle */
  subtitle?: string;
  /** Title size */
  titleSize?: 'sm' | 'md' | 'lg';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom content */
  children?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  titleSize = 'md',
  showCloseButton = true,
  onClose,
  className = '',
  children,
}) => (
  <div className={classNames('modal__header', className)}>
    <div className="modal__title-group">
      {title && (
        <h2
          id="modal-title"
          className={classNames(
            'modal__title',
            {
              [`modal__title--${titleSize}`]: titleSize !== 'md',
            }
          )}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p id="modal-description" className="modal__subtitle">
          {subtitle}
        </p>
      )}
      {children}
    </div>
    
    {showCloseButton && onClose && (
      <button
        type="button"
        className="modal__close"
        onClick={onClose}
        aria-label="Close modal"
      >
        <Icon name="x" />
      </button>
    )}
  </div>
);

ModalHeader.displayName = 'ModalHeader';

// ====================
// MODAL BODY COMPONENT
// ====================

export interface ModalBodyProps {
  /** Additional CSS classes */
  className?: string;
  /** Body content */
  children: React.ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  className = '',
  children,
}) => (
  <div className={classNames('modal__body', className)}>
    {children}
  </div>
);

ModalBody.displayName = 'ModalBody';

// ====================
// MODAL FOOTER COMPONENT
// ====================

export interface ModalFooterProps {
  /** Footer alignment */
  align?: 'start' | 'center' | 'end' | 'between';
  /** Additional CSS classes */
  className?: string;
  /** Footer content */
  children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  align = 'end',
  className = '',
  children,
}) => (
  <div
    className={classNames(
      'modal__footer',
      {
        [`modal__footer--${align}`]: align !== 'end',
      },
      className
    )}
  >
    {children}
  </div>
);

ModalFooter.displayName = 'ModalFooter';

// ====================
// ALERT MODAL COMPONENT
// ====================

export interface AlertModalProps extends Omit<ModalProps, 'variant' | 'children'> {
  /** Alert type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Alert icon */
  icon?: IconName;
  /** Alert title */
  title: string;
  /** Alert message */
  message?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
  /** Show cancel button */
  showCancel?: boolean;
  /** Confirm handler */
  onConfirm?: () => void;
  /** Cancel handler */
  onCancel?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  type = 'info',
  icon,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  showCancel = false,
  onConfirm,
  onCancel,
  onClose,
  ...props
}) => {
  const getDefaultIcon = (): IconName => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'alert-triangle';
      case 'error': return 'alert-circle';
      default: return 'info';
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      {...props}
      variant="alert"
      onClose={onClose}
      showCloseButton={false}
    >
      <ModalBody>
        <div className={classNames('modal__icon', `modal__icon--${type}`)}>
          <Icon name={icon || getDefaultIcon()} />
        </div>
        
        <h3 className="modal__title">{title}</h3>
        
        {message && (
          <p className="modal__subtitle">{message}</p>
        )}
      </ModalBody>
      
      <ModalFooter align="center">
        {showCancel && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
        )}
        <button
          type="button"
          className={`btn btn--${confirmVariant === 'primary' ? 'primary' : confirmVariant}`}
          onClick={handleConfirm}
          autoFocus
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

AlertModal.displayName = 'AlertModal';

// ====================
// CONFIRMATION MODAL COMPONENT
// ====================

export interface ConfirmModalProps extends Omit<AlertModalProps, 'showCancel'> {
  /** Confirmation message */
  message: string;
  /** Dangerous action */
  dangerous?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  dangerous = false,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  ...props
}) => (
  <AlertModal
    {...props}
    type={dangerous ? 'error' : 'warning'}
    confirmText={confirmText}
    confirmVariant={dangerous ? 'danger' : confirmVariant}
    showCancel={true}
  />
);

ConfirmModal.displayName = 'ConfirmModal';

// ====================
// SIDEBAR MODAL COMPONENT
// ====================

export interface SidebarModalProps extends Omit<ModalProps, 'variant'> {
  /** Sidebar position */
  position?: 'left' | 'right';
  /** Sidebar width */
  width?: string;
}

export const SidebarModal: React.FC<SidebarModalProps> = ({
  position = 'left',
  width = '400px',
  contentClassName = '',
  ...props
}) => (
  <Modal
    {...props}
    variant={position === 'right' ? 'sidebar-right' : 'sidebar'}
    contentClassName={classNames(contentClassName)}
    style={{ '--sidebar-width': width } as React.CSSProperties}
  />
);

SidebarModal.displayName = 'SidebarModal';

// ====================
// DRAWER MODAL COMPONENT (Mobile-first)
// ====================

export interface DrawerModalProps extends Omit<ModalProps, 'variant'> {
  /** Drawer height */
  height?: string;
}

export const DrawerModal: React.FC<DrawerModalProps> = ({
  height = '80vh',
  contentClassName = '',
  ...props
}) => (
  <Modal
    {...props}
    variant="drawer"
    contentClassName={classNames(contentClassName)}
    style={{ '--drawer-height': height } as React.CSSProperties}
  />
);

DrawerModal.displayName = 'DrawerModal';

// ====================
// EXPORT ALL COMPONENTS
// ====================

export default Modal;