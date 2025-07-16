import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../contexts/LayoutContext';
// Removed dashboard-optimized.css - using pure Tailwind CSS

interface DashboardProps {
  children: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { isCollapsed, screenSize } = useLayout();
  
  // Tailwind CSS classes for main content area
  const mainClasses = [
    'flex flex-col min-h-screen transition-all duration-300',
    // Desktop layout: account for sidebar width
    screenSize === 'desktop' ? (isCollapsed ? 'ml-20' : 'ml-72') : '',
    // Mobile layout: no left margin, sidebar is overlay
    screenSize === 'mobile' ? 'ml-0' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar variant="modern" theme="auto" />
      <div className={mainClasses}>
        <Header />
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard as DashboardLayout };
