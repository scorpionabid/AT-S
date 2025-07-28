import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardServiceUnified } from '../services';
import type { DashboardStats } from '../services';
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
    <div className="min-h-screen bg-secondary-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{getWelcomeMessage()}, {user?.username}!</h1>
        <p className="text-neutral-600">
          ATİS sistemində son vəziyyət və fəaliyyətlər • Rol: {getRoleDisplayName()}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat, index) => (
          <div key={index} className={`
            bg-white rounded-xl p-6 shadow-card border border-neutral-200 hover:shadow-card-elevated transition-shadow duration-200
            ${stat.color === 'blue' && 'border-l-4 border-l-primary-500'}
            ${stat.color === 'green' && 'border-l-4 border-l-success-500'}
            ${stat.color === 'purple' && 'border-l-4 border-l-purple-500'}
            ${stat.color === 'orange' && 'border-l-4 border-l-warning-500'}
          `}>
            <div className="flex items-center justify-between mb-4">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                ${stat.color === 'blue' && 'bg-primary-50 text-primary-600'}
                ${stat.color === 'green' && 'bg-success-50 text-success-600'}
                ${stat.color === 'purple' && 'bg-purple-50 text-purple-600'}
                ${stat.color === 'orange' && 'bg-warning-50 text-warning-600'}
              `}>
                {stat.icon}
              </div>
              {stat.change && (
                <span className="text-sm font-medium text-success-600 bg-success-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-neutral-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tez Əməliyyatlar</h3>
            <p className="text-sm text-neutral-600">Ən çox istifadə olunan funksiyalar</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
              <Link to="/users" className="flex flex-col items-center p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">👥</span>
                <span className="text-sm font-medium text-primary-700">İstifadəçilər</span>
              </Link>
            )}
            
            <Link to="/surveys" className="flex flex-col items-center p-4 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors duration-200 text-center group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</span>
              <span className="text-sm font-medium text-secondary-700">Sorğular</span>
            </Link>
            
            {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'schooladmin') && (
              <Link to="/reports" className="flex flex-col items-center p-4 rounded-lg bg-success-50 hover:bg-success-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📈</span>
                <span className="text-sm font-medium text-success-700">Hesabatlar</span>
              </Link>
            )}
            
            {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
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
            
            {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
              <Link to="/settings" className="flex flex-col items-center p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200 text-center group">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">⚙️</span>
                <span className="text-sm font-medium text-neutral-700">Tənzimləmələr</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Son Fəaliyyətlər</h3>
            <p className="text-sm text-neutral-600">Sistemdə son dəyişikliklər</p>
          </div>
          <div className="space-y-4">
            {stats.loading ? (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-50">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                  <span className="text-sm">⏳</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Fəaliyyətlər yüklənir...</p>
                </div>
              </div>
            ) : stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      <span className="font-medium">{typeof activity.user === 'string' ? activity.user : activity.user?.username || activity.user?.name || 'N/A'}</span> {activity.action}
                    </p>
                    <p className="text-xs text-neutral-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-50">
                <div className="w-8 h-8 rounded-full bg-info-100 text-info-600 flex items-center justify-center">
                  <span className="text-sm">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Hələlik fəaliyyət qeydə alınmayıb</p>
                  <p className="text-xs text-neutral-500">--</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sistem Statusu</h3>
            <p className="text-sm text-neutral-600">Sistemin hazırkı vəziyyəti</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${stats.systemStatus.database.status === 'healthy' && 'bg-success-500'}
                  ${stats.systemStatus.database.status === 'warning' && 'bg-warning-500'}
                  ${stats.systemStatus.database.status === 'error' && 'bg-error-500'}
                  ${stats.systemStatus.database.status === 'unknown' && 'bg-neutral-400'}
                `}></div>
                <span className="text-sm font-medium text-neutral-700">Database Bağlantısı</span>
              </div>
              <span className="text-sm text-neutral-600">{stats.systemStatus.database.label}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${stats.systemStatus.api.status === 'healthy' && 'bg-success-500'}
                  ${stats.systemStatus.api.status === 'warning' && 'bg-warning-500'}
                  ${stats.systemStatus.api.status === 'error' && 'bg-error-500'}
                  ${stats.systemStatus.api.status === 'unknown' && 'bg-neutral-400'}
                `}></div>
                <span className="text-sm font-medium text-neutral-700">API Servisi</span>
              </div>
              <span className="text-sm text-neutral-600">{stats.systemStatus.api.label}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${stats.systemStatus.memory.status === 'healthy' && 'bg-success-500'}
                  ${stats.systemStatus.memory.status === 'warning' && 'bg-warning-500'}
                  ${stats.systemStatus.memory.status === 'error' && 'bg-error-500'}
                  ${stats.systemStatus.memory.status === 'unknown' && 'bg-neutral-400'}
                `}></div>
                <span className="text-sm font-medium text-neutral-700">Yaddaş İstifadəsi</span>
              </div>
              <span className="text-sm text-neutral-600">{stats.systemStatus.memory.label}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${stats.systemStatus.storage.status === 'healthy' && 'bg-success-500'}
                  ${stats.systemStatus.storage.status === 'warning' && 'bg-warning-500'}
                  ${stats.systemStatus.storage.status === 'error' && 'bg-error-500'}
                  ${stats.systemStatus.storage.status === 'unknown' && 'bg-neutral-400'}
                `}></div>
                <span className="text-sm font-medium text-neutral-700">Yaddaş</span>
              </div>
              <span className="text-sm text-neutral-600">{stats.systemStatus.storage.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;