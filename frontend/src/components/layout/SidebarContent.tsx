import React, { memo, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVisibleMenuItems } from '../../utils/navigation';
import EnhancedSidebarItem from './sidebar/EnhancedSidebarItem';
import { FiHome, FiSettings, FiUsers, FiFolder, FiFileText, FiBell, FiMessageSquare, FiHelpCircle } from 'react-icons/fi';

export interface NavigationItem {
  id: string;
  name: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | { text: string; color?: string } | number;
  children?: NavigationItem[];
  roles?: string[];
}

interface SidebarContentProps {
  isCollapsed: boolean;
  expandedItems: string[];
  onToggleSubmenu: (itemId: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
}

// Helper function to get icon component by name
const getIconComponent = (iconName?: string): React.ReactNode => {
  switch (iconName) {
    case 'home': return <FiHome className="w-5 h-5" />;
    case 'settings': return <FiSettings className="w-5 h-5" />;
    case 'users': return <FiUsers className="w-5 h-5" />;
    case 'folder': return <FiFolder className="w-5 h-5" />;
    case 'file-text': return <FiFileText className="w-5 h-5" />;
    case 'bell': return <FiBell className="w-5 h-5" />;
    case 'message-square': return <FiMessageSquare className="w-5 h-5" />;
    case 'help-circle': return <FiHelpCircle className="w-5 h-5" />;
    default: return <FiHome className="w-5 h-5" />;
  }
};

// Convert MenuItem to NavigationItem
const convertToNavigationItem = (item: any): NavigationItem => {
  return {
    id: item.id || item.path || Math.random().toString(36).substr(2, 9),
    name: item.name || '',
    title: item.title || item.name || '',
    path: item.path || '#',
    icon: typeof item.icon === 'string' ? getIconComponent(item.icon) : item.icon,
    badge: item.badge,
    children: item.children?.map(convertToNavigationItem),
    roles: item.roles || []
  };
};

const SidebarContent: React.FC<SidebarContentProps> = memo(({
  isCollapsed,
  expandedItems,
  onToggleSubmenu,
  variant = 'default'
}) => {
  const { user } = useAuth();

  // Memoize menu items to prevent unnecessary recalculations
  const menuItems = useMemo(() => {
    try {
      const items = getVisibleMenuItems(user || null);
      return Array.isArray(items) ? items.map(convertToNavigationItem) : [];
    } catch (error) {
      console.error('Error loading menu items:', error);
      return [];
    }
  }, [user]);

  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return (
      <div className="flex-1 p-4 text-sm text-[var(--text-tertiary)] text-center">
        {isCollapsed ? (
          <div className="w-8 h-8 mx-auto bg-[var(--color-neutral-200)] rounded-full animate-pulse" />
        ) : (
          <div className="space-y-2">
            <div className="w-full h-4 bg-[var(--color-neutral-200)] rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-[var(--color-neutral-200)] rounded animate-pulse mx-auto" />
            <div className="w-1/2 h-4 bg-[var(--color-neutral-200)] rounded animate-pulse mx-auto" />
          </div>
        )}
      </div>
    );
  }

  return (
    <nav 
      className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--sidebar-border)] scrollbar-track-transparent"
      role="navigation"
      aria-label="Main navigation"
    >
      {menuItems.map((item, index) => {
        const itemId = item.id || item.name || '';
        return (
          <div
            key={itemId}
            className="stagger-animation"
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <EnhancedSidebarItem
              item={item}
              isCollapsed={isCollapsed}
              isExpanded={expandedItems.includes(itemId)}
              onToggle={onToggleSubmenu}
              variant={variant}
            />
          </div>
        );
      })}
    </nav>
  );
});

SidebarContent.displayName = 'SidebarContent';

export default SidebarContent;