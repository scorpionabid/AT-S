import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedData, useRegionalData } from '../../hooks/useRoleBasedData';
import InstitutionCreateForm from './InstitutionCreateForm';
import InstitutionEditForm from './InstitutionEditForm';
import InstitutionHierarchyView from './InstitutionHierarchyView';
import InstitutionDetails from './InstitutionDetails';
import InstitutionDepartments from './InstitutionDepartments';
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState<number | null>(null);
  const [viewingInstitutionId, setViewingInstitutionId] = useState<number | null>(null);
  const [historyInstitutionId, setHistoryInstitutionId] = useState<number | null>(null);
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<number | null>(null);
  const [departmentsInstitutionId, setDepartmentsInstitutionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInstitutions, setSelectedInstitutions] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // 🚀 NEW: Role-based institutions data fetching
  const {
    data: institutionsResponse,
    loading,
    error,
    refetch: refetchInstitutions
  } = useRoleBasedData<InstitutionsResponse>({
    endpoint: '/institutions',
    filters: {
      page: currentPage,
      per_page: 12,
      ...(searchTerm && { search: searchTerm }),
      ...(typeFilter && { type: typeFilter }),
      ...(levelFilter && { level: levelFilter })
    },
    dependencies: [currentPage, searchTerm, typeFilter, levelFilter]
  });

  // Extract institutions and pagination from response
  const institutions = institutionsResponse?.institutions || [];
  const totalPages = institutionsResponse?.meta?.last_page || 1;

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

  // Manual fetch removed - handled by useRoleBasedData hook automatically

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
    setShowCreateForm(false);
    // 🚀 NEW: Use refetch instead of manual fetchInstitutions
    refetchInstitutions();
  };

  const handleEditClick = (institutionId: number) => {
    setEditingInstitutionId(institutionId);
    setShowEditForm(true);
  };

  const handleDetailsClick = (institutionId: number) => {
    setViewingInstitutionId(institutionId);
    setShowDetailsForm(true);
  };

  const handleDepartmentsClick = (institutionId: number) => {
    setDepartmentsInstitutionId(institutionId);
    setShowDepartmentsModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingInstitutionId(null);
    // 🚀 NEW: Use refetch instead of manual fetchInstitutions
    refetchInstitutions();
  };

  const handleToggleStatus = async (institution: Institution) => {
    try {
      await api.put(`/institutions/${institution.id}`, {
        is_active: !institution.is_active
      });
      refetchInstitutions();
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
      refetchInstitutions();
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
      refetchInstitutions();
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
          <div className="header-content">
            <h1 className="page-title">
              <Icon type="INSTITUTION" />
              Təşkilat İdarəetməsi
            </h1>
            <p className="page-description">Təhsil təşkilatlarının idarə edilməsi və strukturu</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Icon type="INSTITUTION" />
              </div>
              <span className="stat-number">---</span>
              <span className="stat-label">Ümumi</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Icon type="ACTIVE" />
              </div>
              <span className="stat-number">---</span>
              <span className="stat-label">Aktiv</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Icon type="INACTIVE" />
              </div>
              <span className="stat-number">---</span>
              <span className="stat-label">Deaktiv</span>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Icon type="HIERARCHY" />
              </div>
              <span className="stat-number">---</span>
              <span className="stat-label">Tip</span>
            </div>
          </div>
        </div>
        
        <div className="institutions-table">
          <table>
            <tbody>
              {Array.from({ length: 6 }, (_, index) => (
                <tr key={index}>
                  <td colSpan={9}>
                    <InstitutionCardSkeleton />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="institutions-list">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <Icon type="INSTITUTION" />
            Təşkilat İdarəetməsi
          </h1>
          <p className="page-description">Təhsil təşkilatlarının idarə edilməsi və strukturu</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="INSTITUTION" />
            </div>
            <span className="stat-number">{institutions.length}</span>
            <span className="stat-label">Ümumi</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="ACTIVE" />
            </div>
            <span className="stat-number">{institutions.filter(inst => inst.is_active).length}</span>
            <span className="stat-label">Aktiv</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="INACTIVE" />
            </div>
            <span className="stat-number">{institutions.filter(inst => !inst.is_active).length}</span>
            <span className="stat-label">Deaktiv</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Icon type="HIERARCHY" />
            </div>
            <span className="stat-number">{institutionTypes.length}</span>
            <span className="stat-label">Tip</span>
          </div>
        </div>
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
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <Icon type="TABLE" className="nav-icon" /> Cədvəl
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
          onRefresh={() => {
            // Refresh both views when institutions are updated
            fetchInstitutions();
          }}
        />
      ) : (
        <>
          <div className="institutions-table">
            <table>
              <thead>
                <tr>
                  {canManageInstitutions() && (
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedInstitutions.length === institutions.length}
                        onChange={handleSelectAll}
                        className="bulk-select-all"
                      />
                    </th>
                  )}
                  <th>Təşkilat</th>
                  <th>Tip</th>
                  <th>Səviyyə</th>
                  <th>Status</th>
                  <th>Alt təşkilat</th>
                  <th>Region</th>
                  <th>Kod</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(institutions) && institutions.map((institution) => (
                  <tr 
                    key={institution.id} 
                    className={selectedInstitutions.includes(institution.id) ? 'selected' : ''}
                  >
                    {canManageInstitutions() && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedInstitutions.includes(institution.id)}
                          onChange={() => handleSelectInstitution(institution.id)}
                          className="institution-select-checkbox"
                        />
                      </td>
                    )}
                    <td>
                      <div className="institution-name-cell">
                        {institution.name}
                        {institution.short_name && (
                          <span className="institution-short-cell">({institution.short_name})</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`table-badge type-${institution.type}`}>
                        {getTypeDisplayName(institution.type)}
                      </span>
                    </td>
                    <td>{getLevelDisplayName(institution.level)}</td>
                    <td>
                      <span className={`table-badge status-${institution.is_active ? 'active' : 'inactive'}`}>
                        {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td>{institution.children_count}</td>
                    <td>{institution.region_code || '-'}</td>
                    <td>
                      {institution.institution_code && (
                        <span style={{fontFamily: 'Monaco, monospace', fontSize: '0.8rem'}}>
                          {institution.institution_code}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-action-btn details"
                          onClick={() => handleDetailsClick(institution.id)}
                          title="Detallar"
                        >
                          <Icon type="VIEW" />
                        </button>
                        {canManageInstitutions() && (
                          <>
                            <button
                              className="table-action-btn departments"
                              onClick={() => handleDepartmentsClick(institution.id)}
                              title="Şöbələr"
                            >
                              <Icon type="USERS" />
                            </button>
                            <button
                              className="table-action-btn edit"
                              onClick={() => handleEditClick(institution.id)}
                              title="Redaktə et"
                            >
                              <Icon type="EDIT" />
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={() => handleDeleteClick(institution.id)}
                              title="Sil"
                            >
                              <Icon type="DELETE" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {(!institutions || institutions.length === 0) && !loading && (
              <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>
                <Icon type="INSTITUTION" style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.5}} />
                <p style={{margin: 0, fontSize: '1.1rem'}}>Heç bir təşkilat tapılmadı</p>
                {(searchTerm || typeFilter || levelFilter) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('');
                      setLevelFilter('');
                      setCurrentPage(1);
                    }}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Filtrləri təmizlə
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination for table view */}
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

      {/* Institution Departments Modal */}
      {showDepartmentsModal && departmentsInstitutionId && (
        <InstitutionDepartments 
          institutionId={departmentsInstitutionId}
          onClose={() => {
            setShowDepartmentsModal(false);
            setDepartmentsInstitutionId(null);
          }}
        />
      )}
    </div>
  );
};

export default InstitutionsList;