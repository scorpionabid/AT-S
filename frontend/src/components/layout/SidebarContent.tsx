import React, { memo, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVisibleMenuItems } from '../../utils/navigation';
import SidebarItem from './SidebarItem';

interface NavigationItem {
  id?: string;
  name?: string;
  title?: string;
  path?: string;
  href?: string;
  icon?: string;
  badge?: string | { text: string; color?: string } | number;
  children?: NavigationItem[];
}

interface SidebarContentProps {
  isCollapsed: boolean;
  expandedItems: string[];
  onToggleSubmenu: (itemId: string) => void;
}

// Convert MenuItem to NavigationItem
const convertToNavigationItem = (item: any): NavigationItem => {
  return {
    id: item.id,
    name: item.name,
    title: item.title,
    path: item.path,
    href: item.href,
    icon: typeof item.icon === 'string' ? item.icon : undefined,
    badge: item.badge,
    children: item.children?.map(convertToNavigationItem)
  };
};

const SidebarContent: React.FC<SidebarContentProps> = memo(({
  isCollapsed,
  expandedItems,
  onToggleSubmenu,
}) => {
  const { user } = useAuth();

  // Memoize menu items to prevent unnecessary recalculations
  const menuItems = useMemo(() => {
    const items = getVisibleMenuItems(user || null);
    return items.map(convertToNavigationItem);
  }, [user]);

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {menuItems.map((item) => (
        <SidebarItem
          key={item.id || item.name}
          item={item}
          isCollapsed={isCollapsed}
          isExpanded={expandedItems.includes(item.id || item.name || '')}
          onToggle={onToggleSubmenu}
        />
      ))}
    </nav>
  );
});

SidebarContent.displayName = 'SidebarContent';

export default SidebarContent;