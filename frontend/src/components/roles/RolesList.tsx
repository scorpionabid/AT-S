import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/shared';
import RoleCreateForm from './RoleCreateForm';
import RoleEditForm from './RoleEditForm';

interface RolesResponse {
  roles: Role[];
}

const RolesList: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles?guard=api');
      const data: RolesResponse = response.data;
      setRoles(data.roles);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rol məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === '' || role.level.toString() === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const canManageRoles = () => {
    // Check both new roles array and legacy role field for backward compatibility
    const hasRoleInArray = user?.roles?.includes('superadmin');
    const legacyRoleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
    const hasLegacyRole = legacyRoleName === 'superadmin';
    
    // Debug logging
    console.log('canManageRoles debug:', {
      user: user,
      userRoles: user?.roles,
      hasRoleInArray,
      legacyRole: user?.role,
      legacyRoleName,
      hasLegacyRole,
      canManage: hasRoleInArray || hasLegacyRole
    });
    
    return hasRoleInArray || hasLegacyRole;
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchRoles();
  };

  const handleEditClick = (roleId: number) => {
    setEditingRoleId(roleId);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingRoleId(null);
    fetchRoles();
  };

  const getRoleLevelName = (level: number) => {
    const levelNames: { [key: number]: string } = {
      1: 'System Level',
      2: 'Regional Level',
      3: 'Operational Level',
      4: 'Sector Level',
      5: 'Institution Level',
      6: 'Staff Level'
    };
    return levelNames[level] || `Level ${level}`;
  };

  const formatPermissionCount = (permissions: string[]) => {
    const count = permissions.length;
    return `${count} icazə`;
  };

  const getRoleIcon = (level: number) => {
    const icons: { [key: number]: string } = {
      1: '👑', // System Level
      2: '🏛️', // Regional Level  
      3: '⚙️', // Operational Level
      4: '📋', // Sector Level
      5: '🏢', // Institution Level
      6: '👥'  // Staff Level
    };
    return icons[level] || '🔸';
  };

  const getRoleStats = (roleName: string) => {
    // Mock data - bu real API-dən gələcək
    const mockStats: { [key: string]: number } = {
      'superadmin': 1,
      'regionadmin': 5,
      'schooladmin': 12,
      'müəllim': 45,
      'regionoperator': 8,
      'sectordirector': 3
    };
    return mockStats[roleName] || 0;
  };

  // Debug log for component render
  console.log('RolesList component render:', {
    loading,
    user,
    userRoles: user?.roles,
    canManage: user ? canManageRoles() : 'no user'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Rol məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Rol İdarəetməsi</h1>
            <p className="mt-1 text-gray-500">Sistem rollərini və icazələrini idarə edin</p>
          </div>
          {canManageRoles() && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="mr-2">+</span> Yeni Rol Əlavə Et
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r">
          <div className="flex items-center">
            <span className="text-red-600 mr-3">⚠️</span>
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-600 hover:text-red-800 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rol adı ilə axtarın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Bütün səviyyələr</option>
            <option value="1">System Level</option>
            <option value="2">Regional Level</option>
            <option value="3">Operational Level</option>
            <option value="4">Sector Level</option>
            <option value="5">Institution Level</option>
            <option value="6">Staff Level</option>
          </select>
        </div>

        {canManageRoles() && (
          <button 
            className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowCreateForm(true)}
          >
            <span className="mr-1">+</span> Yeni Rol
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getRoleIcon(role.level)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{role.display_name}</h3>
                  </div>
                  <span className="text-sm text-gray-500">({role.name})</span>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.level === 1 ? 'bg-red-100 text-red-800' :
                      role.level === 2 ? 'bg-blue-100 text-blue-800' :
                      role.level === 3 ? 'bg-green-100 text-green-800' :
                      role.level === 4 ? 'bg-yellow-100 text-yellow-800' :
                      role.level === 5 ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getRoleLevelName(role.level)}
                    </span>
                    
                    {getRoleStats(role.name) > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        👥 {getRoleStats(role.name)} istifadəçi
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {canManageRoles() && (
                    <button 
                      onClick={() => handleEditClick(role.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Redaktə et"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 text-sm">
                  {role.description || 'Təsvir mövcud deyil'}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{formatPermissionCount(role.permissions)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {role.permissions.slice(0, 4).map((permission) => (
                      <span 
                        key={permission} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {permission.split('.')[1] || permission}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{role.permissions.length - 4} daha
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">🔒</span>
                      <span className="text-gray-600 truncate">{role.guard_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">📅</span>
                      <span className="text-gray-600">
                        {new Date(role.created_at).toLocaleDateString('az-AZ')}
                      </span>
                    </div>
                    {getRoleStats(role.name) > 0 && (
                      <div className="flex items-center col-span-2">
                        <span className="text-gray-500 mr-2">👥</span>
                        <span className="text-gray-600">
                          {getRoleStats(role.name)} istifadəçi bu roldadır
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && !loading && (
        <div className="no-roles">
          <p>Heç bir rol tapılmadı</p>
          {canManageRoles() && (
            <button 
              className="create-first-role"
              onClick={() => setShowCreateForm(true)}
            >
              İlk rolu yaradın
            </button>
          )}
        </div>
      )}

      {/* Role Create Modal */}
      {showCreateForm && (
        <RoleCreateForm 
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Role Edit Modal */}
      {showEditForm && editingRoleId && (
        <RoleEditForm 
          roleId={editingRoleId}
          onClose={() => {
            setShowEditForm(false);
            setEditingRoleId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default RolesList;