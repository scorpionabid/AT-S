import React, { useState, useEffect } from 'react';
import { surveyService } from '../../services/surveyService';
import type { Survey } from '../../services/surveyService';

interface SurveysManagementProps {
  onRefresh?: () => void;
  onCreateSurvey?: () => void;
  filters?: {
    status?: string;
    search?: string;
  };
}

const SurveysManagement: React.FC<SurveysManagementProps> = ({ 
  onRefresh, 
  onCreateSurvey,
  filters = {}
}) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');

  useEffect(() => {
    fetchSurveys();
  }, [selectedStatus, searchTerm]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await surveyService.getSurveys({
        page: 1,
        per_page: 50,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchTerm || undefined
      });
      setSurveys(response.data);
    } catch (error: any) {
      setError(error.message || 'Sorğular yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSurvey = async (surveyId: number) => {
    try {
      await surveyService.publishSurvey(surveyId);
      fetchSurveys();
      onRefresh?.();
    } catch (error: any) {
      setError(error.message || 'Sorğu dərc edilmədi');
    }
  };

  const handleCloseSurvey = async (surveyId: number) => {
    try {
      await surveyService.closeSurvey(surveyId);
      fetchSurveys();
      onRefresh?.();
    } catch (error: any) {
      setError(error.message || 'Sorğu bağlanmadı');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'closed': return 'secondary';
      default: return 'primary';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'published': return 'Dərc edilmiş';
      case 'draft': return 'Layihə';
      case 'closed': return 'Bağlanmış';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="surveys-content loading">
        <div className="loading-spinner"></div>
        <p>Sorğular yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="surveys-content">
      <div className="surveys-header">
        <div className="surveys-title">
          <h3>📊 Sorğu Siyahısı</h3>
          <p>Regional sorğuların idarə edilməsi</p>
        </div>
        <div className="surveys-actions">
          <button 
            className="btn btn-primary"
            onClick={onCreateSurvey}
          >
            ➕ Yeni Sorğu
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="surveys-filters">
        <div className="filter-group">
          <label>Status filtri:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Bütün statuslar</option>
            <option value="draft">Layihə</option>
            <option value="published">Dərc edilmiş</option>
            <option value="closed">Bağlanmış</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Axtarış:</label>
          <input
            type="text"
            placeholder="Sorğu adı axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-outline"
          onClick={fetchSurveys}
        >
          🔍 Axtar
        </button>
      </div>

      {/* Surveys Grid */}
      <div className="surveys-grid">
        {surveys.map((survey) => (
          <div key={survey.id} className="survey-card">
            <div className="survey-header">
              <div className="survey-title-section">
                <h4 className="survey-title">{survey.title}</h4>
                <span className={`survey-status ${getStatusColor(survey.status)}`}>
                  {getStatusText(survey.status)}
                </span>
              </div>
              <div className="survey-meta">
                <span className="survey-date">
                  {new Date(survey.created_at).toLocaleDateString('az-AZ')}
                </span>
              </div>
            </div>

            <div className="survey-content">
              <p className="survey-description">
                {survey.description || 'Təsvir əlavə edilməyib'}
              </p>
              
              <div className="survey-stats">
                <div className="survey-stat">
                  <span className="stat-icon">❓</span>
                  <span className="stat-text">{survey.questions?.length || 0} sual</span>
                </div>
                <div className="survey-stat">
                  <span className="stat-icon">💬</span>
                  <span className="stat-text">{survey.response_count || 0} cavab</span>
                </div>
                {survey.start_date && (
                  <div className="survey-stat">
                    <span className="stat-icon">📅</span>
                    <span className="stat-text">
                      {new Date(survey.start_date).toLocaleDateString('az-AZ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="survey-actions">
              <button className="btn btn-sm btn-outline">
                👁️ Gör
              </button>
              <button className="btn btn-sm btn-outline">
                ✏️ Redaktə
              </button>
              
              {survey.status === 'draft' && (
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handlePublishSurvey(survey.id)}
                >
                  📤 Dərc Et
                </button>
              )}
              
              {survey.status === 'published' && (
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => handleCloseSurvey(survey.id)}
                >
                  🔒 Bağla
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {surveys.length === 0 && !loading && (
        <div className="empty-surveys">
          <div className="empty-icon">📊</div>
          <h3>Sorğu tapılmadı</h3>
          <p>Seçilmiş kriterlərə uyğun sorğu yoxdur</p>
          <button 
            className="btn btn-primary"
            onClick={onCreateSurvey}
          >
            İlk Sorğunu Yarat
          </button>
        </div>
      )}
    </div>
  );
};

export default SurveysManagement;