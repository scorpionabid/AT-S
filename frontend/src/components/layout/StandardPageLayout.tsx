import React, { ReactNode } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../common/regionadmin/layout/PageHeader';
import { cn } from '../../utils/cn';

// Simplified StandardPageLayout - minimal wrapper for DashboardLayout
export interface StandardPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  className = '',
  showBreadcrumbs = true,
  customBreadcrumbs
}) => {
  return (
    <DashboardLayout>
      <div className={cn('standard-page-layout min-h-full', className)}>
        {/* Page Header */}
        <div 
          className="bg-white border-b border-gray-200 sticky"
          style={{ 
            top: 'var(--header-height, 80px)', 
            zIndex: 'var(--z-page-header)' 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <PageHeader
              title={title}
              subtitle={subtitle}
              icon={icon}
              actions={actions}
              showBreadcrumbs={showBreadcrumbs}
              customBreadcrumbs={customBreadcrumbs}
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StandardPageLayout;