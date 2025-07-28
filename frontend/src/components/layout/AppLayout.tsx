import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import UnifiedSidebar from './UnifiedSidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed, screenSize, isMobileOpen } = useLayout();
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
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: '#f8fafc',
      position: 'relative'
    }}>
      <UnifiedSidebar />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '100vh',
        marginLeft: screenSize === 'mobile' ? 0 : (isCollapsed ? '80px' : '280px'),
        transition: 'margin-left 0.3s ease'
      }}>
        <Header />
        
        {/* Main Content Area */}
        <main style={{
          flex: 1,
          marginTop: '64px',
          padding: screenSize === 'mobile' ? '16px' : '24px',
          minHeight: 'calc(100vh - 64px)',
          background: '#f8fafc',
          position: 'relative',
          overflowX: 'hidden'
        }}>
          {/* Content Container */}
          <div style={{
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
            position: 'relative'
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;