import React, { Suspense, memo, useMemo } from 'react';
import { IconType } from 'react-icons';
import { cn } from '../../../utils/cn';

// Lazy load icon libraries
const FeatherIcons = React.lazy(() => 
  import('react-icons/fi').then(module => ({
    default: module
  }))
);

const MaterialIcons = React.lazy(() => 
  import('react-icons/md').then(module => ({
    default: module
  }))
);

const HeroIcons = React.lazy(() => 
  import('react-icons/hi').then(module => ({
    default: module
  }))
);

// Icon mapping with lazy loading
const iconMap = {
  // Feather Icons (most common)
  home: () => import('react-icons/fi').then(m => m.FiHome),
  user: () => import('react-icons/fi').then(m => m.FiUser),
  users: () => import('react-icons/fi').then(m => m.FiUsers),
  settings: () => import('react-icons/fi').then(m => m.FiSettings),
  search: () => import('react-icons/fi').then(m => m.FiSearch),
  bell: () => import('react-icons/fi').then(m => m.FiBell),
  message: () => import('react-icons/fi').then(m => m.FiMessageSquare),
  file: () => import('react-icons/fi').then(m => m.FiFile),
  folder: () => import('react-icons/fi').then(m => m.FiFolder),
  edit: () => import('react-icons/fi').then(m => m.FiEdit),
  plus: () => import('react-icons/fi').then(m => m.FiPlus),
  minus: () => import('react-icons/fi').then(m => m.FiMinus),
  check: () => import('react-icons/fi').then(m => m.FiCheck),
  x: () => import('react-icons/fi').then(m => m.FiX),
  chevronRight: () => import('react-icons/fi').then(m => m.FiChevronRight),
  chevronDown: () => import('react-icons/fi').then(m => m.FiChevronDown),
  chevronLeft: () => import('react-icons/fi').then(m => m.FiChevronLeft),
  chevronUp: () => import('react-icons/fi').then(m => m.FiChevronUp),
  menu: () => import('react-icons/fi').then(m => m.FiMenu),
  grid: () => import('react-icons/fi').then(m => m.FiGrid),
  list: () => import('react-icons/fi').then(m => m.FiList),
  eye: () => import('react-icons/fi').then(m => m.FiEye),
  eyeOff: () => import('react-icons/fi').then(m => m.FiEyeOff),
  sun: () => import('react-icons/fi').then(m => m.FiSun),
  moon: () => import('react-icons/fi').then(m => m.FiMoon),
  star: () => import('react-icons/fi').then(m => m.FiStar),
  heart: () => import('react-icons/fi').then(m => m.FiHeart),
  bookmark: () => import('react-icons/fi').then(m => m.FiBookmark),
  download: () => import('react-icons/fi').then(m => m.FiDownload),
  upload: () => import('react-icons/fi').then(m => m.FiUpload),
  share: () => import('react-icons/fi').then(m => m.FiShare),
  link: () => import('react-icons/fi').then(m => m.FiLink),
  lock: () => import('react-icons/fi').then(m => m.FiLock),
  unlock: () => import('react-icons/fi').then(m => m.FiUnlock),
  key: () => import('react-icons/fi').then(m => m.FiKey),
  shield: () => import('react-icons/fi').then(m => m.FiShield),
  activity: () => import('react-icons/fi').then(m => m.FiActivity),
  trending: () => import('react-icons/fi').then(m => m.FiTrendingUp),
  calendar: () => import('react-icons/fi').then(m => m.FiCalendar),
  clock: () => import('react-icons/fi').then(m => m.FiClock),
  mail: () => import('react-icons/fi').then(m => m.FiMail),
  phone: () => import('react-icons/fi').then(m => m.FiPhone),
  map: () => import('react-icons/fi').then(m => m.FiMap),
  mapPin: () => import('react-icons/fi').then(m => m.FiMapPin),
  globe: () => import('react-icons/fi').then(m => m.FiGlobe),
  wifi: () => import('react-icons/fi').then(m => m.FiWifi),
  bluetooth: () => import('react-icons/fi').then(m => m.FiBluetooth),
  camera: () => import('react-icons/fi').then(m => m.FiCamera),
  video: () => import('react-icons/fi').then(m => m.FiVideo),
  image: () => import('react-icons/fi').then(m => m.FiImage),
  music: () => import('react-icons/fi').then(m => m.FiMusic),
  play: () => import('react-icons/fi').then(m => m.FiPlay),
  pause: () => import('react-icons/fi').then(m => m.FiPause),
  stop: () => import('react-icons/fi').then(m => m.FiSquare),
  skipBack: () => import('react-icons/fi').then(m => m.FiSkipBack),
  skipForward: () => import('react-icons/fi').then(m => m.FiSkipForward),
  volume: () => import('react-icons/fi').then(m => m.FiVolume2),
  volumeOff: () => import('react-icons/fi').then(m => m.FiVolumeX),
  refresh: () => import('react-icons/fi').then(m => m.FiRefreshCw),
  rotate: () => import('react-icons/fi').then(m => m.FiRotateCw),
  archive: () => import('react-icons/fi').then(m => m.FiArchive),
  trash: () => import('react-icons/fi').then(m => m.FiTrash),
  delete: () => import('react-icons/fi').then(m => m.FiTrash2),
  copy: () => import('react-icons/fi').then(m => m.FiCopy),
  cut: () => import('react-icons/fi').then(m => m.FiScissors),
  paste: () => import('react-icons/fi').then(m => m.FiClipboard),
  save: () => import('react-icons/fi').then(m => m.FiSave),
  print: () => import('react-icons/fi').then(m => m.FiPrinter),
  info: () => import('react-icons/fi').then(m => m.FiInfo),
  help: () => import('react-icons/fi').then(m => m.FiHelpCircle),
  alert: () => import('react-icons/fi').then(m => m.FiAlertCircle),
  alertTriangle: () => import('react-icons/fi').then(m => m.FiAlertTriangle),
  checkCircle: () => import('react-icons/fi').then(m => m.FiCheckCircle),
  xCircle: () => import('react-icons/fi').then(m => m.FiXCircle),
  zap: () => import('react-icons/fi').then(m => m.FiZap),
  target: () => import('react-icons/fi').then(m => m.FiTarget),
  award: () => import('react-icons/fi').then(m => m.FiAward),
  gift: () => import('react-icons/fi').then(m => m.FiGift),
  package: () => import('react-icons/fi').then(m => m.FiPackage),
  box: () => import('react-icons/fi').then(m => m.FiBox),
  layers: () => import('react-icons/fi').then(m => m.FiLayers),
  command: () => import('react-icons/fi').then(m => m.FiCommand),
  terminal: () => import('react-icons/fi').then(m => m.FiTerminal),
  code: () => import('react-icons/fi').then(m => m.FiCode),
  database: () => import('react-icons/fi').then(m => m.FiDatabase),
  server: () => import('react-icons/fi').then(m => m.FiServer),
  cpu: () => import('react-icons/fi').then(m => m.FiCpu),
  hardDrive: () => import('react-icons/fi').then(m => m.FiHardDrive),
  monitor: () => import('react-icons/fi').then(m => m.FiMonitor),
  smartphone: () => import('react-icons/fi').then(m => m.FiSmartphone),
  tablet: () => import('react-icons/fi').then(m => m.FiTablet),
  laptop: () => import('react-icons/fi').then(m => m.FiLaptop),
  headphones: () => import('react-icons/fi').then(m => m.FiHeadphones),
  power: () => import('react-icons/fi').then(m => m.FiPower),
  battery: () => import('react-icons/fi').then(m => m.FiBattery),
  
  // ATİS specific icons
  dashboard: () => import('react-icons/fi').then(m => m.FiHome),
  institution: () => import('react-icons/fi').then(m => m.FiMapPin),
  survey: () => import('react-icons/fi').then(m => m.FiList),
  task: () => import('react-icons/fi').then(m => m.FiCheckSquare),
  document: () => import('react-icons/fi').then(m => m.FiFile),
  report: () => import('react-icons/fi').then(m => m.FiBarChart),
  analytics: () => import('react-icons/fi').then(m => m.FiTrendingUp),
  approval: () => import('react-icons/fi').then(m => m.FiCheckCircle),
  role: () => import('react-icons/fi').then(m => m.FiShield),
  department: () => import('react-icons/fi').then(m => m.FiUsers),
  region: () => import('react-icons/fi').then(m => m.FiMap),
  school: () => import('react-icons/fi').then(m => m.FiHome),
  student: () => import('react-icons/fi').then(m => m.FiUser),
  teacher: () => import('react-icons/fi').then(m => m.FiUserCheck),
  admin: () => import('react-icons/fi').then(m => m.FiUserCog),
  notification: () => import('react-icons/fi').then(m => m.FiBell),
  message: () => import('react-icons/fi').then(m => m.FiMessageSquare),
  chat: () => import('react-icons/fi').then(m => m.FiMessageCircle),
  email: () => import('react-icons/fi').then(m => m.FiMail),
  sms: () => import('react-icons/fi').then(m => m.FiMessageSquare),
  profile: () => import('react-icons/fi').then(m => m.FiUser),
  password: () => import('react-icons/fi').then(m => m.FiLock),
  security: () => import('react-icons/fi').then(m => m.FiShield),
  permission: () => import('react-icons/fi').then(m => m.FiKey),
  config: () => import('react-icons/fi').then(m => m.FiSettings),
  theme: () => import('react-icons/fi').then(m => m.FiSun),
  language: () => import('react-icons/fi').then(m => m.FiGlobe),
  backup: () => import('react-icons/fi').then(m => m.FiDownload),
  restore: () => import('react-icons/fi').then(m => m.FiUpload),
  import: () => import('react-icons/fi').then(m => m.FiUpload),
  export: () => import('react-icons/fi').then(m => m.FiDownload),
  sync: () => import('react-icons/fi').then(m => m.FiRefreshCw),
  offline: () => import('react-icons/fi').then(m => m.FiWifiOff),
  online: () => import('react-icons/fi').then(m => m.FiWifi),
  loading: () => import('react-icons/fi').then(m => m.FiLoader),
  error: () => import('react-icons/fi').then(m => m.FiAlertCircle),
  success: () => import('react-icons/fi').then(m => m.FiCheckCircle),
  warning: () => import('react-icons/fi').then(m => m.FiAlertTriangle),
  filter: () => import('react-icons/fi').then(m => m.FiFilter),
  sort: () => import('react-icons/fi').then(m => m.FiArrowUp),
  maximize: () => import('react-icons/fi').then(m => m.FiMaximize),
  minimize: () => import('react-icons/fi').then(m => m.FiMinimize),
  fullscreen: () => import('react-icons/fi').then(m => m.FiMaximize2),
  exitFullscreen: () => import('react-icons/fi').then(m => m.FiMinimize2),
  
  // Fallback icon
  default: () => import('react-icons/fi').then(m => m.FiCircle),
};

