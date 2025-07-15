import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import styles from './ProfileDropdown.module.scss';

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
    <div className={`${styles.profileDropdown} ${className}`} ref={dropdownRef}>
      {/* Profile Trigger */}
      <button
        className={`${styles.profileTrigger} ${isOpen ? styles.active : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        <div className={styles.profileInfo}>
          <div className={styles.userAvatar}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <h4>{user?.username}</h4>
            <p>{getRoleDisplayName(user?.role || null)}</p>
          </div>
        </div>
        <FiChevronDown 
          className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`} 
          size={16} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          {/* User Info Section */}
          <div className={styles.userSection}>
            <div className={styles.userAvatarLarge}>
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className={styles.userDetailsLarge}>
              <h3>{user?.username}</h3>
              <p>{getRoleDisplayName(user?.role || null)}</p>
              <span className={styles.userEmail}>{user?.email || 'Email təyin edilməyib'}</span>
            </div>
          </div>

          <div className={styles.divider}></div>

          {/* Menu Items */}
          <div className={styles.menuItems}>
            <button
              className={styles.menuItem}
              onClick={handleClose}
              role="menuitem"
            >
              <FiUser className={styles.menuIcon} />
              <span>Profili Düzənlə</span>
            </button>

            <button
              className={styles.menuItem}
              onClick={handleClose}
              role="menuitem"
            >
              <FiSettings className={styles.menuIcon} />
              <span>Tənzimləmələr</span>
            </button>

            {/* Theme toggle moved to Header component */}
          </div>

          <div className={styles.divider}></div>

          {/* Logout */}
          <button
            className={`${styles.menuItem} ${styles.logoutItem}`}
            onClick={handleLogout}
            role="menuitem"
          >
            <FiLogOut className={styles.menuIcon} />
            <span>Çıxış</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
