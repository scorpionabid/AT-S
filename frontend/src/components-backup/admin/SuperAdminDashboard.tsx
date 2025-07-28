import React, { useState, useEffect } from 'react';
import { dashboardServiceUnified, SuperAdminAnalytics, SystemStatusDetailed } from '../../services';

const SuperAdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SuperAdminAnalytics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds for system status
    const interval = setInterval(() => {
      if (activeTab === 'monitoring') {
        fetchSystemStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTab('overview');
            break;
          case '2':
            event.preventDefault();
            setActiveTab('monitoring');
            break;
          case '3':
            event.preventDefault();
            setActiveTab('analytics');
            break;
          case 'r':
            event.preventDefault();
            fetchData();
            break;
          case 'e':
            event.preventDefault();
            exportData('full');
            break;
          case 'h':
            event.preventDefault();
            setShowHelp(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsData, statusData] = await Promise.all([
        dashboardServiceUnified.getSuperAdminAnalytics(),
        dashboardServiceUnified.getSystemStatus()
      ]);
      
      setAnalytics(analyticsData);
      setSystemStatus(statusData);
    } catch (error: any) {
      console.error('SuperAdmin dashboard error:', error);
      setError(error.message || 'Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const statusData = await dashboardServiceUnified.getSystemStatus();
      setSystemStatus(statusData);
    } catch (error) {
      console.error('System status refresh error:', error);
    }
  };

  const exportData = (type: string) => {
    try {
      let data: any;
      let filename: string;
      
      switch (type) {
        case 'system-health':
          data = analytics?.systemHealth;
          filename = `system-health-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'user-engagement':
          data = analytics?.userEngagement;
          filename = `user-engagement-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'institution-performance':
          data = analytics?.institutionPerformance;
          filename = `institution-performance-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'system-status':
          data = systemStatus;
          filename = `system-status-${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          data = { analytics, systemStatus };
          filename = `dashboard-full-export-${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export zamanı xəta baş verdi');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'good':
      case 'active':
        return '🟢';
      case 'warning':
      case 'medium':
      case 'degraded':
        return '🟡';
      case 'critical':
      case 'offline':
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>SuperAdmin analytics yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="superadmin-dashboard">
        <div className="error-container">
          <h3>⚠️ Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-button">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <div className="dashboard-header">
        <h1>SuperAdmin Dashboard</h1>
        <p>Sistem monitorinqi və advanced analytics</p>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/users'}
            title="İstifadəçi İdarəetməsinə keç"
          >
            👥 İstifadəçilər
          </button>
          <button 
            className="action-button secondary"
            onClick={() => window.location.href = '/institutions'}
            title="Təşkilat İdarəetməsinə keç"
          >
            🏢 Təşkilatlar
          </button>
          <button 
            className="action-button tertiary"
            onClick={() => window.location.href = '/surveys'}
            title="Sorğu İdarəetməsinə keç"
          >
            📊 Sorğular
          </button>
          <button 
            className="action-button quaternary"
            onClick={() => window.location.href = '/roles'}
            title="Rol İdarəetməsinə keç"
          >
            🛡️ Rollər
          </button>
          <button 
            className="action-button refresh"
            onClick={fetchData}
            title="Dashboard məlumatlarını yenilə"
          >
            🔄 Yenilə
          </button>
          <button 
            className="action-button help"
            onClick={() => setShowHelp(true)}
            title="Klaviatura qısayollarını göstər"
          >
            ❓ Yardım
          </button>
        </div>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Ümumi Baxış
          </button>
          <button 
            className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            🖥️ Sistem Monitorinqi
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Advanced Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="tab-content">
          {/* System Health Overview */}
          <div className="cards-grid">
            <div className="admin-card system-health">
              <div className="card-header">
                <h3>🏥 Sistem Sağlamlığı</h3>
                <div className="card-actions">
                  <button 
                    className="export-button" 
                    onClick={() => exportData('system-health')}
                    title="Sistem sağlamlığı məlumatlarını export et"
                  >
                    📁 Export
                  </button>
                  <span className={`status-badge ${analytics.systemHealth.overall}`}>
                    {getStatusIcon(analytics.systemHealth.overall)} {analytics.systemHealth.overall}
                  </span>
                </div>
              </div>
              <div className="card-content">
                <div className="health-grid">
                  {Object.entries(analytics.systemHealth.components).map(([key, component]) => (
                    <div key={key} className="health-item">
                      <span className="service-name">
                        {key.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="service-status">
                        {getStatusIcon(component.status)} {component.status}
                      </span>
                      <span className="service-detail">
                        {'response_time' in component ? component.response_time : 
                         'connection_pool' in component ? component.connection_pool :
                         'space_usage' in component ? component.space_usage :
                         'hit_rate' in component ? component.hit_rate : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card growth-metrics">
              <div className="card-header">
                <h3>📈 Artım Metrikleri</h3>
              </div>
              <div className="card-content">
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">İstifadəçi Artımı</span>
                    <span className="metric-value positive">{analytics.growthMetrics.user_growth}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Təşkilat Artımı</span>
                    <span className="metric-value positive">{analytics.growthMetrics.institution_growth}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Sorğu Həcmi</span>
                    <span className="metric-value positive">{analytics.growthMetrics.survey_volume}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Məlumat Keyfiyyəti</span>
                    <span className="metric-value positive">{analytics.growthMetrics.data_quality}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-card alerts-summary">
              <div className="card-header">
                <h3>🚨 Sistemlər Xəbərdarlığı</h3>
                <div className="alert-counts">
                  <span className="alert-count critical">{analytics.alertsSummary.critical} Kritik</span>
                  <span className="alert-count warning">{analytics.alertsSummary.warnings} Xəbərdarlıq</span>
                  <span className="alert-count info">{analytics.alertsSummary.info} Məlumat</span>
                </div>
              </div>
              <div className="card-content">
                <div className="recent-alerts">
                  {analytics.alertsSummary.recent.map((alert, index) => (
                    <div key={index} className={`alert-item ${alert.type}`}>
                      <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                      <div className="alert-content">
                        <span className="alert-message">{alert.message}</span>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Engagement & Institution Performance */}
          <div className="cards-grid">
            <div className="admin-card user-engagement">
              <div className="card-header">
                <h3>👥 İstifadəçi Aktivliyi</h3>
              </div>
              <div className="card-content">
                <div className="engagement-stats">
                  <div className="stat-item">
                    <span className="stat-label">Günlük Aktiv İstifadəçi</span>
                    <span className="stat-value">{analytics.userEngagement.daily_active_users}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Orta Session Müddəti</span>
                    <span className="stat-value">{analytics.userEngagement.session_duration}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bounce Rate</span>
                    <span className="stat-value">{analytics.userEngagement.bounce_rate}</span>
                  </div>
                </div>
                
                <div className="feature-usage">
                  <h4>Funksiya İstifadəsi</h4>
                  {Object.entries(analytics.userEngagement.feature_usage).map(([feature, usage]) => (
                    <div key={feature} className="feature-item">
                      <span className="feature-name">{feature}</span>
                      <div className="usage-bar">
                        <div 
                          className="usage-fill" 
                          style={{ width: `${usage}%` }}
                        ></div>
                      </div>
                      <span className="usage-value">{usage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-card survey-effectiveness">
              <div className="card-header">
                <h3>📊 Sorğu Effektivliyi</h3>
              </div>
              <div className="card-content">
                <div className="effectiveness-grid">
                  <div className="effectiveness-item">
                    <span className="label">Tamamlanma Dərəcəsi</span>
                    <span className="value">{analytics.surveyEffectiveness.completion_rate}</span>
                  </div>
                  <div className="effectiveness-item">
                    <span className="label">Orta Cavab Müddəti</span>
                    <span className="value">{analytics.surveyEffectiveness.average_time}</span>
                  </div>
                  <div className="effectiveness-item">
                    <span className="label">Keyfiyyət Skoru</span>
                    <span className="value">{analytics.surveyEffectiveness.quality_score}</span>
                  </div>
                  <div className="effectiveness-item">
                    <span className="label">Məmnuniyyət</span>
                    <span className="value">{analytics.surveyEffectiveness.feedback_satisfaction}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && systemStatus && (
        <div className="tab-content">
          <div className="monitoring-header">
            <h3>🖥️ Real-time Sistem Monitorinqi</h3>
            <span className="last-updated">
              Son yenilənmə: {new Date(systemStatus.timestamp).toLocaleTimeString('az-AZ')}
            </span>
            <button onClick={fetchSystemStatus} className="refresh-button">
              🔄 Yenilə
            </button>
          </div>

          <div className="cards-grid">
            {/* Services Status */}
            <div className="admin-card services-status">
              <div className="card-header">
                <h3>🔧 Xidmətlər Statusu</h3>
              </div>
              <div className="card-content">
                {Object.entries(systemStatus.services).map(([service, details]) => (
                  <div key={service} className="service-item">
                    <div className="service-info">
                      <span className="service-name">{service.toUpperCase()}</span>
                      <span className={`service-status ${details.status}`}>
                        {getStatusIcon(details.status)} {details.status}
                      </span>
                    </div>
                    <div className="service-details">
                      {'response_time' in details && <span>Response: {details.response_time}</span>}
                      {'connections' in details && <span>Connections: {details.connections}</span>}
                      {'hit_rate' in details && <span>Hit Rate: {details.hit_rate}</span>}
                      {'space_used' in details && <span>Space: {details.space_used}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="admin-card performance-metrics">
              <div className="card-header">
                <h3>⚡ Performans Metrikleri</h3>
              </div>
              <div className="card-content">
                <div className="performance-item">
                  <div className="metric-header">
                    <span className="metric-name">🧠 Yaddaş</span>
                    <span className={`metric-status ${systemStatus.performance.memory.status}`}>
                      {systemStatus.performance.memory.percent}%
                    </span>
                  </div>
                  <div className="metric-details">
                    {systemStatus.performance.memory.used} / {systemStatus.performance.memory.total}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${systemStatus.performance.memory.status}`}
                      style={{ width: `${systemStatus.performance.memory.percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="metric-header">
                    <span className="metric-name">💾 Disk Sahəsi</span>
                    <span className={`metric-status ${systemStatus.performance.disk.status}`}>
                      {systemStatus.performance.disk.percent}%
                    </span>
                  </div>
                  <div className="metric-details">
                    {systemStatus.performance.disk.used} / {systemStatus.performance.disk.total}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${systemStatus.performance.disk.status}`}
                      style={{ width: `${systemStatus.performance.disk.percent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="metric-header">
                    <span className="metric-name">🗄️ Database</span>
                    <span className={`metric-status ${systemStatus.performance.database.status}`}>
                      {systemStatus.performance.database.size}
                    </span>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="metric-header">
                    <span className="metric-name">⏱️ Uptime</span>
                    <span className="metric-status">
                      {systemStatus.performance.uptime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="admin-card system-alerts">
              <div className="card-header">
                <h3>🚨 Sistem Xəbərdarlıqları</h3>
              </div>
              <div className="card-content">
                <div className="alerts-summary">
                  <div className="alert-summary-item critical">
                    <span className="alert-icon">🚨</span>
                    <span className="alert-count">{systemStatus.alerts.critical}</span>
                    <span className="alert-label">Kritik</span>
                  </div>
                  <div className="alert-summary-item warning">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-count">{systemStatus.alerts.warning}</span>
                    <span className="alert-label">Xəbərdarlıq</span>
                  </div>
                  <div className="alert-summary-item info">
                    <span className="alert-icon">ℹ️</span>
                    <span className="alert-count">{systemStatus.alerts.info}</span>
                    <span className="alert-label">Məlumat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="tab-content">
          <div className="cards-grid">
            <div className="admin-card institution-performance">
              <div className="card-header">
                <h3>🏢 Təşkilat Performansı</h3>
              </div>
              <div className="card-content">
                <div className="performance-summary">
                  <div className="response-rates">
                    <h4>Cavab Dərəcələri</h4>
                    <div className="rate-item high">
                      <span className="rate-label">Yüksək</span>
                      <span className="rate-value">{Math.round(analytics.institutionPerformance.response_rates.high)}</span>
                    </div>
                    <div className="rate-item medium">
                      <span className="rate-label">Orta</span>
                      <span className="rate-value">{Math.round(analytics.institutionPerformance.response_rates.medium)}</span>
                    </div>
                    <div className="rate-item low">
                      <span className="rate-label">Aşağı</span>
                      <span className="rate-value">{Math.round(analytics.institutionPerformance.response_rates.low)}</span>
                    </div>
                  </div>
                </div>

                <div className="most-active">
                  <h4>Ən Aktiv Təşkilatlar</h4>
                  {analytics.institutionPerformance.most_active.slice(0, 5).map((institution, index) => (
                    <div key={institution.id} className="active-institution">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{institution.short_name || institution.name}</span>
                      <span className="users">{institution.users_count} istifadəçi</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>🎹 Klaviatura Qısayolları</h3>
              <button className="close-help" onClick={() => setShowHelp(false)}>✕</button>
            </div>
            <div className="help-modal-content">
              <div className="shortcut-group">
                <h4>📋 Naviqasiya</h4>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 1</span>
                  <span className="shortcut-desc">Ümumi Baxış</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 2</span>
                  <span className="shortcut-desc">Sistem Monitorinqi</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 3</span>
                  <span className="shortcut-desc">Advanced Analytics</span>
                </div>
              </div>
              
              <div className="shortcut-group">
                <h4>⚡ Sürətli Əməliyyatlar</h4>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + R</span>
                  <span className="shortcut-desc">Dashboard Yenilə</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + E</span>
                  <span className="shortcut-desc">Tam Export</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + H</span>
                  <span className="shortcut-desc">Bu Yardım</span>
                </div>
              </div>
              
              <div className="help-note">
                <p><strong>Qeyd:</strong> Mac istifadəçiləri üçün Ctrl əvəzinə Cmd düyməsini istifadə edin.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;