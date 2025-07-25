import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface DepartmentCreateData {
  name: string;
  short_name: string;
  department_type: string;
  description: string;
  institution_id: number;
  parent_department_id: number | null;
  metadata: Record<string, any>;
  capacity: number | null;
  budget_allocation: number | null;
  functional_scope: string;
  is_active: boolean;
}

interface DepartmentCreateFormProps {
  institutionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface DepartmentType {
  [key: string]: string;
}

interface ParentDepartment {
  id: number;
  name: string;
  department_type: string;
}

const DepartmentCreateForm: React.FC<DepartmentCreateFormProps> = ({ 
  institutionId, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<DepartmentCreateData>({
    name: '',
    short_name: '',
    department_type: '',
    description: '',
    institution_id: institutionId,
    parent_department_id: null,
    metadata: {},
    capacity: null,
    budget_allocation: null,
    functional_scope: '',
    is_active: true
  });

  const [availableTypes, setAvailableTypes] = useState<DepartmentType>({});
  const [parentDepartments, setParentDepartments] = useState<ParentDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchAvailableTypes();
    fetchParentDepartments();
  }, [institutionId]);

  const fetchAvailableTypes = async () => {
    try {
      const response = await api.get(`/departments/types/institution?institution_id=${institutionId}`);
      setAvailableTypes(response.data.types);
    } catch (error) {
      console.error('Error fetching department types:', error);
    }
  };

  const fetchParentDepartments = async () => {
    try {
      const response = await api.get(`/departments?institution_id=${institutionId}&is_active=1`);
      setParentDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching parent departments:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'parent_department_id' || name === 'capacity') {
      const numValue = value === '' ? null : parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else if (name === 'budget_allocation') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else if (name === 'is_active') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Şöbə adı mütləqdir';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Şöbə adı minimum 3 simvol olmalıdır';
    }

    if (!formData.department_type) {
      newErrors.department_type = 'Şöbə tipi mütləqdir';
    }

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'Tutum 1-dən çox olmalıdır';
    }

    if (formData.budget_allocation && formData.budget_allocation < 0) {
      newErrors.budget_allocation = 'Büdcə təyinatı mənfi ola bilməz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/departments', formData);
      
      console.log('Department created successfully:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Department creation error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const errorMessage = error.response?.data?.message || 'Şöbə yaradılarkən xəta baş verdi';
        setErrors({
          general: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-content department-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yeni Şöbə Yaradın</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="department-create-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>🏢 Əsas Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Şöbə Adı *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Şöbənin tam adı"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="short_name">Qısa Ad</label>
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className={errors.short_name ? 'error' : ''}
                  placeholder="Qısa ad və ya akronim"
                />
                {errors.short_name && <span className="field-error">{errors.short_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="department_type">Şöbə Tipi *</label>
                <select
                  id="department_type"
                  name="department_type"
                  value={formData.department_type}
                  onChange={handleInputChange}
                  className={errors.department_type ? 'error' : ''}
                >
                  <option value="">Seçin...</option>
                  {Object.entries(availableTypes).map(([type, label]) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.department_type && <span className="field-error">{errors.department_type}</span>}
              </div>

              {parentDepartments.length > 0 && (
                <div className="form-group">
                  <label htmlFor="parent_department_id">Ana Şöbə</label>
                  <select
                    id="parent_department_id"
                    name="parent_department_id"
                    value={formData.parent_department_id || ''}
                    onChange={handleInputChange}
                    className={errors.parent_department_id ? 'error' : ''}
                  >
                    <option value="">Seçin...</option>
                    {parentDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.department_type})
                      </option>
                    ))}
                  </select>
                  {errors.parent_department_id && <span className="field-error">{errors.parent_department_id}</span>}
                </div>
              )}

              <div className="form-group form-group-full">
                <label htmlFor="description">Təsvir</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Şöbə haqqında əlavə məlumat"
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Operational Information */}
          <div className="form-section">
            <h3>📊 Əməliyyat Məlumatları</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="capacity">Tutum (İşçi sayı)</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  className={errors.capacity ? 'error' : ''}
                  min="1"
                  max="1000"
                  placeholder="Nəfər"
                />
                {errors.capacity && <span className="field-error">{errors.capacity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="budget_allocation">Büdcə Təyinatı (AZN)</label>
                <input
                  type="number"
                  id="budget_allocation"
                  name="budget_allocation"
                  value={formData.budget_allocation || ''}
                  onChange={handleInputChange}
                  className={errors.budget_allocation ? 'error' : ''}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.budget_allocation && <span className="field-error">{errors.budget_allocation}</span>}
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="functional_scope">Funksional Sahə</label>
                <textarea
                  id="functional_scope"
                  name="functional_scope"
                  value={formData.functional_scope}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Şöbənin məsuliyyət və funksiyaları"
                />
                {errors.functional_scope && <span className="field-error">{errors.functional_scope}</span>}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Aktiv şöbə
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
            >
              Ləğv et
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
            >
              {loading ? 'Yaradılır...' : 'Şöbə yarat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentCreateForm;