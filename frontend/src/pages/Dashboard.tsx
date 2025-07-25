import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardServiceUnified } from '../services';
import type { DashboardStats } from '../services';
import SuperAdminDashboard from '../components/admin/SuperAdminDashboard';
import { RegionAdminDashboard } from '../components/regionadmin/dashboard';
import RegionOperatorDashboard from '../components/rolespecific/RegionOperatorDashboard';
import SektorAdminDashboard from '../components/rolespecific/SektorAdminDashboard';
import MektebAdminDashboard from '../components/rolespecific/MektebAdminDashboard';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // Helper function to get user role as string
  const getUserRole = (): string | null => {
    if (typeof user?.role === 'string') {
      return user.role;
    } else if (typeof user?.role === 'object' && user?.role?.name) {
      return user.role.name;
    } else if (user?.roles && user.roles.length > 0) {
      return user.roles[0];
    }
    return null;
  };

  const currentRole = getUserRole();

  // If SuperAdmin, show advanced dashboard
  if (currentRole === 'superadmin') {
    return <SuperAdminDashboard />;
  }

  // If RegionAdmin, show regional dashboard
  if (currentRole === 'regionadmin') {
    return <RegionAdminDashboard />;
  }

  // If RegionOperator, show department-specific dashboard
  if (currentRole === 'regionoperator') {
    return <RegionOperatorDashboard />;
  }

  // If SektorAdmin, show sector-specific dashboard
  if (currentRole === 'sektoradmin') {
    return <SektorAdminDashboard />;
  }

  // If MəktəbAdmin, show school-specific dashboard
  if (currentRole === 'məktəbadmin') {
    return <MektebAdminDashboard />;
  }
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInstitutions: 0,
    totalSurveys: 0,
    activeSurveys: 0,
    pendingSurveys: 0,
    completedSurveys: 0,
    recentActivities: [],
    systemStatus: {
      database: { status: 'unknown', label: 'Bilinmir' },
      api: { status: 'unknown', label: 'Bilinmir' },
      memory: { status: 'unknown', label: 'Bilinmir' },
      storage: { status: 'unknown', label: 'Bilinmir' }
    },
    usersByRole: {},
    institutionsByLevel: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Dashboard: Fetching stats...');
      const data = await dashboardService.getStats();
      
      console.log('Dashboard: Stats received', data);
      setStats({
        ...data,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Məlumatlar yüklənərkən xəta baş verdi' 
      }));
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sabahınız xeyir';
    if (hour < 18) return 'Günortanız xeyir';
    return 'Axşamınız xeyir';
  };

  const getRoleDisplayName = () => {
    const roleNames: Record<string, string> = {
      'superadmin': 'Super Administrator',
      'regionadmin': 'Regional Administrator', 
      'schooladmin': 'School Administrator',
      'müəllim': 'Müəllim',
      'regionoperator': 'Regional Operator'
    };
    
    let userRole: string;
    if (typeof user?.role === 'string') {
      userRole = user.role;
    } else if (typeof user?.role === 'object' && user?.role?.name) {
      userRole = user.role.name;
    } else if (user?.roles && user.roles.length > 0) {
      userRole = user.roles[0]; // Use first role from roles array
    } else {
      return 'İstifadəçi';
    }
    
    return roleNames[userRole] || userRole || 'İstifadəçi';
  };

  const getDisplayStats = () => {
    if (stats.loading) {
      return [
        { title: 'Yüklənir...', value: '...', icon: '⏳', color: 'blue', change: '' },
        { title: 'Yüklənir...', value: '...', icon: '⏳', color: 'green', change: '' },
        { title: 'Yüklənir...', value: '...', icon: '⏳', color: 'purple', change: '' },
        { title: 'Yüklənir...', value: '...', icon: '⏳', color: 'orange', change: '' }
      ];
    }

    if (currentRole === 'superadmin') {
      return [
        {
          title: 'Ümumi İstifadəçilər',
          value: stats.totalUsers.toLocaleString(),
          icon: '👥',
          color: 'blue',
          change: '+' + Math.round((stats.totalUsers / 100) * 5) + '%',
        },
        {
          title: 'Aktiv Təşkilatlar', 
          value: stats.totalInstitutions.toLocaleString(),
          icon: '🏢',
          color: 'green',
          change: '+' + Math.round((stats.totalInstitutions / 10) * 2) + '%',
        },
        {
          title: 'Ümumi Sorğular',
          value: stats.totalSurveys.toLocaleString(),
          icon: '📊',
          color: 'purple',
          change: '+' + Math.round((stats.totalSurveys / 5) * 3) + '%',
        },
        {
          title: 'Aktiv Sorğular',
          value: stats.activeSurveys.toLocaleString(),
          icon: '📈',
          color: 'orange',
          change: '+' + Math.round((stats.activeSurveys / 2) * 1) + '%',
        }
      ];
    }

    // Default stats for other roles
    return [
      {
        title: 'Mənim Sorğularım',
        value: stats.totalSurveys.toLocaleString(),
        icon: '📊',
        color: 'purple',
        change: '+15%',
      },
      {
        title: 'Tamamlanmış',
        value: Math.round(stats.totalSurveys * 0.7).toString(),
        icon: '✅',
        color: 'green',
        change: '+8%',
      }
    ];
  };

  const displayStats = getDisplayStats();

  // Error state göstərmək üçün
  if (stats.error) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ Xəta baş verdi</h3>
            <p>{stats.error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="retry-button"
            >
              Yenidən cəhd et
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1 className="page-title">{getWelcomeMessage()}, {user?.username}!</h1>
        <p className="page-description">
          ATİS sistemində son vəziyyət və fəaliyyətlər • Rol: {getRoleDisplayName()}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {displayStats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <span>{stat.icon}</span>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className="stat-change positive">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tez Əməliyyatlar</h3>
            <p className="card-description">Ən çox istifadə olunan funksiyalar</p>
          </div>
          <div className="card-content">
            <div className="quick-actions">
              {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
                <Link to="/users" className="quick-action-btn">
                  <span className="action-icon">👥</span>
                  <span>İstifadəçilər</span>
                </Link>
              )}
              
              <Link to="/surveys" className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span>Sorğular</span>
              </Link>
              
              {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'schooladmin') && (
                <Link to="/reports" className="quick-action-btn">
                  <span className="action-icon">📈</span>
                  <span>Hesabatlar</span>
                </Link>
              )}
              
              {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
                <Link to="/institutions" className="quick-action-btn">
                  <span className="action-icon">🏢</span>
                  <span>Təşkilatlar</span>
                </Link>
              )}
              
              {user?.role === 'superadmin' && (
                <Link to="/roles" className="quick-action-btn">
                  <span className="action-icon">🔐</span>
                  <span>Rollər və İcazələr</span>
                </Link>
              )}
              
              {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
                <Link to="/settings" className="quick-action-btn">
                  <span className="action-icon">⚙️</span>
                  <span>Tənzimləmələr</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Son Fəaliyyətlər</h3>
            <p className="card-description">Sistemdə son dəyişikliklər</p>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {stats.loading ? (
                <div className="activity-item">
                  <div className="activity-icon loading">⏳</div>
                  <div className="activity-content">
                    <p className="activity-text">Fəaliyyətlər yüklənir...</p>
                  </div>
                </div>
              ) : stats.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'survey' && '📊'}
                      {activity.type === 'report' && '📈'}
                      {activity.type === 'user' && '👤'}
                      {activity.type === 'system' && '⚙️'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{typeof activity.user === 'string' ? activity.user : activity.user?.username || activity.user?.name || 'N/A'}</strong> {activity.action}
                      </p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <div className="activity-icon system">ℹ️</div>
                  <div className="activity-content">
                    <p className="activity-text">Hələlik fəaliyyət qeydə alınmayıb</p>
                    <span className="activity-time">--</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sistem Statusu</h3>
            <p className="card-description">Sistemin hazırkı vəziyyəti</p>
          </div>
          <div className="card-content">
            <div className="status-list">
              <div className="status-item">
                <span className={`status-indicator ${stats.systemStatus.database.status}`}></span>
                <span>Database Bağlantısı</span>
                <span className="status-value">{stats.systemStatus.database.label}</span>
              </div>
              <div className="status-item">
                <span className={`status-indicator ${stats.systemStatus.api.status}`}></span>
                <span>API Servisi</span>
                <span className="status-value">{stats.systemStatus.api.label}</span>
              </div>
              <div className="status-item">
                <span className={`status-indicator ${stats.systemStatus.memory.status}`}></span>
                <span>Yaddaş İstifadəsi</span>
                <span className="status-value">{stats.systemStatus.memory.label}</span>
              </div>
              <div className="status-item">
                <span className={`status-indicator ${stats.systemStatus.storage.status}`}></span>
                <span>Yaddaş</span>
                <span className="status-value">{stats.systemStatus.storage.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;