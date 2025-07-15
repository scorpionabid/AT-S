import React from 'react';
import {
  // Navigation & Layout
  FiHome,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiMoreHorizontal,
  FiSidebar,
  
  // Users & People
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  
  // Actions
  FiPlus,
  FiEdit3,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiCopy,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiEye,
  FiEyeOff,
  
  // Communication
  FiBell,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSend,
  
  // Files & Documents
  FiFile,
  FiFileText,
  FiFolder,
  FiFolderPlus,
  FiPaperclip,
  
  // Data & Analytics
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  
  // Status & Feedback
  FiCheck,
  FiCheckCircle,
  FiX as FiClose,
  FiXCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiHelpCircle,
  
  // Settings & Configuration
  FiSettings,
  FiTool,
  FiSliders,
  FiToggleLeft,
  FiToggleRight,
  
  // Time & Calendar
  FiClock,
  FiCalendar,
  FiWatch,
  
  // Location & Geography
  FiMapPin,
  FiMap,
  FiGlobe,
  
  // Security & Privacy
  FiLock,
  FiUnlock,
  FiShield,
  FiEye as FiShow,
  FiEyeOff as FiHide,
  
  // Media & Content
  FiImage,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  
  // External & Links
  FiExternalLink,
  FiLink,
  FiLink2,
  
  // Loading & Progress
  FiLoader,
  
  // Misc
  FiStar,
  FiHeart,
  FiBookmark,
  FiTag,
  FiHash,
  FiZap,
  FiTarget,
  FiAward,
  FiGift,
} from 'react-icons/fi';

// Mapping of icon names to components
const ICON_MAP = {
  // Navigation & Layout
  home: FiHome,
  menu: FiMenu,
  close: FiX,
  'chevron-left': FiChevronLeft,
  'chevron-right': FiChevronRight,
  'chevron-up': FiChevronUp,
  'chevron-down': FiChevronDown,
  'more-horizontal': FiMoreHorizontal,
  sidebar: FiSidebar,
  
  // Users & People
  user: FiUser,
  users: FiUsers,
  'user-plus': FiUserPlus,
  'user-check': FiUserCheck,
  'user-x': FiUserX,
  
  // Actions
  plus: FiPlus,
  add: FiPlus,
  create: FiPlus,
  edit: FiEdit3,
  'edit-alt': FiEdit2,
  delete: FiTrash2,
  trash: FiTrash2,
  save: FiSave,
  copy: FiCopy,
  download: FiDownload,
  upload: FiUpload,
  refresh: FiRefreshCw,
  search: FiSearch,
  filter: FiFilter,
  view: FiEye,
  hide: FiEyeOff,
  show: FiShow,
  
  // Communication
  bell: FiBell,
  notifications: FiBell,
  mail: FiMail,
  email: FiMail,
  message: FiMessageSquare,
  chat: FiMessageSquare,
  phone: FiPhone,
  send: FiSend,
  
  // Files & Documents
  file: FiFile,
  'file-text': FiFileText,
  document: FiFileText,
  folder: FiFolder,
  'folder-plus': FiFolderPlus,
  attachment: FiPaperclip,
  
  // Data & Analytics
  'bar-chart': FiBarChart2,
  chart: FiBarChart2,
  'pie-chart': FiPieChart,
  'trending-up': FiTrendingUp,
  'trending-down': FiTrendingDown,
  activity: FiActivity,
  analytics: FiActivity,
  
  // Status & Feedback
  check: FiCheck,
  'check-circle': FiCheckCircle,
  success: FiCheckCircle,
  'x-circle': FiXCircle,
  error: FiXCircle,
  'alert-circle': FiAlertCircle,
  warning: FiAlertTriangle,
  'alert-triangle': FiAlertTriangle,
  info: FiInfo,
  help: FiHelpCircle,
  question: FiHelpCircle,
  
  // Settings & Configuration
  settings: FiSettings,
  tool: FiTool,
  tools: FiTool,
  sliders: FiSliders,
  'toggle-left': FiToggleLeft,
  'toggle-right': FiToggleRight,
  
  // Time & Calendar
  clock: FiClock,
  time: FiClock,
  calendar: FiCalendar,
  watch: FiWatch,
  
  // Location & Geography
  'map-pin': FiMapPin,
  location: FiMapPin,
  map: FiMap,
  globe: FiGlobe,
  
  // Security & Privacy
  lock: FiLock,
  unlock: FiUnlock,
  shield: FiShield,
  security: FiShield,
  
  // Media & Content
  image: FiImage,
  play: FiPlay,
  pause: FiPause,
  volume: FiVolume2,
  mute: FiVolumeX,
  
  // External & Links
  'external-link': FiExternalLink,
  external: FiExternalLink,
  link: FiLink,
  'link-2': FiLink2,
  
  // Loading & Progress
  loader: FiLoader,
  loading: FiLoader,
  spinner: FiLoader,
  
  // ATİS Specific - Education Icons
  dashboard: FiHome,
  institutions: FiUsers,
  surveys: FiFileText,
  reports: FiBarChart2,
  tasks: FiCheckCircle,
  roles: FiShield,
  profile: FiUser,
  
  // Misc
  star: FiStar,
  favorite: FiStar,
  heart: FiHeart,
  bookmark: FiBookmark,
  tag: FiTag,
  hash: FiHash,
  zap: FiZap,
  target: FiTarget,
  award: FiAward,
  gift: FiGift,
} as const;

