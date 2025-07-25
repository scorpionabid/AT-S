import React, { useCallback, ReactNode, memo, useRef, useEffect, Suspense } from 'react';
import { 
  Home, Users, Building, Shield, Clipboard, CheckSquare, CheckCircle, 
  CalendarCheck, Calendar, BookOpen, School, FileText, TrendingUp, 
  BarChart, Settings, User, AlertTriangle, Clock
} from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { cn } from '../../utils/cn';
import SidebarContent from './SidebarContent';
import SidebarHeader from './sidebar/SidebarHeader';
import UserProfile from './sidebar/UserProfile';
import MobileOverlay from './sidebar/MobileOverlay';
import { useKeyboardNavigation } from './sidebar/useKeyboardNavigation';
import { SidebarErrorBoundary } from './sidebar/ErrorBoundaries';
import { SidebarSkeleton, LoadingOverlay } from './sidebar/LoadingStates';
import { ProgressiveEnhancement, FallbackSidebarContent, useOnlineStatus } from './sidebar/GracefulDegradation';
import { useSidebarState } from '../../hooks/useSidebarState';

// Icon mapping for navigation items
const getNavigationIcon = (iconName: string) => {
  const iconMap = {
    'home': Home,
    'users': Users,
    'building': Building,
    'shield': Shield,
    'clipboard': Clipboard,
    'check-square': CheckSquare,
    'check-circle': CheckCircle,
    'calendar-check': CalendarCheck,
    'calendar': Calendar,
    'book-open': BookOpen,
    'school': School,
    'file-text': FileText,
    'trending-up': TrendingUp,
    'bar-chart': BarChart,
    'settings': Settings,
    'user': User,
    'alert-triangle': AlertTriangle,
    'clock': Clock
  };
  
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};

