import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { roleServiceDynamic, Role } from '../../services/roleServiceDynamic';

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

interface UserEditData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
  institution_id: string;
  departments: string[];
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string;
  gender: string;
  contact_phone: string;
  is_active: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number | null;
  institution_id: number | null;
  departments: string[];
  first_name: string | null;
  last_name: string | null;
  patronymic: string | null;
  birth_date: string | null;
  gender: string | null;
  contact_phone: string | null;
  is_active: boolean;
}

interface UserEditFormProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({ userId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserEditData>({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    institution_id: '',
    departments: [],
    first_name: '',
    last_name: '',
    patronymic: '',
    birth_date: '',
    gender: '',
    contact_phone: '',
    is_active: true
  });

  const [, setOriginalUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [changePassword, setChangePassword] = useState(false);

  const departmentOptions = [
    'maliyyə',
    'təsərrüfat', 
    'təhsil',
    'statistika',
    'qiymətləndirmə',
    'idarəetmə'
  ];

  useEffect(() => {
    fetchInitialData();
  }, [userId]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        fetchUser(),
        fetchRoles(),
        fetchInstitutions()
      ]);
    } catch (error) {
      console.error('Initial data fetch error:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      const user: User = response.data.user;
      setOriginalUser(user);
      
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        password_confirmation: '',
        role_id: user.role_id?.toString() || '',
        institution_id: user.institution_id?.toString() || '',
        departments: user.departments || [],
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        patronymic: user.patronymic || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        contact_phone: user.contact_phone || '',
        is_active: user.is_active
      });
    } catch (error) {
      console.error('User fetch error:', error);
      setErrors({ general: 'İstifadəçi məlumatları yüklənərkən xəta baş verdi' });
    }
  };

  const fetchRoles = async () => {
    try {
      // Use dynamic role service to get all roles for editing
      const allRoles = await roleServiceDynamic.getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('Roles fetch error:', error);
      setRoles([]);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions?per_page=100');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Institutions fetch error:', error);
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

  const handleDepartmentChange = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
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

    // Password validation only if changing password
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Şifrə mütləqdir';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Şifrə ən azı 8 simvol olmalıdır';
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Şifrələr uyğun gəlmir';
      }
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
      const updateData = { ...formData };
      
      // Remove password fields if not changing password
      if (!changePassword) {
        delete (updateData as any).password;
        delete (updateData as any).password_confirmation;
      }

      await api.put(`/users/${userId}`, updateData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'İstifadəçi yenilənərkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: Role) => {
    // Use the role service for consistent display names
    return roleServiceDynamic.getRoleDisplayName(role.name) || role.display_name || role.name;
  };

  if (initialLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="users-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>İstifadəçi məlumatları yüklənir...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content user-create-modal">
        <div className="modal-header">
          <h2>İstifadəçini Redaktə Edin</h2>
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
            </div>

            <div className="form-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        password: '',
                        password_confirmation: ''
                      }));
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.password;
                        delete newErrors.password_confirmation;
                        return newErrors;
                      });
                    }
                  }}
                />
                <span className="checkbox-label">Şifrəni dəyişdirmək istəyirəm</span>
              </label>
            </div>

            {changePassword && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="password">Yeni şifrə *</label>
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
            )}
          </div>

          <div className="form-section">
            <h3>Rol və Təşkilat</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="role_id">Rol *</label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className={errors.role_id ? 'error' : ''}
                >
                  <option value="">Rol seçin</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
                {errors.role_id && <span className="field-error">{errors.role_id}</span>}
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
              <label>Departmentlər</label>
              <div className="checkbox-grid">
                {departmentOptions.map(dept => (
                  <label key={dept} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept)}
                      onChange={() => handleDepartmentChange(dept)}
                    />
                    <span className="checkbox-label">{dept}</span>
                  </label>
                ))}
              </div>
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
              {loading ? 'Yenilənir...' : 'Dəyişiklikləri yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;