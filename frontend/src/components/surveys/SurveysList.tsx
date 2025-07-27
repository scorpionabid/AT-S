import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSurveyEnhanced } from '../../hooks/useSurveyEnhanced';
import { surveyEnhancedService } from '../../services/surveyEnhancedService';
import SurveyCreateForm from './SurveyCreateForm';
import SurveyEditForm from './SurveyEditForm';
import { Icon, ActionIcon, StatusIcon } from '../common/IconSystem';

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

interface SurveysListProps {
  showCreateModal?: boolean;
  onCreateModalClose?: () => void;
}

const SurveysList: React.FC<SurveysListProps> = ({ 
  showCreateModal = false, 
  onCreateModalClose 
}) => {
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
  const [dateFilter, setDateFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [mySurveys, setMySurveys] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(showCreateModal);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [previewingSurveyId, setPreviewingSurveyId] = useState<number | null>(null);
  const [selectedSurveys, setSelectedSurveys] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDeleteMenu, setActiveDeleteMenu] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, type: 'soft' | 'hard'} | null>(null);
  
  // Enhanced functionality hooks
  const {
    dashboardStats,
    bulkOperationLoading,
    bulkPublishSurveys,
    bulkCloseSurveys,
    bulkArchiveSurveys,
    bulkDeleteSurveys,
    startAutoRefresh,
    stopAutoRefresh
  } = useSurveyEnhanced();

  // Handle external modal control
  useEffect(() => {
    setShowCreateForm(showCreateModal);
  }, [showCreateModal]);

  // Permission check function (must be defined before useEffect)
  const canCreateSurvey = () => {
    if (!user) return false;
    
    // Handle both string and object role formats
    const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
    
    // Check if user has roles array (from auth response)
    const userRoles = user.roles || [];
    
    // Allow survey creation for specific roles
    const allowedRoles = ['superadmin', 'regionadmin', 'schooladmin'];
    return allowedRoles.includes(roleName || '') || userRoles.some(role => allowedRoles.includes(role));
  };

  const fetchSurveys = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const filterParams = {
        page,
        per_page: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { survey_type: typeFilter }),
        ...(dateFilter && { date_filter: dateFilter }),
        ...(creatorFilter && { creator_filter: creatorFilter }),
        ...(mySurveys && { my_surveys: true }),
        sort_by: 'created_at',
        sort_direction: 'desc' as const
      };

      const data = await surveyEnhancedService.getFilteredSurveys(filterParams);
      
      setSurveys(data.surveys);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.last_page);
      setTotalSurveys(data.meta.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Sorğular yüklənərkən xəta baş verdi';
      setError(errorMessage);
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys(currentPage);
  }, [currentPage, searchTerm, statusFilter, typeFilter, dateFilter, creatorFilter, mySurveys]);

  // Auto-refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && surveys.length > 0) {
        fetchSurveys(currentPage);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, loading, surveys.length]);

  // Start auto-refresh when component mounts
  useEffect(() => {
    startAutoRefresh(30000);
    return () => stopAutoRefresh();
  }, [startAutoRefresh, stopAutoRefresh]);

  // Enhanced bulk selection logic
  useEffect(() => {
    setShowBulkActions(selectedSurveys.length > 0);
  }, [selectedSurveys]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleSelectAll();
      }
      // Escape: Clear selection
      if (e.key === 'Escape') {
        setSelectedSurveys([]);
        setShowBulkActions(false);
      }
      // Ctrl/Cmd + R: Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchSurveys(currentPage);
      }
      // Ctrl/Cmd + N: New survey (if allowed)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && canCreateSurvey()) {
        e.preventDefault();
        setShowCreateForm(true);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [selectedSurveys, currentPage, canCreateSurvey]);

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
      return (
        <span className="status-badge expired">
          <StatusIcon status="expired" />
          Vaxtı keçib
        </span>
      );
    }
    
    switch (survey.status) {
      case 'draft':
        return (
          <span className="status-badge draft">
            <StatusIcon status="draft" />
            Layihə
          </span>
        );
      case 'published':
        return survey.is_active ? (
          <span className="status-badge active">
            <StatusIcon status="active" />
            Aktiv
          </span>
        ) : (
          <span className="status-badge published">
            <StatusIcon status="published" />
            Dərc edilib
          </span>
        );
      case 'closed':
        return (
          <span className="status-badge closed">
            <StatusIcon status="closed" />
            Bağlı
          </span>
        );
      case 'archived':
        return (
          <span className="status-badge archived">
            <StatusIcon status="archived" />
            Arxivləşib
          </span>
        );
      default:
        return <span className="status-badge">{survey.status}</span>;
    }
  };

  const getProgressBar = (survey: Survey) => {
    const percentage = survey.completion_percentage || 0;
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="progress-text">{percentage}%</span>
      </div>
    );
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

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchSurveys(currentPage);
  };

  const handleEditClick = (surveyId: number) => {
    setEditingSurveyId(surveyId);
    setShowEditForm(true);
  };

  const handleViewSurvey = (surveyId: number) => {
    window.open(`/surveys/${surveyId}`, '_blank');
  };

  const handleEditSurvey = (surveyId: number) => {
    setEditingSurveyId(surveyId);
    setShowEditForm(true);
  };

  const toggleDeleteMenu = (surveyId: number) => {
    setActiveDeleteMenu(activeDeleteMenu === surveyId ? null : surveyId);
  };

  const handleSoftDelete = (surveyId: number) => {
    setDeleteConfirm({ id: surveyId, type: 'soft' });
    setActiveDeleteMenu(null);
  };

  const handleHardDelete = (surveyId: number) => {
    setDeleteConfirm({ id: surveyId, type: 'hard' });
    setActiveDeleteMenu(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'soft') {
        await api.patch(`/surveys/${deleteConfirm.id}/archive`);
      } else {
        await api.delete(`/surveys/${deleteConfirm.id}`);
      }
      
      setDeleteConfirm(null);
      fetchSurveys(currentPage);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Sorğu silinərkən xəta baş verdi');
    }
  };

  const handlePublishSurvey = async (surveyId: number) => {
    try {
      await api.patch(`/surveys/${surveyId}/publish`);
      fetchSurveys(currentPage);
    } catch (error) {
      console.error('Publish error:', error);
      setError('Sorğu dərc edilərkən xəta baş verdi');
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingSurveyId(null);
    fetchSurveys(currentPage);
  };

  const handlePreviewClick = (surveyId: number) => {
    setPreviewingSurveyId(surveyId);
    setShowPreview(true);
  };

  const handleSelectSurvey = (surveyId: number) => {
    setSelectedSurveys(prev => 
      prev.includes(surveyId) 
        ? prev.filter(id => id !== surveyId)
        : [...prev, surveyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSurveys.length === surveys.length) {
      setSelectedSurveys([]);
    } else {
      setSelectedSurveys(surveys.map(survey => survey.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSurveys.length === 0) return;

    try {
      let result;
      switch (action) {
        case 'publish':
          result = await bulkPublishSurveys(selectedSurveys);
          if (result && result.published_count > 0) {
            setError('');
            setSelectedSurveys([]);
            setShowBulkActions(false);
            fetchSurveys(currentPage);
          }
          break;
        case 'close':
          result = await bulkCloseSurveys(selectedSurveys);
          if (result && result.closed_count > 0) {
            setError('');
            setSelectedSurveys([]);
            setShowBulkActions(false);
            fetchSurveys(currentPage);
          }
          break;
        case 'archive':
          result = await bulkArchiveSurveys(selectedSurveys);
          if (result && result.archived_count > 0) {
            setError('');
            setSelectedSurveys([]);
            setShowBulkActions(false);
            fetchSurveys(currentPage);
          }
          break;
        case 'delete':
          // Show confirmation dialog for delete
          const confirmDelete = window.confirm(
            `${selectedSurveys.length} sorğunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`
          );
          if (confirmDelete) {
            result = await bulkDeleteSurveys(selectedSurveys, true);
            if (result && result.deleted_count > 0) {
              setError('');
              setSelectedSurveys([]);
              setShowBulkActions(false);
              fetchSurveys(currentPage);
            }
          }
          break;
        default:
          return;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Kütləvi əməliyyat xətası baş verdi';
      setError(errorMessage);
      console.error(`Error performing bulk ${action}:`, err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFilter('');
    setCreatorFilter('');
    setMySurveys(false);
    setCurrentPage(1);
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
        <div className="header-content">
          <h1 className="page-title">
            <Icon type="SURVEY" />
            Sorğu İdarəetməsi
          </h1>
          <p className="page-description">Sistem sorğularını idarə edin və cavablandırın</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="TOTAL" />
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {dashboardStats?.overview.total_surveys || totalSurveys}
              </span>
              <span className="stat-label">Cəmi sorğu</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="ACTIVE" />
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {dashboardStats?.overview.active_surveys || surveys.filter(s => s.is_active).length}
              </span>
              <span className="stat-label">Aktiv</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="SELECTED" />
            </div>
            <div className="stat-content">
              <span className="stat-number">{selectedSurveys.length}</span>
              <span className="stat-label">Seçilmiş</span>
            </div>
          </div>
          {dashboardStats?.overview.my_surveys !== undefined && (
            <div className="stat-card">
              <div className="stat-icon">
                <Icon type="USER" />
              </div>
              <div className="stat-content">
                <span className="stat-number">{dashboardStats.overview.my_surveys}</span>
                <span className="stat-label">Mənim</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Enhanced Bulk Actions Bar */}
      {selectedSurveys.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-selection-info">
            <input
              type="checkbox"
              checked={selectedSurveys.length === surveys.length}
              onChange={handleSelectAll}
              className="bulk-select-all"
            />
            <span>{selectedSurveys.length} sorğu seçildi</span>
            {bulkOperationLoading && (
              <div className="bulk-operation-loading">
                <div className="spinner"></div>
                <span>Əməliyyat davam edir...</span>
              </div>
            )}
          </div>
          <div className="bulk-actions">
            <button
              onClick={() => handleBulkAction('publish')}
              className="bulk-action-btn publish"
              disabled={bulkOperationLoading}
            >
              <Icon type="PUBLISH" /> Dərc et
            </button>
            <button
              onClick={() => handleBulkAction('close')}
              className="bulk-action-btn close"
              disabled={bulkOperationLoading}
            >
              <Icon type="CLOSE" /> Bağla
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="bulk-action-btn archive"
              disabled={bulkOperationLoading}
            >
              <Icon type="ARCHIVE" /> Arxiv
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bulk-action-btn delete"
              disabled={bulkOperationLoading}
            >
              <Icon type="DELETE" /> Sil
            </button>
            <button
              onClick={() => {
                setSelectedSurveys([]);
                setShowBulkActions(false);
              }}
              className="bulk-action-btn cancel"
              disabled={bulkOperationLoading}
            >
              <Icon type="CLOSE" /> Ləğv et
            </button>
          </div>
        </div>
      )}

      <div className="surveys-controls">
        <div className="surveys-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Sorğu adı, təsvir və ya yaradıcı ilə axtarın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Icon type="SEARCH" />
              </button>
            </div>
          </form>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">
                <Icon type="STATUS" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Bütün statuslar</option>
                <option value="draft">📝 Layihə</option>
                <option value="published">📢 Dərc edilib</option>
                <option value="active">✅ Aktiv</option>
                <option value="closed">🔒 Bağlı</option>
                <option value="archived">📦 Arxivləşib</option>
                <option value="expired">⏰ Vaxtı keçib</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Icon type="TYPE" />
                Tip
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Bütün tiplər</option>
                <option value="form">📋 Form</option>
                <option value="poll">🗳️ Sorğu</option>
                <option value="assessment">📊 Qiymətləndirmə</option>
                <option value="feedback">💬 Rəy</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Icon type="CALENDAR" />
                Tarix
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Bütün tarixlər</option>
                <option value="today">🔥 Bu gün</option>
                <option value="week">📅 Bu həftə</option>
                <option value="month">📆 Bu ay</option>
                <option value="quarter">🗓️ Bu rüb</option>
                <option value="year">📊 Bu il</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Icon type="USER" />
                Yaradıcı
              </label>
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Bütün yaradıcılar</option>
                <option value="me">👤 Mənim sorğularım</option>
                <option value="team">👥 Komanda</option>
                <option value="admin">👨‍💼 Administratorlar</option>
              </select>
            </div>

            <div className="advanced-filters">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={mySurveys}
                  onChange={(e) => setMySurveys(e.target.checked)}
                />
                <span className="checkbox-icon">
                  <Icon type="CHECK" />
                </span>
                <span>Yalnız mənim sorğularım</span>
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter('active');
                    } else {
                      setStatusFilter('');
                    }
                  }}
                />
                <span className="checkbox-icon">
                  <Icon type="CHECK" />
                </span>
                <span>Yalnız aktiv sorğular</span>
              </label>

              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTypeFilter('form');
                    } else {
                      setTypeFilter('');
                    }
                  }}
                />
                <span className="checkbox-icon">
                  <Icon type="CHECK" />
                </span>
                <span>Yalnız formlar</span>
              </label>
            </div>

            {(searchTerm || statusFilter || typeFilter || dateFilter || creatorFilter || mySurveys) && (
              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters-btn">
                  <Icon type="CLOSE" /> Filtrlər təmizlə
                </button>
                <span className="active-filters-count">
                  {[searchTerm, statusFilter, typeFilter, dateFilter, creatorFilter, mySurveys].filter(Boolean).length} aktiv filtr
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Icon type="GRID" /> Grid
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <Icon type="LIST" /> Siyahı
            </button>
          </div>

          <div className="control-buttons">
            <button 
              className="control-button btn-with-icon"
              onClick={() => fetchSurveys(currentPage)}
              title="Yenilə"
            >
              <Icon type="REFRESH" /> Yenilə
            </button>
            
            {canCreateSurvey() && (
              <button 
                className="add-survey-button btn-with-icon"
                onClick={() => {
                  console.log('Survey create button clicked, setting showCreateForm to true');
                  setShowCreateForm(true);
                }}
              >
                <Icon type="ADD" /> Yeni Sorğu
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="surveys-summary">
        <span className="summary-text">
          {totalSurveys} sorğu tapıldı
          {selectedSurveys.length > 0 && ` (${selectedSurveys.length} seçildi)`}
        </span>
      </div>

      <div className={`surveys-grid surveys-grid--${viewMode}`}>
        {surveys.map((survey) => (
          <div 
            key={survey.id} 
            className={`survey-card ${selectedSurveys.includes(survey.id) ? 'selected' : ''}`}
          >
            <div className="survey-card-header">
              <div className="survey-title-section">
                <h3 className="survey-title">{survey.title}</h3>
                <div className="survey-badges">
                  {getStatusBadge(survey)}
                  <span className="type-badge">{getTypeBadge(survey.survey_type)}</span>
                </div>
              </div>
              <div className="survey-card-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleViewSurvey(survey.id)}
                  title="Sorğuya bax"
                >
                  👁️
                </button>
                {survey.creator.id === user?.id && (
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditSurvey(survey.id)}
                    title="Redaktə et"
                  >
                    ✏️
                  </button>
                )}
                <div className="delete-dropdown">
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => toggleDeleteMenu(survey.id)}
                    title="Sil"
                  >
                    🗑️
                  </button>
                  {activeDeleteMenu === survey.id && (
                    <div className="delete-menu">
                      <button 
                        className="delete-option soft-delete"
                        onClick={() => handleSoftDelete(survey.id)}
                      >
                        📊 Arxivlə
                      </button>
                      <button 
                        className="delete-option hard-delete"
                        onClick={() => handleHardDelete(survey.id)}
                      >
                        🗑️ Tam sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="survey-card-content">
              <div className="survey-stats-row">
                <div className="stat-item">
                  <span className="stat-value">{survey.response_count}</span>
                  <span className="stat-label">Cavab</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{survey.completion_percentage}%</span>
                  <span className="stat-label">Tamamlanma</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{survey.creator.name}</span>
                  <span className="stat-label">Yaradıcı</span>
                </div>
              </div>
              
              <div className="survey-dates-row">
                <div className="date-info">
                  <span className="date-label">📅 Başlama:</span>
                  <span className="date-value">{formatDate(survey.start_date)}</span>
                </div>
                {survey.end_date && (
                  <div className="date-info">
                    <span className="date-label">📅 Bitmə:</span>
                    <span className="date-value">{formatDate(survey.end_date)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="survey-card-footer">
              {survey.is_open_for_responses && (
                <Link 
                  to={`/surveys/${survey.id}/respond`} 
                  className="respond-link"
                >
                  📝 Cavablandır
                </Link>
              )}
              {survey.creator.id === user?.id && survey.status === 'draft' && (
                <button 
                  className="publish-btn"
                  onClick={() => handlePublishSurvey(survey.id)}
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
          <div className="pagination-content">
            <div className="pagination-info">
              <span className="pagination-summary">
                <Icon type="INFO" />
                {totalSurveys} sorğudan {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalSurveys)} arası göstərilir
              </span>
              <div className="view-mode-mobile">
                <select 
                  value={currentPage} 
                  onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                  className="page-select"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <option key={page} value={page}>
                      Səhifə {page} / {totalPages}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pagination-controls">
              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="pagination-button first"
                  title="İlk səhifə"
                >
                  <Icon type="FIRST_PAGE" />
                  <span className="button-text">İlk</span>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button prev"
                  title="Əvvəlki səhifə"
                >
                  <Icon type="PREV_PAGE" />
                  <span className="button-text">Əvvəlki</span>
                </button>
                
                {/* Page Numbers for Desktop */}
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button next"
                  title="Növbəti səhifə"
                >
                  <span className="button-text">Növbəti</span>
                  <Icon type="NEXT_PAGE" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-button last"
                  title="Son səhifə"
                >
                  <span className="button-text">Son</span>
                  <Icon type="LAST_PAGE" />
                </button>
              </div>
              
              <div className="per-page-selector">
                <label htmlFor="per-page">Səhifədə:</label>
                <select 
                  id="per-page"
                  className="per-page-select"
                  defaultValue="12"
                  onChange={(e) => {
                    // Handle per page change
                    const params = new URLSearchParams(window.location.search);
                    params.set('per_page', e.target.value);
                    setCurrentPage(1);
                    fetchSurveys(1);
                  }}
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Create Modal */}
      {showCreateForm && (
        <SurveyCreateForm 
          onClose={() => {
            console.log('Closing survey create form');
            setShowCreateForm(false);
            if (onCreateModalClose) {
              onCreateModalClose();
            }
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-header">
              <h3>Sorğunu sil</h3>
            </div>
            <div className="modal-body">
              <p>
                {deleteConfirm.type === 'soft' 
                  ? 'Sorğu arxivlənəcək və gizlədiləcək, lakin tamamilə silinməyəcək.'
                  : 'Sorğu tamamilə silinəcək və bərpa edilə bilməyəcək.'
                }
              </p>
              <p><strong>Bu əməliyyat geri qaytarıla bilməz!</strong></p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Ləğv et
              </button>
              <button 
                className={`btn ${deleteConfirm.type === 'soft' ? 'btn-warning' : 'btn-danger'}`}
                onClick={confirmDelete}
              >
                {deleteConfirm.type === 'soft' ? '📁 Arxivlə' : '🗑️ Tam sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveysList;