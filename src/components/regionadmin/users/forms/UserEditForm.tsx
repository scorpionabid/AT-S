import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  roles: Role[];
  institution: Institution;
  department: Department | null;
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

interface UserEditFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

interface UpdateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  password_confirmation?: string;
  role_name: string;
  institution_id: number;
  department_id: number | '';
  is_active: boolean;
}

const UserEditForm: React.FC<UserEditFormProps> = ({
  user,
  onSuccess,
  onCancel
}) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const [formData, setFormData] = useState<UpdateUserData>({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role_name: user.roles?.[0]?.name || '',
    institution_id: user.institution?.id || 0,
    department_id: user.department?.id || '',
    is_active: user.is_active
  });

  // Fetch initial data
  useEffect(() => {
    fetchRoles();
    fetchInstitutions();
    if (formData.institution_id) {
      fetchDepartments(formData.institution_id);
    }
  }, []);

  // Fetch departments when institution changes
  useEffect(() => {
    if (formData.institution_id && formData.institution_id !== user.institution?.id) {
      fetchDepartments(formData.institution_id);
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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'institution_id' || name === 'department_id' 
                ? (value ? parseInt(value) : '') 
                : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Password validation if changing password
    if (changePassword) {
      if (!formData.password || !formData.password_confirmation) {
        setError('Şifrə və təkrarı tələb olunur');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setError('Şifrələr uyğun gəlmir');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('auth_token');
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_name: formData.role_name,
        institution_id: formData.institution_id,
        department_id: formData.department_id || null,
        is_active: formData.is_active
      };

      if (changePassword && formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      const response = await fetch(`/api/regionadmin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(errorData.message || 'İstifadəçi yenilənə bilmədi');
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

  const isCurrentUser = user.id === currentUser?.id;

  return (
    <div className="user-edit-form">
      <div className="form-header">
        <h2>İstifadəçi Redaktəsi</h2>
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
              />
            </div>

            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
                <span className="checkbox-text">Şifrəni dəyişdir</span>
              </label>
            </div>

            {changePassword && (
              <>
                <div className="form-group">
                  <label htmlFor="password">Yeni Şifrə *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    required={changePassword}
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
                    value={formData.password_confirmation || ''}
                    onChange={handleInputChange}
                    required={changePassword}
                    minLength={8}
                    placeholder="Şifrəni təkrar daxil edin"
                  />
                </div>
              </>
            )}
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
                disabled={isCurrentUser}
              >
                <option value="">Rol seçin</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              {isCurrentUser && (
                <small className="form-note">Öz rolunuzu dəyişə bilməzsiniz</small>
              )}
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
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isCurrentUser}
                />
                <span className="checkbox-text">Aktiv istifadəçi</span>
              </label>
              {isCurrentUser && (
                <small className="form-note">Öz statusunuzu dəyişə bilməzsiniz</small>
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
            {loading ? 'Yenilənir...' : 'Dəyişiklikləri Saxla'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;