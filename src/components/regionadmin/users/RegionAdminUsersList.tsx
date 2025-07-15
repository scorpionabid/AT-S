import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UserCreateForm from './forms/UserCreateForm';
import UserEditForm from './forms/UserEditForm';
import LoadingSpinner from '../../common/LoadingSpinner';
import { EmptyState } from '../../common/EmptyState';
import '../../../styles/regionadmin-users.css';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
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

interface UsersResponse {
  users: User[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const RegionAdminUsersList: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    institution_id: '',
    department_id: '',
    status: ''
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/regionadmin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('İstifadəçilər yüklənə bilmədi');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchUsers();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleEdit = (userData: User) => {
    setSelectedUser(userData);
    setShowEditForm(true);
  };

  const handleDelete = async (userData: User) => {
    if (!confirm(`"${userData.username}" istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/users/${userData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İstifadəçi silinə bilmədi');
      }

      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xəta baş verdi');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRoleDisplayName = (userRoles: Role[]): string => {
    if (userRoles.length === 0) return 'Rol Yoxdur';
    return userRoles[0].display_name;
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

  const getUserStatusBadge = (isActive: boolean, lastLogin: string | null) => {
    if (!isActive) {
      return <span className="status-badge inactive">Deaktiv</span>;
    }
    
    if (!lastLogin) {
      return <span className="status-badge new">Yeni</span>;
    }
    
    const loginDate = new Date(lastLogin);
    const daysSinceLogin = Math.floor((Date.now() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLogin <= 7) {
      return <span className="status-badge active">Aktiv</span>;
    } else if (daysSinceLogin <= 30) {
      return <span className="status-badge idle">Passiv</span>;
    } else {
      return <span className="status-badge dormant">Dormant</span>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-container">
        <LoadingSpinner size="lg" text="İstifadəçilər yüklənir..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={() => fetchUsers()} className="retry-btn">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="header-content">
          <h2>İstifadəçi İdarəetməsi</h2>
          <p>Regional istifadəçiləri yaradın və idarə edin</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-btn"
        >
          ➕ Yeni İstifadəçi
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Axtarış</label>
            <input
              type="text"
              placeholder="Ad, email və ya istifadəçi adı..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Rol</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">Bütün rollar</option>
              <option value="regionoperator">Regional Operator</option>
              <option value="sektoradmin">Sektor Admin</option>
              <option value="məktəbadmin">Məktəb Admin</option>
              <option value="müəllim">Müəllim</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Bütün statuslar</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon="👥"
          title="İstifadəçi tapılmadı"
          description="Hələ heç bir istifadəçi yaradılmayıb və ya axtarış şərtlərinə uyğun istifadəçi yoxdur"
          actionLabel="Yeni İstifadəçi Yarat"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>İstifadəçi</th>
                  <th>Rol</th>
                  <th>Təşkilat</th>
                  <th>Şöbə</th>
                  <th>Status</th>
                  <th>Son Giriş</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {(userData.first_name?.[0] || userData.username[0]).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {userData.first_name && userData.last_name 
                              ? `${userData.first_name} ${userData.last_name}`
                              : userData.username
                            }
                          </div>
                          <div className="user-email">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">
                        {getRoleDisplayName(userData.roles)}
                      </span>
                    </td>
                    <td>
                      <div className="institution-info">
                        <div className="institution-name">{userData.institution.name}</div>
                        <div className="institution-type">
                          {getInstitutionTypeDisplay(userData.institution.type)}
                        </div>
                      </div>
                    </td>
                    <td>
                      {userData.department ? (
                        <span className="department-name">{userData.department.name}</span>
                      ) : (
                        <span className="no-department">Şöbə yoxdur</span>
                      )}
                    </td>
                    <td>
                      {getUserStatusBadge(userData.is_active, userData.last_login_at)}
                    </td>
                    <td>
                      <div className="last-login">
                        {userData.last_login_at ? (
                          new Date(userData.last_login_at).toLocaleDateString('az-AZ')
                        ) : (
                          'Heç vaxt'
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          onClick={() => handleEdit(userData)}
                          className="action-btn edit-btn"
                          title="Redaktə Et"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(userData)}
                          className="action-btn delete-btn"
                          title="Sil"
                          disabled={userData.id === user?.id}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchUsers(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="pagination-btn"
              >
                « Əvvəlki
              </button>
              
              <div className="pagination-info">
                Səhifə {pagination.current_page} / {pagination.last_page}
                ({pagination.total} istifadəçi)
              </div>
              
              <button
                onClick={() => fetchUsers(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="pagination-btn"
              >
                Növbəti »
              </button>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserEditForm
              user={selectedUser}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionAdminUsersList;