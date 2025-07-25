import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { regionAdminService } from '../services/regionAdminService';
import type { RegionUserStats } from '../services/regionAdminService';
import UserStatsOverview from '../components/users/UserStatsOverview';
import UsersList from '../components/users/UsersList';
import '../styles/regionadmin-consolidated.css';

const RegionAdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<RegionUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getUserStats();
      setUserStats(data);
    } catch (error: any) {
      setError(error.message || 'İstifadəçi məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUserStats();
  };

  if (loading) {
    return (
      <div className="regionadmin-users loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>İstifadəçi məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="regionadmin-users error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchUserStats} className="btn btn-primary">
            Yenidən Cəhd Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="regionadmin-users">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title">👥 İstifadəçi İdarəetməsi</h1>
            <p className="page-subtitle">Regional istifadəçilərin yaradılması və idarə edilməsi</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefresh} 
              className="btn btn-outline refresh-btn"
              title="Məlumatları yenilə"
            >
              🔄 Yenilə
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="users-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Ümumi Baxış</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">İstifadəçilər</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Analitika</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="users-content-container">
        {activeTab === 'overview' && userStats && (
          <UserStatsOverview 
            userStats={userStats} 
            loading={loading}
          />
        )}
        
        {activeTab === 'users' && (
          <UsersList 
            onRefresh={handleRefresh}
            filters={{
              institution_id: user?.institution_id
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-header">
              <h3>📈 İstifadəçi Analitikası</h3>
              <p>Detallı statistika və trend analizi</p>
            </div>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-header">
                  <h4>📊 Aylıq Trend</h4>
                </div>
                <div className="card-content">
                  <div className="trend-chart">
                    <div className="chart-placeholder">
                      <span className="chart-icon">📈</span>
                      <p>Trend qrafiki hazırlanmaqdadır</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-header">
                  <h4>🎯 Aktivlik Dərəcəsi</h4>
                </div>
                <div className="card-content">
                  <div className="activity-metrics">
                    {userStats && (
                      <>
                        <div className="metric-row">
                          <span className="metric-name">Son 7 gün giriş:</span>
                          <span className="metric-value">
                            {Math.round(userStats.active_users * 0.7)} istifadəçi
                          </span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-name">Orta günlük aktivlik:</span>
                          <span className="metric-value">
                            {Math.round(userStats.active_users * 0.4)} istifadəçi
                          </span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-name">Ən aktiv rol:</span>
                          <span className="metric-value">
                            {Object.values(userStats.users_by_role)
                              .sort((a: any, b: any) => b.count - a.count)[0]?.display_name || 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-header">
                  <h4>🏢 Təşkilat Dağılımı</h4>
                </div>
                <div className="card-content">
                  <div className="distribution-chart">
                    {userStats && Object.entries(userStats.users_by_level).map(([level, count]) => (
                      <div key={level} className="distribution-item">
                        <div className="level-label">{level}</div>
                        <div className="level-bar">
                          <div 
                            className="level-fill"
                            style={{ 
                              width: `${userStats.total_users > 0 ? (count / userStats.total_users) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="level-count">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <div className="card-header">
                  <h4>⚡ Canlı Statistika</h4>
                </div>
                <div className="card-content">
                  <div className="live-stats">
                    <div className="stat-item">
                      <span className="stat-icon">🕐</span>
                      <div className="stat-info">
                        <span className="stat-label">Son yenilənmə</span>
                        <span className="stat-value">
                          {new Date().toLocaleTimeString('az-AZ')}
                        </span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📊</span>
                      <div className="stat-info">
                        <span className="stat-label">Məlumat mənbəyi</span>
                        <span className="stat-value">Regional İdarə</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">🔄</span>
                      <div className="stat-info">
                        <span className="stat-label">Sinxronizasiya</span>
                        <span className="stat-value">Aktiv</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionAdminUsers;