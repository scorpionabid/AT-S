import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

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
  institution_id: number;
}

interface UserCreateData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
  institution_id: string;
  department_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string;
  gender: string;
  contact_phone: string;
  is_active: boolean;
}

interface UserCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserCreateData>({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    institution_id: '',
    department_id: '',
    first_name: '',
    last_name: '',
    patronymic: '',
    birth_date: '',
    gender: '',
    contact_phone: '',
    is_active: true
  });

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCurrentUser();
    fetchRoles();
    fetchInstitutions();
    fetchDepartments();
  }, []);

  // Filter departments when institution changes
  useEffect(() => {
    if (formData.institution_id) {
      const institutionId = parseInt(formData.institution_id);
      setFilteredDepartments(departments.filter(dept => dept.institution_id === institutionId));
      setFormData(prev => ({ ...prev, department_id: '' })); // Reset department selection
    } else {
      setFilteredDepartments([]);
    }
  }, [formData.institution_id, departments]);

  // Update filtered roles when allRoles or currentUser changes
  useEffect(() => {
    if (!currentUser || allRoles.length === 0) return;

    const userRoleLevel = currentUser.role?.level || 0;
    
    // Superadmin can assign any role
    if (currentUser.role?.name === 'superadmin') {
      setFilteredRoles(allRoles);
    } 
    // Regionadmin can only assign roles with level > 2 (regionoperator and below)
    else if (currentUser.role?.name === 'regionadmin') {
      setFilteredRoles(allRoles.filter(role => role.level > 2));
    }
    // Other users can't assign any roles
    else {
      setFilteredRoles([]);
    }
  }, [allRoles, currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/me');
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setCurrentUser(null);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setAllRoles(response.data.roles || response.data.data || []);
    } catch (error) {
      console.error('Roles fetch error:', error);
      // If user doesn't have permission to access roles, set empty array
      setAllRoles([]);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions?per_page=100');
      setInstitutions(response.data.institutions || response.data.data || []);
    } catch (error) {
      console.error('Institutions fetch error:', error);
      setInstitutions([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments?per_page=100&is_active=1');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Departments fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required fields
    if (!formData.username.trim()) {
      newErrors.username = 'İstifadəçi adı mütləqdir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'İstifadəçi adı ən azı 3 simvol olmalıdır';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email mütləqdir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Düzgün email formatı daxil edin';
    }

    if (!formData.password) {
      newErrors.password = 'Şifrə mütləqdir';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifrə ən azı 8 simvol olmalıdır';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Şifrələr uyğun gəlmir';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Rol seçimi mütləqdir';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Ad mütləqdir';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyad mütləqdir';
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
      await api.post('/users', formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'İstifadəçi yaradılarkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: Role) => {
    const roleNames: { [key: string]: string } = {
      'superadmin': 'Super Administrator',
      'regionadmin': 'Regional Administrator',
      'schooladmin': 'School Administrator',
      'müəllim': 'Müəllim',
      'regionoperator': 'Regional Operator'
    };
    return roleNames[role.name] || role.display_name || role.name;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-create-modal">
        <div className="modal-header">
          <h2>Yeni İstifadəçi Yaradın</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-create-form">
          <div className="form-section">
            <h3>Giriş Məlumatları</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">İstifadəçi adı *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? 'error' : ''}
                  placeholder="İstifadəçi adını daxil edin"
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="email@domain.com"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Şifrə *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Ən azı 8 simvol"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password_confirmation">Şifrə təkrarı *</label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className={errors.password_confirmation ? 'error' : ''}
                  placeholder="Şifrəni təkrar edin"
                />
                {errors.password_confirmation && <span className="field-error">{errors.password_confirmation}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Rol və Təşkilat</h3>
            <div className="form-grid">
              <div className="mb-3">
                <label htmlFor="role_id" className="form-label">Rol</label>
                <select
                  name="role_id"
                  id="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className={`form-select ${errors.role_id ? 'is-invalid' : ''}`}
                  required
                  disabled={loading || filteredRoles.length === 0}
                >
                  <option value="">
                    {filteredRoles.length === 0 
                      ? 'Rol təyini üçün icazəniz yoxdur' 
                      : 'Rol seçin'}
                  </option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.display_name || role.name}
                    </option>
                  ))}
                </select>
                {filteredRoles.length === 0 && (
                  <div className="form-text text-warning">
                    Sizə yeni istifadəçi yaratmaq üçün icazə verilməyib
                  </div>
                )}
                {errors.role_id && <div className="invalid-feedback">{errors.role_id}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="institution_id">Təşkilat</label>
                <select
                  id="institution_id"
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleInputChange}
                >
                  <option value="">Təşkilat seçin</option>
                  {institutions.map(institution => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name} ({institution.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="department_id">Şöbə</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                disabled={!formData.institution_id}
              >
                <option value="">
                  {!formData.institution_id 
                    ? 'Əvvəlcə təşkilat seçin' 
                    : 'Şöbə seçin (ixtiyari)'}
                </option>
                {filteredDepartments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.department_type})
                  </option>
                ))}
              </select>
              {formData.institution_id && filteredDepartments.length === 0 && (
                <div className="form-text">
                  Bu təşkilatda hələ şöbə yaradılmayıb
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Şəxsi Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name">Ad *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={errors.first_name ? 'error' : ''}
                  placeholder="Ad"
                />
                {errors.first_name && <span className="field-error">{errors.first_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Soyad *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={errors.last_name ? 'error' : ''}
                  placeholder="Soyad"
                />
                {errors.last_name && <span className="field-error">{errors.last_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="patronymic">Ata adı</label>
                <input
                  type="text"
                  id="patronymic"
                  name="patronymic"
                  value={formData.patronymic}
                  onChange={handleInputChange}
                  placeholder="Ata adı"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birth_date">Doğum tarixi</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Cins</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Seçin</option>
                  <option value="male">Kişi</option>
                  <option value="female">Qadın</option>
                  <option value="other">Digər</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">Telefon</label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="+994 XX XXX XX XX"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span className="checkbox-label">İstifadəçi aktiv olsun</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Ləğv et
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Yaradılır...' : 'İstifadəçi yarat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateForm;