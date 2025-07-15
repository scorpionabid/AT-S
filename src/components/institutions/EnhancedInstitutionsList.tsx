import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiPause, FiPlay, FiAlertCircle, FiMapPin, FiLayers, FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useInstitution } from '../../contexts/InstitutionContext';
import type { Institution } from '../../services/institutionService';

// Institution type options
const institutionTypes: Array<{value: string, label: string}> = [
  { value: '', label: 'Bütün tiplər' },
  { value: 'ministry', label: 'Nazirlik' },
  { value: 'region', label: 'Regional İdarə' },
  { value: 'sektor', label: 'Sektor' },
  { value: 'school', label: 'Məktəb' },
  { value: 'vocational', label: 'Peşə Məktəbi' },
  { value: 'university', label: 'Universitet' }
];

const levelOptions: Array<{value: string, label: string}> = [
  { value: '', label: 'Bütün səviyyələr' },
  { value: '1', label: 'Səviyyə 1 - Nazirlik' },
  { value: '2', label: 'Səviyyə 2 - Regional' },
  { value: '3', label: 'Səviyyə 3 - Sektor' },
  { value: '4', label: 'Səviyyə 4 - Məktəb' },
  { value: '5', label: 'Səviyyə 5 - Şöbə' }
];
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { Dialog } from '../common/Dialog';
import '../../styles/institutions.css';

// TODO: Uncomment and implement these when needed
// import { format } from 'date-fns';
// import { enUS, az } from 'date-fns/locale';
// import { useDebounce } from '../../hooks/useDebounce';
// import { Input } from '../common/Input';
// import { Select } from '../common/Select';
// import { Tabs } from '../common/Tabs';
// Import actual LoadingSkeleton when available
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);
// import { Tooltip } from '../common/Tooltip';
// InstitutionForm component with form handling and validation
const InstitutionForm: React.FC<{
  initialValues?: Partial<Institution>;
  onSubmit: (values: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}> = ({ initialValues, onSubmit, onCancel, loading = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<Institution, 'id' | 'created_at' | 'updated_at'>>(() => ({
    name: '',
    short_name: '',
    type: 'school',
    level: 1,
    institution_code: '',
    is_active: true,
    ...initialValues
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Ad mütləqdir';
    if (!formData.type) newErrors.type = 'Növ seçilməlidir';
    if (!formData.institution_code) newErrors.institution_code = 'Kod mütləqdir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        form: 'Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium">
        {initialValues ? t('common.edit') : t('common.add')} {t('institutions.institution')}
      </h3>
      
      {errors.form && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errors.form}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ad <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`block w-full rounded-md ${errors.name ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          disabled={loading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qısa ad
        </label>
        <input
          type="text"
          name="short_name"
          value={formData.short_name || ''}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Növü <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`block w-full rounded-md ${errors.type ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            disabled={loading}
          >
            {institutionTypes
              .filter(type => type.value !== '') // Remove 'All types' option
              .map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Səviyyə
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loading}
          >
            {levelOptions
              .filter(level => level.value !== '') // Remove 'All levels' option
              .map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Müəssisə kodu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="institution_code"
          value={formData.institution_code}
          onChange={handleChange}
          className={`block w-full rounded-md ${errors.institution_code ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          disabled={loading}
        />
        {errors.institution_code && <p className="mt-1 text-sm text-red-600">{errors.institution_code}</p>}
      </div>
      
      <div className="flex items-center">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={loading}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Aktiv
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.saving')}...
            </>
          ) : initialValues ? (
            t('common.saveChanges')
          ) : (
            t('common.create')
          )}
        </Button>
      </div>
    </form>
  );
};

export const EnhancedInstitutionsList: React.FC = () => {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Using the institutionTypes and levelOptions from the top of the file
  
  const {
    institutions,
    loading,
    error,
    pagination,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    toggleInstitutionStatus,
  } = useInstitution();
  
  // Fetch institutions on component mount
  useEffect(() => {
    fetchInstitutions();
  }, []);
  
  // Define the type for the form values
  type InstitutionFormValues = {
    name: string;
    short_name?: string;
    type: string;
    level: number;
    institution_code: string;
    region_code?: string;
    established_date?: string;
    is_active: boolean;
    parent_id?: number | null;
  };

  // Helper functions
  const getInstitutionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      ministry: '🏛️',
      region: '🌍',
      sektor: '🏢', 
      school: '🏫',
      vocational: '🔧',
      university: '🎓'
    };
    return icons[type] || '🏢';
  };

  const getInstitutionStats = (institution: Institution) => {
    // Mock data - real API data will replace this
    return {
      userCount: Math.floor(Math.random() * 100) + 10,
      subInstitutions: Math.floor(Math.random() * 15),
      activeSurveys: Math.floor(Math.random() * 8)
    };
  };

  // Add debugging
  console.log('EnhancedInstitutionsList - institutions data:', institutions);
  console.log('EnhancedInstitutionsList - loading:', loading);
  console.log('EnhancedInstitutionsList - error:', error);
  
  const filteredInstitutions = (institutions || []).filter(institution => {
    if (!institution || typeof institution !== 'object') {
      console.log('Invalid institution object:', institution);
      return false;
    }
    
    const matchesSearch = (institution.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (institution.short_name && institution.short_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === '' || institution.type === typeFilter;
    const matchesLevel = levelFilter === '' || String(institution.level) === levelFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && institution.is_active) ||
                         (statusFilter === 'inactive' && !institution.is_active);
    
    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  // Handle form submission
  const handleCreateInstitution = async (data: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createInstitution(data);
      setShowCreateModal(false);
      // Refresh the institutions list
      await fetchInstitutions();
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error; // This will be caught by the form's error handling
    }
  };

  return (
    <div className="institutions-page">
      {/* Page Header */}
      <div className="institutions-header">
        <div>
          <h1 className="institutions-title">Təşkilatlar</h1>
          <p className="institutions-subtitle">Təhsil təşkilatlarını idarə edin və izləyin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="add-institution-btn"
        >
          <FiPlus className="mr-1" />
          Yeni Təşkilat Əlavə Et
        </button>
      </div>

      {/* Create Institution Modal - Enhanced Design */}
      <div className={`fixed inset-0 z-50 overflow-y-auto ${showCreateModal ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          
          {/* Modal */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <FiPlus className="mr-2 h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Yeni Təşkilat Əlavə Et</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <InstitutionForm
                onSubmit={handleCreateInstitution}
                onCancel={() => setShowCreateModal(false)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="institutions-controls">
        <div className="institutions-filters">
          <div className="search-form">
            <input
              type="text"
              placeholder="Təşkilat adı ilə axtarın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            {institutionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="filter-select"
          >
            {levelOptions.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Deaktiv</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid /> Grid
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList /> List
          </button>
        </div>
      </div>

      {/* Add your component's content here */}
      
      {loading ? (
        <div className="institutions-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="institution-card">
              <LoadingSkeleton className="h-64" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error.message || t('common.errorLoadingData')}</span>
          <button onClick={() => fetchInstitutions()} className="retry-button">
            {t('common.retry')}
          </button>
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <div className="no-institutions">
          <h3>🏢 Heç bir təşkilat tapılmadı</h3>
          <p>Axtarış kriteriyalarınıza uyğun təşkilat mövcud deyil</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="add-institution-btn"
          >
            <FiPlus /> İlk təşkilatı yaradın
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'institutions-grid' : 'institutions-list-view'}>
          {filteredInstitutions.map((institution) => {
            // Add defensive checks to prevent object conversion errors
            if (!institution || typeof institution !== 'object' || !institution.id) {
              return null;
            }
            
            const stats = getInstitutionStats(institution);
            
            return (
              <div key={String(institution.id)} className="institution-card">
                <div className="institution-card-header">
                  <div className="institution-title-section">
                    <div className="institution-title-wrapper">
                      <span className="institution-icon">{getInstitutionIcon(institution.type || '')}</span>
                      <h3 className="institution-title">{String(institution.name || 'Adsız təşkilat')}</h3>
                    </div>
                    {institution.short_name && (
                      <span className="institution-short-name">({String(institution.short_name)})</span>
                    )}
                    <div className="institution-badges">
                      <span className={`institution-type-badge ${institution.type || ''}`}>
                        {String(institution.type || 'N/A')}
                      </span>
                      <span className="institution-level-badge">
                        Səviyyə {String(institution.level || 0)}
                      </span>
                      <span className={`institution-status-badge ${institution.is_active ? 'active' : 'inactive'}`}>
                        {institution.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </div>
                  </div>
                  <div className="institution-actions">
                    <button
                      onClick={() => setEditingInstitution(institution)}
                      className="action-button edit"
                      title="Redaktə et"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => toggleInstitutionStatus(Number(institution.id), !institution.is_active)}
                      className="action-button toggle"
                      title={institution.is_active ? 'Deaktiv et' : 'Aktiv et'}
                    >
                      {institution.is_active ? <FiPause /> : <FiPlay />}
                    </button>
                  </div>
                </div>

                <div className="institution-card-content">
                  <div className="institution-details">
                    <div className="detail-item">
                      <span className="detail-icon">🌍</span>
                      <span className="detail-label">Region:</span>
                      <span className="detail-value">{String(institution.region_code || 'Məlum deyil')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-label">Təsis:</span>
                      <span className="detail-value">
                        {institution.established_date ? 
                          new Date(institution.established_date).toLocaleDateString('az-AZ') : 
                          'Məlum deyil'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🏷️</span>
                      <span className="detail-label">Kod:</span>
                      <span className="detail-value">{String(institution.institution_code || 'Təyin edilməyib')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">
                        {String(institution.contact_info?.email || 'Məlum deyil')}
                      </span>
                    </div>
                  </div>

                  <div className="institution-stats">
                    <div className="stat-item">
                      <p className="stat-value">{String(stats.userCount || 0)}</p>
                      <p className="stat-label">İstifadəçi</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-value">{String(stats.subInstitutions || 0)}</p>
                      <p className="stat-label">Alt təşkilat</p>
                    </div>
                    <div className="stat-item">
                      <p className="stat-value">{String(stats.activeSurveys || 0)}</p>
                      <p className="stat-label">Aktiv sorğu</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="institutions-pagination">
          <div className="pagination-info">
            {t('common.showing')}{' '}
            <span className="font-medium">
              {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}
            </span>{' '}
            {t('common.of')}{' '}
            <span className="font-medium">{pagination.totalItems}</span>{' '}
            nəticə
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Əvvəlki
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === pagination.totalPages}
              onClick={() =>
                setCurrentPage((prev: number) =>
                  Math.min(prev + 1, pagination.totalPages)
                )
              }
            >
              Sonrakı →
            </button>
          </div>
        </div>
      )}

      {/* Add modals here */}
      <Dialog
        isOpen={showCreateModal || !!editingInstitution}
        onClose={() => {
          setShowCreateModal(false);
          setEditingInstitution(null);
        }}
        title={
          editingInstitution
            ? t('institutions.editInstitution')
            : t('institutions.addInstitution')
        }
      >
        <InstitutionForm
          initialValues={editingInstitution || undefined}
          onSubmit={async (values: InstitutionFormValues) => {
            try {
              if (editingInstitution) {
                await updateInstitution(editingInstitution.id, values);
              } else {
                await createInstitution(values);
              }
              setShowCreateModal(false);
              setEditingInstitution(null);
            } catch (error) {
              console.error('Error saving institution:', error);
            }
          }}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingInstitution(null);
          }}
        />
      </Dialog>
    </div>
  );
};
