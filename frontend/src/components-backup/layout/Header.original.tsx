import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const { isCollapsed, screenSize, toggleMobile } = useLayout();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      timestamp: '1 saat əvvəl',
      read: false
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: isCollapsed ? '80px' : '280px',
        right: 0,
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 999,
        transition: 'left 0.3s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        ...(screenSize === 'mobile' && {
          left: 0,
          paddingLeft: '16px'
        })
      }}
      className={className}
    >
      {/* Mobile menu button */}
      {screenSize === 'mobile' && (
        <button 
          onClick={toggleMobile}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#6b7280',
            marginRight: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Search */}
      <div style={{ 
        flex: 1, 
        maxWidth: '500px',
        marginRight: '24px'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '16px',
              color: '#9ca3af',
              zIndex: 1
            }}
          />
          <input
            type="text"
            placeholder="Axtarış..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '14px',
              background: '#f8fafc',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px'
      }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                minWidth: '18px',
                height: '18px',
                background: '#ef4444',
                borderRadius: '9px',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '320px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              marginTop: '8px',
              zIndex: 1000,
              maxHeight: '400px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f8fafc'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Bildirişlər
                </h3>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        background: notification.read ? 'transparent' : '#eff6ff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notification.read ? 'transparent' : '#eff6ff';
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#9ca3af'
                      }}>
                        {notification.timestamp}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    Bildiriş yoxdur
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              border: '1px solid #e5e7eb',
              background: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {user?.profile?.first_name?.charAt(0)?.toUpperCase() || 
               user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {screenSize !== 'mobile' && (
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  marginBottom: '2px'
                }}>
                  {user?.profile?.first_name && user?.profile?.last_name 
                    ? `${user.profile.first_name} ${user.profile.last_name}`
                    : user?.username || 'İstifadəçi'
                  }
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280'
                }}>
                  {typeof user?.role === 'string' 
                    ? user.role 
                    : user?.role?.name || 'İstifadəçi'
                  }
                </div>
              </div>
            )}
            <ChevronDown size={16} style={{ color: '#6b7280' }} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '240px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              marginTop: '8px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                background: '#f8fafc'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {user?.profile?.first_name && user?.profile?.last_name 
                    ? `${user.profile.first_name} ${user.profile.last_name}`
                    : user?.username || 'İstifadəçi'
                  }
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {user?.email}
                </div>
              </div>

              <div style={{ padding: '8px' }}>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#4b5563',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <Settings size={16} />
                  <span>Tənzimləmələr</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <LogOut size={16} />
                  <span>Çıxış</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;