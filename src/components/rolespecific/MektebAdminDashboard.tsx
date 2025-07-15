import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/rolespecific-dashboards.css';

interface MektebAdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeSubjects: number;
  schoolUsers: number;
  activeSurveys: number;
  pendingTasks: number;
  attendanceRate: number;
  schoolInfo: {
    name: string;
    type: string;
    sector: string;
    establishedYear: string;
    address: string;
  };
  recentActivities: Activity[];
  classroomStats: ClassroomStat[];
  teachersBySubject: SubjectStat[];
}

interface Activity {
  id: string;
  type: 'student' | 'teacher' | 'survey' | 'report' | 'class' | 'event';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
  class?: string;
}

interface ClassroomStat {
  id: number;
  grade: number;
  section: string;
  students: number;
  teacher: string;
  subject?: string;
}

interface SubjectStat {
  subject: string;
  teachers: number;
  classes: number;
}

const MektebAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MektebAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/mektebadmin/dashboard', {
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
      'student': '👨‍🎓',
      'teacher': '👨‍🏫',
      'survey': '📊',
      'report': '📋',
      'class': '🏫',
      'event': '📅'
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
    <div className="mektebadmin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="welcome-title">
            {getWelcomeMessage()}, {user?.first_name || user?.username}!
          </h1>
          <p className="header-subtitle">
            {stats.schoolInfo.name} • {stats.schoolInfo.sector}
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
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalStudents}</h3>
            <p className="stat-label">Ümumi şagirdlər</p>
            <span className="stat-detail">{stats.attendanceRate}% davamiyyət</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalTeachers}</h3>
            <p className="stat-label">Ümumi müəllimlər</p>
            <span className="stat-detail">{stats.activeSubjects} fənn</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalClasses}</h3>
            <p className="stat-label">Ümumi siniflər</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.activeSurveys}</h3>
            <p className="stat-label">Aktiv sorğular</p>
            <span className="stat-detail">{stats.pendingTasks} gözləyən tapşırıq</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Tez Əməliyyatlar</h3>
            <p>Məktəb idarəetməsi üçün lazımi funksiyalar</p>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <button className="action-card">
                <div className="action-icon">👨‍🎓</div>
                <div className="action-content">
                  <h4>Şagirdlər</h4>
                  <p>Şagird qeydiyyatı və idarə</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">👨‍🏫</div>
                <div className="action-content">
                  <h4>Müəllimlər</h4>
                  <p>Müəllim heyəti idarəsi</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">🏫</div>
                <div className="action-content">
                  <h4>Siniflər</h4>
                  <p>Sinif və qrup idarəsi</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <h4>Dərslər</h4>
                  <p>Dərs cədvəli və planları</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h4>Sorğular</h4>
                  <p>Məktəb sorğuları</p>
                </div>
              </button>

              <button className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Hesabatlar</h4>
                  <p>Məktəb hesabatları</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Classes Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Sinif Baxışı</h3>
            <p>Məktəbinizdəki siniflərin ümumi vəziyyəti</p>
          </div>
          <div className="card-content">
            <div className="classes-list">
              {stats.classroomStats.map((classroom) => (
                <div key={classroom.id} className="class-item">
                  <div className="class-info">
                    <div className="class-header">
                      <h4 className="class-name">{classroom.grade}-{classroom.section} sinfi</h4>
                      <span className="student-count">{classroom.students} şagird</span>
                    </div>
                    <p className="class-teacher">👨‍🏫 {classroom.teacher}</p>
                  </div>
                  <div className="class-actions">
                    <button className="action-btn">📝</button>
                    <button className="action-btn">👁️</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn">
              Bütün sinifləri gör ({stats.totalClasses})
            </button>
          </div>
        </div>

        {/* Subjects Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Fənn Baxışı</h3>
            <p>Müəllimlər və dərslər üzrə statistika</p>
          </div>
          <div className="card-content">
            <div className="subjects-list">
              {stats.teachersBySubject.map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <h4 className="subject-name">{subject.subject}</h4>
                    <div className="subject-stats">
                      <span className="subject-stat">
                        👨‍🏫 {subject.teachers} müəllim
                      </span>
                      <span className="subject-stat">
                        🏫 {subject.classes} sinif
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Son Fəaliyyətlər</h3>
            <p>Məktəbdə son dəyişikliklər və fəaliyyətlər</p>
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
        </div>

        {/* School Info */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Məktəb Məlumatları</h3>
            <p>Məktəbiniz haqqında ümumi məlumat</p>
          </div>
          <div className="card-content">
            <div className="school-info">
              <div className="info-item">
                <span className="info-label">Məktəb adı:</span>
                <span className="info-value">{stats.schoolInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Növü:</span>
                <span className="info-value">{stats.schoolInfo.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sektor:</span>
                <span className="info-value">{stats.schoolInfo.sector}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Təsis ili:</span>
                <span className="info-value">{stats.schoolInfo.establishedYear}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ünvan:</span>
                <span className="info-value">{stats.schoolInfo.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ümumi istifadəçilər:</span>
                <span className="info-value">{stats.schoolUsers} nəfər</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MektebAdminDashboard;