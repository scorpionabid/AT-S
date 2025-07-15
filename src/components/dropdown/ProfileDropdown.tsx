import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
// Removed SCSS module import - using Tailwind CSS classes

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRoleDisplayName = (role: string | { name: string; display_name: string } | null) => {
    const roleNames: { [key: string]: string } = {
      'superadmin': 'Super Administrator',
      'regionadmin': 'Regional Administrator',  
      'schooladmin': 'School Administrator',
      'sektoradmin': 'Sektor Administrator',
      'müəllim': 'Müəllim',
      'regionoperator': 'Regional Operator'
    };
    
    if (!role) return 'İstifadəçi';
    const roleName = typeof role === 'string' ? role : role.name;
    return roleNames[roleName] || roleName;
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Profile Trigger */}
      <button
        className={`flex items-center gap-3 px-3 py-2 bg-transparent border-none rounded-md cursor-pointer transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOpen ? 'bg-blue-50 text-blue-600' : ''
        }`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm border-2 border-blue-200">
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-medium text-gray-900 m-0 truncate">{user?.username}</h4>
            <p className="text-xs text-gray-500 m-0 truncate">{getRoleDisplayName(user?.role || null)}</p>
          </div>
        </div>
        <FiChevronDown 
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          size={16} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 mt-2 animate-[dropdownFadeIn_0.2s_ease_forwards]" role="menu">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg border-2 border-blue-200">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 mt-3">
              <h3 className="text-base font-semibold text-gray-900 m-0 mb-1 truncate">{user?.username}</h3>
              <p className="text-xs text-gray-400 m-0 mb-1 truncate">{getRoleDisplayName(user?.role || null)}</p>
              <span className="text-sm text-gray-600 truncate">{user?.email || 'Email təyin edilməyib'}</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-4 my-2"></div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              className="flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none text-left cursor-pointer transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-blue-50 focus:text-blue-600"
              onClick={handleClose}
              role="menuitem"
            >
              <FiUser className="flex-shrink-0 w-5 h-5" />
              <span>Profili Düzənlə</span>
            </button>

            <button
              className="flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none text-left cursor-pointer transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-blue-50 focus:text-blue-600"
              onClick={handleClose}
              role="menuitem"
            >
              <FiSettings className="flex-shrink-0 w-5 h-5" />
              <span>Tənzimləmələr</span>
            </button>

            {/* Theme toggle moved to Header component */}
          </div>

          <div className="h-px bg-gray-100 mx-4 my-2"></div>

          {/* Logout */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none text-left cursor-pointer transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:bg-red-100 focus:text-red-600"
            onClick={handleLogout}
            role="menuitem"
          >
            <FiLogOut className="flex-shrink-0 w-5 h-5" />
            <span>Çıxış</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
