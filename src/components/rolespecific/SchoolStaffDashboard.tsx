import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/Loading';
import { Card } from '../ui/Card';
import { Calendar, Users, Package, Heart, Settings, Clock, FileText } from 'lucide-react';
import '../../styles/rolespecific-dashboards.css';

interface StaffRole {
  key: string;
  name: string;
  permissions: string[];
}

interface SchoolStaffStats {
  staff_info: {
    role: string;
    role_name: string;
    school_name: string;
    department?: string;
    assigned_classes?: string[];
  };
  workload: {
    total_assignments: number;
    pending_tasks: number;
    completed_tasks: number;
    upcoming_events: number;
  };
  recent_activities: Activity[];
  quick_actions: QuickAction[];
  notifications: Notification[];
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
  class?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  permission_required?: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const SchoolStaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SchoolStaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine staff role and permissions
  const staffRoles: Record<string, StaffRole> = {
    'müavin': {
      key: 'deputy',
      name: 'Müavin',
      permissions: ['schedule_management', 'class_assignment', 'teacher_coordination']
    },
    'ubr': {
      key: 'academic_officer',
      name: 'Tədris-Bilimlər Referenti',
      permissions: ['event_planning', 'academic_activities', 'exam_scheduling']
    },
    'təsərrüfat_müdiri': {
      key: 'facility_manager', 
      name: 'Təsərrüfat Müdiri',
      permissions: ['inventory_management', 'facility_maintenance', 'supply_management']
    },
    'psixoloq': {
      key: 'psychologist',
      name: 'Psixoloq',
      permissions: ['student_counseling', 'psychological_support', 'development_reports']
    },
    'müəllim': {
      key: 'teacher',
      name: 'Müəllim',
      permissions: ['class_teaching', 'student_assessment', 'attendance_tracking']
    }
  };

  const currentRole = user?.roles?.[0]?.name || 'müəllim';
  const roleConfig = staffRoles[currentRole] || staffRoles['müəllim'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/school-staff/dashboard/${roleConfig.key}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Dashboard məlumatları yüklənə bilmədi');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sabahınız xeyir';
    if (hour < 18) return 'Günortanız xeyir';
    return 'Axşamınız xeyir';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      'deputy': <Settings className="w-6 h-6" />,
      'academic_officer': <Calendar className="w-6 h-6" />,
      'facility_manager': <Package className="w-6 h-6" />,
      'psychologist': <Heart className="w-6 h-6" />,
      'teacher': <Users className="w-6 h-6" />
    };
    return icons[role] || <Users className="w-6 h-6" />;
  };

  const getActionIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'calendar': <Calendar className="w-5 h-5" />,
      'users': <Users className="w-5 h-5" />,
      'package': <Package className="w-5 h-5" />,
      'heart': <Heart className="w-5 h-5" />,
      'settings': <Settings className="w-5 h-5" />,
      'clock': <Clock className="w-5 h-5" />,
      'file-text': <FileText className="w-5 h-5" />
    };
    return icons[iconName] || <FileText className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      'info': 'bg-blue-100 border-blue-200 text-blue-800',
      'warning': 'bg-yellow-100 border-yellow-200 text-yellow-800',
      'success': 'bg-green-100 border-green-200 text-green-800',
      'error': 'bg-red-100 border-red-200 text-red-800'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="lg" text="Dashboard yüklənir..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Xəta baş verdi</h3>
          <p>{error || 'Məlumatlar yüklənə bilmədi'}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="school-staff-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="role-info">
            {getRoleIcon(roleConfig.key)}
            <div>
              <h1 className="welcome-title">
                {getWelcomeMessage()}, {user?.first_name || user?.username}!
              </h1>
              <p className="header-subtitle">
                {roleConfig.name} • {stats.staff_info.school_name}
              </p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchDashboardData} className="refresh-btn">
            🔄 Yenilə
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.workload.total_assignments}</h3>
            <p className="stat-label">Ümumi tapşırıqlar</p>
            <span className="stat-detail">{stats.workload.pending_tasks} gözləyir</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.workload.completed_tasks}</h3>
            <p className="stat-label">Tamamlanmış</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.workload.upcoming_events}</h3>
            <p className="stat-label">Gələcək tədbirlər</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.notifications.filter(n => !n.read).length}</h3>
            <p className="stat-label">Yeni bildirişlər</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <Card className="dashboard-card">
          <div className="card-header">
            <h3>Tez Əməliyyatlar</h3>
            <p>{roleConfig.name} üçün əsas funksiyalar</p>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              {stats.quick_actions.map((action) => (
                <button key={action.id} className="action-card">
                  <div className="action-icon">
                    {getActionIcon(action.icon)}
                  </div>
                  <div className="action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        {stats.notifications.length > 0 && (
          <Card className="dashboard-card">
            <div className="card-header">
              <h3>Bildirişlər</h3>
              <p>Son sistem bildirişləri</p>
            </div>
            <div className="card-content">
              <div className="notifications-list">
                {stats.notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${getNotificationColor(notification.type)} ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Recent Activities */}
        <Card className="dashboard-card">
          <div className="card-header">
            <h3>Son Fəaliyyətlər</h3>
            <p>Son dəyişikliklər və əməliyyatlar</p>
          </div>
          <div className="card-content">
            <div className="activities-list">
              {stats.recent_activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActionIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.title}</h4>
                      <span className={`status-badge ${activity.status}`}>
                        {activity.status === 'completed' && 'Tamamlandı'}
                        {activity.status === 'pending' && 'Gözləyir'}
                        {activity.status === 'in_progress' && 'Davam edir'}
                      </span>
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-meta">
                      {activity.class && (
                        <span className="activity-class">📍 {activity.class}</span>
                      )}
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Role-specific Information */}
        <Card className="dashboard-card">
          <div className="card-header">
            <h3>Rol Məlumatları</h3>
            <p>Sizin vəzifəniz haqqında məlumat</p>
          </div>
          <div className="card-content">
            <div className="role-info">
              <div className="info-item">
                <span className="info-label">Rol:</span>
                <span className="info-value">{roleConfig.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Məktəb:</span>
                <span className="info-value">{stats.staff_info.school_name}</span>
              </div>
              {stats.staff_info.department && (
                <div className="info-item">
                  <span className="info-label">Departament:</span>
                  <span className="info-value">{stats.staff_info.department}</span>
                </div>
              )}
              {stats.staff_info.assigned_classes && stats.staff_info.assigned_classes.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Təyin edilmiş siniflər:</span>
                  <span className="info-value">
                    {stats.staff_info.assigned_classes.join(', ')}
                  </span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Səlahiyyətlər:</span>
                <div className="permissions-list">
                  {roleConfig.permissions.map((permission) => (
                    <span key={permission} className="permission-badge">
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SchoolStaffDashboard;