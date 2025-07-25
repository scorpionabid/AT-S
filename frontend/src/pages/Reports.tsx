import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsService } from '../services/reportsService';
import type { 
  OverviewStats, 
  InstitutionalPerformance, 
  SurveyAnalytics, 
  UserActivityReport,
  ReportFilters 
} from '../services/reportsService';
import '../styles/reports.css';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [institutionalPerformance, setInstitutionalPerformance] = useState<InstitutionalPerformance | null>(null);
  const [surveyAnalytics, setSurveyAnalytics] = useState<SurveyAnalytics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityReport | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState<ReportFilters>({});

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const requestFilters = { ...filters, ...dateRange };

      switch (activeTab) {
        case 'overview':
          const overview = await reportsService.getOverviewStats(requestFilters);
          setOverviewStats(overview);
          break;
        case 'institutional':
          const institutional = await reportsService.getInstitutionalPerformance(requestFilters);
          setInstitutionalPerformance(institutional);
          break;
        case 'surveys':
          const surveys = await reportsService.getSurveyAnalytics(requestFilters);
          setSurveyAnalytics(surveys);
          break;
        case 'users':
          const users = await reportsService.getUserActivityReport(requestFilters);
          setUserActivity(users);
          break;
      }
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      setError(error.message || 'Hesabat məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'json' | 'pdf') => {
    setLoading(true);
    try {
      const result = await reportsService.exportReport(activeTab, format, { ...filters, ...dateRange });
      
      // Create download link
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : format === 'pdf' ? 'application/pdf' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Show success message
      setError(null);
    } catch (error: any) {
      setError('Export zamanı xəta baş verdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewStats = () => {
    if (!overviewStats) return null;

    return (
      <div className="reports-content">
        <div className="stats-grid">
          {/* User Statistics */}
          <div className="stat-card">
            <div className="stat-header">
              <h3>👥 İstifadəçi Statistikası</h3>
              <span className="stat-badge">{overviewStats.user_statistics.total_users}</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="label">Aktiv:</span>
                <span className="value">{overviewStats.user_statistics.active_users}</span>
              </div>
              <div className="stat-item">
                <span className="label">Yeni (30 gün):</span>
                <span className="value">{overviewStats.user_statistics.new_users}</span>
              </div>
              <div className="stat-item">
                <span className="label">Aktivlik dərəcəsi:</span>
                <span className="value">{overviewStats.user_statistics.engagement_rate}%</span>
              </div>
            </div>
          </div>

          {/* Institution Statistics */}
          <div className="stat-card">
            <div className="stat-header">
              <h3>🏢 Təşkilat Statistikası</h3>
              <span className="stat-badge">{overviewStats.institution_statistics.total_institutions}</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="label">Aktiv:</span>
                <span className="value">{overviewStats.institution_statistics.active_institutions}</span>
              </div>
              <div className="stat-item">
                <span className="label">Yeni (30 gün):</span>
                <span className="value">{overviewStats.institution_statistics.new_institutions}</span>
              </div>
            </div>
          </div>

          {/* Survey Statistics */}
          <div className="stat-card">
            <div className="stat-header">
              <h3>📊 Sorğu Statistikası</h3>
              <span className="stat-badge">{overviewStats.survey_statistics.total_surveys}</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="label">Dərc edilmiş:</span>
                <span className="value">{overviewStats.survey_statistics.published_surveys}</span>
              </div>
              <div className="stat-item">
                <span className="label">Tamamlanmış:</span>
                <span className="value">{overviewStats.survey_statistics.completed_surveys}</span>
              </div>
              <div className="stat-item">
                <span className="label">Cavab dərəcəsi:</span>
                <span className="value">{overviewStats.survey_statistics.response_rate}%</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="stat-card">
            <div className="stat-header">
              <h3>⚡ Performans Metrikleri</h3>
              <span className="stat-badge quality">
                {overviewStats.performance_metrics.data_quality_score}
              </span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="label">Sistem Uptime:</span>
                <span className="value">{overviewStats.performance_metrics.system_uptime}</span>
              </div>
              <div className="stat-item">
                <span className="label">Xəta dərəcəsi:</span>
                <span className="value">{overviewStats.performance_metrics.error_rate}</span>
              </div>
              <div className="stat-item">
                <span className="label">İstifadəçi məmnuniyyəti:</span>
                <span className="value">{overviewStats.performance_metrics.user_satisfaction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trends Chart */}
        <div className="chart-section">
          <h3>📈 Artım Trendləri</h3>
          <div className="trends-chart">
            {overviewStats.growth_trends.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-date">{new Date(trend.period).toLocaleDateString('az-AZ')}</div>
                <div className="trend-metrics">
                  <div className="metric">
                    <span className="metric-label">İstifadəçi</span>
                    <span className="metric-value">{trend.users}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Təşkilat</span>
                    <span className="metric-value">{trend.institutions}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Sorğu</span>
                    <span className="metric-value">{trend.surveys}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInstitutionalPerformance = () => {
    if (!institutionalPerformance) return null;

    return (
      <div className="reports-content">
        <div className="performance-section">
          <h3>🏆 Təşkilat Reytinqi</h3>
          <div className="rankings-table">
            <div className="table-header">
              <span>Rank</span>
              <span>Təşkilat</span>
              <span>Tip</span>
              <span>Aktiv İstifadəçi</span>
              <span>Aktivlik Skoru</span>
            </div>
            {institutionalPerformance.institution_rankings.map((institution, index) => (
              <div key={institution.id} className="table-row">
                <span className="rank">#{index + 1}</span>
                <span className="name">{institution.name}</span>
                <span className="type">{institution.type}</span>
                <span className="users">{institution.active_users}</span>
                <span className="score">{institution.engagement_score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="engagement-metrics">
          <h3>📊 İstifadəçi Aktivliyi</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Orta Session Müddəti</span>
              <span className="metric-value">{institutionalPerformance.user_engagement.average_session_duration}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Günlük Aktiv İstifadəçi</span>
              <span className="metric-value">{institutionalPerformance.user_engagement.daily_active_users}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Həftəlik Saxlama Dərəcəsi</span>
              <span className="metric-value">{institutionalPerformance.user_engagement.weekly_retention_rate}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Funksiya Mənimsəmə Dərəcəsi</span>
              <span className="metric-value">{institutionalPerformance.user_engagement.feature_adoption_rate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSurveyAnalytics = () => {
    if (!surveyAnalytics) return null;

    return (
      <div className="reports-content">
        <div className="survey-overview">
          <h3>📋 Sorğu Baxışı</h3>
          <div className="overview-cards">
            <div className="overview-card">
              <span className="card-label">Ümumi Sorğu</span>
              <span className="card-value">{surveyAnalytics.survey_overview.total_surveys}</span>
            </div>
            <div className="overview-card">
              <span className="card-label">Cavab Dərəcəsi</span>
              <span className="card-value">{surveyAnalytics.survey_overview.response_rate}</span>
            </div>
            <div className="overview-card">
              <span className="card-label">Tamamlanma Dərəcəsi</span>
              <span className="card-value">{surveyAnalytics.survey_overview.completion_rate}</span>
            </div>
            <div className="overview-card">
              <span className="card-label">Orta Müddət</span>
              <span className="card-value">{surveyAnalytics.survey_overview.average_time}</span>
            </div>
          </div>
        </div>

        <div className="response-rates-section">
          <h3>📊 Cavab Dərəcələri</h3>
          <div className="rates-grid">
            <div className="rates-category">
              <h4>Təşkilat Tipinə görə</h4>
              {Object.entries(surveyAnalytics.response_rates.by_institution_type).map(([type, rate]) => (
                <div key={type} className="rate-item">
                  <span className="rate-label">{type}</span>
                  <span className="rate-value">{rate}</span>
                </div>
              ))}
            </div>
            <div className="rates-category">
              <h4>Regiona görə</h4>
              {Object.entries(surveyAnalytics.response_rates.by_region).map(([region, rate]) => (
                <div key={region} className="rate-item">
                  <span className="rate-label">{region}</span>
                  <span className="rate-value">{rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserActivity = () => {
    if (!userActivity) return null;

    return (
      <div className="reports-content">
        <div className="activity-summary">
          <h3>👤 İstifadəçi Aktivlik Xülasəsi</h3>
          <div className="summary-metrics">
            <div className="summary-card">
              <span className="summary-label">Ümumi Aktivlik</span>
              <span className="summary-value">{userActivity.user_activity_summary.total_activities}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Günlük Orta</span>
              <span className="summary-value">{userActivity.user_activity_summary.daily_average}</span>
            </div>
          </div>
        </div>

        <div className="activity-patterns">
          <h3>🕐 Giriş Nümunələri</h3>
          <div className="patterns-info">
            <div className="pattern-item">
              <span className="pattern-label">Pik Saatlar:</span>
              <span className="pattern-value">{userActivity.login_patterns.peak_hours.join(', ')}</span>
            </div>
            <div className="pattern-item">
              <span className="pattern-label">Giriş Tezliyi:</span>
              <span className="pattern-value">{userActivity.login_patterns.login_frequency}</span>
            </div>
          </div>
        </div>

        <div className="feature-usage">
          <h3>🔧 Funksiya İstifadəsi</h3>
          <div className="usage-bars">
            {Object.entries(userActivity.feature_usage).map(([feature, usage]) => (
              <div key={feature} className="usage-bar">
                <span className="feature-name">{feature}</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: usage }}></div>
                </div>
                <span className="usage-percent">{usage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">📊 Hesabatlar və Analitika</h1>
        <p className="page-description">
          Sistem performansı və istifadəçi aktivliyi haqqında dəqiq hesabatlar
        </p>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="date-filter">
          <label>Tarix aralığı:</label>
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
            className="date-input"
          />
          <span>-</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
            className="date-input"
          />
        </div>

        <div className="export-actions">
          <button
            onClick={() => handleExportReport('csv')}
            disabled={loading}
            className="export-btn csv"
          >
            📄 CSV Export
          </button>
          <button
            onClick={() => handleExportReport('json')}
            disabled={loading}
            className="export-btn json"
          >
            📋 JSON Export
          </button>
          <button
            onClick={() => handleExportReport('pdf')}
            disabled={loading}
            className="export-btn pdf"
          >
            📑 PDF Export
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Ümumi Baxış
        </button>
        <button
          className={`tab-btn ${activeTab === 'institutional' ? 'active' : ''}`}
          onClick={() => setActiveTab('institutional')}
        >
          🏢 Təşkilat Performansı
        </button>
        <button
          className={`tab-btn ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          📊 Sorğu Analitikası
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 İstifadəçi Aktivliyi
        </button>
      </div>

      {/* Content Area */}
      <div className="reports-container">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={fetchReportData} className="retry-btn">
              Yenidən cəhd et
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Hesabat məlumatları yüklənir...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewStats()}
            {activeTab === 'institutional' && renderInstitutionalPerformance()}
            {activeTab === 'surveys' && renderSurveyAnalytics()}
            {activeTab === 'users' && renderUserActivity()}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;