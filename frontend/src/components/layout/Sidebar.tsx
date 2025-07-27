import React, { useCallback, ReactNode, memo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';
import { getVisibleMenuItems, isPathActive, MenuItem } from '../../utils/navigation/menuConfig';

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = memo(({ className = '' }) => {
  const layoutContext = useLayout();
  const { 
    isCollapsed, 
    isHovered,
    toggleCollapse, 
    setHovered,
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop'
  } = layoutContext;
  
  // Debug: LayoutContext məlumatları
  console.log('🔗 LayoutContext data:', {
    isCollapsed: layoutContext.isCollapsed,
    isHovered: layoutContext.isHovered,
    setHovered: typeof layoutContext.setHovered,
    screenSize: layoutContext.screenSize,
    fullContext: Object.keys(layoutContext)
  });
  
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get navigation items filtered by user permissions
  const navigationItems = getVisibleMenuItems(user);

  // Hover handlers for desktop sidebar expansion
  const handleMouseEnter = useCallback(() => {
    console.log('🐭 Sidebar mouseEnter:', { screenSize, isCollapsed, isHovered });
    if (screenSize === 'desktop' && isCollapsed) {
      console.log('✅ Setting hovered to TRUE');
      setHovered(true);
    }
  }, [screenSize, isCollapsed, setHovered, isHovered]);

  const handleMouseLeave = useCallback(() => {
    console.log('🐭 Sidebar mouseLeave:', { screenSize, isHovered });
    if (screenSize === 'desktop') {
      console.log('✅ Setting hovered to FALSE');
      setHovered(false);
    }
  }, [screenSize, setHovered, isHovered]);

  // Toggle submenu expansion
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Auto-expand active parent menu
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          isPathActive(location.pathname, child.path, child.exactMatch)
        );
        if (hasActiveChild) {
          setExpandedItems(prev => new Set([...prev, item.id]));
        }
      }
    });
  }, [location.pathname, navigationItems]);

  const isExpanded = (isCollapsed && !isHovered) ? false : true;
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('🔄 Sidebar state changed:', { 
      isCollapsed, 
      isHovered, 
      isExpanded, 
      screenSize,
      computedWidth: isCollapsed && !isHovered ? '80px' : '280px'
    });
  }, [isCollapsed, isHovered, isExpanded, screenSize]);

  // Debug: Log render state
  console.log('🎨 Sidebar render state:', {
    isLoading: false,
    hasData: navigationItems.length > 0,
    hasError: false,
    navigationItems: navigationItems.length,
    userProfile: !!user,
    isCollapsed,
    isHovered,
    isMobileOpen,
    screenSize
  });

  const renderNavigationItem = (item: MenuItem) => {
    const IconComponent = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isPathActive(location.pathname, item.path, item.exactMatch);
    const isItemExpanded = expandedItems.has(item.id);
    const shouldShowText = isExpanded;

    return (
      <div key={item.id} style={{ marginBottom: '4px' }}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: isItemActive ? '#eff6ff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: isItemActive ? '#2563eb' : '#4b5563',
              fontSize: '14px',
              fontWeight: isItemActive ? '600' : '500',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!isItemActive) e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (!isItemActive) e.currentTarget.style.background = 'transparent';
            }}
            title={!isExpanded ? item.title : undefined}
          >
            <IconComponent 
              size={20} 
              style={{ 
                minWidth: '20px',
                marginRight: isExpanded ? '12px' : '0'
              }} 
            />
            {isExpanded && (
              <>
                <span style={{ flex: 1 }}>{item.title}</span>
                {hasChildren && (
                  <ChevronRight 
                    size={16} 
                    style={{ 
                      transform: isItemExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                )}
              </>
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: isItemActive ? '#eff6ff' : 'transparent',
              borderRadius: '8px',
              color: isItemActive ? '#2563eb' : '#4b5563',
              fontSize: '14px',
              fontWeight: isItemActive ? '600' : '500',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isItemActive) e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              if (!isItemActive) e.currentTarget.style.background = 'transparent';
            }}
            title={!isExpanded ? item.title : undefined}
          >
            <IconComponent 
              size={20} 
              style={{ 
                minWidth: '20px',
                marginRight: isExpanded ? '12px' : '0'
              }} 
            />
            {isExpanded && <span>{item.title}</span>}
            {item.badge && isExpanded && (
              <span
                style={{
                  marginLeft: 'auto',
                  padding: '2px 6px',
                  background: item.badge.color === 'primary' ? '#dc2626' : '#6b7280',
                  color: 'white',
                  fontSize: '10px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}
              >
                {item.badge.text}
              </span>
            )}
          </Link>
        )}

        {/* Children/Submenu */}
        {hasChildren && isExpanded && isItemExpanded && (
          <div style={{ 
            marginLeft: '20px', 
            marginTop: '4px',
            borderLeft: '2px solid #e5e7eb',
            paddingLeft: '16px'
          }}>
            {item.children?.map((child) => {
              const ChildIconComponent = child.icon;
              const isChildActive = isPathActive(location.pathname, child.path, child.exactMatch);

              return (
                <Link
                  key={child.id}
                  to={child.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: isChildActive ? '#eff6ff' : 'transparent',
                    borderRadius: '6px',
                    color: isChildActive ? '#2563eb' : '#6b7280',
                    fontSize: '13px',
                    fontWeight: isChildActive ? '600' : '500',
                    textDecoration: 'none',
                    marginBottom: '2px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isChildActive) e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    if (!isChildActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ChildIconComponent size={16} style={{ marginRight: '8px' }} />
                  <span>{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {screenSize === 'mobile' && isMobileOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={closeMobile}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isCollapsed && !isHovered ? '80px' : '280px',
          height: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          zIndex: 1000,
          transform: screenSize === 'mobile' && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: screenSize === 'mobile' ? '4px 0 8px rgba(0, 0, 0, 0.1)' : 'none'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {/* Header */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}>
              A
            </div>
            {isExpanded && (
              <div style={{ marginLeft: '12px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  margin: 0
                }}>
                  ATİS
                </h2>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Təhsil İdarəetmə Sistemi
                </p>
              </div>
            )}
          </div>
          
          {screenSize === 'desktop' && (
            <button 
              onClick={toggleCollapse}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
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
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}

          {screenSize === 'mobile' && (
            <button 
              onClick={closeMobile}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '16px 12px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {navigationItems.map(renderNavigationItem)}
        </nav>

        {/* User Profile */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {user?.profile?.first_name?.charAt(0)?.toUpperCase() || 
             user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {isExpanded && (
            <div style={{ marginLeft: '12px', flex: 1 }}>
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
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {typeof user?.role === 'string' 
                  ? user.role 
                  : user?.role?.name || 'İstifadəçi'
                }
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;