import React from 'react';
import { FiAlertCircle, FiInbox, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../ui/Button';

type EmptyStateVariant = 'info' | 'warning' | 'error' | 'success' | 'default';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: EmptyStateVariant;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  };
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
}

const variantIcons = {
  default: <FiInbox className="h-12 w-12 text-gray-400" aria-hidden="true" />,
  info: <FiInbox className="h-12 w-12 text-blue-500" aria-hidden="true" />,
  warning: <FiAlertTriangle className="h-12 w-12 text-yellow-500" aria-hidden="true" />,
  error: <FiAlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />,
  success: <FiInbox className="h-12 w-12 text-green-500" aria-hidden="true" />,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  variant = 'default',
  action,
  className = '',
  contentClassName = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  actionClassName = '',
}) => {
  const variantClasses = {
    default: 'text-gray-900',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
    success: 'text-green-800',
  };

  const descriptionVariantClasses = {
    default: 'text-gray-500',
    info: 'text-blue-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    success: 'text-green-700',
  };

  const bgClasses = {
    default: 'bg-gray-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
    success: 'bg-green-50',
  };

  const displayIcon = icon || variantIcons[variant];

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-lg ${bgClasses[variant]} ${className}`}>
      <div className={`text-center ${contentClassName}`}>
        <div className={`mx-auto flex items-center justify-center h-24 w-24 ${iconClassName}`}>
          {displayIcon}
        </div>
        <h3 className={`mt-4 text-lg font-medium ${variantClasses[variant]} ${titleClassName}`}>
          {title}
        </h3>
        {description && (
          <p className={`mt-2 text-sm ${descriptionVariantClasses[variant]} ${descriptionClassName}`}>
            {description}
          </p>
        )}
        {action && (
          <div className={`mt-6 ${actionClassName}`}>
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Common pre-configured empty states
export const NoResultsEmptyState: React.FC<{
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchQuery, onClearSearch, className = '' }) => (
  <EmptyState
    title={searchQuery ? 'Nəticə tapılmadı' : 'Məlumat tapılmadı'}
    description={
      searchQuery
        ? `"${searchQuery}" üzrə heç bir nəticə tapılmadı. Başqa açar sözlərlə cəhd edin.`
        : 'Hələ heç bir məlumat əlavə edilməyib.'
    }
    icon={<FiSearch className="h-12 w-12 text-gray-400" />}
    variant="info"
    action={
      onClearSearch && searchQuery
        ? {
            label: 'Axtarışı təmizlə',
            onClick: onClearSearch,
            variant: 'outline',
          }
        : undefined
    }
    className={className}
  />
);

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Xəta baş verdi',
  description = 'Məlumatlar yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
  onRetry,
  className = '',
}) => (
  <EmptyState
    title={title}
    description={description}
    variant="error"
    action={
      onRetry
        ? {
            label: 'Yenidən yoxla',
            onClick: onRetry,
            variant: 'danger',
          }
        : undefined
    }
    className={className}
  />
);

export default EmptyState;
