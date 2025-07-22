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
    isCollapsed ? 'sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  const mainClasses = [
    'dashboard-main',
    isCollapsed ? 'collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={dashboardClasses}>
      {/* Mobile/Tablet overlay */}
      {(screenSize === 'mobile' || screenSize === 'tablet') && (
        <div 
          className={`mobile-sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
      
      {/* Header */}
      <Header />
      
      {/* Sidebar - no wrapper needed, it handles its own positioning */}
      <Sidebar variant="modern" />
      
      {/* Main Content */}
      <main className={mainClasses}>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
export { Dashboard as DashboardLayout };
