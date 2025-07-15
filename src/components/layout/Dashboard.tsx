import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../contexts/LayoutContext';
import '../../styles/dashboard-optimized.css';

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { isCollapsed, screenSize } = useLayout();
  
  const mainClasses = [
    'dashboard-main',
    screenSize === 'desktop' && isCollapsed ? 'collapsed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="dashboard">
      <Sidebar variant="modern" theme="auto" />
      <div className={mainClasses}>
        <Header />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard as DashboardLayout };
