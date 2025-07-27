import React from 'react';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '' 
}) => {
  return (
    <div className={`standard-page-layout ${className}`}>
      {(title || subtitle || action) && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            {title && (
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                {subtitle}
              </p>
            )}
          </div>
          
          {action && (
            <div style={{ flexShrink: 0, marginLeft: '24px' }}>
              {action}
            </div>
          )}
        </div>
      )}
      
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default StandardPageLayout;