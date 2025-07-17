import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { cn } from '../../../../utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
  showHomeIcon?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  actions,
  className = '',
  showHomeIcon = true
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-gray-500">
          {showHomeIcon && (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center hover:text-gray-700 transition-colors"
                aria-label="Ana səhifə"
              >
                <FiHome className="w-4 h-4" />
              </Link>
              <FiChevronRight className="w-4 h-4" />
            </>
          )}
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <Link 
                  to={crumb.href} 
                  className="hover:text-gray-700 transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <FiChevronRight className="w-4 h-4" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      
      {/* Page Title and Actions */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {typeof icon === 'string' ? (
                  <span className="text-2xl">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0 flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;