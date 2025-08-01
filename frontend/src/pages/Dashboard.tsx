import React, { useState, useEffect } from 'react';
import { StatsGrid, ContentCard, type StatCard } from '../components/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardServiceUnified } from '../services';
import type { DashboardStats } from '../services';
import { hasAnyRole, hasRole } from '../utils/auth/roleUtils';
import { ROLES } from '../constants/roles';
import SuperAdminDashboardUnified from '../components/admin/SuperAdminDashboardUnified';
import RegionAdminDashboardUnified from '../components/regionadmin/RegionAdminDashboardUnified';
import { DashboardFactory, DashboardType } from '../components/dashboard/DashboardFactory';

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
    return <SuperAdminDashboardUnified />;
  }

  // If RegionAdmin, show regional dashboard
  if (currentRole === 'regionadmin') {
    return <RegionAdminDashboardUnified />;
  }

  // If RegionOperator, show department-specific dashboard
  if (currentRole === 'regionoperator') {
    return <DashboardFactory type={DashboardType.REGION_ADMIN} />;
  }

  // If SektorAdmin, show sector-specific dashboard
  if (currentRole === 'sektoradmin') {
    return <DashboardFactory type={DashboardType.REGION_ADMIN} />;
  }

  // If MəktəbAdmin, show school-specific dashboard
  if (currentRole === 'məktəbadmin') {
    return <DashboardFactory type={DashboardType.SCHOOL_ADMIN} />;
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
      const data = await dashboardServiceUnified.getStats();
      
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

  const getDisplayStats = (): StatCard[] => {
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
      <div className="min-h-screen bg-secondary-50 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white p-8 rounded-lg shadow-card border border-neutral-200 text-center max-w-md">
            <h3 className="text-lg font-semibold text-error-600 mb-4">⚠️ Xəta baş verdi</h3>
            <p className="text-neutral-600 mb-6">{stats.error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors duration-200 font-medium"
            >
              Yenidən cəhd et
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="header-title-section">
          <h1 className="text-h1">{getWelcomeMessage()}, {user?.username}!</h1>
          <p className="text-secondary">
            ATİS sistemində son vəziyyət və fəaliyyətlər • Rol: {getRoleDisplayName()}
          </p>
        </div>

        {/* Statistics Cards */}
        <StatsGrid stats={displayStats} loading={stats.loading} />

        <div className="charts-container">
          {/* Quick Actions */}
          <ContentCard
            title="Tez Əməliyyatlar"
            subtitle="Ən çox istifadə olunan funksiyalar"
          >
            <div className="grid grid-cols-2 gap-4">
            {hasAnyRole(user, [ROLES.SUPERADMIN, ROLES.REGION_ADMIN]) && (
              <Link to="/users" className="flex flex-col items-center p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">👥</span>
                <span className="text-sm font-medium text-primary-700">İstifadəçilər</span>
              </Link>
            )}
            
            <Link to="/surveys" className="flex flex-col items-center p-4 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors duration-200 text-center group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</span>
              <span className="text-sm font-medium text-secondary-700">Sorğular</span>
            </Link>
            
            {hasAnyRole(user, [ROLES.SUPERADMIN, ROLES.REGION_ADMIN, ROLES.SCHOOL_ADMIN]) && (
              <Link to="/reports" className="flex flex-col items-center p-4 rounded-lg bg-success-50 hover:bg-success-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📈</span>
                <span className="text-sm font-medium text-success-700">Hesabatlar</span>
              </Link>
            )}
            
            {hasAnyRole(user, [ROLES.SUPERADMIN, ROLES.REGION_ADMIN]) && (
              <Link to="/institutions" className="flex flex-col items-center p-4 rounded-lg bg-warning-50 hover:bg-warning-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🏢</span>
                <span className="text-sm font-medium text-warning-700">Təşkilatlar</span>
              </Link>
            )}
            
            {user?.role === 'superadmin' && (
              <Link to="/roles" className="flex flex-col items-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🔐</span>
                <span className="text-sm font-medium text-purple-700">Rollər və İcazələr</span>
              </Link>
            )}
            
            {hasAnyRole(user, [ROLES.SUPERADMIN, ROLES.REGION_ADMIN]) && (
              <Link to="/settings" className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">⚙️</span>
                <span className="text-sm font-medium text-neutral-700">Tənzimləmələr</span>
              </Link>
            )}
            </div>
          </ContentCard>

          {/* Recent Activities */}
          <ContentCard
            title="Son Fəaliyyətlər"
            subtitle="Sistemdə son dəyişikliklər"
            loading={stats.loading}
          >
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="activities-list">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-header">
                      <div className={`
                        activity-icon
                        ${activity.type === 'survey' && 'bg-primary-100 text-primary-600'}
                        ${activity.type === 'report' && 'bg-success-100 text-success-600'}
                        ${activity.type === 'user' && 'bg-warning-100 text-warning-600'}
                        ${activity.type === 'system' && 'bg-neutral-100 text-neutral-600'}
                      `}>
                        {activity.type === 'survey' && '📊'}
                        {activity.type === 'report' && '📈'}
                        {activity.type === 'user' && '👤'}
                        {activity.type === 'system' && '⚙️'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          <span>{typeof activity.user === 'string' ? activity.user : activity.user?.username || activity.user?.name || 'N/A'}</span> {activity.action}
                        </div>
                        <div className="activity-description">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="activities-list">
                <div className="activity-item">
                  <div className="activity-header">
                    <div className="activity-icon bg-info-100 text-info-600">
                      <span>ℹ️</span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Hələlik fəaliyyət qeydə alınmayıb</div>
                      <div className="activity-description">--</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>

        </div>

        {/* System Status */}
        <ContentCard
          title="Sistem Statusu"
          subtitle="Sistemin hazırkı vəziyyəti"
        >
          <div className="status-grid">
            <div className="status-item">
              <div className={`
                status-indicator
                ${stats.systemStatus.database.status === 'healthy' && 'status-indicator-healthy'}
                ${stats.systemStatus.database.status === 'warning' && 'status-indicator-warning'}
                ${stats.systemStatus.database.status === 'error' && 'status-indicator-error'}
                ${stats.systemStatus.database.status === 'unknown' && 'status-indicator-unknown'}
              `}></div>
              <div>
                <div className="status-label">Database Bağlantısı</div>
                <div className="text-xs text-neutral-600">{stats.systemStatus.database.label}</div>
              </div>
            </div>
            <div className="status-item">
              <div className={`
                status-indicator
                ${stats.systemStatus.api.status === 'healthy' && 'status-indicator-healthy'}
                ${stats.systemStatus.api.status === 'warning' && 'status-indicator-warning'}
                ${stats.systemStatus.api.status === 'error' && 'status-indicator-error'}
                ${stats.systemStatus.api.status === 'unknown' && 'status-indicator-unknown'}
              `}></div>
              <div>
                <div className="status-label">API Servisi</div>
                <div className="text-xs text-neutral-600">{stats.systemStatus.api.label}</div>
              </div>
            </div>
            <div className="status-item">
              <div className={`
                status-indicator
                ${stats.systemStatus.memory.status === 'healthy' && 'status-indicator-healthy'}
                ${stats.systemStatus.memory.status === 'warning' && 'status-indicator-warning'}
                ${stats.systemStatus.memory.status === 'error' && 'status-indicator-error'}
                ${stats.systemStatus.memory.status === 'unknown' && 'status-indicator-unknown'}
              `}></div>
              <div>
                <div className="status-label">Yaddaş İstifadəsi</div>
                <div className="text-xs text-neutral-600">{stats.systemStatus.memory.label}</div>
              </div>
            </div>
            <div className="status-item">
              <div className={`
                status-indicator
                ${stats.systemStatus.storage.status === 'healthy' && 'status-indicator-healthy'}
                ${stats.systemStatus.storage.status === 'warning' && 'status-indicator-warning'}
                ${stats.systemStatus.storage.status === 'error' && 'status-indicator-error'}
                ${stats.systemStatus.storage.status === 'unknown' && 'status-indicator-unknown'}
              `}></div>
              <div>
                <div className="status-label">Yaddaş</div>
                <div className="text-xs text-neutral-600">{stats.systemStatus.storage.label}</div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
};

export default DashboardHome;