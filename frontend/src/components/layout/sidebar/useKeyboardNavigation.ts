import { useCallback } from 'react';

interface UseKeyboardNavigationProps {
  showSettingsMenu: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const useKeyboardNavigation = ({
  showSettingsMenu,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        if (showSettingsMenu) {
          e.preventDefault();
          const settingsButton = document.getElementById('user-menu-button');
          settingsButton?.focus();
        } else if (isMobileOpen) {
          onCloseMobile?.();
        }
        break;
        
      case 'ArrowRight':
        if (isCollapsed && !showSettingsMenu) {
          e.preventDefault();
          onToggleCollapse?.();
        }
        break;
        
      case 'ArrowLeft':
        if (!isCollapsed && !showSettingsMenu) {
          e.preventDefault();
          onToggleCollapse?.();
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowUp':
        if (showSettingsMenu) {
          e.preventDefault();
          const menuItems = Array.from(
            document.querySelectorAll('.settings-menu-item:not([disabled])')
          ) as HTMLElement[];
          
          if (menuItems.length === 0) return;
          
          const currentIndex = menuItems.findIndex(el => el === document.activeElement);
          let nextIndex = 0;
          
          if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
          }
          
          menuItems[nextIndex]?.focus();
        }
        break;
        
      case 'Home':
        if (showSettingsMenu) {
          e.preventDefault();
          const firstItem = document.querySelector('.settings-menu-item:not([disabled])') as HTMLElement;
          firstItem?.focus();
        }
        break;
        
      case 'End':
        if (showSettingsMenu) {
          e.preventDefault();
          const menuItems = document.querySelectorAll('.settings-menu-item:not([disabled])');
          const lastItem = menuItems[menuItems.length - 1] as HTMLElement;
          lastItem?.focus();
        }
        break;
      
      case 'Tab':
        if (!showSettingsMenu) return;
        
        const menuItems = Array.from(
          document.querySelectorAll('.settings-menu-item:not([disabled])')
        ) as HTMLElement[];
        
        if (menuItems.length === 0) return;
        
        const firstItem = menuItems[0];
        const lastItem = menuItems[menuItems.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstItem) {
            e.preventDefault();
            lastItem.focus();
          }
        } else {
          if (document.activeElement === lastItem) {
            e.preventDefault();
            firstItem.focus();
          }
        }
        break;
    }
  }, [showSettingsMenu, isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile]);

  return handleKeyDown;
};