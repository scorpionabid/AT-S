import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import InstitutionCreateForm from './InstitutionCreateForm';
import InstitutionEditForm from './InstitutionEditForm';
import InstitutionHierarchyView from './InstitutionHierarchyView';
import InstitutionDetails from './InstitutionDetails';
import InstitutionCardSkeleton from '../common/InstitutionCardSkeleton';
import ErrorDisplay from '../common/ErrorDisplay';
import { NoResultsEmptyState, ErrorEmptyState } from '../common/EmptyState';
import { Icon, ActionIcon, StatusIcon, InstitutionTypeIcon, ICONS } from '../common/IconSystem';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  region_code: string;
  institution_code: string;
  is_active: boolean;
  established_date: string;
  hierarchy_path: string;
  parent: {
    id: number;
    name: string;
    type: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface InstitutionsResponse {
  institutions: Institution[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

const InstitutionsList: React.FC = () => {
  console.log('🟢 InstitutionsList component rendered');
  
  const { user } = useAuth();
  console.log('👤 Current user in InstitutionsList:', user);
  
  // Additional debugging - check localStorage directly
  const storedUser = localStorage.getItem('user_data');
  console.log('💾 Stored user data in localStorage:', storedUser);
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('📄 Parsed user data:', parsedUser);
      console.log('🔍 User roles from localStorage:', parsedUser.roles);
    } catch (e) {
      console.error('❌ Error parsing localStorage user data:', e);
    }
  }
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState<number | null>(null);
  const [viewingInstitutionId, setViewingInstitutionId] = useState<number | null>(null);
  const [historyInstitutionId, setHistoryInstitutionId] = useState<number | null>(null);
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const institutionTypes = [
    { value: 'ministry', label: 'Nazirlik' },
    { value: 'region', label: 'Regional İdarə' },
    { value: 'sektor', label: 'Sektor' },
    { value: 'school', label: 'Məktəb' },
    { value: 'vocational', label: 'Peşə Məktəbi' },
    { value: 'university', label: 'Universitet' }
  ];

  const levelOptions = [
    { value: 1, label: 'Səviyyə 1 - Nazirlik' },
    { value: 2, label: 'Səviyyə 2 - Regional' },
    { value: 3, label: 'Səviyyə 3 - Sektor' },
    { value: 4, label: 'Səviyyə 4 - Məktəb' },
    { value: 5, label: 'Səviyyə 5 - Şöbə' }
  ];

  useEffect(() => {
    console.log('🔄 InstitutionsList useEffect triggered');
    console.log('   - Dependencies changed:', { currentPage, searchTerm, typeFilter, levelFilter });
    fetchInstitutions();
  }, [currentPage, searchTerm, typeFilter, levelFilter]);

  const fetchInstitutions = async () => {
    console.log('📥 fetchInstitutions called');
    
    try {
      console.log('   - Setting loading to true...');
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '15'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);
      if (levelFilter) params.append('level', levelFilter);

      console.log('   - Making API request to /institutions with params:', params.toString());
      const response = await api.get(`/institutions?${params}`);
      console.log('   - Raw API response:', response.data);
      const data: InstitutionsResponse = response.data;
      
      console.log('   - API response received:', data);
      console.log('   - Institutions array:', data.institutions);
      console.log('   - Institutions count:', data.institutions?.length || 0);
      console.log('   - Is institutions array:', Array.isArray(data.institutions));
      
      // Ensure institutions is always an array
      const institutionsArray = Array.isArray(data.institutions) ? data.institutions : [];
      setInstitutions(institutionsArray);
      setTotalPages(data.meta?.last_page || 1);
      
      console.log('   - State updated successfully');
    } catch (err: any) {
      console.error('❌ fetchInstitutions error:', err);
      console.error('   - Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Institution məlumatları yüklənərkən xəta baş verdi';
      console.error('   - Setting error message:', errorMessage);
      setError(errorMessage);
      
      // Ensure institutions is empty array on error
      setInstitutions([]);
      setTotalPages(1);
    } finally {
      console.log('   - Setting loading to false...');
      setLoading(false);
    }
  };

  const canManageInstitutions = () => {
    // Check if user has roles array (from /me endpoint)
    const roles = user?.roles || [];
    const canManage = roles.includes('superadmin') || roles.includes('regionadmin');
    
    console.log('🔑 Checking institution management permissions:');
    console.log('   - User object:', user);
    console.log('   - User roles:', roles);
    console.log('   - Can manage institutions:', canManage);
    
    return canManage;
  };

  const handleCreateSuccess = () => {
    console.log('🎉 handleCreateSuccess called');
    console.log('   - Closing create form...');
    setShowCreateForm(false);
    console.log('   - Fetching updated institutions list...');
    fetchInstitutions();
  };

  const handleEditClick = (institutionId: number) => {
    setEditingInstitutionId(institutionId);
    setShowEditForm(true);
  };

  const handleDetailsClick = (institutionId: number) => {
    setViewingInstitutionId(institutionId);
    setShowDetailsForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingInstitutionId(null);
    fetchInstitutions();
  };

  const handleToggleStatus = async (institution: Institution) => {
    try {
      await api.put(`/institutions/${institution.id}`, {
        is_active: !institution.is_active
      });
      fetchInstitutions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Status dəyişdirilərkən xəta baş verdi');
    }
  };

  const handleDuplicateClick = async (institutionId: number) => {
    try {
      const response = await api.get(`/institutions/${institutionId}`);
      const institution = response.data.data;
      
      // Create a duplicate with modified name
      const duplicateData = {
        ...institution,
        name: `${institution.name} (Kopya)`,
        institution_code: `${institution.institution_code}_copy`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      await api.post('/institutions', duplicateData);
      fetchInstitutions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Təşkilat kopyalanarkən xəta baş verdi');
    }
  };

  const handleHistoryClick = (institutionId: number) => {
    setHistoryInstitutionId(institutionId);
    setShowHistoryModal(true);
  };

  const handleDeleteClick = (institutionId: number) => {
    setDeletingInstitutionId(institutionId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInstitutionId) return;

    try {
      await api.delete(`/institutions/${deletingInstitutionId}`);
      setShowDeleteModal(false);
      setDeletingInstitutionId(null);
      fetchInstitutions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Təşkilat silinərkən xəta baş verdi');
    }
  };

  const handleSelectInstitution = (institutionId: number) => {
    setSelectedInstitutions(prev => 
      prev.includes(institutionId) 
        ? prev.filter(id => id !== institutionId)
        : [...prev, institutionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstitutions.length === institutions.length) {
      setSelectedInstitutions([]);
    } else {
      setSelectedInstitutions(institutions.map(inst => inst.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedInstitutions.length === 0) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await api.post('/institutions/bulk/activate', {
            institution_ids: selectedInstitutions
          });
          break;
        case 'deactivate':
          response = await api.post('/institutions/bulk/deactivate', {
            institution_ids: selectedInstitutions
          });
          break;
        case 'delete':
          response = await api.post('/institutions/bulk/delete', {
            institution_ids: selectedInstitutions
          });
          break;
        case 'export':
          response = await api.post('/institutions/bulk/export', {
            institution_ids: selectedInstitutions,
            format: 'json'
          });
          // Handle download
          const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
            type: 'application/json'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `institutions_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
          break;
        default:
          return;
      }

      if (response && response.data.success) {
        setSelectedInstitutions([]);
        setShowBulkActions(false);
        fetchInstitutions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kütləvi əməliyyat xətası baş verdi');
    }
  };

  const getTypeDisplayName = (type: string) => {
    const typeObj = institutionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getLevelDisplayName = (level: number) => {
    const levelObj = levelOptions.find(l => l.value === level);
    return levelObj ? levelObj.label : `Səviyyə ${level}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  if (loading) {
    return (
      <div className="institutions-list">
        <div className="page-header">
          <h1 className="page-title">Təşkilat İdarəetməsi</h1>
          <p className="page-description">Təhsil təşkilatlarının idarə edilməsi və strukturu</p>
        </div>
        
        <div className="institutions-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <InstitutionCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="institutions-list">
      <div className="page-header">
        <h1 className="page-title">Təşkilat İdarəetməsi</h1>
        <p className="page-description">Təhsil təşkilatlarının idarə edilməsi və strukturu</p>
      </div>

      {error && (
        <ErrorDisplay 
          message={error}
          type={error.includes('Network') ? 'network' : error.includes('permission') ? 'permission' : 'error'}
          onRetry={() => {
            setError('');
            fetchInstitutions();
          }}
          onDismiss={() => setError('')}
        />
      )}

      <div className="institutions-controls">
        {selectedInstitutions.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-selection-info">
              <input
                type="checkbox"
                checked={selectedInstitutions.length === institutions.length}
                onChange={handleSelectAll}
                className="bulk-select-all"
              />
              <span>{selectedInstitutions.length} təşkilat seçildi</span>
            </div>
            <div className="bulk-actions">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bulk-action-btn activate"
              >
                <Icon type="ACTIVE" /> Aktivləşdir
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bulk-action-btn deactivate"
              >
                <Icon type="INACTIVE" /> Deaktivləşdir
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="bulk-action-btn export"
              >
                <Icon type="DOWNLOAD" /> Eksport
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bulk-action-btn delete"
              >
                <Icon type="DELETE" /> Sil
              </button>
              <button
                onClick={() => {
                  setSelectedInstitutions([]);
                  setShowBulkActions(false);
                }}
                className="bulk-action-btn cancel"
              >
                <Icon type="CLOSE" /> Ləğv et
              </button>
            </div>
          </div>
        )}

        <div className="institutions-filters">
          <div className="search-form">
            <input
              type="text"
              placeholder="Təşkilat adı ilə axtarın..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Bütün tiplər</option>
            {institutionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Bütün səviyyələr</option>
            {levelOptions.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="view-controls">
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <Icon type="LIST" className="nav-icon" /> Siyahı
            </button>
            <button
              className={`view-button ${viewMode === 'hierarchy' ? 'active' : ''}`}
              onClick={() => setViewMode('hierarchy')}
            >
              <Icon type="HIERARCHY" className="nav-icon" /> Ierarxiya
            </button>
          </div>

          <div className="control-buttons">
            {canManageInstitutions() && (
              <>
                <button 
                  className="control-button btn-with-icon"
                  onClick={() => {
                    // Navigate to trashed institutions
                    window.location.href = '/institutions/trashed';
                  }}
                  title="Silinmiş təşkilatları göstər"
                >
                  <Icon type="TRASH" /> Silinmiş
                </button>
                <button 
                  className="control-button btn-with-icon"
                  onClick={() => {
                    // Navigate to audit logs
                    window.location.href = '/institutions/audit-logs';
                  }}
                  title="Dəyişiklik tarixçəsini göstər"
                >
                  <Icon type="HISTORY" /> Tarixçə
                </button>
                <button 
                  className="add-institution-button btn-with-icon"
                  onClick={() => {
                    console.log('🔵 "Yeni Təşkilat" button clicked!');
                    console.log('   - User can manage institutions:', canManageInstitutions());
                    console.log('   - Current showCreateForm state:', showCreateForm);
                    console.log('   - Setting showCreateForm to true...');
                    setShowCreateForm(true);
                  }}
                >
                  <Icon type="ADD" /> Yeni Təşkilat
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        <InstitutionHierarchyView 
          onEditClick={handleEditClick}
          canManage={canManageInstitutions()}
        />
      ) : (
        <>
          <div className="institutions-grid">
            {Array.isArray(institutions) && institutions.map((institution) => (
              <div key={institution.id} className={`institution-card type-${institution.type} ${selectedInstitutions.includes(institution.id) ? 'selected' : ''}`}>
                <div className="institution-card-header">
                  <div className="institution-selection">
                    {canManageInstitutions() && (
                      <input
                        type="checkbox"
                        checked={selectedInstitutions.includes(institution.id)}
                        onChange={() => handleSelectInstitution(institution.id)}
                        className="institution-select-checkbox"
                      />
                    )}
                  </div>
                  <div className="institution-title-section">
                    <h3 className="institution-title">{institution.name}</h3>
                    {institution.short_name && (
                      <span className="institution-short-name">({institution.short_name})</span>
                    )}
                    <div className="institution-badges">
                      <span className={`type-badge type-${institution.type}`}>
                        {getTypeDisplayName(institution.type)}
                      </span>
                      <span className={`level-badge level-${institution.level}`}>
                        {getLevelDisplayName(institution.level)}
                      </span>
                      <span className={`status-badge ${institution.is_active ? 'active' : 'inactive'}`}>
                        <StatusIcon status={institution.is_active ? 'active' : 'inactive'} />
                        {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </div>
                  </div>
                  <div className="institution-actions">
                    <ActionIcon
                      type="VIEW"
                      onClick={() => handleDetailsClick(institution.id)}
                      className="details"
                      title="Detallar və Şöbələr"
                    />
                    {canManageInstitutions() && (
                      <>
                        <ActionIcon
                          type="EDIT"
                          onClick={() => handleEditClick(institution.id)}
                          className="edit"
                          title="Redaktə et"
                        />
                        <ActionIcon
                          type="DUPLICATE"
                          onClick={() => handleDuplicateClick(institution.id)}
                          className="duplicate"
                          title="Kopyala"
                        />
                        <ActionIcon
                          type="HISTORY"
                          onClick={() => handleHistoryClick(institution.id)}
                          className="history"
                          title="Dəyişiklik Tarixçəsi"
                        />
                        <ActionIcon
                          type={institution.is_active ? 'INACTIVE' : 'ACTIVE'}
                          onClick={() => handleToggleStatus(institution)}
                          className={institution.is_active ? 'deactivate' : 'activate'}
                          title={institution.is_active ? 'Deaktiv et' : 'Aktiv et'}
                        />
                        <ActionIcon
                          type="DELETE"
                          onClick={() => handleDeleteClick(institution.id)}
                          className="delete"
                          title="Sil"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="institution-card-content">
                  <div className="institution-hierarchy">
                    <span className="hierarchy-label">Ierarxiya:</span>
                    <span className="hierarchy-path">{institution.hierarchy_path}</span>
                  </div>

                  {institution.institution_code && (
                    <div className="institution-code">
                      <span className="code-label">Kod:</span>
                      <span className="code-value">{institution.institution_code}</span>
                    </div>
                  )}

                  {institution.region_code && (
                    <div className="region-info">
                      <span className="region-label">Region:</span>
                      <span className="region-value">{institution.region_code}</span>
                    </div>
                  )}

                  <div className="institution-stats">
                    <div className="stat-item">
                      <span className="stat-label">Alt təşkilatlar:</span>
                      <span className="stat-value">{institution.children_count}</span>
                    </div>
                  </div>

                  <div className="institution-meta">
                    <div className="meta-item">
                      <span className="meta-label">Təsis tarixi:</span>
                      <span className="meta-value">
                        {institution.established_date ? formatDate(institution.established_date) : 'Məlum deyil'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Əlavə olundu:</span>
                      <span className="meta-value">
                        {formatDate(institution.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!institutions || institutions.length === 0) && !loading && (
            <NoResultsEmptyState
              searchQuery={searchTerm || typeFilter || levelFilter ? 'filtrlənmiş nəticə' : undefined}
              onClearSearch={() => {
                setSearchTerm('');
                setTypeFilter('');
                setLevelFilter('');
                setCurrentPage(1);
              }}
              className="institutions-empty-state"
            />
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button btn-with-icon"
              >
                <Icon type="PREVIOUS" /> Əvvəlki
              </button>
              
              <span className="pagination-info">
                Səhifə {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button btn-with-icon"
              >
                Növbəti <Icon type="NEXT" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Institution Create Modal */}
      {showCreateForm && (
        React.createElement(() => {
          console.log('🎨 Rendering InstitutionCreateForm modal');
          console.log('   - showCreateForm:', showCreateForm);
          return (
            <InstitutionCreateForm 
              onClose={() => {
                console.log('🚪 Closing institution create form');
                setShowCreateForm(false);
              }}
              onSuccess={() => {
                console.log('✅ Institution creation success callback triggered');
                handleCreateSuccess();
              }}
            />
          );
        })
      )}

      {/* Institution Edit Modal */}
      {showEditForm && editingInstitutionId && (
        <InstitutionEditForm 
          institutionId={editingInstitutionId}
          onClose={() => {
            setShowEditForm(false);
            setEditingInstitutionId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Institution Details Modal */}
      {showDetailsForm && viewingInstitutionId && (
        <InstitutionDetails 
          institutionId={viewingInstitutionId}
          onClose={() => {
            setShowDetailsForm(false);
            setViewingInstitutionId(null);
          }}
        />
      )}

      {/* Institution History Modal */}
      {showHistoryModal && historyInstitutionId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Dəyişiklik Tarixçəsi</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryInstitutionId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Audit log komponenti burada olacaq...</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingInstitutionId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Təşkilatı Sil</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingInstitutionId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Bu təşkilatı silmək istədiyinizə əminsiniz?</p>
              <p className="warning-text">
                Bu əməliyyat geri qaytarıla bilər (soft delete).
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingInstitutionId(null);
                }}
              >
                İmtina
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionsList;