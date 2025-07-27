import React, { useState } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { isCollapsed, screenSize, toggleMobile } = useLayout();

  // Header classes
  const headerClasses = [
    'app-header',
    isCollapsed ? 'sidebar-collapsed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      {/* Mobile menu button */}
      {screenSize === 'mobile' && (
        <button 
          onClick={toggleMobile}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Search */}
      <div style={{ 
        flex: 1, 
        maxWidth: '400px',
        marginLeft: screenSize === 'mobile' ? '12px' : '0'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={16} 
            style={{
              position: 'absolute',
              left: '12px',
              color: '#9ca3af'
            }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#f9fafb'
            }}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginLeft: '24px'
      }}>
        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            background: '#ef4444',
            borderRadius: '50%'
          }} />
        </button>

        {/* User Menu */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '8px',
          cursor: 'pointer',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {screenSize !== 'mobile' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                {user?.name || 'User'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;