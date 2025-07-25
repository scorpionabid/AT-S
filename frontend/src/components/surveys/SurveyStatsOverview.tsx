import React from 'react';
import type { 
  RegionSurveyAnalytics, 
  SectorSurveyData 
} from '../../services/regionAdminService';

interface SurveyStatsOverviewProps {
  surveyAnalytics: RegionSurveyAnalytics;
  loading?: boolean;
  onCreateSurvey?: () => void;
  onManageSurveys?: () => void;
  onViewAnalytics?: () => void;
}

const SurveyStatsOverview: React.FC<SurveyStatsOverviewProps> = ({ 
  surveyAnalytics, 
  loading,
  onCreateSurvey,
  onManageSurveys,
  onViewAnalytics
}) => {
  const getResponseRateClass = (rate: number): string => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  };

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

  const { survey_totals, surveys_by_sector, average_response_rate, most_active_sector } = surveyAnalytics;

  return (
    <div className="overview-content">
      {/* Survey Metrics */}
      <div className="survey-metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3 className="metric-value">{survey_totals.total}</h3>
            <p className="metric-label">Toplam Sorğular</p>
          </div>
        </div>

        <div className="metric-card published">
          <div className="metric-icon">📤</div>
          <div className="metric-content">
            <h3 className="metric-value">{survey_totals.published}</h3>
            <p className="metric-label">Dərc Edilmiş</p>
            <span className="metric-sublabel">Aktiv sorğular</span>
          </div>
        </div>

        <div className="metric-card responses">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <h3 className="metric-value">{survey_totals.total_responses.toLocaleString()}</h3>
            <p className="metric-label">Toplam Cavablar</p>
            <span className="metric-sublabel">{average_response_rate.toFixed(1)}% orta cavab dərəcəsi</span>
          </div>
        </div>

        <div className="metric-card drafts">
          <div className="metric-icon">📝</div>
          <div className="metric-content">
            <h3 className="metric-value">{survey_totals.draft}</h3>
            <p className="metric-label">Layihələr</p>
            <span className="metric-sublabel">Hazırlanmaqda</span>
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="sector-survey-section">
        <div className="section-header">
          <h3>📍 Sektorlara Görə Sorğu Fəaliyyəti</h3>
          <p>Hər sektorun sorğu performansı və cavab dərəcələri</p>
        </div>
        
        <div className="sector-survey-grid">
          {surveys_by_sector.map((sector: SectorSurveyData) => (
            <div key={sector.sector_name} className="sector-survey-card">
              <div className="sector-survey-header">
                <h4 className="sector-name">{sector.sector_name}</h4>
                <span className={`response-rate ${getResponseRateClass(sector.response_rate)}`}>
                  {sector.response_rate}%
                </span>
              </div>
              
              <div className="sector-survey-stats">
                <div className="survey-stat">
                  <span className="stat-icon">📊</span>
                  <div className="stat-info">
                    <span className="stat-value">{sector.surveys_count}</span>
                    <span className="stat-label">Sorğular</span>
                  </div>
                </div>

                <div className="survey-stat">
                  <span className="stat-icon">💬</span>
                  <div className="stat-info">
                    <span className="stat-value">{sector.responses_count}</span>
                    <span className="stat-label">Cavablar</span>
                  </div>
                </div>
              </div>

              <div className="response-progress">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getResponseRateClass(sector.response_rate)}`}
                    style={{ width: `${sector.response_rate}%` }}
                  ></div>
                </div>
                <span className="progress-text">Cavab dərəcəsi</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <div className="section-header">
          <h3>📈 Performans Təhlili</h3>
          <p>Regional sorğu fəaliyyətinin ümumi təhlili</p>
        </div>

        <div className="insights-grid">
          <div className="insight-card best-performer">
            <div className="insight-icon">🏆</div>
            <div className="insight-content">
              <h4>Ən Yaxşı Performans</h4>
              {most_active_sector ? (
                <div className="performer-info">
                  <span className="performer-name">{most_active_sector.sector_name}</span>
                  <span className="performer-stats">
                    {most_active_sector.responses_count} cavab ({most_active_sector.response_rate}%)
                  </span>
                </div>
              ) : (
                <span className="no-data">Məlumat yoxdur</span>
              )}
            </div>
          </div>

          <div className="insight-card avg-response">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>Orta Cavab Dərəcəsi</h4>
              <div className="avg-info">
                <span className="avg-value">{average_response_rate.toFixed(1)}%</span>
                <span className="avg-desc">Bütün sektorlar üzrə</span>
              </div>
            </div>
          </div>

          <div className="insight-card participation">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>İştirak Sektorları</h4>
              <div className="participation-info">
                <span className="participation-count">
                  {surveys_by_sector.filter(s => s.surveys_count > 0).length}
                </span>
                <span className="participation-desc">
                  {surveys_by_sector.length} sektordan aktiv
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h3>🚀 Tez Əməliyyatlar</h3>
          <p>Sorğu idarəetməsi üçün əsas funksiyalar</p>
        </div>

        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn create"
            onClick={onCreateSurvey}
          >
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h4>Yeni Sorğu Yarat</h4>
              <p>Regional sorğu hazırla</p>
            </div>
          </button>

          <button 
            className="quick-action-btn manage"
            onClick={onManageSurveys}
          >
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h4>Sorğuları İdarə Et</h4>
              <p>Mövcud sorğuları redaktə et</p>
            </div>
          </button>

          <button 
            className="quick-action-btn analytics"
            onClick={onViewAnalytics}
          >
            <div className="action-icon">📈</div>
            <div className="action-content">
              <h4>Analitika Gör</h4>
              <p>Detaylı performans təhlili</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyStatsOverview;