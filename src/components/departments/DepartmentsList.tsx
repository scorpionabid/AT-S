import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import DepartmentCreateForm from './DepartmentCreateForm';
import DepartmentEditForm from './DepartmentEditForm';
import DepartmentCard from './DepartmentCard';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

interface Department {
  id: number;
  name: string;
  short_name: string;
  department_type: string;
  department_type_display: string;
  description: string;
  capacity: number | null;
  budget_allocation: number | null;
  functional_scope: string;
  is_active: boolean;
  institution_id: number;
  institution: {
    id: number;
    name: string;
    type: string;
  };
  parent: {
    id: number;
    name: string;
    department_type: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface DepartmentsResponse {
  departments: Department[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

interface DepartmentsListProps {
  institutionId?: number;
  institutionName?: string;
  showCreateButton?: boolean;
  compactView?: boolean;
}

const DepartmentsList: React.FC<DepartmentsListProps> = ({ 
  institutionId,
  institutionName,
  showCreateButton = true,
  compactView = false
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const departmentTypes = [
    { value: 'maliyyə', label: 'Maliyyə Şöbəsi' },
    { value: 'inzibati', label: 'İnzibati Şöbəsi' },
    { value: 'təsərrüfat', label: 'Təsərrüfat Şöbəsi' },
    { value: 'müavin', label: 'Müavin Şöbəsi' },
    { value: 'ubr', label: 'UBR Şöbəsi' },
    { value: 'psixoloq', label: 'Psixoloji Dəstək Şöbəsi' },
    { value: 'müəllim', label: 'Fənn Müəllimləri Şöbəsi' },
    { value: 'general', label: 'Ümumi Şöbə' },
    { value: 'other', label: 'Digər' }
  ];

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, searchTerm, typeFilter, institutionId]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: compactView ? '10' : '15'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('department_type', typeFilter);
      if (institutionId) params.append('institution_id', institutionId.toString());
      if (viewMode === 'hierarchy') params.append('hierarchy', '1');

      const response = await api.get(`/departments?${params}`);
      const data: DepartmentsResponse = response.data;
      
      setDepartments(data.departments);
      if (data.meta) {
        setTotalPages(data.meta.last_page);
        setTotalCount(data.meta.total);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Şöbə məlumatları yüklənərkən xəta baş verdi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canManageDepartments = () => {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
    return roleName === 'superadmin';
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchDepartments();
  };

  const handleEditClick = (departmentId: number) => {
    setEditingDepartmentId(departmentId);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingDepartmentId(null);
    fetchDepartments();
  };

  const handleToggleStatus = async (department: Department) => {
    try {
      await api.put(`/departments/${department.id}`, {
        is_active: !department.is_active
      });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Status dəyişdirilərkən xəta baş verdi');
    }
  };

  const [deletingDepartment, setDeletingDepartment] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteDepartment = (department: any) => {
    setDeletingDepartment(department);
  };

  const confirmDepartmentDelete = async (deleteType: 'soft' | 'hard') => {
    if (!deletingDepartment) return;

    try {
      setDeleteLoading(true);
      
      if (deleteType === 'soft') {
        // Soft delete - deactivate department
        await api.put(`/departments/${deletingDepartment.id}`, {
          is_active: false,
          deleted_at: new Date().toISOString()
        });
      } else {
        // Hard delete - permanently delete
        await api.delete(`/departments/${deletingDepartment.id}?type=hard`);
      }
      
      setDeletingDepartment(null);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbə silinərkən xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="departments-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Şöbə məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`departments-list ${compactView ? 'compact' : ''}`}>
      {!compactView && (
        <div className="page-header">
          <h1 className="page-title">
            {institutionName ? `${institutionName} - Şöbə İdarəetməsi` : 'Şöbə İdarəetməsi'}
          </h1>
          <p className="page-description">Təşkilat şöbələrinin idarə edilməsi və strukturu</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="departments-controls">
        <div className="departments-filters">
          <div className="search-form">
            <input
              type="text"
              placeholder="Şöbə adı ilə axtarın..."
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
            {departmentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="view-controls">
          {!compactView && (
            <div className="view-toggle">
              <button
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 Siyahı
              </button>
              <button
                className={`view-button ${viewMode === 'hierarchy' ? 'active' : ''}`}
                onClick={() => setViewMode('hierarchy')}
              >
                🌳 Ierarxiya
              </button>
            </div>
          )}

          {canManageDepartments() && showCreateButton && institutionId && (
            <button 
              className="add-department-button"
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Yeni Şöbə
            </button>
          )}
        </div>
      </div>

      {departments.length === 0 && !loading ? (
        <div className="no-departments">
          <p>Heç bir şöbə tapılmadı</p>
          {canManageDepartments() && showCreateButton && institutionId && (
            <button 
              className="create-first-department"
              onClick={() => setShowCreateForm(true)}
            >
              İlk şöbəni yaradın
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="departments-grid">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onEdit={handleEditClick}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteDepartment}
                canManage={canManageDepartments()}
                compactView={compactView}
              />
            ))}
          </div>

          {!compactView && totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ⬅️ Əvvəlki
              </button>
              
              <span className="pagination-info">
                Səhifə {currentPage} / {totalPages} (Ümumi: {totalCount})
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Növbəti ➡️
              </button>
            </div>
          )}
        </>
      )}

      {/* Department Create Modal */}
      {showCreateForm && institutionId && (
        <DepartmentCreateForm 
          institutionId={institutionId}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Department Edit Modal */}
      {showEditForm && editingDepartmentId && (
        <DepartmentEditForm 
          departmentId={editingDepartmentId}
          onClose={() => {
            setShowEditForm(false);
            setEditingDepartmentId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Department Delete Modal */}
      {deletingDepartment && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingDepartment(null)}
          onConfirm={confirmDepartmentDelete}
          item={{
            id: deletingDepartment.id,
            name: deletingDepartment.name,
            type: deletingDepartment.department_type_display,
            additional_info: {
              institution: deletingDepartment.institution?.name,
              children_count: deletingDepartment.children_count
            }
          }}
          itemType="department"
          title="Şöbəni Sil"
          loading={deleteLoading}
          canHardDelete={deletingDepartment.children_count === 0}
          showBothOptions={true}
        />
      )}
    </div>
  );
};

export default DepartmentsList;