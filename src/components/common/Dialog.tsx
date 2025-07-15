import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-2xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-2xl',
  '7xl': 'sm:max-w-2xl',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  maxWidth = '2xl',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
}) => {
  // Handle escape key press
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayClasses = `fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 ${overlayClassName}`;
  const dialogClasses = `bg-white rounded-lg shadow-xl transform transition-all w-full ${maxWidthClasses[maxWidth]} ${className}`;
  const contentClasses = `px-6 py-4 ${contentClassName}`;
  const headerClasses = `flex items-center justify-between pb-4 border-b border-gray-200 ${headerClassName}`;
  const bodyClasses = `py-4 ${bodyClassName}`;
  const footerClasses = `px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3 ${footerClassName}`;

  return createPortal(
    <div 
      className={overlayClasses}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      <div 
        className={dialogClasses}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className={headerClasses}>
            {title && (
              <h2 
                id="dialog-title"
                className="text-lg font-medium text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Bağla"
              >
                <FiX className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
        
        <div className={contentClasses}>
          {description && (
            <p id="dialog-description" className="text-sm text-gray-500 mb-4">
              {description}
            </p>
          )}
          
          <div className={bodyClasses}>
            {children}
          </div>
        </div>
        
        {footer && (
          <div className={footerClasses}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
