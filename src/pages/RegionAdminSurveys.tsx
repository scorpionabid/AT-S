import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { regionAdminService } from '../services/regionAdminService';
import type { RegionSurveyAnalytics } from '../services/regionAdminService';
import SurveyStatsOverview from '../components/surveys/SurveyStatsOverview';
import SurveysManagement from '../components/surveys/SurveysManagement';
import SurveyAnalyticsView from '../components/surveys/SurveyAnalyticsView';
import '../styles/regionadmin-surveys.css';

const RegionAdminSurveys: React.FC = () => {
  const { user } = useAuth();
  const [surveyAnalytics, setSurveyAnalytics] = useState<RegionSurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'analytics' | 'create'>('overview');

  useEffect(() => {
    fetchSurveyAnalytics();
  }, []);

  const fetchSurveyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getSurveyAnalytics();
      setSurveyAnalytics(data);
    } catch (error: any) {
      setError(error.message || 'Sorğu məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSurveyAnalytics();
  };

  if (loading) {
    return (
      <div className="regionadmin-surveys loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Sorğu məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="regionadmin-surveys error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchSurveyAnalytics} className="btn btn-primary">
            Yenidən Cəhd Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="regionadmin-surveys">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title">📊 Sorğu İdarəetməsi</h1>
            <p className="page-subtitle">Regional sorğuların yaradılması və analizi</p>
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
      <div className="surveys-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Ümumi Baxış</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Sorğular</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Analitika</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className="tab-icon">➕</span>
          <span className="tab-label">Yeni Yarat</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="surveys-content-container">
        {activeTab === 'overview' && surveyAnalytics && (
          <SurveyStatsOverview 
            surveyAnalytics={surveyAnalytics}
            loading={loading}
            onCreateSurvey={() => setActiveTab('create')}
            onManageSurveys={() => setActiveTab('surveys')}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}
        
        {activeTab === 'surveys' && (
          <SurveysManagement 
            onRefresh={handleRefresh}
            onCreateSurvey={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'analytics' && (
          <SurveyAnalyticsView 
            surveyAnalytics={surveyAnalytics}
            loading={loading}
          />
        )}

        {activeTab === 'create' && (
          <div className="create-content">
            <div className="create-header">
              <h3>➕ Yeni Sorğu Yarat</h3>
              <p>Regional sorğu hazırlama sihirbazı</p>
            </div>

            {/* Coming Soon Placeholder */}
            <div className="coming-soon">
              <div className="coming-soon-icon">🚧</div>
              <h3>Tezliklə...</h3>
              <p>RegionAdmin sorğu yaratma interfeysi hazırlanmaqdadır</p>
              <ul className="feature-list">
                <li>🎯 Hədəf auditoriya seçimi (sektor və məktəb bazında)</li>
                <li>❓ 8 növ sual tipi (çoxseçimli, yazılı, qiymətləndirmə və s.)</li>
                <li>📅 Avtomatik sorğu planlaması</li>
                <li>🔔 Real-time bildiriş sistemi</li>
                <li>📊 Canli nəticə izləmə</li>
              </ul>
              <button className="btn btn-primary" disabled>
                Hazırlanır...
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionAdminSurveys;