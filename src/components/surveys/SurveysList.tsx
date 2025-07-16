import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SurveyCreateForm from './SurveyCreateForm';
import SurveyEditForm from './SurveyEditForm';
import '../../styles/surveys.css';

interface Survey {
  id: number;
  title: string;
  description: string;
  status: string;
  survey_type: string;
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  start_date: string | null;
  end_date: string | null;
  published_at: string | null;
  response_count: number;
  completion_percentage: number;
  is_active: boolean;
  is_open_for_responses: boolean;
  has_expired: boolean;
  created_at: string;
  updated_at: string;
  creator: {
    id: number;
    username: string;
    name: string;
  };
}

interface SurveysResponse {
  surveys: Survey[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

const SurveysList: React.FC = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [mySurveys, setMySurveys] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);

  const fetchSurveys = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { survey_type: typeFilter }),
        ...(mySurveys && { my_surveys: 'true' })
      });

      const response = await api.get(`/surveys?${params}`);
      const data: SurveysResponse = response.data;
      
      setSurveys(data.surveys);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.last_page);
      setTotalSurveys(data.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sorğular yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys(currentPage);
  }, [currentPage, searchTerm, statusFilter, typeFilter, mySurveys]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSurveys(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Təyin edilməyib';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (survey: Survey) => {
    if (survey.has_expired) {
      return <span className="status-badge expired">Vaxtı keçib</span>;
    }
    
    switch (survey.status) {
      case 'draft':
        return <span className="status-badge draft">Layihə</span>;
      case 'published':
        return survey.is_active 
          ? <span className="status-badge active">Aktiv</span>
          : <span className="status-badge published">Dərc edilib</span>;
      case 'closed':
        return <span className="status-badge closed">Bağlı</span>;
      case 'archived':
        return <span className="status-badge archived">Arxivləşib</span>;
      default:
        return <span className="status-badge">{survey.status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeNames: { [key: string]: string } = {
      'form': 'Form',
      'poll': 'Sorğu',
      'assessment': 'Qiymətləndirmə',
      'feedback': 'Rəy'
    };
    return typeNames[type] || type;
  };

  const canCreateSurvey = () => {
    if (!user) return false;
    
    // Handle both string and object role formats
    const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
    
    return roleName === 'superadmin' || 
           roleName === 'regionadmin' || 
           roleName === 'schooladmin' || 
           roleName === 'sektoradmin';
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchSurveys(currentPage);
  };

  const handleEditClick = (surveyId: number) => {
    setEditingSurveyId(surveyId);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingSurveyId(null);
    fetchSurveys(currentPage);
  };

  if (loading && surveys.length === 0) {
    return (
      <div className="surveys-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Sorğular yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surveys-list">
      <div className="page-header">
        <h1 className="page-title">Sorğu İdarəetməsi</h1>
        <p className="page-description">Sistem sorğularını idarə edin və cavablandırın</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="surveys-controls">
        <div className="surveys-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Sorğu adı ilə axtarın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍 Axtar
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Bütün statuslar</option>
            <option value="draft">Layihə</option>
            <option value="published">Dərc edilib</option>
            <option value="closed">Bağlı</option>
            <option value="archived">Arxivləşib</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Bütün tiplər</option>
            <option value="form">Form</option>
            <option value="poll">Sorğu</option>
            <option value="assessment">Qiymətləndirmə</option>
            <option value="feedback">Rəy</option>
          </select>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={mySurveys}
              onChange={(e) => setMySurveys(e.target.checked)}
            />
            <span>Yalnız mənim sorğularım</span>
          </label>
        </div>

        {canCreateSurvey() && (
          <button 
            className="add-survey-button"
            onClick={() => {
              console.log('Survey create button clicked, setting showCreateForm to true');
              setShowCreateForm(true);
            }}
          >
            ➕ Yeni Sorğu
          </button>
        )}
      </div>

      <div className="surveys-grid">
        {surveys.map((survey) => (
          <div key={survey.id} className="survey-card">
            <div className="survey-card-header">
              <div className="survey-title-section">
                <h3 className="survey-title">{survey.title}</h3>
                <div className="survey-badges">
                  {getStatusBadge(survey)}
                  <span className="type-badge">{getTypeBadge(survey.survey_type)}</span>
                </div>
              </div>
              <div className="survey-actions">
                <Link 
                  to={`/surveys/${survey.id}`} 
                  className="action-button view"
                  title="Ətraflı bax"
                >
                  👁️
                </Link>
                {survey.creator.id === user?.id && (
                  <button 
                    onClick={() => handleEditClick(survey.id)}
                    className="action-button edit"
                    title="Redaktə et"
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>

            <div className="survey-card-content">
              <p className="survey-description">
                {survey.description || 'Təsvir mövcud deyil'}
              </p>

              <div className="survey-meta">
                <div className="survey-dates">
                  <div className="date-item">
                    <span className="date-label">Başlama:</span>
                    <span className="date-value">{formatDate(survey.start_date)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">Bitmə:</span>
                    <span className="date-value">{formatDate(survey.end_date)}</span>
                  </div>
                </div>

                <div className="survey-stats">
                  <div className="stat-item">
                    <span className="stat-value">{survey.response_count}</span>
                    <span className="stat-label">Cavab</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{survey.completion_percentage}%</span>
                    <span className="stat-label">Tamamlanma</span>
                  </div>
                </div>
              </div>

              <div className="survey-creator">
                <span>Yaradıcı: <strong>{survey.creator.name}</strong></span>
                <span className="created-date">{formatDate(survey.created_at)}</span>
              </div>
            </div>

            <div className="survey-card-footer">
              {survey.is_open_for_responses && (
                <Link 
                  to={`/surveys/${survey.id}/respond`} 
                  className="respond-button"
                >
                  📝 Cavablandır
                </Link>
              )}
              {survey.creator.id === user?.id && survey.status === 'draft' && (
                <button 
                  className="publish-button"
                  onClick={() => {/* Handle publish */}}
                >
                  🚀 Dərc et
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {surveys.length === 0 && !loading && (
        <div className="no-surveys">
          <p>Heç bir sorğu tapılmadı</p>
          {canCreateSurvey() && (
            <button 
              className="create-first-survey"
              onClick={() => setShowCreateForm(true)}
            >
              İlk sorğunuzu yaradın
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            {totalSurveys} sorğudan {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalSurveys)} arası göstərilir
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ⏮️ İlk
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ◀️ Əvvəlki
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ▶️ Növbəti
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ⏭️ Son
            </button>
          </div>
        </div>
      )}

      {/* Survey Create Modal */}
      {showCreateForm && (
        <SurveyCreateForm 
          onClose={() => {
            console.log('Closing survey create form');
            setShowCreateForm(false);
          }}
          onSuccess={handleCreateSuccess}
        />
      )}
      
      {/* Debug info */}
      {import.meta.env.MODE === 'development' && (
        <div style={{position: 'fixed', top: 10, right: 10, background: 'yellow', padding: '5px', fontSize: '12px', zIndex: 9999}}>
          showCreateForm: {showCreateForm.toString()}<br/>
          canCreateSurvey: {canCreateSurvey().toString()}<br/>
          userRole: {user?.role ? (typeof user.role === 'string' ? user.role : user.role.name) : 'null'}
        </div>
      )}

      {/* Survey Edit Modal */}
      {showEditForm && editingSurveyId && (
        <SurveyEditForm 
          surveyId={editingSurveyId}
          onClose={() => {
            setShowEditForm(false);
            setEditingSurveyId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default SurveysList;