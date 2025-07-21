import React, { memo } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import SidebarItem from './sidebar/SidebarItem';
import SidebarIcon, { IconName } from './sidebar/SidebarIcon';

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

// Helper function to get icon component by name using centralized SidebarIcon
const getIconComponent = (iconName?: string): React.ReactNode => {
  if (!iconName) return <SidebarIcon name="home" />;
  
  // Map string names to IconName type
  const iconMap: Record<string, IconName> = {
    'home': 'home',
    'settings': 'settings', 
    'users': 'users',
    'folder': 'folder',
    'file-text': 'file-text',
    'bell': 'bell',
    'message-square': 'message-square',
    'help-circle': 'help-circle',
    'grid': 'grid',
    'bar-chart': 'bar-chart',
    'calendar': 'calendar',
    'clipboard': 'clipboard',
    'shield': 'shield',
    'trending-up': 'trending-up',
    'lock': 'lock',
    'book': 'book',
    'check-circle': 'check-circle',
    'user': 'user',
    'archive': 'archive',
    'activity': 'activity'
  };
  
  const mappedIcon = iconMap[iconName] || 'home';
  return <SidebarIcon name={mappedIcon} />;
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
  const { 
    menuItems: rawMenuItems, 
    isMenuLoading 
  } = useNavigation();
  
  // Convert menu items to NavigationItem format
  const menuItems = rawMenuItems.map(convertToNavigationItem);

  if (isMenuLoading || !Array.isArray(menuItems) || menuItems.length === 0) {
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
            <SidebarItem
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