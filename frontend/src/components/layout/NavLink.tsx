import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, children, className = '' }) => {
  const location = useLocation();
  const { closeMobile, screenSize } = useLayout();
  
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(`${to}/`));

  const handleClick = () => {
    // Mobile-da sidebar-ı bağla
    if (screenSize === 'mobile') {
      closeMobile();
    }
  };

  return (
    <Link
      to={to}
      className={`${className} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default NavLink;
