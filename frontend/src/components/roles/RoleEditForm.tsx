import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: string[];
}

interface RoleEditData {
  display_name: string;
  description: string;
  level: number;
  permissions: string[];
}

interface RoleEditFormProps {
  roleId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleEditForm: React.FC<RoleEditFormProps> = ({ roleId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<RoleEditData>({
    display_name: '',
    description: '',
    level: 1,
    permissions: []
  });

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const levelOptions = [
    { value: 1, label: 'System Level - Sistem İdarəetməsi' },
    { value: 2, label: 'Regional Level - Regional İdarəetmə' },
    { value: 3, label: 'Operational Level - Əməliyyat İdarəetməsi' },
    { value: 4, label: 'Sector Level - Sektor İdarəetməsi' },
    { value: 5, label: 'Institution Level - Təşkilat İdarəetməsi' },
    { value: 6, label: 'Staff Level - Personalın İdarəetməsi' }
  ];

  useEffect(() => {
    fetchRole();
    fetchPermissions();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/roles/${roleId}`);
      const roleData = response.data.role;
      setRole(roleData);
      
      setFormData({
        display_name: roleData.display_name || '',
        description: roleData.description || '',
        level: roleData.level || 1,
        permissions: roleData.permissions || []
      });
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || 'Rol məlumatları yüklənərkən xəta baş verdi'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.permissions || []);
    } catch (error) {
      console.error('Permissions fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'level') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
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

  const handlePermissionChange = (permissionName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Göstəriş adı mütləqdir';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Təsvir mütləqdir';
    }

    if (formData.level < 1 || formData.level > 6) {
      newErrors.level = 'Səviyyə 1-6 arasında olmalıdır';
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
      const response = await api.put(`/roles/${roleId}`, formData);
      console.log('Role updated successfully:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Role update error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Rol yenilənərkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      const category = permission.name.split('.')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(permission);
    });

    return categories;
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'users': 'İstifadəçi İdarəetməsi',
      'roles': 'Rol İdarəetməsi',
      'institutions': 'Təşkilat İdarəetməsi',
      'surveys': 'Sorğu İdarəetməsi',
      'schedules': 'Cədvəl İdarəetməsi',
      'grades': 'Qiymət İdarəetməsi',
      'attendance': 'Davamiyyət İdarəetməsi'
    };
    return categoryNames[category] || category;
  };

  const isSystemRole = () => {
    return role?.name === 'superadmin' || role?.level === 1;
  };

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-700">Rol məlumatları yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-screen-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Rolu Redaktə Et: {role?.display_name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            aria-label="Bağla"
          >
            &times;
          </button>
        </div>

        {errors.general && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex items-center">
              <span className="text-red-600 mr-3">⚠️</span>
              <span className="text-red-700">{errors.general}</span>
            </div>
          </div>
        )}

        {isSystemRole() && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-3">⚠️</span>
              <span className="text-yellow-700">Bu sistem rolu həssasdır. Dəyişiklikləri diqqətlə edin.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Əsas Məlumatlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Rol Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={role?.name || ''}
                  disabled
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 focus:outline-none sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Rol adı dəyişdirilə bilməz</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                  Göstəriş Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.display_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                  placeholder="Role Display Name"
                />
                {errors.display_name && <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Rol Səviyyəsi <span className="text-red-500">*</span>
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  disabled={isSystemRole()}
                  className={`block w-full px-3 py-2 border ${
                    errors.level ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm ${isSystemRole() ? 'bg-gray-100 text-gray-600' : ''}`}
                >
                  {levelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
                {isSystemRole() && (
                  <p className="mt-1 text-xs text-gray-500">Sistem rolların səviyyəsi dəyişdirilə bilməz</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Təsvir <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`block w-full px-3 py-2 border ${
                    errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                  placeholder="Bu rolun məqsədi və məsuliyyətlərini təsvir edin"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">İcazələr</h3>
              <p className="text-sm text-gray-600">Bu rola verilmək istədiyiniz icazələri seçin</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => {
              const selectedInCategory = categoryPermissions.filter(p => formData.permissions.includes(p.name)).length;
              const totalInCategory = categoryPermissions.length;
              const allSelected = categoryPermissions.every(p => formData.permissions.includes(p.name));
              
              return (
                <div key={category} className="space-y-2 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {getCategoryDisplayName(category)}
                      <span className="ml-2 text-xs text-gray-500">({selectedInCategory}/{totalInCategory})</span>
                    </h4>
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        if (allSelected) {
                          setFormData(prev => ({
                            ...prev,
                            permissions: prev.permissions.filter(p => !categoryPermissions.map(cp => cp.name).includes(p))
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            permissions: [...new Set([...prev.permissions, ...categoryPermissions.map(cp => cp.name)])]
                          }));
                        }
                      }}
                      disabled={isSystemRole()}
                    >
                      {allSelected ? 'Heç birini seçmə' : 'Hamısını seç'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {categoryPermissions.map(permission => (
                      <label key={permission.id} className="flex items-start p-2 rounded-md hover:bg-gray-50">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.name)}
                            onChange={() => handlePermissionChange(permission.name)}
                            disabled={isSystemRole() && role?.permissions.includes(permission.name)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <div className="font-medium text-gray-700">
                            {permission.name}
                            {isSystemRole() && role?.permissions.includes(permission.name) && (
                              <span className="ml-2 text-xs text-yellow-600">(Sistem icazəsi)</span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yenilənir...
                </>
              ) : 'Yenilə'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleEditForm;