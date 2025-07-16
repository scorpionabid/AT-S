import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../contexts/LayoutContext';

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { isCollapsed, isMobileOpen, screenSize } = useLayout();
  
  // Generate CSS classes based on layout state
  const sidebarClasses = [
    'app-sidebar',
    isCollapsed ? 'collapsed' : '',
    screenSize === 'mobile' && isMobileOpen ? 'mobile-open' : ''
  ].filter(Boolean).join(' ');

  const mainClasses = [
    'app-main',
    isCollapsed ? 'sidebar-collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="app-layout">
      {/* Header */}
      <Header />
      
      {/* Sidebar */}
      <Sidebar variant="modern" theme="auto" />
      
      {/* Main Content */}
      <main className={mainClasses}>
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
export { Dashboard as DashboardLayout };