interface SidebarProps {
  className?: string;
  variant?: 'modern' | 'classic';
  contentVariant?: 'default' | 'compact' | 'minimal';
  children?: ReactNode;
  enableErrorBoundary?: boolean;
  enableLoadingStates?: boolean;
  enableGracefulDegradation?: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

const Sidebar: React.FC<SidebarProps> = memo(({
  className = '',
  variant = 'modern',
  contentVariant = 'default',
  children,
  enableErrorBoundary = true,
  enableLoadingStates = true,
  enableGracefulDegradation = true,
  enableAutoRefresh = false,
  refreshInterval = 30000
}) => {
  const { 
    isCollapsed, 
    isHovered,
    toggleCollapse, 
    setHovered,
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop',
    sidebarWidth
  } = useLayout();
  
  const { 
    expandedItems, 
    toggleExpanded 
  } = useNavigation();

  // Sidebar state with loading and error handling
  const {
    isLoading,
    error,
    hasError,
    data,
    navigationItems,
    badges,
    userProfile,
    retry,
    refresh,
    clearError,
    canRetry,
    isStale
  } = useSidebarState({
    autoRefresh: enableAutoRefresh,
    refreshInterval,
    onError: (error) => {
      console.error('Sidebar data error:', error);
    }
  });

  // Online status detection
  const isOnline = useOnlineStatus();

  // Sync CSS variables with sidebar state (including hover state)
  useEffect(() => {
    const root = document.documentElement;
    if (screenSize === 'mobile') {
      root.style.setProperty('--sidebar-width', isMobileOpen ? '100vw' : '0px');
      root.style.setProperty('--sidebar-width-current', isMobileOpen ? '100vw' : '0px');
    } else {
      // Use computed sidebarWidth which accounts for hover state
      root.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
      root.style.setProperty('--sidebar-width-current', `${sidebarWidth}px`);
      
      // Set individual state variables for more precise control
      root.style.setProperty('--sidebar-width-collapsed', '80px');
      root.style.setProperty('--sidebar-width-expanded', '280px');
      root.style.setProperty('--is-sidebar-collapsed', isCollapsed ? '1' : '0');
      root.style.setProperty('--is-sidebar-hovered', isHovered ? '1' : '0');
    }
  }, [sidebarWidth, isMobileOpen, screenSize, isCollapsed, isHovered]);
  
  // Refs for touch gestures
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  
  // Handle keyboard navigation
  const handleKeyDown = useKeyboardNavigation({
    showSettingsMenu: false,
    isCollapsed,
    isMobileOpen,
    onToggleCollapse: toggleCollapse,
    onCloseMobile: closeMobile,
  });

  // Toggle submenu expansion using centralized navigation state
  const toggleSubmenu = useCallback((itemId: string) => {
    toggleExpanded(itemId);
  }, [toggleExpanded]);

  // Touch gesture handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (screenSize !== 'mobile') return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isDragging.current = false;
  }, [screenSize]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (screenSize !== 'mobile') return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    // Check if this is a horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isDragging.current = true;
      e.preventDefault(); // Prevent scrolling
    }
  }, [screenSize]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (screenSize !== 'mobile' || !isDragging.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const threshold = 50; // Minimum swipe distance
    
    // Swipe left to close (when sidebar is open)
    if (deltaX < -threshold && isMobileOpen) {
      closeMobile();
    }
    // Swipe right to open (when sidebar is closed) - handled by overlay or main content
    
    isDragging.current = false;
  }, [screenSize, isMobileOpen, closeMobile]);

  // Hover handlers for desktop sidebar expansion
  const handleMouseEnter = useCallback(() => {
    if (screenSize === 'desktop' && isCollapsed) {
      setHovered(true);
    }
  }, [screenSize, isCollapsed, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      setHovered(false);
    }
  }, [screenSize, setHovered]);

  // Determine effective sidebar state (collapsed but show expanded on hover)
  const isEffectivelyExpanded = !isCollapsed || (isCollapsed && isHovered);

  // Sidebar classes
  const sidebarClasses = cn(
    'app-sidebar',
    'flex flex-col h-screen fixed left-0 top-0',
    'transition-all duration-300 ease-in-out',
    isCollapsed ? 'collapsed' : '',
    isHovered && isCollapsed ? 'hovered' : '',
    className,
    variant === 'modern' && 'sidebar-glass-effect',
    // Mobile transitions
    screenSize === 'mobile' && [
      'transition-transform duration-300 ease-out',
      isMobileOpen ? 'sidebar-slide-in' : 'sidebar-slide-out'
    ],
    {
      'translate-x-0': isMobileOpen || screenSize !== 'mobile',
      '-translate-x-full': !isMobileOpen && screenSize === 'mobile'
    } as const
  );

  // Render sidebar content with error boundary and loading states
  const renderSidebarContent = () => {
    // Development debug info
    if (process.env.NODE_ENV === 'development') {
      console.log('Sidebar render state:', {
        isLoading,
        hasData: !!data,
        hasError,
        navigationItems: navigationItems?.length || 0,
        userProfile: !!userProfile,
        isCollapsed,
        isMobileOpen,
        screenSize
      });
    }

    const sidebarInner = (
      <aside 
        ref={sidebarRef}
        className={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        tabIndex={-1}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          width: `${sidebarWidth}px`,
          zIndex: isHovered && isCollapsed ? 'var(--z-dropdown)' : 'var(--z-sidebar)'
        }}
      >
        {/* Always render header first */}
        <SidebarHeader 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapse} 
        />

        {/* Show loading or content */}
        {isLoading && !data ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading...</p>
          </div>
        ) : hasError ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">Error loading sidebar</p>
            {canRetry && (
              <button onClick={retry} className="text-xs text-blue-600 mt-1">
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Enhanced navigation list */}
            <nav className="p-3 space-y-1">
              {(navigationItems || []).map((item, index) => {
                const IconComponent = getNavigationIcon(item.icon);
                const isActive = window.location.pathname === item.path;
                
                return (
                  <a
                    key={item.id || index}
                    href={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title={isCollapsed && !isHovered ? item.label : undefined}
                  >
                    <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                    {isEffectivelyExpanded && <span className="flex-1">{item.label}</span>}
                    {isEffectivelyExpanded && badges && badges[item.id] > 0 && (
                      <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                        {badges[item.id]}
                      </span>
                    )}
                    {!isEffectivelyExpanded && badges && badges[item.id] > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {/* User profile section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {userProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {isEffectivelyExpanded && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {typeof userProfile?.role === 'string' ? userProfile.role : (userProfile?.role?.name || userProfile?.role?.display_name || 'User')}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    );

    if (enableErrorBoundary) {
      return (
        <SidebarErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Sidebar Error Boundary:', error, errorInfo);
          }}
          maxRetries={3}
          resetOnPropsChange={true}
          resetKeys={[String(isCollapsed), String(isMobileOpen), screenSize]}
        >
          {sidebarInner}
        </SidebarErrorBoundary>
      );
    }

    return sidebarInner;
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <MobileOverlay 
        isVisible={isMobileOpen && screenSize === 'mobile'} 
        onClose={closeMobile} 
      />
      
      {renderSidebarContent()}
      
      {children}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;