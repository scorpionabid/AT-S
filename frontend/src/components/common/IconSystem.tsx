import React from 'react';

// Icon mapping for consistent usage throughout the app
export const ICONS = {
  // Navigation & Actions
  LIST: '📋',
  HIERARCHY: '🌳',
  ADD: '➕',
  EDIT: '✏️',
  DELETE: '🗑️',
  VIEW: '👁️',
  SEARCH: '🔍',
  FILTER: '🎯',
  CLOSE: '✕',
  REFRESH: '🔄',
  DUPLICATE: '📋',
  HISTORY: '📜',
  TRASH: '🗑️',
  DOWNLOAD: '⬇️',
  
  // Status & State
  ACTIVE: '▶️',
  INACTIVE: '⏸️',
  SUCCESS: '✅',
  WARNING: '⚠️',
  ERROR: '❌',
  INFO: 'ℹ️',
  
  // Data & Analytics
  CHART: '📊',
  REPORT: '📋',
  STATISTICS: '📈',
  ANALYTICS: '📉',
  DATABASE: '🗄️',
  
  // System & Admin
  SETTINGS: '⚙️',
  SECURITY: '🔒',
  ADMIN: '🛡️',
  SYSTEM: '🖥️',
  UPTIME: '⏱️',
  
  // Institution Types
  MINISTRY: '🏛️',
  REGION: '🗺️',
  SEKTOR: '🏢',
  SCHOOL: '🏫',
  VOCATIONAL: '🔧',
  UNIVERSITY: '🎓',
  
  // User & Roles
  USER: '👤',
  USERS: '👥',
  ROLE: '🎭',
  PERMISSION: '🔑',
  DEPARTMENT: '🏢',
  
  // Communication & Surveys
  SURVEY: '📊',
  NOTIFICATION: '🔔',
  MESSAGE: '💬',
  EMAIL: '📧',
  
  // UI Elements
  EXPAND: '🔽',
  COLLAPSE: '🔼',
  NEXT: '➡️',
  PREVIOUS: '⬅️',
  UP: '⬆️',
  DOWN: '⬇️',
  
  // Theme & Display
  LIGHT: '☀️',
  DARK: '🌙',
  AUTO: '🔄',
  
  // File & Documents
  DOCUMENT: '📄',
  FILE_DOWNLOAD: '⬇️',
  UPLOAD: '⬆️',
  EXPORT: '📤',
  IMPORT: '📥'
} as const;

// Type for icon keys
export type IconType = keyof typeof ICONS;

interface IconProps {
  type: IconType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
}

// Icon component with consistent sizing and accessibility
export const Icon: React.FC<IconProps> = ({ 
  type, 
  className = '', 
  size = 'md', 
  ariaLabel 
}) => {
  const sizeClasses = {
    sm: 'icon-sm',
    md: 'icon-md', 
    lg: 'icon-lg',
    xl: 'icon-xl'
  };

  return (
    <span 
      className={`icon ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={ariaLabel || `${type} icon`}
    >
      {ICONS[type]}
    </span>
  );
};

// Specialized icon components for common use cases
export const ActionIcon: React.FC<{
  type: IconType;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}> = ({ type, onClick, disabled = false, className = '', title }) => (
  <button
    className={`action-icon-button ${className} ${disabled ? 'disabled' : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    type="button"
  >
    <Icon type={type} />
  </button>
);

export const StatusIcon: React.FC<{
  status: 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}> = ({ status, className = '' }) => {
  const statusIconMap = {
    active: 'SUCCESS' as IconType,
    inactive: 'INACTIVE' as IconType,
    success: 'SUCCESS' as IconType,
    warning: 'WARNING' as IconType,
    error: 'ERROR' as IconType,
    info: 'INFO' as IconType
  };

  return (
    <Icon 
      type={statusIconMap[status]} 
      className={`status-icon status-${status} ${className}`}
    />
  );
};

export const InstitutionTypeIcon: React.FC<{
  type: 'ministry' | 'region' | 'sektor' | 'school' | 'vocational' | 'university';
  className?: string;
}> = ({ type, className = '' }) => {
  const typeIconMap = {
    ministry: 'MINISTRY' as IconType,
    region: 'REGION' as IconType,
    sektor: 'SEKTOR' as IconType,
    school: 'SCHOOL' as IconType,
    vocational: 'VOCATIONAL' as IconType,
    university: 'UNIVERSITY' as IconType
  };

  return (
    <Icon 
      type={typeIconMap[type]} 
      className={`institution-type-icon institution-${type} ${className}`}
    />
  );
};

// Helper function to get icon by string
export const getIcon = (type: IconType): string => {
  return ICONS[type];
};

// Export for backward compatibility
export default Icon;