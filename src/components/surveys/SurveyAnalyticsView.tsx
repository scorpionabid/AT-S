import React from 'react';
import type { RegionSurveyAnalytics } from '../../services/regionAdminService';

interface SurveyAnalyticsViewProps {
  surveyAnalytics: RegionSurveyAnalytics | null;
  loading?: boolean;
}

const SurveyAnalyticsView: React.FC<SurveyAnalyticsViewProps> = ({ 
  surveyAnalytics, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="analytics-content loading">
        <div className="loading-skeleton">
          <div className="skeleton-analytics"></div>
        </div>
      </div>
    );
  }

  if (!surveyAnalytics) {
    return (
      <div className="analytics-content">
        <div className="no-data">
          <span className="no-data-icon">📊</span>
          <h3>Analitika məlumatları yoxdur</h3>
          <p>Analitika üçün məlumat tapılmadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-content">
      <div className="analytics-header">
        <h3>📈 Detaylı Analitika</h3>
        <p>Regional sorğu performansının dərin təhlili</p>
      </div>

      {/* Advanced Analytics Sections */}
      <div className="analytics-sections">
        {/* Response Rate Trends */}
        <div className="analytics-section">
          <div className="section-header">
            <h4>📊 Cavab Dərəcəsi Trendləri</h4>
            <p>Zaman ərzində cavab dərəcələrinin dəyişimi</p>
          </div>
          <div className="trend-chart-container">
            <div className="chart-placeholder">
              <span className="chart-icon">📈</span>
              <p>Interaktiv trend qrafiki hazırlanmaqdadır</p>
              <ul className="chart-features">
                <li>Aylıq cavab dərəcəsi trendləri</li>
                <li>Sektorlar üzrə müqayisə</li>
                <li>Performans proqnozları</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demographic Analysis */}
        <div className="analytics-section">
          <div className="section-header">
            <h4>🎯 Demografik Analiz</h4>
            <p>Hədəf auditoriya və iştirak təhlili</p>
          </div>
          <div className="demographic-charts">
            <div className="chart-placeholder">
              <span className="chart-icon">👥</span>
              <p>Demografik breakdown charts</p>
              <ul className="chart-features">
                <li>Yaş qrupları üzrə bölgü</li>
                <li>Cins tərkibi analizi</li>
                <li>Təhsil səviyyəsi statistikası</li>
                <li>Regional paylanma</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="analytics-section">
          <div className="section-header">
            <h4>⚡ Performans Göstəriciləri</h4>
            <p>Sorğu keyfiyyəti və effektivlik mətriklər</p>
          </div>
          <div className="performance-metrics">
            <div className="metrics-grid">
              <div className="metric-card completion-rate">
                <div className="metric-header">
                  <h5>✅ Tamamlanma Dərəcəsi</h5>
                </div>
                <div className="metric-value">
                  {surveyAnalytics.average_response_rate.toFixed(1)}%
                </div>
                <div className="metric-trend">
                  <span className="trend-up">↗️ +2.3%</span>
                  <span className="trend-period">bu ay</span>
                </div>
              </div>

              <div className="metric-card engagement-score">
                <div className="metric-header">
                  <h5>🎯 Cəlbedicilik Balı</h5>
                </div>
                <div className="metric-value">8.7/10</div>
                <div className="metric-trend">
                  <span className="trend-up">↗️ +0.4</span>
                  <span className="trend-period">bu ay</span>
                </div>
              </div>

              <div className="metric-card response-time">
                <div className="metric-header">
                  <h5>⏱️ Orta Cavab Müddəti</h5>
                </div>
                <div className="metric-value">4.2 dəq</div>
                <div className="metric-trend">
                  <span className="trend-down">↘️ -0.8 dəq</span>
                  <span className="trend-period">bu ay</span>
                </div>
              </div>

              <div className="metric-card satisfaction">
                <div className="metric-header">
                  <h5>😊 Məmnunluq Dərəcəsi</h5>
                </div>
                <div className="metric-value">4.6/5</div>
                <div className="metric-trend">
                  <span className="trend-up">↗️ +0.2</span>
                  <span className="trend-period">bu ay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Analysis */}
        <div className="analytics-section">
          <div className="section-header">
            <h4>❓ Sual Analizi</h4>
            <p>Sual tipləri və effektivlik təhlili</p>
          </div>
          <div className="question-analysis">
            <div className="chart-placeholder">
              <span className="chart-icon">📊</span>
              <p>Sual effektivlik charts</p>
              <ul className="chart-features">
                <li>Sual tipi performansları</li>
                <li>Cavabsızlıq səbəbləri</li>
                <li>Optimal sual sayı təhlili</li>
                <li>Sual ardıcıllığı analizi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export and Reports */}
        <div className="analytics-section">
          <div className="section-header">
            <h4>📄 Hesabat və Export</h4>
            <p>Analitika məlumatlarının ixracı və hesabat yaradılması</p>
          </div>
          <div className="export-options">
            <div className="export-grid">
              <button className="export-btn excel" disabled>
                <span className="export-icon">📊</span>
                <div className="export-content">
                  <h5>Excel Hesabatı</h5>
                  <p>Detallı məlumatlar və qrafiklər</p>
                </div>
              </button>

              <button className="export-btn pdf" disabled>
                <span className="export-icon">📄</span>
                <div className="export-content">
                  <h5>PDF Hesabatı</h5>
                  <p>Executive summary və vizuallar</p>
                </div>
              </button>

              <button className="export-btn powerpoint" disabled>
                <span className="export-icon">📊</span>
                <div className="export-content">
                  <h5>PowerPoint Təqdimatı</h5>
                  <p>Prezentasiya üçün hazır slaydlar</p>
                </div>
              </button>

              <button className="export-btn api" disabled>
                <span className="export-icon">⚙️</span>
                <div className="export-content">
                  <h5>API Data Export</h5>
                  <p>JSON/CSV formatında raw data</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="coming-soon-notice">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">🚧</div>
          <h3>Tezliklə...</h3>
          <p>Detaylı analitika səhifəsi hazırlanmaqdadır</p>
          <ul className="feature-list">
            <li>📊 Interaktiv chartlar və qrafiklər</li>
            <li>📈 Real-time trend analizi və proqnozlar</li>
            <li>🎯 Advanced hədəf auditoriya analizi</li>
            <li>📄 Avtomatik hesabat generatoru</li>
            <li>📤 Çoxlu format export funksiyası</li>
            <li>🔄 Scheduled reports və alerts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalyticsView;