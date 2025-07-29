/**
 * ATİS Enhanced Header Component
 * Modern header using modular CSS architecture
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const EnhancedHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, screenSize, toggleMobile } = useLayout();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Yeni tapşırıq',
      message: 'Sizə yeni tapşırıq təyin edildi',
      type: 'info',
      timestamp: '5 dəqiqə əvvəl',
      read: false
    },
    {
      id: '2',
      title: 'Anket tamamlandı',
      message: 'Məktəb rəhbərliyi anketi tamamladı',
      type: 'success',
      timestamp: '10 dəqiqə əvvəl',
      read: false
    },
    {
      id: '3',
      title: 'Sistem yeniləməsi',
      message: 'Sistem bu gecə yenilənəcək',
      type: 'warning',
      timestamp: '1 saat əvvəl',
      read: true
    }
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-info';
    }
  };

  const headerClasses = `
    header
    ${screenSize === 'mobile' ? 'header-mobile' : ''}
    ${screenSize === 'mobile' ? 'header-no-sidebar' : (isCollapsed ? 'header-with-sidebar-collapsed' : 'header-with-sidebar')}
  `.trim().replace(/\s+/g, ' ');

  return (
    <header className={headerClasses}>
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          {/* Mobile Menu Button */}
          {screenSize === 'mobile' && (
            <button
              className="header-mobile-menu"
              onClick={toggleMobile}
              aria-label="Menyunu aç"
            >
              <Menu className="header-mobile-menu-icon" />
            </button>
          )}

          {/* Breadcrumbs */}
          <div className="header-breadcrumbs">
            <div className="header-breadcrumb-item">
              <span className="header-breadcrumb-current">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="header-center">
          <div className="header-search" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <Search className="header-search-icon" />
              <input
                type="text"
                placeholder="Axtarış..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="header-search-clear"
                  aria-label="Axtarışı təmizlə"
                >
                  ×
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Notifications */}
          <div className="header-notifications" ref={notificationsRef}>
            <button
              className="header-notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Bildirişlər"
            >
              <Bell className="header-notifications-icon" />
              {unreadCount > 0 && (
                <span className="header-notifications-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="header-notifications-dropdown header-notifications-dropdown-open">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Bildirişlər</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`font-medium ${getNotificationTypeClass(notification.type)}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Bildiriş yoxdur
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium w-full text-center">
                    Hamısını gör
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="header-user" ref={profileRef}>
            <button
              className="header-user-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="İstifadəçi menyusu"
            >
              <div className="header-user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {screenSize !== 'mobile' && (
                <div className="header-user-info">
                  <div className="header-user-name">{user?.name || 'İstifadəçi'}</div>
                  <div className="header-user-role">{user?.role || 'Rol'}</div>
                </div>
              )}
              <ChevronDown 
                className={`header-user-dropdown-icon ${showProfileMenu ? 'header-user-dropdown-open' : ''}`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="header-user-dropdown header-user-dropdown-open">
                <div className="py-2">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      navigate('/settings/profile');
                      setShowProfileMenu(false);
                    }}
                  >
                    <User size={16} />
                    Profil
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                  >
                    <Settings size={16} />
                    Tənzimləmələr
                  </button>
                  <hr className="my-2" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Çıxış
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;