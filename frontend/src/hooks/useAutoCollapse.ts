import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';

/**
 * Hook to automatically collapse sidebar on mobile/tablet after navigation
 */
export const useAutoCollapse = () => {
  const location = useLocation();
  const { screenSize, isMobileOpen, closeMobile } = useLayout();

  useEffect(() => {
    // Auto-collapse on route change for mobile and tablet
    if ((screenSize === 'mobile' || screenSize === 'tablet') && isMobileOpen) {
      // Small delay to ensure navigation completes smoothly
      const timer = setTimeout(() => {
        closeMobile();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, screenSize, isMobileOpen, closeMobile]);

  // Click outside to close on mobile/tablet
  useEffect(() => {
    if ((screenSize !== 'mobile' && screenSize !== 'tablet') || !isMobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside sidebar
      const sidebar = document.querySelector('.app-sidebar');
      const menuToggle = document.querySelector('[data-menu-toggle]');
      
      if (
        sidebar && 
        !sidebar.contains(target) && 
        !menuToggle?.contains(target)
      ) {
        closeMobile();
      }
    };

    // Add event listener with slight delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [screenSize, isMobileOpen, closeMobile]);

  // ESC key to close on mobile/tablet
  useEffect(() => {
    if ((screenSize !== 'mobile' && screenSize !== 'tablet') || !isMobileOpen) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobile();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [screenSize, isMobileOpen, closeMobile]);
};