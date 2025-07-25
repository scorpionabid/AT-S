import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Icon } from '../common/IconSystem';
import '../../styles/institutions.css';

interface Department {
  id: number;
  name: string;
  short_name?: string;
  type: string;
  is_active: boolean;
  users_count: number;
  active_users_count: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface InstitutionDepartmentsProps {
  institutionId: number;
  onClose: () => void;
}

const InstitutionDepartments: React.FC<InstitutionDepartmentsProps> = ({ 
  institutionId, 
  onClose 
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [institutionName, setInstitutionName] = useState<string>('');

  // Form state
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

  useEffect(() => {
    fetchDepartments();
    fetchInstitutionName();
  }, [institutionId]);

  const fetchInstitutionName = async () => {
    try {
      const response = await api.get(`/institutions/${institutionId}`);
      setInstitutionName(response.data.data?.name || response.data.institution?.name || 'Müəssisə');
    } catch (err: any) {
      console.error('Institution name fetch error:', err);
      setInstitutionName('Müəssisə');
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/institutions/${institutionId}/departments`);
      setDepartments(response.data.departments || response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbələr yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post(`/institutions/${institutionId}/departments`, formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        short_name: '',
        type: 'general',
        description: '',
        is_active: true
      });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbə yaradılarkən xəta baş verdi');
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      await api.put(`/institutions/${institutionId}/departments/${editingDepartment.id}`, formData);
      setEditingDepartment(null);
      setFormData({
        name: '',
        short_name: '',
        type: 'general',
        description: '',
        is_active: true
      });
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbə yenilənərkən xəta baş verdi');
    }
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    if (!window.confirm('Bu şöbəni silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await api.delete(`/institutions/${institutionId}/departments/${departmentId}`);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şöbə silinərkən xəta baş verdi');
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
    setShowCreateForm(true);
  };

  const getDepartmentTypeLabel = (type: string) => {
    const typeObj = departmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>
            <Icon type="USERS" /> {institutionName} - Şöbələr
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError('')} className="dismiss-error">×</button>
            </div>
          )}

          <div className="department-actions">
            <button
              onClick={() => {
                setEditingDepartment(null);
                setFormData({
                  name: '',
                  short_name: '',
                  type: 'general',
                  description: '',
                  is_active: true
                });
                setShowCreateForm(true);
              }}
              className="btn btn-primary"
            >
              <Icon type="ADD" /> Yeni Şöbə
            </button>
          </div>

          {showCreateForm && (
            <div className="department-form">
              <h3>{editingDepartment ? 'Şöbəni Redaktə Et' : 'Yeni Şöbə Yarat'}</h3>
              <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}>
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
                    {editingDepartment ? 'Yenilə' : 'Yarat'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingDepartment(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Ləğv et
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="departments-loading">
              <div className="loading-spinner">Yüklənir...</div>
            </div>
          ) : (
            <div className="departments-table">
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
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                        <Icon type="USERS" style={{fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5}} />
                        <p>Heç bir şöbə tapılmadı</p>
                        <small>Bu müəssisə üçün şöbə əlavə edə bilərsiniz</small>
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
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
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDepartments;