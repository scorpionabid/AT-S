import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  className = '' 
}) => {
  return (
    <div className={`dashboard-layout ${className}`}>
      {(title || subtitle) && (
        <div style={{ 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {title && (
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

// Default export for backward compatibility
const Dashboard: React.FC<DashboardLayoutProps> = DashboardLayout;

export default Dashboard;