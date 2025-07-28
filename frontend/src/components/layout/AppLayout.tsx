import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import UnifiedSidebar from './UnifiedSidebar';
import Header from './Header';
import { ThemeProvider as ThemedStyleProvider } from '../../utils/theme/ThemeSystem';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed, screenSize, isMobileOpen, toggleMobile } = useLayout();
  const location = useLocation();

  // Don't show layout on login/test pages
  const isPublicPage = location.pathname === '/login' || 
                       location.pathname === '/login-test' || 
                       location.pathname === '/minimal-test' ||
                       location.pathname === '/test' ||
                       location.pathname === '/tailwind-test';

  // Handle mobile layout adjustments
  useEffect(() => {
    if (screenSize === 'mobile') {
      document.body.style.overflow = isMobileOpen ? 'hidden' : 'auto';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [screenSize, isMobileOpen]);

  // Return children only for public pages or unauthenticated users
  if (!isAuthenticated || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <ThemedStyleProvider>
      <div className="flex min-h-screen bg-secondary-50 relative">
        <UnifiedSidebar />
      
      {/* Mobile Backdrop Overlay */}
      {screenSize === 'mobile' && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[850]"
          onClick={toggleMobile}
        />
      )}
      
      <div className={`
        flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out
        ${screenSize === 'mobile' 
          ? 'ml-0' 
          : isCollapsed 
            ? 'ml-sidebar-collapsed' 
            : 'ml-sidebar'
        }
      `}>
        <Header />
        
        {/* Main Content Area */}
        <main className={`
          flex-1 mt-header bg-secondary-50 relative overflow-x-hidden
          ${screenSize === 'mobile' ? 'p-4' : 'p-6'}
          min-h-[calc(100vh-4rem)]
        `}>
          {/* Content Container */}
          <div className="max-w-full w-full mx-auto relative">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ThemedStyleProvider>
  );
};

export default AppLayout;