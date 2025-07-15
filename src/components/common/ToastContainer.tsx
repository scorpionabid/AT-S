import React, { useEffect, useRef } from 'react';
import { useToast, type Toast as ToastType, ToastVariant } from '../../contexts/ToastContext';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  [ToastVariant.SUCCESS]: <FiCheckCircle className="h-5 w-5" />,
  [ToastVariant.ERROR]: <FiAlertCircle className="h-5 w-5" />,
  [ToastVariant.WARNING]: <FiAlertTriangle className="h-5 w-5" />,
  [ToastVariant.INFO]: <FiInfo className="h-5 w-5" />,
  [ToastVariant.DEFAULT]: null,
};

const variantColors: Record<ToastVariant, string> = {
  [ToastVariant.SUCCESS]: 'bg-green-50 text-green-800 border-green-200',
  [ToastVariant.ERROR]: 'bg-red-50 text-red-800 border-red-200',
  [ToastVariant.WARNING]: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  [ToastVariant.INFO]: 'bg-blue-50 text-blue-800 border-blue-200',
  [ToastVariant.DEFAULT]: 'bg-white text-gray-800 border-gray-200',
};

const iconColors: Record<ToastVariant, string> = {
  [ToastVariant.SUCCESS]: 'text-green-400',
  [ToastVariant.ERROR]: 'text-red-400',
  [ToastVariant.WARNING]: 'text-yellow-400',
  [ToastVariant.INFO]: 'text-blue-400',
  [ToastVariant.DEFAULT]: 'text-gray-400',
};

const progressColors: Record<ToastVariant, string> = {
  [ToastVariant.SUCCESS]: 'bg-green-500',
  [ToastVariant.ERROR]: 'bg-red-500',
  [ToastVariant.WARNING]: 'bg-yellow-500',
  [ToastVariant.INFO]: 'bg-blue-500',
  [ToastVariant.DEFAULT]: 'bg-gray-500',
};

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, message, variant = ToastVariant.DEFAULT, duration = 5000, isDismissible = true } = toast;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current || duration <= 0) return;

    const progressBar = progressRef.current;
    
    // Reset animation
    progressBar.style.width = '100%';
    progressBar.style.transition = 'none';
    progressBar.getBoundingClientRect(); // Force reflow
    
    // Start animation
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '0%';
    
    return () => {
      progressBar.style.transition = 'none';
    };
  }, [duration]);

  const handleDismiss = () => {
    if (toast.onDismiss) {
      toast.onDismiss(id);
    } else {
      onDismiss(id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`relative flex items-start p-4 mb-2 rounded-lg shadow-lg border ${variantColors[variant]} max-w-sm w-full`}
      role="alert"
      aria-live="assertive"
    >
      {variantIcons[variant] && (
        <div className={`flex-shrink-0 mr-3 ${iconColors[variant]}`}>
          {variantIcons[variant]}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      {isDismissible && (
        <div className="ml-4 flex-shrink-0 flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Bağla"
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            ref={progressRef}
            className={`h-full ${progressColors[variant]}`}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </motion.div>
  );
};

interface ToastContainerProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  maxToasts?: number;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  className = '',
}) => {
  const { toasts, removeToast } = useToast();
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  // Limit the number of toasts shown
  const visibleToasts = maxToasts ? toasts.slice(0, maxToasts) : toasts;

  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 space-y-2 ${positionClasses[position]} ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onDismiss={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
