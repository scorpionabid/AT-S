import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/Loading';
import { RoleGuard } from '../../common/access/RoleGuard';
import { FiSave, FiRefreshCw, FiSettings, FiUsers, FiEye, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

interface Permission {
  id: number;
  name: string;
  display_name: string;
  category: string;
  description: string;
  resource: string;
  action: string;
  is_active: boolean;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  level: number;
  permissions: Permission[];
  is_active: boolean;
}

interface PermissionMatrixData {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
}

/**
 * SuperAdmin üçün Permission Matrix - rollara görə səlahiyyətləri idarə etmək
 * Yalnız SuperAdmin görə və idarə edə bilər
 */
const PermissionMatrix: React.FC = () => {
  const { user } = useAuth();
  const [matrixData, setMatrixData] = useState<PermissionMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [changes, setChanges] = useState<Record<string, Record<string, boolean>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPermissionMatrix();
  }, []);

  const fetchPermissionMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching permission matrix...');
      const response = await api.get('/admin/permissions/matrix');
      
      const data: PermissionMatrixData = response.data;
      setMatrixData(data);
      
      console.log('✅ Permission matrix loaded:', data);
    } catch (err: any) {
      console.error('❌ Permission matrix fetch error:', err);
      setError(err.response?.data?.message || 'Permission matrix yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId: number, permissionId: number, hasPermission: boolean) => {
    const roleKey = roleId.toString();
    const permissionKey = permissionId.toString();
    
    setChanges(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permissionKey]: !hasPermission
      }
    }));
    
    setHasUnsavedChanges(true);
    
    console.log('🔄 Permission toggle:', {
      roleId,
      permissionId,
      oldValue: hasPermission,
      newValue: !hasPermission
    });
  };

  const saveChanges = async () => {
    if (!hasUnsavedChanges || Object.keys(changes).length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('💾 Saving permission changes:', changes);
      
      await api.post('/admin/permissions/matrix/update', {
        changes: changes
      });

      // Refresh data
      await fetchPermissionMatrix();
      
      // Clear changes
      setChanges({});
      setHasUnsavedChanges(false);
      
      console.log('✅ Permission changes saved successfully');
    } catch (err: any) {
      console.error('❌ Permission save error:', err);
      setError(err.response?.data?.message || 'Dəyişikliklər saxlanılarkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const hasPermission = (roleId: number, permissionId: number): boolean => {
    const roleKey = roleId.toString();
    const permissionKey = permissionId.toString();
    
    // Check if there's a pending change
    if (changes[roleKey]?.[permissionKey] !== undefined) {
      return changes[roleKey][permissionKey];
    }
    
    // Check original matrix
    return matrixData?.matrix[roleKey]?.[permissionKey] || false;
  };

  const getFilteredPermissions = () => {
    if (!matrixData) return [];
    
    if (selectedCategory === 'all') {
      return matrixData.permissions;
    }
    
    return matrixData.permissions.filter(p => p.category === selectedCategory);
  };

  const getPermissionCategories = () => {
    if (!matrixData) return [];
    
    const categories = [...new Set(matrixData.permissions.map(p => p.category))];
    return categories.sort();
  };

  const getRoleColor = (level: number): string => {
    const colors = {
      1: 'bg-red-100 text-red-800',      // SuperAdmin
      2: 'bg-blue-100 text-blue-800',    // RegionAdmin
      3: 'bg-green-100 text-green-800',  // RegionOperator
      4: 'bg-yellow-100 text-yellow-800', // SektorAdmin
      5: 'bg-purple-100 text-purple-800', // MəktəbAdmin
      6: 'bg-gray-100 text-gray-800'     // Müəllim
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3">Permission Matrix yüklənir...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchPermissionMatrix} variant="outline">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Yenidən Yüklə
          </Button>
        </div>
      </Card>
    );
  }

  if (!matrixData) {
    return null;
  }

  const filteredPermissions = getFilteredPermissions();
  const categories = getPermissionCategories();

  return (
    <RoleGuard roles={['superadmin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Permission Matrix</h2>
            <p className="text-gray-600 mt-1">
              Rollara görə səlahiyyətləri idarə edin
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Saxlanılmamış dəyişikliklər var
              </span>
            )}
            
            <Button
              onClick={fetchPermissionMatrix}
              variant="outline"
              disabled={saving}
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Yenilə
            </Button>
            
            <Button
              onClick={saveChanges}
              variant="primary"
              disabled={!hasUnsavedChanges || saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saxlanılır...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Dəyişiklikləri Saxla
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Kateqoriya:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Bütün Kateqoriyalar</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Permission Matrix Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Səlahiyyət
                  </th>
                  {matrixData.roles.map(role => (
                    <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.level)}`}>
                        {role.display_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Level {role.level}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPermissions.map(permission => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {permission.display_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {permission.category}
                        </div>
                      </div>
                    </td>
                    {matrixData.roles.map(role => {
                      const hasCurrentPermission = hasPermission(role.id, permission.id);
                      const hasChange = changes[role.id.toString()]?.[permission.id.toString()] !== undefined;
                      
                      return (
                        <td key={`${role.id}-${permission.id}`} className="px-3 py-4 text-center">
                          <button
                            onClick={() => handlePermissionToggle(role.id, permission.id, hasCurrentPermission)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                              hasCurrentPermission
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                            } ${
                              hasChange ? 'ring-2 ring-orange-300 ring-offset-2' : ''
                            }`}
                            title={`${hasCurrentPermission ? 'Aktiv' : 'Qeyri-aktiv'} - Dəyişmək üçün klik edin`}
                          >
                            {hasCurrentPermission ? '✓' : ''}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <FiUsers className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">
                  {matrixData.roles.length}
                </div>
                <div className="text-sm text-gray-500">Rollar</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <FiSettings className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">
                  {matrixData.permissions.length}
                </div>
                <div className="text-sm text-gray-500">Səlahiyyətlər</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <FiEdit className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(changes).reduce((total, roleKey) => 
                    total + Object.keys(changes[roleKey]).length, 0
                  )}
                </div>
                <div className="text-sm text-gray-500">Saxlanılmamış Dəyişikliklər</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default PermissionMatrix;