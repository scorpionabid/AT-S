import React, { memo } from 'react';
import { cn } from '../../../utils/cn';
import { 
  FiHome, FiSettings, FiUsers, FiFolder, FiFileText, FiBell, 
  FiMessageSquare, FiHelpCircle, FiChevronDown, FiChevronRight,
  FiGrid, FiBarChart, FiCalendar, FiClipboard, FiGlobe,
  FiLayers, FiMail, FiPhone, FiSearch, FiStar, FiTrendingUp,
  FiUser, FiLock, FiShield, FiBook, FiArchive, FiActivity,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiPlay,
  FiPause, FiSquare, FiChevronLeft, FiVolume2,
  FiEdit, FiTrash2, FiCopy, FiDownload, FiUpload, FiShare2,
  FiExternalLink, FiMaximize, FiMinimize, FiRefreshCw
} from 'react-icons/fi';

export type IconName = 
  | 'home' | 'settings' | 'users' | 'folder' | 'file-text' | 'bell'
  | 'message-square' | 'help-circle' | 'chevron-down' | 'chevron-right'
  | 'grid' | 'bar-chart' | 'calendar' | 'clipboard' | 'globe'
  | 'layers' | 'mail' | 'phone' | 'search' | 'star' | 'trending-up'
  | 'user' | 'lock' | 'shield' | 'book' | 'archive' | 'activity'
  | 'alert-circle' | 'check-circle' | 'x-circle' | 'info' | 'play'
  | 'pause' | 'square' | 'chevron-left' | 'volume-2'
  | 'edit' | 'trash-2' | 'copy' | 'download' | 'upload' | 'share-2'
  | 'external-link' | 'maximize' | 'minimize' | 'refresh-cw';

export interface SidebarIconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  animate?: boolean;
  className?: string;
  'aria-label'?: string;
}

const iconMap: Record<IconName, React.ComponentType<any>> = {
  'home': FiHome,
  'settings': FiSettings,
  'users': FiUsers,
  'folder': FiFolder,
  'file-text': FiFileText,
  'bell': FiBell,
  'message-square': FiMessageSquare,
  'help-circle': FiHelpCircle,
  'chevron-down': FiChevronDown,
  'chevron-right': FiChevronRight,
  'grid': FiGrid,
  'bar-chart': FiBarChart,
  'calendar': FiCalendar,
  'clipboard': FiClipboard,
  'globe': FiGlobe,
  'layers': FiLayers,
  'mail': FiMail,
  'phone': FiPhone,
  'search': FiSearch,
  'star': FiStar,
  'trending-up': FiTrendingUp,
  'user': FiUser,
  'lock': FiLock,
  'shield': FiShield,
  'book': FiBook,
  'archive': FiArchive,
  'activity': FiActivity,
  'alert-circle': FiAlertCircle,
  'check-circle': FiCheckCircle,
  'x-circle': FiXCircle,
  'info': FiInfo,
  'play': FiPlay,
  'pause': FiPause,
  'square': FiSquare,
  'chevron-left': FiChevronLeft,
  'volume-2': FiVolume2,
  'edit': FiEdit,
  'trash-2': FiTrash2,
  'copy': FiCopy,
  'download': FiDownload,
  'upload': FiUpload,
  'share-2': FiShare2,
  'external-link': FiExternalLink,
  'maximize': FiMaximize,
  'minimize': FiMinimize,
  'refresh-cw': FiRefreshCw
};

const SidebarIcon: React.FC<SidebarIconProps> = memo(({
  name,
  size = 'md',
  active = false,
  disabled = false,
  animate = true,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found. Using default home icon.`);
    return <FiHome className={className} aria-label={ariaLabel} {...props} />;
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    return sizes[size];
  };

  const iconClasses = cn(
    'flex-shrink-0',
    'transition-all duration-200 ease-out',
    getSizeClasses(),
    {
      // Color states
      'text-[var(--sidebar-icon)]': !active && !disabled,
      'text-[var(--sidebar-active-icon)]': active,
      'text-[var(--sidebar-icon)] opacity-50': disabled,
      
      // Hover effects (only if not disabled)
      'group-hover:text-[var(--sidebar-hover-icon)]': !disabled && !active,
      'group-hover:scale-105': !disabled && animate,
      
      // Active state effects
      'scale-110': active && animate,
      'drop-shadow-sm': active,
      
      // Animation effects
      'transition-transform': animate,
      'transform-gpu': animate,
      
      // Disabled state
      'cursor-not-allowed': disabled,
      'pointer-events-none': disabled
    },
    className
  );

  return (
    <IconComponent 
      className={iconClasses}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      {...props}
    />
  );
});

SidebarIcon.displayName = 'SidebarIcon';

export default SidebarIcon;