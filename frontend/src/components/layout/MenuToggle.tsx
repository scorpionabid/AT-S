import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { useLayout } from '../../contexts/LayoutContext';

interface MenuToggleProps {
  className?: string;
  size?: number;
}

const MenuToggle: React.FC<MenuToggleProps> = ({
  className = '',
  size = 20,
}) => {
  const { toggleMobile, toggleCollapse, screenSize } = useLayout();

  const handleMenuToggle = () => {
    if (screenSize === 'mobile') {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };

  const ariaLabel = screenSize === 'mobile' ? 'Toggle menu' : 'Toggle sidebar';

  return (
    <button
      onClick={handleMenuToggle}
      className={`p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transition-smooth ${className}`}
      aria-label={ariaLabel}
      data-menu-toggle
    >
      <FiMenu size={size} />
    </button>
  );
};

export default MenuToggle;