import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import InstitutionCreateForm from '../../institutions/InstitutionCreateForm';
import InstitutionEditForm from '../../institutions/InstitutionEditForm';
import DepartmentManagement from './components/DepartmentManagement';
import { LoadingSpinner } from '../../ui/Loading';
import { EmptyState } from '../../common/EmptyState';
import DeleteConfirmationModal from '../../ui/DeleteConfirmationModal';

// Types
interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  parent_id: number;
  region_code: string;
  institution_code: string;
  is_active: boolean;
  parent?: Institution;
  children: Institution[];
}

interface InstitutionStats {
  institutions: Institution[];
}

const RegionAdminInstitutionsList: React.FC = () => {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'level'>('name');

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const baseURL = import.meta.env.MODE === 'production' ? '/api' : 'http://127.0.0.1:8000/api';
      const response = await fetch(`${baseURL}/regionadmin/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Təşkilatlar yüklənə bilmədi');
      }

      const data: InstitutionStats = await response.json();
      setInstitutions(data.institutions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchInstitutions();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedInstitution(null);
    fetchInstitutions();
  };

  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setShowEditForm(true);
  };

  const handleViewDepartments = (institution: Institution) => {
    setSelectedInstitution(institution);
    setShowDepartments(true);
  };

  const [deletingInstitution, setDeletingInstitution] = useState<Institution | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = (institution: Institution) => {
    setDeletingInstitution(institution);
  };

  const confirmInstitutionDelete = async (deleteType: 'soft' | 'hard') => {
    if (!deletingInstitution) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth_token');
      const baseURL = import.meta.env.MODE === 'production' ? '/api' : 'http://127.0.0.1:8000/api';
      
      if (deleteType === 'soft') {
        // Soft delete - deactivate institution
        const response = await fetch(`${baseURL}/regionadmin/institutions/${deletingInstitution.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_active: false,
            deleted_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Təşkilat deaktiv edilərkən xəta baş verdi');
        }
      } else {
        // Hard delete - permanently delete
        const response = await fetch(`${baseURL}/regionadmin/institutions/${deletingInstitution.id}?type=hard`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Təşkilat silinərkən xəta baş verdi');
        }
      }

      setDeletingInstitution(null);
      fetchInstitutions();
    } catch (err: any) {
      setError(err.message || 'Xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInstitutionTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      'sektor': 'Sektor',
      'sector_education_office': 'Sektor',
      'school': 'Məktəb',
      'secondary_school': 'Orta Məktəb',
      'primary_school': 'İbtidai Məktəb',
      'gymnasium': 'Gimnaziya',
      'vocational': 'Peşə Məktəbi'
    };
    return types[type] || type;
  };

  const getInstitutionIcon = (type: string): string => {
    if (type.includes('sector') || type === 'sektor') return '🏛️';
    if (type.includes('gymnasium')) return '🎓';
    if (type.includes('vocational')) return '⚒️';
    return '🏫';
  };

  const getInstitutionCardClass = (type: string): string => {
    const baseClass = 'institution-card institution-card-modern';
    if (type.includes('sector') || type === 'sektor') return `${baseClass} institution-card-sektor`;
    if (type.includes('gymnasium')) return `${baseClass} institution-card-gymnasium`;
    if (type.includes('vocational')) return `${baseClass} institution-card-vocational`;
    return `${baseClass} institution-card-school`;
  };

  // Enhanced filtering and sorting logic
  const filteredAndSortedInstitutions = useMemo(() => {
    let filtered = institutions.filter(institution => {
      const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          institution.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          institution.institution_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || institution.type === filterType;
      
      return matchesSearch && matchesFilter;
    });

    // Sort institutions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'level':
          return a.level - b.level;
        default:
          return 0;
      }
    });

    return filtered;
  }, [institutions, searchTerm, filterType, sortBy]);

  const institutionTypes = useMemo(() => {
    const types = Array.from(new Set(institutions.map(inst => inst.type)));
    return types.map(type => ({
      value: type,
      label: getInstitutionTypeDisplay(type)
    }));
  }, [institutions]);

  if (loading) {
    return (
      <div className="institutions-container">
        <LoadingSpinner size="lg" text="Təşkilatlar yüklənir..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="institutions-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={fetchInstitutions} className="retry-btn">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="institutions-container">
      <div className="institutions-header">
        <div className="header-content">
          <h2>Təşkilat İdarəetməsi</h2>
          <p>Regionunuza aid sektorlar və məktəblər</p>
          <div className="header-stats">
            <span className="stat-item">
              📊 Ümumi: {institutions.length}
            </span>
            <span className="stat-item">
              🎯 Filtrlənmiş: {filteredAndSortedInstitutions.length}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-btn bounce-on-click"
        >
          ➕ Yeni Təşkilat
        </button>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Təşkilat adı, qısa ad və ya kod..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
                title="Axtarışı təmizlə"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Tip:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Hamısı</option>
              {institutionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sıralama:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'level')}
              className="filter-select"
            >
              <option value="name">Ad</option>
              <option value="type">Tip</option>
              <option value="level">Səviyyə</option>
            </select>
          </div>
        </div>
      </div>

      {institutions.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="Təşkilat tapılmadı"
          description="Hələ heç bir təşkilat yaradılmayıb"
          actionLabel="Yeni Təşkilat Yarat"
          onAction={() => setShowCreateForm(true)}
        />
      ) : filteredAndSortedInstitutions.length === 0 ? (
        <div className="no-results-state">
          <div className="no-results-icon">🔍</div>
          <h3>Heç bir nəticə tapılmadı</h3>
          <p>Axtarış və ya filtr kriteriyalarını dəyişdirin</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="reset-filters-btn"
          >
            Filtrlərı sıfırla
          </button>
        </div>
      ) : (
        <div className="institutions-grid modern-grid">
          {filteredAndSortedInstitutions.map((institution) => (
            <div key={institution.id} className={getInstitutionCardClass(institution.type)}>
              <div className="card-header">
                <div className="institution-info">
                  <span className="institution-icon scale-on-hover">
                    {getInstitutionIcon(institution.type)}
                  </span>
                  <div>
                    <h3>{institution.name}</h3>
                    <p className="institution-type">
                      {getInstitutionTypeDisplay(institution.type)}
                    </p>
                  </div>
                </div>
                <div className="institution-status">
                  <span className={`status-badge ${institution.is_active ? 'active' : 'inactive'}`}>
                    {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <div className="institution-details">
                  <div className="detail-item">
                    <span className="label">Qısa ad:</span>
                    <span className="value">{institution.short_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Kod:</span>
                    <span className="value">{institution.institution_code || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Səviyyə:</span>
                    <span className="value">{institution.level}</span>
                  </div>
                  {institution.parent && (
                    <div className="detail-item">
                      <span className="label">Valideyn:</span>
                      <span className="value">{institution.parent.name}</span>
                    </div>
                  )}
                  {institution.children.length > 0 && (
                    <div className="detail-item">
                      <span className="label">Alt təşkilatlar:</span>
                      <span className="value">{institution.children.length}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => handleViewDepartments(institution)}
                  className="action-btn departments-btn bounce-on-click"
                  title="Şöbələri İdarə Et"
                >
                  🏢 Şöbələr
                </button>
                <button 
                  onClick={() => handleEdit(institution)}
                  className="action-btn edit-btn bounce-on-click"
                  title="Redaktə Et"
                >
                  ✏️ Redaktə
                </button>
                <button 
                  onClick={() => handleDelete(institution)}
                  className="action-btn delete-btn bounce-on-click"
                  title="Sil"
                  disabled={institution.children.length > 0}
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Institution Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <InstitutionCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Institution Modal */}
      {showEditForm && selectedInstitution && (
        <div className="modal-overlay">
          <div className="modal-content">
            <InstitutionEditForm
              institution={selectedInstitution}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedInstitution(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Department Management Modal */}
      {showDepartments && selectedInstitution && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <DepartmentManagement
              institution={selectedInstitution}
              onClose={() => {
                setShowDepartments(false);
                setSelectedInstitution(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Institution Modal */}
      {deletingInstitution && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingInstitution(null)}
          onConfirm={confirmInstitutionDelete}
          item={{
            id: deletingInstitution.id,
            name: deletingInstitution.name,
            type: getInstitutionTypeDisplay(deletingInstitution.type),
            additional_info: {
              children_count: deletingInstitution.children.length,
              parent: deletingInstitution.parent?.name
            }
          }}
          itemType="institution"
          title="Təşkilatı Sil"
          loading={deleteLoading}
          canHardDelete={deletingInstitution.children.length === 0}
          showBothOptions={true}
        />
      )}
    </div>
  );
};

export default RegionAdminInstitutionsList;