// Icon names type - manually defined to ensure proper export
export type IconName = 
  | 'home' | 'menu' | 'close' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevron-down' 
  | 'more-horizontal' | 'sidebar' | 'user' | 'users' | 'user-plus' | 'user-check' | 'user-x'
  | 'plus' | 'add' | 'create' | 'edit' | 'edit-alt' | 'delete' | 'trash' | 'save' | 'copy' 
  | 'download' | 'upload' | 'refresh' | 'search' | 'filter' | 'view' | 'hide' | 'show'
  | 'bell' | 'notifications' | 'mail' | 'email' | 'message' | 'chat' | 'phone' | 'send'
  | 'file' | 'file-text' | 'document' | 'folder' | 'folder-plus' | 'attachment'
  | 'bar-chart' | 'chart' | 'pie-chart' | 'trending-up' | 'trending-down' | 'activity' | 'analytics'
  | 'check' | 'check-circle' | 'success' | 'x-circle' | 'error' | 'alert-circle' | 'warning' 
  | 'alert-triangle' | 'info' | 'help' | 'question'
  | 'settings' | 'tool' | 'tools' | 'sliders' | 'toggle-left' | 'toggle-right'
  | 'clock' | 'time' | 'calendar' | 'watch'
  | 'map-pin' | 'location' | 'map' | 'globe'
  | 'lock' | 'unlock' | 'shield' | 'security'
  | 'image' | 'play' | 'pause' | 'volume' | 'mute'
  | 'external-link' | 'external' | 'link' | 'link-2'
  | 'loader' | 'loading' | 'spinner'
  | 'dashboard' | 'institutions' | 'surveys' | 'reports' | 'tasks' | 'roles' | 'profile'
  | 'star' | 'favorite' | 'heart' | 'bookmark' | 'tag' | 'hash' | 'zap' | 'target' | 'award' | 'gift';

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  style?: React.CSSProperties;
}

/**
 * Icon component using Feather Icons (react-icons/fi)
 * 
 * @example
 * <Icon name="user" size={20} className="text-primary" />
 * <Icon name="home" size="1.5rem" color="var(--color-primary-500)" />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color,
  strokeWidth,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  style,
  ...props
}) => {
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found. Available icons:`, Object.keys(ICON_MAP));
    return null;
  }

  const iconStyle: React.CSSProperties = {
    ...style,
    ...(color && { color }),
  };

  return (
    <IconComponent
      size={size}
      className={`icon icon--${name} ${className}`}
      style={iconStyle}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
};

// Export icon names for TypeScript intellisense
export const iconNames = Object.keys(ICON_MAP) as IconName[];

// Utility function to check if icon exists
export const hasIcon = (name: string): name is IconName => {
  return name in ICON_MAP;
};

// Icon variants for common use cases
export const StatusIcon: React.FC<{ status: 'success' | 'warning' | 'error' | 'info'; size?: number }> = ({
  status,
  size = 20,
}) => {
  const iconMap = {
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    info: 'info',
  } as const;

  return <Icon name={iconMap[status]} size={size} className={`text-${status}`} />;
};

export const LoadingIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => {
  return (
    <Icon
      name="loader"
      size={size}
      className={`animate-spin ${className}`}
      aria-label="Yüklənir..."
    />
  );
};

// All exports are already declared above with the components