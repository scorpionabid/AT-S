import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface LayoutContextType {
  // Desktop sidebar states
  isCollapsed: boolean;
  isHovered: boolean;
  toggleCollapse: () => void;
  setHovered: (hovered: boolean) => void;
  
  // Mobile sidebar states  
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  
  // Responsive detection
  screenSize: 'mobile' | 'tablet' | 'desktop';
  sidebarWidth: number; // computed value
  
  // Theme management
  theme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  
  // Legacy support (will be removed)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  
  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'system' 
      ? systemTheme === 'dark' 
      : theme === 'dark';
    
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme, systemTheme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'system') return 'dark';
      if (prev === 'dark') return 'light';
      return 'system';
    });
  }, []);
  
  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setScreenSize('mobile');
        setIsMobileOpen(false); // Auto-close on mobile
      } else if (width < 1024) {
        setScreenSize('tablet');
        setIsMobileOpen(false); // Auto-close on tablet
      } else {
        setScreenSize('desktop');
        setIsMobileOpen(false); // Reset mobile state on desktop
      }
    };
    
    // Set initial screen size
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Computed sidebar width (including hover state for collapsed sidebar)
  const sidebarWidth = React.useMemo(() => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      return isMobileOpen ? 280 : 0;
    }
    // On desktop: if collapsed but hovered, expand; otherwise use collapsed/expanded state
    if (isCollapsed && isHovered) {
      return 280; // Expanded on hover
    }
    return isCollapsed ? 80 : 280;
  }, [screenSize, isCollapsed, isMobileOpen, isHovered]);

  // CSS Variables sync with real-time updates - FIXED hover animation conflict
  React.useEffect(() => {
    const root = document.documentElement;
    
    // CRITICAL FIX: Don't set inline width - let CSS handle hover transitions
    // Only set state variables for CSS to use with calc() functions
    
    // Primary layout variables (base values only)
    root.style.setProperty('--sidebar-width-collapsed', '80px');
    root.style.setProperty('--sidebar-width-expanded', '280px');
    
    // State variables for conditional CSS - this is the key fix
    root.style.setProperty('--is-sidebar-collapsed', isCollapsed ? '1' : '0');
    root.style.setProperty('--is-sidebar-hovered', isHovered ? '1' : '0');
    root.style.setProperty('--is-mobile-open', isMobileOpen ? '1' : '0');
    root.style.setProperty('--screen-size', screenSize);
    
    // Mobile-specific transform for off-canvas behavior
    const translateValue = screenSize === 'mobile' ? 
      (isMobileOpen ? '0px' : '-100%') : '0px';
    root.style.setProperty('--sidebar-translate', translateValue);
    
    // Content offset calculation - let CSS handle desktop hover transitions
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      root.style.setProperty('--content-offset', isMobileOpen ? '280px' : '0px');
    } else {
      // Desktop: Use CSS calc() for smooth transitions
      root.style.setProperty('--content-offset', 'calc(var(--sidebar-width-collapsed) * (1 - var(--is-sidebar-collapsed)) + var(--sidebar-width-expanded) * var(--is-sidebar-collapsed))');
    }
    
  }, [screenSize, isCollapsed, isHovered, isMobileOpen]);
  
  // Desktop collapse functionality
  const toggleCollapse = useCallback(() => {
    if (screenSize === 'desktop') {
      setIsCollapsed(prev => !prev);
    }
  }, [isCollapsed, screenSize]);
  
  // Mobile/tablet sidebar functionality
  const toggleMobile = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setIsMobileOpen(prev => !prev);
    }
  };
  
  const closeMobile = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setIsMobileOpen(false);
    }
  };

  // Hover functionality for desktop sidebar
  const setHover = useCallback((hovered: boolean) => {
    if (screenSize === 'desktop') {
      setIsHovered(hovered);
    }
  }, [screenSize, isHovered]);
  
  // Legacy support functions (for backward compatibility)
  const toggleSidebar = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };
  
  const closeSidebar = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      closeMobile();
    }
  };
  
  // Legacy support
  const isSidebarOpen = screenSize === 'mobile' ? isMobileOpen : !isCollapsed;
  
  return (
    <LayoutContext.Provider value={{
      // Current state
      isCollapsed,
      isHovered,
      isMobileOpen,
      screenSize,
      sidebarWidth,
      
      // Theme
      theme: theme === 'system' ? systemTheme : theme,
      systemTheme,
      toggleTheme,
      setTheme,
      
      // Actions
      toggleCollapse,
      setHovered: setHover,
      toggleMobile,
      closeMobile,
      
      // Legacy support (will be removed)
      isSidebarOpen,
      toggleSidebar,
      closeSidebar
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