export type IconName = keyof typeof iconMap;

interface LazyIconProps {
  name: IconName;
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Loading placeholder component
const IconPlaceholder: React.FC<{ className?: string; size?: number | string }> = ({ 
  className, 
  size = 20 
}) => (
  <div 
    className={cn(
      'animate-pulse bg-gray-300 rounded-sm',
      className
    )}
    style={{
      width: size,
      height: size,
      minWidth: size,
      minHeight: size
    }}
    aria-hidden="true"
  />
);

// Error fallback component
const IconError: React.FC<{ className?: string; size?: number | string }> = ({ 
  className, 
  size = 20 
}) => (
  <div 
    className={cn(
      'flex items-center justify-center bg-red-100 text-red-600 rounded-sm text-xs font-bold',
      className
    )}
    style={{
      width: size,
      height: size,
      minWidth: size,
      minHeight: size
    }}
    title="Icon failed to load"
  >
    !
  </div>
);

// Individual icon component with lazy loading
const LazyIconComponent: React.FC<LazyIconProps> = memo(({ 
  name, 
  className, 
  size = 20, 
  color, 
  strokeWidth = 2,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  onClick,
  style
}) => {
  const IconComponent = useMemo(() => {
    const loadIcon = iconMap[name] || iconMap.default;
    
    return React.lazy(async () => {
      try {
        const IconModule = await loadIcon();
        return {
          default: (props: any) => <IconModule {...props} />
        };
      } catch (error) {
        console.warn(`Failed to load icon: ${name}`, error);
        return {
          default: (props: any) => <IconError {...props} />
        };
      }
    });
  }, [name]);

  return (
    <Suspense fallback={<IconPlaceholder className={className} size={size} />}>
      <IconComponent
        className={cn('flex-shrink-0', className)}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        onClick={onClick}
        style={style}
      />
    </Suspense>
  );
});

LazyIconComponent.displayName = 'LazyIcon';

// Icon cache for performance
const iconCache = new Map<IconName, React.ComponentType<any>>();

// Optimized icon component with caching
export const LazyIcon: React.FC<LazyIconProps> = memo((props) => {
  const { name } = props;
  
  // Use cached component if available
  const cachedComponent = iconCache.get(name);
  if (cachedComponent) {
    return <cachedComponent {...props} />;
  }
  
  return <LazyIconComponent {...props} />;
});

LazyIcon.displayName = 'LazyIcon';

// Preload commonly used icons
export const preloadIcons = async (iconNames: IconName[]) => {
  const promises = iconNames.map(async (name) => {
    try {
      const loadIcon = iconMap[name] || iconMap.default;
      const IconModule = await loadIcon();
      iconCache.set(name, IconModule);
      return { name, success: true };
    } catch (error) {
      console.warn(`Failed to preload icon: ${name}`, error);
      return { name, success: false, error };
    }
  });
  
  const results = await Promise.allSettled(promises);
  return results.map((result, index) => ({
    name: iconNames[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason : undefined
  }));
};

// Preload essential icons on app startup
export const preloadEssentialIcons = () => {
  const essentialIcons: IconName[] = [
    'home', 'user', 'users', 'settings', 'search', 'bell', 'message',
    'chevronRight', 'chevronDown', 'chevronLeft', 'menu', 'sun', 'moon',
    'dashboard', 'institution', 'survey', 'task', 'document', 'report',
    'plus', 'edit', 'check', 'x', 'info', 'error', 'success', 'warning'
  ];
  
  return preloadIcons(essentialIcons);
};

export default LazyIcon;