import React from 'react';
import type { RegionUserStats, UserRole, RecentUser } from '../../services/regionAdminService';

interface UserStatsOverviewProps {
  userStats: RegionUserStats;
  loading?: boolean;
}

const UserStatsOverview: React.FC<UserStatsOverviewProps> = ({ userStats, loading }) => {
  if (loading) {
    return (
      <div className="overview-content loading">
        <div className="loading-skeleton">
          <div className="skeleton-metrics"></div>
          <div className="skeleton-charts"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-content">
      {/* Key Metrics */}
      <div className="user-metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3 className="metric-value">{userStats.total_users.toLocaleString()}</h3>
            <p className="metric-label">Toplam İstifadəçilər</p>
          </div>
        </div>

        <div className="metric-card active">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <h3 className="metric-value">{userStats.active_users.toLocaleString()}</h3>
            <p className="metric-label">Aktiv İstifadəçilər</p>
            <span className="metric-sublabel">
              {userStats.total_users > 0 
                ? Math.round((userStats.active_users / userStats.total_users) * 100)
                : 0}% aktivlik dərəcəsi
            </span>
          </div>
        </div>

        <div className="metric-card new">
          <div className="metric-icon">🆕</div>
          <div className="metric-content">
            <h3 className="metric-value">{userStats.new_users_this_month}</h3>
            <p className="metric-label">Bu Ay Yeni</p>
            <span className="metric-sublabel">Yeni qeydiyyatlar</span>
          </div>
        </div>
      </div>

      {/* Users by Role */}
      <div className="roles-section">
        <div className="section-header">
          <h3>👤 Rollara Görə Bölgü</h3>
          <p>İstifadəçilərin rol statistikası</p>
        </div>
        
        <div className="roles-grid">
          {Object.values(userStats.users_by_role).map((role: UserRole) => (
            <div key={role.name} className="role-card">
              <div className="role-header">
                <h4 className="role-name">{role.display_name}</h4>
                <span className="role-count">{role.count}</span>
              </div>
              <div className="role-percentage">
                <div className="percentage-bar">
                  <div 
                    className="percentage-fill"
                    style={{ 
                      width: `${userStats.total_users > 0 ? (role.count / userStats.total_users) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="percentage-text">
                  {userStats.total_users > 0 
                    ? Math.round((role.count / userStats.total_users) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users by Institution Level */}
      <div className="levels-section">
        <div className="section-header">
          <h3>🏢 Təşkilat Səviyyəsinə Görə</h3>
          <p>İstifadəçilərin təşkilat səviyyəsi üzrə paylanması</p>
        </div>
        
        <div className="levels-grid">
          {Object.entries(userStats.users_by_level).map(([level, count]) => (
            <div key={level} className="level-card">
              <div className="level-icon">
                {level === 'Regional' && '🌍'}
                {level === 'Sector' && '📍'}
                {level === 'School' && '🏫'}
              </div>
              <div className="level-content">
                <h4 className="level-name">{level}</h4>
                <span className="level-count">{count} nəfər</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className="recent-users-section">
        <div className="section-header">
          <h3>📅 Son Qeydiyyatlar</h3>
          <p>Ən son qeydiyyatdan keçən istifadəçilər</p>
        </div>
        
        <div className="recent-users-list">
          {userStats.recent_users.map((user: RecentUser) => (
            <div key={user.id} className="recent-user-item">
              <div className="user-avatar">
                <span>{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-info">
                <div className="user-main">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="user-meta">
                  <span className="user-role">{typeof user.role === 'string' ? user.role : user.role?.display_name || user.role?.name || 'N/A'}</span>
                  <span className="user-institution">{typeof user.institution === 'string' ? user.institution : user.institution?.name || user.institution?.display_name || 'N/A'}</span>
                </div>
              </div>
              <div className="user-status">
                <span className="created-date">{new Date(user.created_at).toLocaleDateString('az-AZ')}</span>
                <span className="last-login">
                  {user.last_login !== 'Never' ? `Son giriş: ${user.last_login}` : 'Hələ giriş etməyib'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserStatsOverview;