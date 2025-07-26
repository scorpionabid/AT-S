import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../contexts/LayoutContext';
import { useAutoCollapse } from '../../hooks/useAutoCollapse';

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { isCollapsed, isMobileOpen, screenSize, closeMobile } = useLayout();
  
  // Auto-collapse sidebar on navigation for mobile
  useAutoCollapse();
  
  const dashboardClasses = [
    'dashboard',
    `dashboard-${screenSize}`,
    isCollapsed ? 'sidebar-collapsed' : '',
    isMobileOpen ? 'mobile-open' : ''
  ].filter(Boolean).join(' ');

  const mainClasses = [
    'dashboard-main',
    isCollapsed ? 'collapsed' : '',
    `main-${screenSize}`
  ].filter(Boolean).join(' ');

  // Note: Overlay system uses fixed positioning instead of grid layout for better reliability

  return (
    <div className={dashboardClasses}>
      {/* Mobile/Tablet overlay */}
      {(screenSize === 'mobile' || screenSize === 'tablet') && (
        <div 
          className={`mobile-sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
          onClick={closeMobile}
          aria-hidden="true"
          style={{ zIndex: 'var(--z-overlay, 999)' }}
        />
      )}
      
      {/* Overlay Layout System */}
      <div className="dashboard-grid-container">
        {/* Header - fixed positioning */}
        <div className="dashboard-grid-header">
          <Header />
        </div>
        
        {/* Sidebar - fixed positioning */}
        <div className="dashboard-grid-sidebar">
          <Sidebar variant="modern" />
        </div>
        
        {/* Main Content - with top padding for header */}
        <main className={mainClasses}>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard as DashboardLayout };
