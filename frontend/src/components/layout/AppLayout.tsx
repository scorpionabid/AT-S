import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import Sidebar from './Sidebar';
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
      <div className="page-container">
        <Sidebar />
        
        <div className="main-container">
          <Header />
          
          {/* Main Content Area */}
          <main className="content-container">
            {/* Content Container */}
            <div className="container-fluid">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemedStyleProvider>
  );
};

export default AppLayout;