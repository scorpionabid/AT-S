import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface UserCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CreateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirmation: string;
  role_name: string;
  institution_id: number | '';
  department_id: number | '';
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  level: number;
}

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

interface Department {
  id: number;
  name: string;
  department_type: string;
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
    role_name: '',
    institution_id: '',
    department_id: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchRoles();
    fetchInstitutions();
  }, []);

  // Fetch departments when institution changes
  useEffect(() => {
    if (formData.institution_id) {
      fetchDepartments(Number(formData.institution_id));
    } else {
      setDepartments([]);
      setFormData(prev => ({ ...prev, department_id: '' }));
    }
  }, [formData.institution_id]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionadmin/roles/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionadmin/institutions/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error('Failed to fetch institutions:', err);
    }
  };

  const fetchDepartments = async (institutionId: number) => {
    try {
      setLoadingDepartments(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institutionId}/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'institution_id' || name === 'department_id' 
        ? (value ? parseInt(value) : '') 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.password_confirmation) {
      setError('Şifrələr uyğun gəlmir');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionadmin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          department_id: formData.department_id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(errorData.message || 'İstifadəçi yaradıla bilmədi');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      'region': 'Region',
      'regional_education_department': 'Regional İdarə',
      'sector_education_office': 'Sektor',
      'school': 'Məktəb',
      'secondary_school': 'Orta Məktəb',
      'gymnasium': 'Gimnaziya',
      'vocational': 'Peşə Məktəbi'
    };
    return types[type] || type;
  };

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

  return (
    <div className="user-create-form">
      <div className="form-header">
        <h2>Yeni İstifadəçi Yarat</h2>
        <button onClick={onCancel} className="close-btn">✕</button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Account Information */}
        <div className="form-section">
          <h3>Hesab Məlumatları</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">İstifadəçi Adı *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Məsələn: test_user"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="user@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Şifrə *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
                placeholder="Minimum 8 simvol"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">Şifrə Təkrarı *</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
                minLength={8}
                placeholder="Şifrəni təkrar daxil edin"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <h3>Şəxsi Məlumatlar</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">Ad</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Adı"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Soyad</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Soyadı"
              />
            </div>
          </div>
        </div>

        {/* Role and Assignment */}
        <div className="form-section">
          <h3>Rol və Təyinat</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="role_name">Rol *</label>
              <select
                id="role_name"
                name="role_name"
                value={formData.role_name}
                onChange={handleInputChange}
                required
              >
                <option value="">Rol seçin</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="institution_id">Təşkilat *</label>
              <select
                id="institution_id"
                name="institution_id"
                value={formData.institution_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Təşkilat seçin</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name} ({getInstitutionTypeDisplay(institution.type)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Şöbə</label>
              {loadingDepartments ? (
                <div className="loading-departments">Şöbələr yüklənir...</div>
              ) : (
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  disabled={!formData.institution_id}
                >
                  <option value="">Şöbə seçin (ixtiyari)</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({getDepartmentTypeDisplay(department.department_type)})
                    </option>
                  ))}
                </select>
              )}
              {!formData.institution_id && (
                <small className="form-note">Əvvəlcə təşkilat seçin</small>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Yaradılır...' : 'İstifadəçi Yarat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreateForm;