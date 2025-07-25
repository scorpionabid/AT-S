import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DepartmentCreateForm from './DepartmentCreateForm';
import DepartmentEditForm from './DepartmentEditForm';
import { Icon, ActionIcon, StatusIcon } from '../common/IconSystem';
import '../../styles/departments.css';

interface Department {
  id: number;
  name: string;
  short_name: string;
  department_type: string;
  department_type_display: string;
  description: string;
  capacity: number;
  budget_allocation: number;
  functional_scope: string;
  is_active: boolean;
  institution_id: number;
  parent: {
    id: number;
    name: string;
    department_type: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface DepartmentManagementProps {
  institutionId: number;
  institutionType: string;
  canManage: boolean;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  institutionId,
  institutionType,
  canManage
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, [institutionId]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/departments?institution_id=${institutionId}`);
      setDepartments(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbələr yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
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

  const handleDeleteClick = (departmentId: number) => {
    setDeletingDepartmentId(departmentId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDepartmentId) return;

    try {
      await api.delete(`/departments/${deletingDepartmentId}`);
      setShowDeleteModal(false);
      setDeletingDepartmentId(null);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbə silinərkən xəta baş verdi');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  if (loading) {
    return (
      <div className="department-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Şöbələr yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="department-management">
      <div className="department-header">
        <h3>
          <Icon type="DEPARTMENT" /> Şöbələr
        </h3>
        {canManage && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-create-department"
          >
            <Icon type="ADD" /> Yeni Şöbə
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-dismiss">×</button>
        </div>
      )}

      {departments.length === 0 ? (
        <div className="empty-state">
          <Icon type="DEPARTMENT" className="empty-icon" />
          <h4>Şöbə yoxdur</h4>
          <p>Bu təşkilatda hələ heç bir şöbə yaradılmayıb.</p>
          {canManage && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-create-first-department"
            >
              <Icon type="ADD" /> İlk şöbəni yarat
            </button>
          )}
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((department) => (
            <div key={department.id} className={`department-card ${department.is_active ? 'active' : 'inactive'}`}>
              <div className="department-card-header">
                <div className="department-title-section">
                  <h4 className="department-title">{department.name}</h4>
                  {department.short_name && (
                    <span className="department-short-name">({department.short_name})</span>
                  )}
                  <div className="department-badges">
                    <span className={`type-badge type-${department.department_type}`}>
                      {department.department_type_display}
                    </span>
                    <span className={`status-badge ${department.is_active ? 'active' : 'inactive'}`}>
                      <StatusIcon status={department.is_active ? 'active' : 'inactive'} />
                      {department.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="department-actions">
                    <ActionIcon
                      type="EDIT"
                      onClick={() => handleEditClick(department.id)}
                      className="edit"
                      title="Redaktə et"
                    />
                    <ActionIcon
                      type={department.is_active ? 'INACTIVE' : 'ACTIVE'}
                      onClick={() => handleToggleStatus(department)}
                      className={department.is_active ? 'deactivate' : 'activate'}
                      title={department.is_active ? 'Deaktiv et' : 'Aktiv et'}
                    />
                    <ActionIcon
                      type="DELETE"
                      onClick={() => handleDeleteClick(department.id)}
                      className="delete"
                      title="Sil"
                    />
                  </div>
                )}
              </div>

              <div className="department-card-content">
                {department.description && (
                  <div className="department-description">
                    <span className="description-label">Təsvir:</span>
                    <span className="description-text">{department.description}</span>
                  </div>
                )}

                {department.capacity && (
                  <div className="department-capacity">
                    <span className="capacity-label">Tutum:</span>
                    <span className="capacity-value">{department.capacity} nəfər</span>
                  </div>
                )}

                {department.budget_allocation && (
                  <div className="department-budget">
                    <span className="budget-label">Büdcə:</span>
                    <span className="budget-value">{department.budget_allocation} AZN</span>
                  </div>
                )}

                {department.functional_scope && (
                  <div className="department-scope">
                    <span className="scope-label">Funksional sahə:</span>
                    <span className="scope-text">{department.functional_scope}</span>
                  </div>
                )}

                {department.parent && (
                  <div className="department-parent">
                    <span className="parent-label">Üst şöbə:</span>
                    <span className="parent-name">{department.parent.name}</span>
                  </div>
                )}

                <div className="department-stats">
                  <div className="stat-item">
                    <span className="stat-label">Alt şöbələr:</span>
                    <span className="stat-value">{department.children_count}</span>
                  </div>
                </div>

                <div className="department-meta">
                  <div className="meta-item">
                    <span className="meta-label">Yaradılıb:</span>
                    <span className="meta-value">{formatDate(department.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Create Modal */}
      {showCreateForm && (
        <DepartmentCreateForm
          institutionId={institutionId}
          institutionType={institutionType}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Department Edit Modal */}
      {showEditForm && editingDepartmentId && (
        <DepartmentEditForm
          departmentId={editingDepartmentId}
          institutionId={institutionId}
          institutionType={institutionType}
          onClose={() => {
            setShowEditForm(false);
            setEditingDepartmentId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDepartmentId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Şöbəni Sil</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDepartmentId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Bu şöbəni silmək istədiyinizə əminsiniz?</p>
              <p className="warning-text">
                Şöbədə istifadəçilər və ya alt şöbələr varsa, əvvəlcə onları köçürün.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDepartmentId(null);
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

export default DepartmentManagement;