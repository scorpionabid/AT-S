/**
 * ATİS Unified Icon System
 * StyleSystem ilə inteqrasiya edilmiş icon sistem
 */

import React from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';

// Icon mapping for consistent usage throughout the app
export const ICONS = {
  // Navigation & Actions
  LIST: '📋',
  HIERARCHY: '🌳',
  ADD: '➕',
  PLUS: '➕',
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
  SAVE: '💾',
  CANCEL: '❌',
  
  // Status & State
  ACTIVE: '✅',
  INACTIVE: '❌',
  SUCCESS: '✅',
  WARNING: '⚠️',
  ERROR: '❌',
  INFO: 'ℹ️',
  LOADING: '⏳',
  TOGGLE: '🔄',
  
  // Data & Analytics
  CHART: '📊',
  REPORT: '📋',
  STATISTICS: '📈',
  ANALYTICS: '📉',
  DATABASE: '🗄️',
  EXPORT: '📤',
  IMPORT: '📥',
  
  // System & Admin
  SETTINGS: '⚙️',
  SECURITY: '🔒',
  ADMIN: '🛡️',
  SYSTEM: '🖥️',
  UPTIME: '⏱️',
  
  // Institution Types
  INSTITUTION: '🏢',
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
  UPLOAD: '⬆️'
} as const;

// Type for icon keys
export type IconType = keyof typeof ICONS;

// Icon size configuration
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps {
  type: IconType;
  size?: IconSize;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Base Icon component with StyleSystem integration
export const Icon: React.FC<IconProps> = ({ 
  type, 
  size = 'md',
  color,
  className = '', 
  style = {},
  ariaLabel,
  onClick,
  disabled = false
}) => {
  // Size mapping using StyleSystem tokens
  const sizeStyles: Record<IconSize, React.CSSProperties> = {
    xs: { fontSize: StyleSystem.tokens.fontSize.xs },
    sm: { fontSize: StyleSystem.tokens.fontSize.sm },
    md: { fontSize: StyleSystem.tokens.fontSize.base },
    lg: { fontSize: StyleSystem.tokens.fontSize.lg },
    xl: { fontSize: StyleSystem.tokens.fontSize.xl },
    '2xl': { fontSize: StyleSystem.tokens.fontSize['2xl'] }
  };

  const iconStyle: React.CSSProperties = {
    ...sizeStyles[size],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    userSelect: 'none',
    ...(color && { color }),
    ...(onClick && {
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...StyleSystem.transition()
    }),
    ...style
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  return (
    <span 
      className={`atis-icon ${className}`}
      style={iconStyle}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel || `${type} icon`}
      onClick={onClick ? handleClick : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {ICONS[type]}
    </span>
  );
};

// Action Icon with built-in button styling
interface ActionIconProps extends Omit<IconProps, 'onClick'> {
  onClick: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  loading?: boolean;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  type,
  size = 'md',
  variant = 'secondary',
  title,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const buttonStyle = {
    ...StyleSystem.button(variant, 'sm'),
    width: 'auto',
    height: 'auto',
    minWidth: '32px',
    minHeight: '32px',
    padding: StyleSystem.tokens.spacing[2],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      title={title}
      type="button"
      className={className}
      aria-label={title || `${type} action`}
    >
      {loading ? (
        <Icon type="LOADING" size={size} {...props} />
      ) : (
        <Icon type={type} size={size} {...props} />
      )}
    </button>
  );
};

// Status Icon with color coding
interface StatusIconProps extends Omit<IconProps, 'type' | 'color'> {
  status: 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info' | 'loading';
  showText?: boolean;
  text?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  showText = false, 
  text,
  size = 'sm',
  className = '',
  ...props 
}) => {
  const statusConfig = {
    active: { 
      icon: 'SUCCESS' as IconType, 
      color: StyleSystem.tokens.colors.success[500],
      text: text || 'Aktiv'
    },
    inactive: { 
      icon: 'INACTIVE' as IconType, 
      color: StyleSystem.tokens.colors.danger[500],
      text: text || 'Deaktiv'
    },
    success: { 
      icon: 'SUCCESS' as IconType, 
      color: StyleSystem.tokens.colors.success[500],
      text: text || 'Uğurlu'
    },
    warning: { 
      icon: 'WARNING' as IconType, 
      color: StyleSystem.tokens.colors.warning[500],
      text: text || 'Xəbərdarlıq'
    },
    error: { 
      icon: 'ERROR' as IconType, 
      color: StyleSystem.tokens.colors.danger[500],
      text: text || 'Xəta'
    },
    info: { 
      icon: 'INFO' as IconType, 
      color: StyleSystem.tokens.colors.info[500],
      text: text || 'Məlumat'
    },
    loading: { 
      icon: 'LOADING' as IconType, 
      color: StyleSystem.tokens.colors.gray[500],
      text: text || 'Yüklənir'
    }
  };

  const config = statusConfig[status];

  if (showText) {
    return (
      <div style={styles.flex('row', 'center', '2')} className={className}>
        <Icon 
          type={config.icon} 
          size={size} 
          color={config.color}
          {...props} 
        />
        <span style={{
          ...styles.text('sm', 'medium'),
          color: config.color
        }}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <Icon 
      type={config.icon} 
      size={size} 
      color={config.color}
      className={`status-icon status-${status} ${className}`}
      {...props} 
    />
  );
};

// Institution Type Icon with specific styling
interface InstitutionTypeIconProps extends Omit<IconProps, 'type'> {
  type: 'ministry' | 'region' | 'sektor' | 'school' | 'vocational' | 'university';
  showText?: boolean;
}

export const InstitutionTypeIcon: React.FC<InstitutionTypeIconProps> = ({ 
  type, 
  showText = false,
  size = 'md',
  className = '',
  ...props 
}) => {
  const typeConfig = {
    ministry: { icon: 'MINISTRY' as IconType, text: 'Nazirlik', color: StyleSystem.tokens.colors.primary[600] },
    region: { icon: 'REGION' as IconType, text: 'Regional İdarə', color: StyleSystem.tokens.colors.info[600] },
    sektor: { icon: 'SEKTOR' as IconType, text: 'Sektor', color: StyleSystem.tokens.colors.warning[600] },
    school: { icon: 'SCHOOL' as IconType, text: 'Məktəb', color: StyleSystem.tokens.colors.success[600] },
    vocational: { icon: 'VOCATIONAL' as IconType, text: 'Peşə Məktəbi', color: StyleSystem.tokens.colors.danger[600] },
    university: { icon: 'UNIVERSITY' as IconType, text: 'Universitet', color: StyleSystem.tokens.colors.gray[600] }
  };

  const config = typeConfig[type];

  if (showText) {
    return (
      <div style={styles.flex('row', 'center', '2')} className={className}>
        <Icon 
          type={config.icon} 
          size={size} 
          color={config.color}
          {...props} 
        />
        <span style={{
          ...styles.text('sm', 'medium'),
          color: config.color
        }}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <Icon 
      type={config.icon} 
      size={size} 
      color={config.color}
      className={`institution-type-icon institution-${type} ${className}`}
      {...props} 
    />
  );
};

// Loading Icon with animation
interface LoadingIconProps extends Omit<IconProps, 'type'> {
  spinning?: boolean;
}

export const LoadingIcon: React.FC<LoadingIconProps> = ({ 
  spinning = true,
  size = 'md',
  className = '',
  style = {},
  ...props 
}) => {
  const spinStyle = spinning ? {
    animation: 'spin 1s linear infinite'
  } : {};

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Icon 
        type="LOADING" 
        size={size}
        className={`loading-icon ${className}`}
        style={{ ...spinStyle, ...style }}
        {...props} 
      />
    </>
  );
};

// Icon Button - Combining icon with standard button styling
interface IconButtonProps {
  icon: IconType;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = ''
}) => {
  const iconSize: IconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <button
      style={{
        ...StyleSystem.button(variant, size, fullWidth),
        ...styles.flex('row', 'center', '2')
      }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      type="button"
      className={className}
    >
      {loading ? (
        <LoadingIcon size={iconSize} />
      ) : (
        <Icon type={icon} size={iconSize} />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};

// Helper function to get icon by string
export const getIcon = (type: IconType): string => {
  return ICONS[type];
};

// Helper to create icon with badge (notification count, status, etc.)
interface IconWithBadgeProps extends IconProps {
  badge?: {
    content: string | number;
    variant?: 'primary' | 'danger' | 'success' | 'warning';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
}

export const IconWithBadge: React.FC<IconWithBadgeProps> = ({
  badge,
  style = {},
  ...iconProps
}) => {
  if (!badge) {
    return <Icon {...iconProps} />;
  }

  const positionStyles = {
    'top-right': { top: '-8px', right: '-8px' },
    'top-left': { top: '-8px', left: '-8px' },
    'bottom-right': { bottom: '-8px', right: '-8px' },
    'bottom-left': { bottom: '-8px', left: '-8px' }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <Icon {...iconProps} />
      <span
        style={{
          ...StyleSystem.badge(badge.variant || 'danger'),
          position: 'absolute',
          ...positionStyles[badge.position || 'top-right'],
          minWidth: '18px',
          height: '18px',
          borderRadius: '9px',
          fontSize: '10px',
          lineHeight: '18px',
          textAlign: 'center',
          padding: '0 4px'
        }}
      >
        {badge.content}
      </span>
    </div>
  );
};

// Export for backward compatibility
export default Icon;