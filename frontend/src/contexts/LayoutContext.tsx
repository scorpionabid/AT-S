import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface LayoutContextType {
  // Desktop sidebar states
  isCollapsed: boolean;
  toggleCollapse: () => void;
  
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  
  // Computed sidebar width
  const sidebarWidth = React.useMemo(() => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      return isMobileOpen ? 280 : 0;
    }
    return isCollapsed ? 80 : 280;
  }, [screenSize, isCollapsed, isMobileOpen]);
  
  // Desktop collapse functionality
  const toggleCollapse = useCallback(() => {
    console.log('toggleCollapse called. Current isCollapsed:', isCollapsed, 'screenSize:', screenSize);
    if (screenSize === 'desktop') {
      console.log('Toggling isCollapsed from', isCollapsed, 'to', !isCollapsed);
      setIsCollapsed(prev => !prev);
    } else {
      console.log('Not on desktop, not toggling collapse');
    }
  }, [isCollapsed, screenSize]);
  
  // Mobile/tablet sidebar functionality
  const toggleMobile = () => {
    console.log('toggleMobile called. Current isMobileOpen:', isMobileOpen, 'screenSize:', screenSize);
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      console.log('Setting isMobileOpen to:', !isMobileOpen);
      setIsMobileOpen(prev => {
        console.log('isMobileOpen state updated to:', !prev);
        return !prev;
      });
    }
  };
  
  const closeMobile = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setIsMobileOpen(false);
    }
  };
  
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
      toggleMobile,
      closeMobile,
      
      // Legacy support (will be removed)
      isSidebarOpen: !isCollapsed,
      toggleSidebar: toggleCollapse,
      closeSidebar: () => setIsCollapsed(true)
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
