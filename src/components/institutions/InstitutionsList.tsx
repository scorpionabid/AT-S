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
  const [editingInstitutionId, setEditingInstitutionId] = useState<number | null>(null);
  const [viewingInstitutionId, setViewingInstitutionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      const data: InstitutionsResponse = response.data;
      
      console.log('   - API response received:', data);
      console.log('   - Institutions count:', data.institutions?.length || 0);
      
      setInstitutions(data.institutions);
      setTotalPages(data.meta.last_page);
      
      console.log('   - State updated successfully');
    } catch (err: any) {
      console.error('❌ fetchInstitutions error:', err);
      console.error('   - Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Institution məlumatları yüklənərkən xəta baş verdi';
      console.error('   - Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('   - Setting loading to false...');
      setLoading(false);
    }
  };

  const canManageInstitutions = () => {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
    const canManage = roleName === 'superadmin';
    
    console.log('🔑 Checking institution management permissions:');
    console.log('   - User object:', user);
    console.log('   - User role (raw):', user?.role);
    console.log('   - Extracted role name:', roleName);
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

          {canManageInstitutions() && (
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
          )}
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
            {institutions.map((institution) => (
              <div key={institution.id} className={`institution-card type-${institution.type}`}>
                <div className="institution-card-header">
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
                          type={institution.is_active ? 'INACTIVE' : 'ACTIVE'}
                          onClick={() => handleToggleStatus(institution)}
                          className={institution.is_active ? 'deactivate' : 'activate'}
                          title={institution.is_active ? 'Deaktiv et' : 'Aktiv et'}
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

          {institutions.length === 0 && !loading && (
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
    </div>
  );
};

export default InstitutionsList;