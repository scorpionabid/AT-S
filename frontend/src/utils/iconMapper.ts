import React from 'react';
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiFileText,
  FiShield,
  FiBarChart,
  FiSettings,
  FiList,
  FiUserPlus,
  FiGitBranch,
  FiPlus,
  FiEye,
  FiTrendingUp,
  FiClipboard,
  FiCalendar,
  FiCheckCircle,
  FiFolder,
  FiClock,
  FiBookOpen,
  FiUserCheck,
  FiAward
} from 'react-icons/fi';

// Icon mapping object
const iconMap: Record<string, React.ComponentType<any>> = {
  FiHome,
  FiUsers,
  FiGrid,
  FiFileText,
  FiShield,
  FiBarChart,
  FiSettings,
  FiList,
  FiUserPlus,
  FiGitBranch,
  FiPlus,
  FiEye,
  FiTrendingUp,
  FiClipboard,
  FiCalendar,
  FiCheckCircle,
  FiFolder,
  FiClock,
  FiBookOpen,
  FiUserCheck,
  FiAward
};

/**
 * Convert icon string to React component
 */
export const getIconComponent = (iconName: string): React.ComponentType<any> | null => {
  if (!iconName || typeof iconName !== 'string') {
    console.warn('getIconComponent: iconName is empty, undefined, or not a string:', iconName);
    return null;
  }
  
  // Normalize icon name (remove any whitespace)
  const normalizedName = iconName.trim();
  
  const component = iconMap[normalizedName];
  if (!component) {
    console.warn(`getIconComponent: Icon "${normalizedName}" not found in iconMap. Available icons:`, Object.keys(iconMap));
    return null;
  }
  
  return component;
};

/**
 * Render icon component with props
 */
export const renderIcon = (iconName: string, props: any = {}): React.ReactElement | null => {
  const IconComponent = getIconComponent(iconName);
  if (!IconComponent) {
    console.warn(`Icon not found: ${iconName}`);
    return null;
  }
  return React.createElement(IconComponent, props);
};

export default iconMap;