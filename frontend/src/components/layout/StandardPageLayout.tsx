import React from 'react';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  icon,
  actions,
  className = '' 
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {(title || subtitle || icon || actions) && (
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-left">
              {title && (
                <h1 className="page-header-title flex items-center gap-3">
                  {icon}
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="page-header-subtitle">
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="page-header-actions">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default StandardPageLayout;