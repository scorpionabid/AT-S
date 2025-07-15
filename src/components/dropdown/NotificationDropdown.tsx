import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';
// Removed SCSS module import - using Tailwind CSS classes

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Yeni sorğu',
      message: 'Yeni sorğu yaradıldı və təsdiqi gözlənilir',
      timestamp: '5 dəqiqə əvvəl',
      read: false
    },
    {
      id: '2', 
      type: 'success',
      title: 'Hesabat hazır',
      message: 'Aylıq hesabat uğurla hazırlandı',
      timestamp: '1 saat əvvəl',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Sistem yeniləməsi',
      message: 'Bu gecə sistem yeniləməsi planlaşdırılır',
      timestamp: '3 saat əvvəl',
      read: true
    }
  ]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <FiCheck className="text-green-500" />;
      case 'warning': return <FiAlertCircle className="text-yellow-500" />;
      case 'error': return <FiX className="text-red-500" />;
      default: return <FiInfo className="text-blue-500" />;
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
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
      {/* Notification Trigger */}
      <button
        className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isOpen ? 'bg-blue-50 text-blue-600' : ''
        }`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications (${unreadCount} unread)`}
        title="Bildirişlər"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 mt-2 max-h-96 overflow-hidden" role="menu">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 m-0">Bildirişlər</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                onClick={markAllAsRead}
              >
                Hamısını oxudu et
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FiBell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Bildiriş yoxdur</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                    notification.read ? 'opacity-75' : 'bg-blue-50/50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 border border-gray-200">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 m-0 mb-1 truncate">{notification.title}</h4>
                    <p className="text-sm text-gray-600 m-0 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-400">{notification.timestamp}</span>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors duration-200">
                Hamısını gör
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
