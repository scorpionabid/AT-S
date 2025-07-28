import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useRoleBasedData, useRegionalData } from '../hooks/useRoleBasedData';
import { Icon } from '../components/common/IconSystem';
import { 
  FiDollarSign, 
  FiSettings, 
  FiTrendingUp,
  FiUsers,
  FiBarChart,
  FiFileText,
  FiClock,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch
} from 'react-icons/fi';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  is_active: boolean;
}

interface Department {
  id: number;
  name: string;
  short_name?: string;
  type: string;
  is_active: boolean;
  users_count: number;
  active_users_count: number;
  description?: string;
  institution_id: number;
  institution?: Institution;
  created_at: string;
  updated_at: string;
}

const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionSearchTerm, setInstitutionSearchTerm] = useState('');
  const [localError, setLocalError] = useState<string>('');

  // 🚀 NEW: Role-based institutions data fetching
  const {
    data: institutionsData,
    loading: institutionsLoading,
    error: institutionsError
  } = useRegionalData<Institution[]>('institutions');

  // Safely extract institutions array from API response
  const institutions = React.useMemo(() => {
    if (!institutionsData) return [];
    
    // Handle different API response formats
    if (Array.isArray(institutionsData)) {
      return institutionsData;
    }
    
    if (institutionsData && typeof institutionsData === 'object') {
      // Check for wrapped response
      if ('data' in institutionsData && Array.isArray(institutionsData.data)) {
        return institutionsData.data;
      }
      if ('institutions' in institutionsData && Array.isArray(institutionsData.institutions)) {
        return institutionsData.institutions;
      }
    }
    
    console.warn('Unexpected institutions data format:', institutionsData);
    return [];
  }, [institutionsData]);

  // 🚀 NEW: Role-based departments data fetching for selected institution
  const {
    data: departmentsData,
    loading,
    error,
    refetch: refetchDepartments
  } = useRoleBasedData<Department[]>({
    endpoint: selectedInstitutionId ? `/institutions/${selectedInstitutionId}/departments` : '',
    filters: {
      ...(searchTerm && { search: searchTerm })
    },
    autoFetch: !!selectedInstitutionId,
    dependencies: [selectedInstitutionId, searchTerm]
  });

  const departments = departmentsData || [];
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    type: 'general',
    description: '',
    is_active: true
  });

  const departmentTypes = [
    { value: 'general', label: 'Ümumi' },
    { value: 'maliyye', label: 'Maliyyə' },
    { value: 'inzibati', label: 'İnzibati' },
    { value: 'texniki', label: 'Texniki' },
    { value: 'telim', label: 'Təlim' },
    { value: 'kadr', label: 'Kadr' },
    { value: 'tehlukesizlik', label: 'Təhlükəsizlik' },
    { value: 'hüquqi', label: 'Hüquqi' },
    { value: 'informatika', label: 'İnformatika' }
  ];

  // Manual fetch removed - handled by useRoleBasedData and useRegionalData hooks automatically

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitutionId) return;
    
    try {
      await api.post(`/institutions/${selectedInstitutionId}/departments`, formData);
      setShowCreateForm(false);
      resetForm();
      refetchDepartments();
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Şöbə yaradılarkən xəta baş verdi');
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment || !selectedInstitutionId) return;
    
    try {
      await api.put(`/institutions/${selectedInstitutionId}/departments/${editingDepartment.id}`, formData);
      setShowEditForm(false);
      setEditingDepartment(null);
      resetForm();
      refetchDepartments();
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Şöbə yenilənərkən xəta baş verdi');
    }
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    if (!selectedInstitutionId || !window.confirm('Bu şöbəni silmək istədiyinizə əminsiniz?')) return;
    
    try {
      await api.delete(`/institutions/${selectedInstitutionId}/departments/${departmentId}`);
      refetchDepartments();
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Şöbə silinərkən xəta baş verdi');
    }
  };

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      short_name: department.short_name || '',
      type: department.type,
      description: department.description || '',
      is_active: department.is_active
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      short_name: '',
      type: 'general',
      description: '',
      is_active: true
    });
  };

  const getDepartmentTypeLabel = (type: string) => {
    const typeObj = departmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const getSelectedInstitutionName = () => {
    const institution = (institutions || []).find(inst => inst.id === selectedInstitutionId);
    return institution ? institution.name : 'Müəssisə seçin';
  };

  const filteredInstitutions = (institutions || []).filter(inst => {
    if (!institutionSearchTerm) return true;
    return inst.name.toLowerCase().includes(institutionSearchTerm.toLowerCase()) ||
           (inst.short_name && inst.short_name.toLowerCase().includes(institutionSearchTerm.toLowerCase()));
  });

  const filteredDepartments = (departments || []).filter(dept => {
    if (!searchTerm) return true;
    return dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (dept.short_name && dept.short_name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Group institutions by type for better organization
  const groupedInstitutions = filteredInstitutions.reduce((groups, institution) => {
    const type = institution.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(institution);
    return groups;
  }, {} as Record<string, Institution[]>);

  const institutionTypeLabels: Record<string, string> = {
    ministry: 'Nazirliklər',
    region: 'Regional İdarələr', 
    sektor: 'Sektorlar',
    school: 'Məktəblər',
    vocational: 'Peşə Məktəbləri',
    university: 'Universitetlər',
    other: 'Digər'
  };

  if (institutionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => {
            setLocalError('');
            window.location.reload();
          }}>Yenidən Yüklə</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="departments-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-left">
              <h1 className="page-header-title flex items-center gap-3">
                <Icon type="USERS" />
                Şöbələr
              </h1>
              <p className="page-header-subtitle">Müəssisə şöbələrinin idarəetməsi</p>
            </div>
            <div className="page-header-actions">
              <div className="flex gap-4">
                <div className="bg-white rounded-lg p-3 shadow-card border border-neutral-200 flex items-center gap-2">
                  <Icon type="INSTITUTION" className="text-primary-500" />
                  <div>
                    <span className="block text-lg font-semibold text-gray-900">{institutions.length}</span>
                    <span className="block text-sm text-gray-500">Müəssisə</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-card border border-neutral-200 flex items-center gap-2">
                  <Icon type="USERS" className="text-primary-500" />
                  <div>
                    <span className="block text-lg font-semibold text-gray-900">{departments.length}</span>
                    <span className="block text-sm text-gray-500">Şöbə</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-card border border-neutral-200 flex items-center gap-2">
                  <Icon type="ACTIVE" className="text-success-500" />
                  <div>
                    <span className="block text-lg font-semibold text-gray-900">{departments.filter(d => d.is_active).length}</span>
                    <span className="block text-sm text-gray-500">Aktiv</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(error || localError) && (
          <div className="error-message">
            {error || localError}
            <button onClick={() => setLocalError('')} className="dismiss-error">×</button>
          </div>
        )}

        {/* Controls */}
        <div className="departments-controls">
          <div className="institutions-selector">
            <label htmlFor="institution-select">
              <Icon type="INSTITUTION" /> Müəssisə seçin:
              {institutionsLoading && <span className="loading-text">Yüklənir...</span>}
            </label>
            
            {/* Institution Search */}
            <div className="institution-search">
              <input
                type="text"
                placeholder="Müəssisə axtarın..."
                value={institutionSearchTerm}
                onChange={(e) => setInstitutionSearchTerm(e.target.value)}
                className="search-input small"
              />
              <Icon type="SEARCH" className="search-icon" />
            </div>

            {/* Institution Selector with Groups */}
            <select
              id="institution-select"
              value={selectedInstitutionId || ''}
              onChange={(e) => setSelectedInstitutionId(e.target.value ? parseInt(e.target.value) : null)}
              className="institution-select"
              disabled={institutionsLoading}
            >
              <option value="">
                {institutionsLoading ? 'Yüklənir...' : `Müəssisə seçin... (${filteredInstitutions.length} müəssisə)`}
              </option>
              
              {Object.entries(groupedInstitutions).map(([type, institutions]) => (
                <optgroup key={type} label={institutionTypeLabels[type] || type}>
                  {(institutions || []).map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                      {institution.short_name && ` (${institution.short_name})`}
                      {!institution.is_active && ' [Deaktiv]'}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Institution Info */}
            {selectedInstitutionId && (
              <div className="selected-institution-info">
                <span className="institution-info">
                  <Icon type="INFO" />
                  {(() => {
                    const institution = (institutions || []).find(inst => inst.id === selectedInstitutionId);
                    if (institution) {
                      return `${institution.type} - Səviyyə ${institution.level}`;
                    }
                    return '';
                  })()}
                </span>
              </div>
            )}
          </div>

          {selectedInstitutionId && (
            <div className="department-controls">
              <div className="search-form">
                <input
                  type="text"
                  placeholder="Şöbə adı ilə axtarın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="add-department-button btn-with-icon"
              >
                <Icon type="ADD" /> Yeni Şöbə
              </button>
            </div>
          )}
        </div>

        {/* Department Table */}
        {selectedInstitutionId && (
          <div className="departments-table">
            <div className="table-header">
              <h2>{getSelectedInstitutionName()} - Şöbələr</h2>
            </div>

            {loading ? (
              <div className="departments-loading">
                <div className="loading-spinner">Yüklənir...</div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Şöbə Adı</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>İstifadəçilər</th>
                    <th>Yaradılma</th>
                    <th>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                        <Icon type="USERS" style={{fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5}} />
                        <p>Heç bir şöbə tapılmadı</p>
                        <small>Bu müəssisə üçün şöbə əlavə edə bilərsiniz</small>
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <tr key={dept.id}>
                        <td>
                          <strong>{dept.name}</strong>
                          {dept.short_name && (
                            <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                              ({dept.short_name})
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`table-badge type-${dept.type}`}>
                            {getDepartmentTypeLabel(dept.type)}
                          </span>
                        </td>
                        <td>
                          <span className={`table-badge status-${dept.is_active ? 'active' : 'inactive'}`}>
                            {dept.is_active ? 'Aktiv' : 'Deaktiv'}
                          </span>
                        </td>
                        <td>
                          <span>{dept.active_users_count}/{dept.users_count}</span>
                        </td>
                        <td>{formatDate(dept.created_at)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn edit"
                              onClick={() => handleEditClick(dept)}
                              title="Redaktə et"
                            >
                              <Icon type="EDIT" />
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={() => handleDeleteDepartment(dept.id)}
                              title="Sil"
                            >
                              <Icon type="DELETE" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!selectedInstitutionId && (
          <div className="no-selection-message">
            <Icon type="USERS" style={{fontSize: '3rem', opacity: 0.3, marginBottom: '1rem'}} />
            <h3>Müəssisə seçin</h3>
            <p>Şöbələri görmək üçün yuxarıdan bir müəssisə seçin</p>
          </div>
        )}

        {/* Create Department Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  <Icon type="ADD" /> Yeni Şöbə Yarat
                </h2>
                <button className="modal-close" onClick={() => setShowCreateForm(false)}>×</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateDepartment}>
                  <div className="form-group">
                    <label htmlFor="dept-name">Şöbə Adı *</label>
                    <input
                      type="text"
                      id="dept-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                      placeholder="Məsələn: Maliyyə Şöbəsi"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dept-short-name">Qısa Ad</label>
                    <input
                      type="text"
                      id="dept-short-name"
                      value={formData.short_name}
                      onChange={(e) => setFormData(prev => ({...prev, short_name: e.target.value}))}
                      placeholder="Məsələn: Maliyyə"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dept-type">Şöbə Tipi *</label>
                    <select
                      id="dept-type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                      required
                    >
                      {departmentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dept-description">Açıqlama</label>
                    <textarea
                      id="dept-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Şöbə haqqında ətraflı məlumat..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                      />
                      Aktiv
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Yarat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="btn btn-secondary"
                    >
                      Ləğv et
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditForm && editingDepartment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  <Icon type="EDIT" /> Şöbəni Redaktə Et
                </h2>
                <button className="modal-close" onClick={() => {
                  setShowEditForm(false);
                  setEditingDepartment(null);
                }}>×</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleEditDepartment}>
                  <div className="form-group">
                    <label htmlFor="edit-dept-name">Şöbə Adı *</label>
                    <input
                      type="text"
                      id="edit-dept-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                      placeholder="Məsələn: Maliyyə Şöbəsi"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-dept-short-name">Qısa Ad</label>
                    <input
                      type="text"
                      id="edit-dept-short-name"
                      value={formData.short_name}
                      onChange={(e) => setFormData(prev => ({...prev, short_name: e.target.value}))}
                      placeholder="Məsələn: Maliyyə"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-dept-type">Şöbə Tipi *</label>
                    <select
                      id="edit-dept-type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
                      required
                    >
                      {departmentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-dept-description">Açıqlama</label>
                    <textarea
                      id="edit-dept-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Şöbə haqqında ətraflı məlumat..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                      />
                      Aktiv
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Yenilə
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingDepartment(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Ləğv et
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DepartmentsPage;