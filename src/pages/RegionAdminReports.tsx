import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { regionAdminService } from '../services/regionAdminService';
import { reportsService } from '../services/reportsService';
import type { 
  RegionDashboardData,
  SectorPerformance 
} from '../services/regionAdminService';
import type { 
  InstitutionalPerformanceData,
  SurveyAnalyticsData,
  UserActivityData 
} from '../services/reportsService';
import '../styles/regionadmin-reports.css';

interface RegionalReportData {
  overview: {
    total_users: number;
    active_users: number;
    total_institutions: number;
    total_surveys: number;
    survey_response_rate: number;
    task_completion_rate: number;
  };
  sector_performance: SectorPerformance[];
  trends: {
    user_growth: Array<{ date: string; count: number }>;
    survey_activity: Array<{ date: string; count: number }>;
    response_rates: Array<{ date: string; rate: number }>;
  };
  top_performers: {
    most_active_sector: string;
    highest_response_rate: string;
    most_surveys_created: string;
  };
}

const RegionAdminReports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'institutions' | 'surveys' | 'users' | 'trends'>('overview');
  const [dashboardData, setDashboardData] = useState<RegionDashboardData | null>(null);
  const [institutionalData, setInstitutionalData] = useState<InstitutionalPerformanceData | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyAnalyticsData | null>(null);
  const [userData, setUserData] = useState<UserActivityData | null>(null);
  const [trendsData, setTrendsData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch dashboard data for overview
      const dashboard = await regionAdminService.getDashboardStats();
      setDashboardData(dashboard);

      // Fetch specific data based on active tab
      switch (activeTab) {
        case 'institutions':
          const institutional = await reportsService.getInstitutionalPerformance();
          setInstitutionalData(institutional);
          break;
        case 'surveys':
          const surveys = await reportsService.getSurveyAnalytics();
          setSurveyData(surveys);
          break;
        case 'users':
          const users = await reportsService.getUserActivityReport();
          setUserData(users);
          break;
        case 'trends':
          const trends = await regionAdminService.getPerformanceTrends('month');
          setTrendsData(trends);
          break;
      }
    } catch (error: any) {
      setError(error.message || 'Hesabat məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const reportType = `region_${activeTab}`;
      const blob = await regionAdminService.exportRegionReport(activeTab as any, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError(error.message || 'Hesabat ixrac edilərkən xəta baş verdi');
    }
  };

  const renderOverviewTab = () => {
    if (!dashboardData) return null;

    const { region_overview, survey_metrics, task_metrics, sector_performance } = dashboardData;

    return (
      <div className="overview-content">
        {/* Regional Summary */}
        <div className="regional-summary">
          <div className="summary-header">
            <h3>🗺️ {region_overview.region_name} Regional Performans Xülasəsi</h3>
            <p>Regional fəaliyyətin ümumi görünümü və əsas göstəricilər</p>
          </div>

          <div className="summary-metrics">
            <div className="summary-metric">
              <div className="metric-icon">🏢</div>
              <div className="metric-info">
                <span className="metric-number">{region_overview.total_sectors}</span>
                <span className="metric-desc">Sektor</span>
              </div>
            </div>

            <div className="summary-metric">
              <div className="metric-icon">🏫</div>
              <div className="metric-info">
                <span className="metric-number">{region_overview.total_schools}</span>
                <span className="metric-desc">Məktəb</span>
              </div>
            </div>

            <div className="summary-metric">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <span className="metric-number">{region_overview.total_users.toLocaleString()}</span>
                <span className="metric-desc">İstifadəçi</span>
              </div>
            </div>

            <div className="summary-metric">
              <div className="metric-icon">✅</div>
              <div className="metric-info">
                <span className="metric-number">{region_overview.user_activity_rate}%</span>
                <span className="metric-desc">Aktivlik</span>
              </div>
            </div>

            <div className="summary-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <span className="metric-number">{survey_metrics.total_surveys}</span>
                <span className="metric-desc">Sorğu</span>
              </div>
            </div>

            <div className="summary-metric">
              <div className="metric-icon">📈</div>
              <div className="metric-info">
                <span className="metric-number">{task_metrics.completion_rate}%</span>
                <span className="metric-desc">Tapşırıq Tamamlanması</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="performance-charts">
          <div className="chart-section">
            <h4>📊 Sektor Performans Müqayisəsi</h4>
            <div className="sector-comparison">
              {sector_performance.map((sector) => (
                <div key={sector.sector_name} className="sector-bar">
                  <div className="sector-info">
                    <span className="sector-name">{sector.sector_name}</span>
                    <span className="sector-score">{sector.completion_rate}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${getPerformanceClass(sector.completion_rate)}`}
                      style={{ width: `${sector.completion_rate}%` }}
                    ></div>
                  </div>
                  <div className="sector-details">
                    <span>{sector.schools_count} məktəb</span>
                    <span>{sector.users_count} istifadəçi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="kpi-section">
          <h4>🎯 Əsas Performans Göstəriciləri</h4>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">İstifadəçi Aktivliği</span>
                <span className={`kpi-trend ${region_overview.user_activity_rate >= 70 ? 'positive' : 'negative'}`}>
                  {region_overview.user_activity_rate >= 70 ? '📈' : '📉'}
                </span>
              </div>
              <div className="kpi-value">{region_overview.user_activity_rate}%</div>
              <div className="kpi-description">30 gün ərzində aktiv istifadəçilər</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Sorğu Cavab Dərəcəsi</span>
                <span className={`kpi-trend ${survey_metrics.response_rate >= 60 ? 'positive' : 'negative'}`}>
                  {survey_metrics.response_rate >= 60 ? '📈' : '📉'}
                </span>
              </div>
              <div className="kpi-value">{survey_metrics.response_rate}%</div>
              <div className="kpi-description">Orta sorğu cavab dərəcəsi</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Tapşırıq Tamamlanması</span>
                <span className={`kpi-trend ${task_metrics.completion_rate >= 80 ? 'positive' : 'negative'}`}>
                  {task_metrics.completion_rate >= 80 ? '📈' : '📉'}
                </span>
              </div>
              <div className="kpi-value">{task_metrics.completion_rate}%</div>
              <div className="kpi-description">Tamamlanmış tapşırıqların faizi</div>
            </div>
          </div>
        </div>

        {/* Regional Insights */}
        <div className="insights-section">
          <h4>💡 Regional Anlayışlar</h4>
          <div className="insights-list">
            <div className="insight-item positive">
              <span className="insight-icon">✅</span>
              <span className="insight-text">
                Ən yüksək performans: {
                  sector_performance.length > 0 
                    ? sector_performance.reduce((best, current) => 
                        current.completion_rate > best.completion_rate ? current : best
                      ).sector_name
                    : 'N/A'
                } sektoru
              </span>
            </div>

            <div className="insight-item warning">
              <span className="insight-icon">⚠️</span>
              <span className="insight-text">
                Diqqət tələb edən: {
                  sector_performance.filter(s => s.completion_rate < 50).length
                } sektor 50%-dən aşağı performans göstərir
              </span>
            </div>

            <div className="insight-item info">
              <span className="insight-icon">ℹ️</span>
              <span className="insight-text">
                Toplam {survey_metrics.total_responses.toLocaleString()} sorğu cavabı alınıb
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstitutionsTab = () => {
    return (
      <div className="institutions-content">
        <div className="tab-header">
          <h3>🏢 Təşkilat Performans Hesabatı</h3>
          <p>Sektorlar və məktəblərin detaylı performans analizi</p>
        </div>

        <div className="coming-soon-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h4>Tezliklə...</h4>
          <p>Təşkilat performans hesabatı hazırlanmaqdadır</p>
          <ul className="feature-list">
            <li>📊 Sektor və məktəb performans tabloları</li>
            <li>📈 Müqayisəli performans chartları</li>
            <li>🎯 Hədəf və nəticə analizi</li>
            <li>📄 Excel/PDF ixrac funksiyası</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderSurveysTab = () => {
    return (
      <div className="surveys-content">
        <div className="tab-header">
          <h3>📊 Sorğu Analitika Hesabatı</h3>
          <p>Regional sorğuların detaylı analizi və statistikaları</p>
        </div>

        <div className="coming-soon-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h4>Tezliklə...</h4>
          <p>Sorğu analitika hesabatı hazırlanmaqdadır</p>
          <ul className="feature-list">
            <li>📊 Sorğu cavab dərəcələri və trendlər</li>
            <li>📈 Cavab keyfiyyəti analizi</li>
            <li>🎯 Hədəf auditoriya məlumatları</li>
            <li>📄 Detaylı sorğu hesabatları</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="users-content">
        <div className="tab-header">
          <h3>👥 İstifadəçi Fəaliyyət Hesabatı</h3>
          <p>Regional istifadəçi aktivliyi və iştirak analizi</p>
        </div>

        <div className="coming-soon-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h4>Tezliklə...</h4>
          <p>İstifadəçi fəaliyyət hesabatı hazırlanmaqdadır</p>
          <ul className="feature-list">
            <li>👥 İstifadəçi aktivlik statistikaları</li>
            <li>📈 Login və iştirak trendləri</li>
            <li>🎯 Rol bazında fəaliyyət analizi</li>
            <li>📄 İstifadəçi performans hesabatları</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    return (
      <div className="trends-content">
        <div className="tab-header">
          <h3>📈 Trend Analizi və Proqnozlar</h3>
          <p>Regional performansın zaman üzrə dəyişimi və gələcək proqnozları</p>
        </div>

        <div className="coming-soon-placeholder">
          <div className="placeholder-icon">🚧</div>
          <h4>Tezliklə...</h4>
          <p>Trend analizi hesabatı hazırlanmaqdadır</p>
          <ul className="feature-list">
            <li>📈 İnteraktiv trend chartları</li>
            <li>🔮 Məlumat əsaslı proqnozlar</li>
            <li>📊 Mövsümi analiz və müqayisələr</li>
            <li>🎯 Performans hədəf izləmə</li>
          </ul>
        </div>
      </div>
    );
  };

  const getPerformanceClass = (rate: number): string => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="regionadmin-reports loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Hesabat məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="regionadmin-reports error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchReportData} className="btn btn-primary">
            Yenidən Cəhd Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="regionadmin-reports">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title">📈 Regional Hesabatlar və Analitika</h1>
            <p className="page-subtitle">
              {dashboardData?.region_overview.region_name} regionunun detaylı performans analizi
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={fetchReportData} 
              className="btn btn-outline refresh-btn"
              title="Məlumatları yenilə"
            >
              🔄 Yenilə
            </button>
            <div className="export-dropdown">
              <button className="btn btn-primary export-btn">
                📤 İxrac Et
              </button>
              <div className="export-menu">
                <button onClick={() => exportReport('csv')}>CSV</button>
                <button onClick={() => exportReport('excel')}>Excel</button>
                <button onClick={() => exportReport('pdf')}>PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Ümumi Baxış</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'institutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('institutions')}
        >
          <span className="tab-icon">🏢</span>
          <span className="tab-label">Təşkilatlar</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Sorğular</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">İstifadəçilər</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Trendlər</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="reports-content-container">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'institutions' && renderInstitutionsTab()}
        {activeTab === 'surveys' && renderSurveysTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'trends' && renderTrendsTab()}
      </div>
    </div>
  );
};

export default RegionAdminReports;