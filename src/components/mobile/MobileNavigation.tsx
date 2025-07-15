import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, IconName } from '../common/Icon';

interface MobileNavItem {
  id: string;
  label: string;
  path: string;
  icon: IconName;
  badge?: string | number;
  requiredRoles?: string[];
}

interface MobileNavigationProps {
  className?: string;
}

const mainNavItems: MobileNavItem[] = [
  {
    id: 'dashboard',
    label: 'Ana səhifə',
    path: '/dashboard',
    icon: 'home',
  },
  {
    id: 'users',
    label: 'İstifadəçilər',
    path: '/users',
    icon: 'users',
    requiredRoles: ['superadmin', 'regionadmin'],
  },
  {
    id: 'surveys',
    label: 'Sorğular',
    path: '/surveys',
    icon: 'file-text',
    requiredRoles: ['superadmin', 'regionadmin', 'schooladmin', 'müəllim'],
  },
  {
    id: 'reports',
    label: 'Hesabatlar',
    path: '/reports',
    icon: 'bar-chart',
    requiredRoles: ['superadmin', 'regionadmin', 'schooladmin'],
  },
  {
    id: 'more',
    label: 'Digər',
    path: '/more',
    icon: 'more-horizontal',
  },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  className = '',
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide navigation on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const hasPermission = (item: MobileNavItem): boolean => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(user?.role || '');
  };

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const visibleItems = mainNavItems.filter(hasPermission).slice(0, 5);

  return (
    <nav
      className={classNames(
        'mobile-nav',
        {
          'mobile-nav--hidden': !isVisible,
        },
        className
      )}
    >
      <div className="mobile-nav__container">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={classNames(
              'mobile-nav__item',
              {
                'mobile-nav__item--active': isActive(item.path),
              }
            )}
          >
            <div className="mobile-nav__icon-container">
              <Icon 
                name={item.icon} 
                size={24} 
                className="mobile-nav__icon"
              />
              {item.badge && (
                <span className="mobile-nav__badge">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mobile-nav__label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

// Mobile App Bar
interface MobileAppBarProps {
  title: string;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export const MobileAppBar: React.FC<MobileAppBarProps> = ({
  title,
  onMenuClick,
  onSearchClick,
  actions,
  showBackButton = false,
  onBackClick,
  className = '',
}) => {
  return (
    <header className={classNames('mobile-app-bar', className)}>
      <div className="mobile-app-bar__start">
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="mobile-app-bar__button"
            aria-label="Geri"
          >
            <Icon name="chevron-left" size={24} />
          </button>
        ) : (
          <button
            onClick={onMenuClick}
            className="mobile-app-bar__button"
            aria-label="Menyu"
          >
            <Icon name="menu" size={24} />
          </button>
        )}
      </div>

      <div className="mobile-app-bar__content">
        <h1 className="mobile-app-bar__title">{title}</h1>
      </div>

      <div className="mobile-app-bar__end">
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            className="mobile-app-bar__button"
            aria-label="Axtarış"
          >
            <Icon name="search" size={24} />
          </button>
        )}
        {actions}
      </div>
    </header>
  );
};

// Mobile Drawer Menu
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer">
      <div 
        className="mobile-drawer__overlay"
        onClick={onClose}
        aria-label="Menyu bağla"
      />
      <div className={classNames('mobile-drawer__content', className)}>
        <div className="mobile-drawer__header">
          <button
            onClick={onClose}
            className="mobile-drawer__close"
            aria-label="Bağla"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
        <div className="mobile-drawer__body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile FAB (Floating Action Button)
interface MobileFABProps {
  icon: IconName;
  label?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'mobile-fab',
        `mobile-fab--${variant}`,
        `mobile-fab--${size}`,
        className
      )}
      aria-label={label}
    >
      <Icon name={icon} size={size === 'sm' ? 18 : size === 'lg' ? 28 : 24} />
      {label && <span className="mobile-fab__label">{label}</span>}
    </button>
  );
};

// Mobile Pull to Refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = '',
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      
      if (distance > 10) {
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold + 40));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  return (
    <div
      className={classNames('pull-to-refresh', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="pull-to-refresh__indicator"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: isPulling ? 1 : 0,
        }}
      >
        <div className={classNames(
          'pull-to-refresh__spinner',
          {
            'pull-to-refresh__spinner--active': isRefreshing || pullDistance >= threshold,
          }
        )}>
          <Icon name="refresh" size={20} />
        </div>
        <span className="pull-to-refresh__text">
          {isRefreshing 
            ? 'Yenilənir...' 
            : pullDistance >= threshold 
              ? 'Burax və yenilə' 
              : 'Yeniləmək üçün aşağı çək'
          }
        </span>
      </div>
      
      <div 
        className="pull-to-refresh__content"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileNavigation;