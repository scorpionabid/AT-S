import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../contexts/LayoutContext';

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { isCollapsed, isMobileOpen, screenSize } = useLayout();
  
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
