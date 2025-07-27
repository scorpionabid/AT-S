import React, { useCallback, ReactNode, memo } from 'react';
import { 
  Home, Users, Building, Shield, Clipboard, CheckSquare, CheckCircle, 
  CalendarCheck, Calendar, BookOpen, School, FileText, TrendingUp, 
  BarChart, Settings, User, AlertTriangle, Clock
} from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { useNavigation } from '../../contexts/NavigationContext';

// Icon mapping for navigation items
const getNavigationIcon = (iconName: string) => {
  const iconMap = {
    'home': Home,
    'users': Users,
    'building': Building,
    'shield': Shield,
    'clipboard': Clipboard,
    'check-square': CheckSquare,
    'check-circle': CheckCircle,
    'calendar-check': CalendarCheck,
    'calendar': Calendar,
    'book-open': BookOpen,
    'school': School,
    'file-text': FileText,
    'trending-up': TrendingUp,
    'bar-chart': BarChart,
    'settings': Settings,
    'user': User,
    'alert-triangle': AlertTriangle,
    'clock': Clock
  };
  
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};

interface SidebarProps {
  className?: string;
  children?: ReactNode;
}

// Temporary navigation data
const navigationItems = [
  { id: '1', label: 'Dashboard', path: '/', icon: 'home' },
  { id: '2', label: 'Users', path: '/users', icon: 'users' },
  { id: '3', label: 'Institutions', path: '/institutions', icon: 'building' },
  { id: '4', label: 'Departments', path: '/departments', icon: 'clipboard' },
  { id: '5', label: 'Surveys', path: '/surveys', icon: 'check-square' },
  { id: '6', label: 'Reports', path: '/reports', icon: 'bar-chart' },
  { id: '7', label: 'Settings', path: '/settings', icon: 'settings' },
];

const Sidebar: React.FC<SidebarProps> = memo(({ className = '', children }) => {
  const { 
    isCollapsed, 
    isHovered,
    toggleCollapse, 
    setHovered,
    isMobileOpen, 
    closeMobile, 
    screenSize = 'desktop'
  } = useLayout();

  // Hover handlers for desktop sidebar expansion
  const handleMouseEnter = useCallback(() => {
    if (screenSize === 'desktop' && isCollapsed) {
      setHovered(true);
    }
  }, [screenSize, isCollapsed, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (screenSize === 'desktop') {
      setHovered(false);
    }
  }, [screenSize, setHovered]);

  // Sidebar classes
  const sidebarClasses = [
    'app-sidebar',
    isCollapsed ? 'collapsed' : '',
    isMobileOpen ? 'mobile-open' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile overlay */}
      {screenSize === 'mobile' && (
        <div 
          className={`mobile-overlay ${isMobileOpen ? 'visible' : ''}`}
          onClick={closeMobile}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={sidebarClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: '#3b82f6', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              A
            </div>
            {!isCollapsed && (
              <div style={{ marginLeft: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>ATİS</h2>
              </div>
            )}
            <button 
              onClick={toggleCollapse}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navigationItems.map((item) => {
            const IconComponent = getNavigationIcon(item.icon);
            const isActive = window.location.pathname === item.path;
            
            return (
              <a
                key={item.id}
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed && !isHovered ? item.label : undefined}
              >
                <IconComponent className="nav-item-icon" />
                <span className="nav-item-text">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            U
          </div>
          {!isCollapsed && (
            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                User
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Admin
              </div>
            </div>
          )}
        </div>
      </aside>
      
      {children}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;