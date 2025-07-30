import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  breadcrumbs
}) => {
  return (
    <div className="dashboard-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="stats-card-icon bg-primary-100 text-primary-600">
                {icon}
              </div>
            )}
            <div>
              <h1 className="chart-title">{title}</h1>
              {subtitle && <p className="chart-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-neutral-600 mt-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-primary-600">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-neutral-900">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;