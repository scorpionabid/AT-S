import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/Loading';
import '../../styles/rolespecific-dashboards.css';

interface SektorAdminStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  sektorUsers: number;
  activeSurveys: number;
  pendingReports: number;
  sektorInfo: {
    name: string;
    region: string;
    establishedYear: string;
  };
  recentActivities: Activity[];
  schoolsList: School[];
}

interface Activity {
  id: string;
  type: 'school' | 'survey' | 'report' | 'user' | 'meeting';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
  school?: string;
}

interface School {
  id: number;
  name: string;
  type: string;
  students: number;
  teachers: number;
  status: 'active' | 'inactive';
}

const SektorAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SektorAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/sektoradmin/dashboard', {
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

  const getActivityIcon = (type: string) => {
    const icons = {
      'school': '🏫',
      'survey': '📊',
      'report': '📋',
      'user': '👤',
      'meeting': '👥'
    };
    return icons[type as keyof typeof icons] || '📌';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'completed': { text: 'Tamamlandı', class: 'completed' },
      'in_progress': { text: 'Davam edir', class: 'in-progress' },
      'pending': { text: 'Gözləyir', class: 'pending' }
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: 'unknown' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getSchoolTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      'school': 'Məktəb',
      'secondary_school': 'Orta Məktəb',
      'gymnasium': 'Gimnaziya',
      'vocational': 'Peşə Məktəbi'
    };
    return types[type] || type;
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
    <div className="sektoradmin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="welcome-title">
            {getWelcomeMessage()}, {user?.first_name || user?.username}!
          </h1>
          <p className="header-subtitle">
            {stats.sektorInfo.name} • {stats.sektorInfo.region}
          </p>
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
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalSchools}</h3>
            <p className="stat-label">Ümumi məktəblər</p>
            <span className="stat-detail">{stats.activeSchools} aktiv</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalStudents.toLocaleString()}</h3>
            <p className="stat-label">Ümumi şagirdlər</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalTeachers}</h3>
            <p className="stat-label">Ümumi müəllimlər</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.activeSurveys}</h3>
            <p className="stat-label">Aktiv sorğular</p>
            <span className="stat-detail">{stats.pendingReports} gözləyən hesabat</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Tez Əməliyyatlar</h3>
            <p>Sektor idarəetməsi üçün lazımi funksiyalar</p>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <button className="action-card">
                <div className="action-icon">🏫</div>
                <div className="action-content">
                  <h4>Məktəblər</h4>
                  <p>Sektor məktəblərini idarə et</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">👨‍🏫</div>
                <div className="action-content">
                  <h4>Müəllimlər</h4>
                  <p>Müəllim qeydiyyatı və idarə</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h4>Sorğular</h4>
                  <p>Təhsil sorğuları</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Hesabatlar</h4>
                  <p>Sektor hesabatları</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <h4>İstifadəçilər</h4>
                  <p>Sektor istifadəçiləri</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📈</div>
                <div className="action-content">
                  <h4>Statistika</h4>
                  <p>Təhsil statistikaları</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Schools Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Məktəblər Baxışı</h3>
            <p>Sektorunuzdakı məktəblərin ümumi vəziyyəti</p>
          </div>
          <div className="card-content">
            <div className="schools-list">
              {stats.schoolsList.slice(0, 4).map((school) => (
                <div key={school.id} className="school-item">
                  <div className="school-info">
                    <div className="school-header">
                      <h4 className="school-name">{school.name}</h4>
                      <span className={`school-status ${school.status}`}>
                        {school.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </div>
                    <p className="school-type">{getSchoolTypeDisplay(school.type)}</p>
                  </div>
                  <div className="school-stats">
                    <div className="school-stat">
                      <span className="stat-value">{school.students}</span>
                      <span className="stat-label">Şagird</span>
                    </div>
                    <div className="school-stat">
                      <span className="stat-value">{school.teachers}</span>
                      <span className="stat-label">Müəllim</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn">
              Bütün məktəbləri gör ({stats.totalSchools})
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Son Fəaliyyətlər</h3>
            <p>Sektorda son dəyişikliklər və fəaliyyətlər</p>
          </div>
          <div className="card-content">
            <div className="activities-list">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-meta">
                      {activity.school && (
                        <span className="activity-school">📍 {activity.school}</span>
                      )}
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Info */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Sektor Məlumatları</h3>
            <p>Sektorunuz haqqında ümumi məlumat</p>
          </div>
          <div className="card-content">
            <div className="sector-info">
              <div className="info-item">
                <span className="info-label">Sektor adı:</span>
                <span className="info-value">{stats.sektorInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Regional idarə:</span>
                <span className="info-value">{stats.sektorInfo.region}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Təsis ili:</span>
                <span className="info-value">{stats.sektorInfo.establishedYear}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ümumi istifadəçilər:</span>
                <span className="info-value">{stats.sektorUsers} nəfər</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SektorAdminDashboard;