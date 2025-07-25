import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/Loading';
import '../../styles/rolespecific-dashboards.css';

interface RegionOperatorStats {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  departmentUsers: number;
  recentActivities: Activity[];
  departmentInfo: {
    name: string;
    type: string;
    institution: string;
  };
}

interface Activity {
  id: string;
  type: 'task' | 'document' | 'meeting' | 'report';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
}

const RegionOperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RegionOperatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionoperator/dashboard', {
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
      'task': '📋',
      'document': '📄',
      'meeting': '👥',
      'report': '📊'
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
    <div className="regionoperator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="welcome-title">
            {getWelcomeMessage()}, {user?.first_name || user?.username}!
          </h1>
          <p className="header-subtitle">
            {stats.departmentInfo.name} • {stats.departmentInfo.institution}
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
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.assignedTasks}</h3>
            <p className="stat-label">Təyin edilmiş tapşırıqlar</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.completedTasks}</h3>
            <p className="stat-label">Tamamlanmış</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.pendingTasks}</h3>
            <p className="stat-label">Gözləyən</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.departmentUsers}</h3>
            <p className="stat-label">Şöbə üzvləri</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Tez Əməliyyatlar</h3>
            <p>Gündəlik işləriniz üçün lazımi funksiyalar</p>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <button className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Tapşırıqlarım</h4>
                  <p>Aktiv tapşırıqları idarə et</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h4>Hesabatlar</h4>
                  <p>Departament hesabatları</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📄</div>
                <div className="action-content">
                  <h4>Sənədlər</h4>
                  <p>Sənəd idarəetməsi</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <h4>Komanda</h4>
                  <p>Şöbə üzvləri</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Son Fəaliyyətlər</h3>
            <p>Departamentınızda son dəyişikliklər</p>
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
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Info */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Departament Məlumatları</h3>
            <p>Şöbəniz haqqında ümumi məlumat</p>
          </div>
          <div className="card-content">
            <div className="department-info">
              <div className="info-item">
                <span className="info-label">Şöbə adı:</span>
                <span className="info-value">{stats.departmentInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Şöbə növü:</span>
                <span className="info-value">{stats.departmentInfo.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Təşkilat:</span>
                <span className="info-value">{typeof stats.departmentInfo.institution === 'string' ? stats.departmentInfo.institution : stats.departmentInfo.institution?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Üzv sayı:</span>
                <span className="info-value">{stats.departmentUsers} nəfər</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionOperatorDashboard;