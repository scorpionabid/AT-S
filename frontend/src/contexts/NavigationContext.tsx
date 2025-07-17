import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getVisibleMenuItems, MenuItem } from '../utils/navigation/menuConfig';

interface NavigationContextType {
  // Menu items state
  menuItems: MenuItem[];
  isMenuLoading: boolean;
  
  // Expanded items state (centralized)
  expandedItems: string[];
  toggleExpanded: (itemId: string) => void;
  setExpandedItems: (items: string[]) => void;
  
  // Active item tracking
  activeItem: string | null;
  setActiveItem: (itemId: string | null) => void;
  
  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredMenuItems: MenuItem[];
  
  // Utility functions
  refreshMenuItems: () => void;
  getMenuItemById: (id: string) => MenuItem | null;
  getMenuItemByPath: (path: string) => MenuItem | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load menu items based on user permissions
  const loadMenuItems = useCallback(async () => {
    try {
      setIsMenuLoading(true);
      const items = getVisibleMenuItems(user);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setMenuItems([]);
    } finally {
      setIsMenuLoading(false);
    }
  }, [user]);

  // Refresh menu items
  const refreshMenuItems = useCallback(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Toggle expanded state for menu items
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  // Find menu item by ID
  const getMenuItemById = useCallback((id: string): MenuItem | null => {
    const findItem = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findItem(menuItems);
  }, [menuItems]);

  // Find menu item by path
  const getMenuItemByPath = useCallback((path: string): MenuItem | null => {
    const findItem = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findItem(menuItems);
  }, [menuItems]);

  // Filter menu items based on search query
  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      const filtered: MenuItem[] = [];
      
      for (const item of items) {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchesSearch) {
          filtered.push(item);
        } else if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            filtered.push({
              ...item,
              children: filteredChildren
            });
          }
        }
      }
      
      return filtered;
    };
    
    return filterItems(menuItems);
  }, [menuItems, searchQuery]);

  // Load menu items when user changes
  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Auto-expand parent items when a child is active
  useEffect(() => {
    if (activeItem) {
      const item = getMenuItemById(activeItem);
      if (item) {
        // Find parent items and expand them
        const findParents = (items: MenuItem[], targetId: string, parents: string[] = []): string[] => {
          for (const item of items) {
            if (item.id === targetId) {
              return parents;
            }
            if (item.children) {
              const result = findParents(item.children, targetId, [...parents, item.id]);
              if (result.length > 0) return result;
            }
          }
          return [];
        };
        
        const parentIds = findParents(menuItems, activeItem);
        if (parentIds.length > 0) {
          setExpandedItems(prev => {
            const newExpanded = [...prev];
            parentIds.forEach(id => {
              if (!newExpanded.includes(id)) {
                newExpanded.push(id);
              }
            });
            return newExpanded;
          });
        }
      }
    }
  }, [activeItem, menuItems, getMenuItemById]);

  const value: NavigationContextType = {
    // Menu items state
    menuItems,
    isMenuLoading,
    
    // Expanded items state
    expandedItems,
    toggleExpanded,
    setExpandedItems,
    
    // Active item tracking
    activeItem,
    setActiveItem,
    
    // Search functionality
    searchQuery,
    setSearchQuery,
    filteredMenuItems,
    
    // Utility functions
    refreshMenuItems,
    getMenuItemById,
    getMenuItemByPath,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};