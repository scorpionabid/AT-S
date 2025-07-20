import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../common/regionadmin/layout/PageHeader';
import { getBreadcrumbItems } from '../../utils/navigation/menuConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { cn } from '../../utils/cn';

export interface StandardPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  // Layout variants
  variant?: 'default' | 'wide' | 'narrow' | 'fullscreen';
  // Content spacing
  spacing?: 'default' | 'compact' | 'loose';
  // Background options
  background?: 'default' | 'gray' | 'white' | 'transparent';
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  className = '',
  containerClassName = '',
  headerClassName = '',
  showBreadcrumbs = true,
  customBreadcrumbs,
  variant = 'default',
  spacing = 'default',
  background = 'default'
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { getMenuItemByPath } = useNavigation();

  // Generate breadcrumbs automatically if not provided
  const breadcrumbs = React.useMemo(() => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }
    
    if (!showBreadcrumbs) {
      return [];
    }

    try {
      const breadcrumbItems = getBreadcrumbItems(location.pathname);
      return breadcrumbItems.map(item => ({
        label: item.title,
        href: item.path === location.pathname ? undefined : item.path
      }));
    } catch (error) {
      console.warn('Error generating breadcrumbs:', error);
      return [];
    }
  }, [location.pathname, customBreadcrumbs, showBreadcrumbs]);

  // Get variant classes
  const getVariantClasses = () => {
    const variants = {
      default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      wide: 'max-w-[90%] mx-auto px-4 sm:px-6',
      narrow: 'max-w-screen-lg mx-auto px-4 sm:px-6',
      fullscreen: 'w-full px-0'
    };
    return variants[variant];
  };

  // Get spacing classes
  const getSpacingClasses = () => {
    const spacings = {
      default: 'py-6 space-y-6',
      compact: 'py-4 space-y-4',
      loose: 'py-8 space-y-8'
    };
    return spacings[spacing];
  };

  // Get background classes
  const getBackgroundClasses = () => {
    const backgrounds = {
      default: 'bg-gray-50',
      gray: 'bg-gray-100',
      white: 'bg-white',
      transparent: 'bg-transparent'
    };
    return backgrounds[background];
  };

  // Main container classes
  const containerClasses = cn(
    'standard-page-layout',
    'min-h-screen',
    getBackgroundClasses(),
    containerClassName
  );

  // Content wrapper classes
  const contentClasses = cn(
    'standard-page-content',
    getVariantClasses(),
    getSpacingClasses(),
    className
  );

  // Header wrapper classes
  const headerWrapperClasses = cn(
    'standard-page-header-wrapper',
    'bg-white border-b border-gray-200',
    'sticky top-0 z-10'
  );

  const headerContentClasses = cn(
    'standard-page-header-content',
    getVariantClasses(),
    'py-4',
    headerClassName
  );

  return (
    <DashboardLayout>
      <div className={containerClasses}>
        {/* Header Section */}
        {(title || breadcrumbs.length > 0 || actions) && (
          <div className={headerWrapperClasses}>
            <div className={headerContentClasses}>
              <PageHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
                breadcrumbs={breadcrumbs}
                actions={actions}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={contentClasses}>
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Export types for other components
export type { StandardPageLayoutProps };

// Quick preset components for common layouts
export const WidePageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant'>> = (props) => (
  <StandardPageLayout {...props} variant="wide" />
);

export const NarrowPageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant'>> = (props) => (
  <StandardPageLayout {...props} variant="narrow" />
);

export const FullscreenPageLayout: React.FC<Omit<StandardPageLayoutProps, 'variant'>> = (props) => (
  <StandardPageLayout {...props} variant="fullscreen" />
);

export const CompactPageLayout: React.FC<Omit<StandardPageLayoutProps, 'spacing'>> = (props) => (
  <StandardPageLayout {...props} spacing="compact" />
);

export default StandardPageLayout;