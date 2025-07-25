import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface Institution {
  id: number;
  name: string;
  type: string;
}

interface Department {
  id: number;
  name: string;
  short_name: string;
  department_type: string;
  description: string;
  is_active: boolean;
  parent_department_id: number | null;
  children: Department[];
}

interface DepartmentManagementProps {
  institution: Institution;
  onClose: () => void;
}

interface DepartmentFormData {
  name: string;
  short_name: string;
  department_type: string;
  description: string;
  parent_department_id?: number;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  institution,
  onClose
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    short_name: '',
    department_type: '',
    description: ''
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institution.id}/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Şöbələr yüklənə bilmədi');
      }

      const data = await response.json();
      setDepartments(data.departments || []);
      setAllowedTypes(data.allowed_types || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [institution.id]);

  const getDepartmentTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      'maliyyə': 'Maliyyə Şöbəsi',
      'inzibati': 'İnzibati Şöbəsi',
      'təsərrüfat': 'Təsərrüfat Şöbəsi',
      'müavin': 'Müavin Şöbəsi',
      'ubr': 'UBR Şöbəsi',
      'psixoloq': 'Psixoloji Dəstək Şöbəsi',
      'müəllim': 'Fənn Müəllimləri Şöbəsi',
      'general': 'Ümumi Şöbə',
      'other': 'Digər'
    };
    return types[type] || type;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parent_department_id' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institution.id}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şöbə yaradıla bilmədi');
      }

      setShowCreateForm(false);
      setFormData({ name: '', short_name: '', department_type: '', description: '' });
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xəta baş verdi');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institution.id}/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şöbə yenilənə bilmədi');
      }

      setEditingDepartment(null);
      setFormData({ name: '', short_name: '', department_type: '', description: '' });
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xəta baş verdi');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      short_name: department.short_name,
      department_type: department.department_type,
      description: department.description,
      parent_department_id: department.parent_department_id || undefined
    });
    setShowCreateForm(false);
  };

  const handleDelete = async (department: Department) => {
    if (!confirm(`"${department.name}" şöbəsini silmək istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institution.id}/departments/${department.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şöbə silinə bilmədi');
      }

      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xəta baş verdi');
    }
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setEditingDepartment(null);
    setFormData({ name: '', short_name: '', department_type: '', description: '' });
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingDepartment(null);
    setFormData({ name: '', short_name: '', department_type: '', description: '' });
  };

  const rootDepartments = departments.filter(dept => !dept.parent_department_id);

  if (loading) {
    return (
      <div className="department-management">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Şöbələr yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="department-management">
      <div className="management-header">
        <div className="header-content">
          <h2>Şöbə İdarəetməsi</h2>
          <p>{institution.name}</p>
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="management-content">
        <div className="departments-section">
          <div className="section-header">
            <h3>Şöbələr</h3>
            <button onClick={startCreate} className="create-btn">
              ➕ Yeni Şöbə
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏢</span>
              <h4>Şöbə tapılmadı</h4>
              <p>Bu təşkilat üçün hələ heç bir şöbə yaradılmayıb</p>
            </div>
          ) : (
            <div className="departments-list">
              {rootDepartments.map((department) => (
                <div key={department.id} className="department-card">
                  <div className="department-info">
                    <div className="department-header">
                      <h4>{department.name}</h4>
                      <span className="department-type">
                        {getDepartmentTypeDisplay(department.department_type)}
                      </span>
                    </div>
                    {department.short_name && (
                      <p className="department-short-name">
                        Qısa ad: {department.short_name}
                      </p>
                    )}
                    {department.description && (
                      <p className="department-description">{department.description}</p>
                    )}
                    <div className="department-status">
                      <span className={`status-badge ${department.is_active ? 'active' : 'inactive'}`}>
                        {department.is_active ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </div>
                  </div>
                  <div className="department-actions">
                    <button 
                      onClick={() => handleEdit(department)}
                      className="action-btn edit-btn"
                    >
                      ✏️ Redaktə
                    </button>
                    <button 
                      onClick={() => handleDelete(department)}
                      className="action-btn delete-btn"
                      disabled={department.children.length > 0}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(showCreateForm || editingDepartment) && (
          <div className="form-section">
            <div className="form-header">
              <h3>{editingDepartment ? 'Şöbə Redaktəsi' : 'Yeni Şöbə'}</h3>
            </div>

            <form onSubmit={editingDepartment ? handleEditSubmit : handleCreateSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Şöbə Adı *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Məsələn: Maliyyə Şöbəsi"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="short_name">Qısa Ad</label>
                  <input
                    type="text"
                    id="short_name"
                    name="short_name"
                    value={formData.short_name}
                    onChange={handleInputChange}
                    placeholder="Məsələn: MS"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department_type">Şöbə Tipi *</label>
                  <select
                    id="department_type"
                    name="department_type"
                    value={formData.department_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Tip seçin</option>
                    {allowedTypes.map(type => (
                      <option key={type} value={type}>
                        {getDepartmentTypeDisplay(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {rootDepartments.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="parent_department_id">Valideyn Şöbə</label>
                    <select
                      id="parent_department_id"
                      name="parent_department_id"
                      value={formData.parent_department_id || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Əsas şöbə</option>
                      {rootDepartments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group full-width">
                  <label htmlFor="description">Təsvir</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Şöbənin funksiyaları və məsuliyyətləri"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelForm} className="cancel-btn">
                  Ləğv et
                </button>
                <button type="submit" className="submit-btn">
                  {editingDepartment ? 'Dəyişiklikləri Saxla' : 'Şöbə Yarat'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentManagement;