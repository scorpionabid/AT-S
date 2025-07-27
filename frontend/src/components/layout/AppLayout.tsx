import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useLayout();
  const location = useLocation();

  // Don't show layout on login page
  const isLoginPage = location.pathname === '/login' || 
                      location.pathname === '/login-test' || 
                      location.pathname === '/minimal-test' ||
                      location.pathname === '/test' ||
                      location.pathname === '/tailwind-test';

  if (!isAuthenticated || isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Header />
      <main style={{
        marginLeft: isCollapsed ? '80px' : '280px',
        marginTop: '64px',
        padding: '24px',
        minHeight: 'calc(100vh - 64px)',
        background: '#f9fafb',
        transition: 'margin-left 0.3s ease',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;