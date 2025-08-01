import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useRoleBasedData, useRegionalData } from '../../hooks/useRoleBasedData';
import { useAuth } from '../../contexts/AuthContext';
import { User, UsersResponse, Institution } from '../../types/users';
import UserCard from './UserCard';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import UserDeleteConfirm from './UserDeleteConfirm';
import UserStatusConfirm from './UserStatusConfirm';
import UserViewModal from './UserViewModal';

const UsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [sortField, setSortField] = useState<'username' | 'email' | 'created_at' | 'last_login_at'>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [createdFromDate, setCreatedFromDate] = useState('');
  const [createdToDate, setCreatedToDate] = useState('');
  const [lastLoginFromDate, setLastLoginFromDate] = useState('');
  const [lastLoginToDate, setLastLoginToDate] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [statusChangingUser, setStatusChangingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [errorMessage, setError] = useState('');

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 🚀 NEW: Role-based data fetching
  const {
    data: usersResponse,
    loading,
    error,
    refetch: refetchUsers
  } = useRoleBasedData<UsersResponse>({
    endpoint: '/users',
    filters: {
      page: currentPage,
      per_page: 10,
      search: debouncedSearchTerm,
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(institutionFilter && { institution_id: institutionFilter }),
      sort_field: sortField,
      sort_order: sortOrder,
      ...(createdFromDate && { created_from: createdFromDate }),
      ...(createdToDate && { created_to: createdToDate }),
      ...(lastLoginFromDate && { last_login_from: lastLoginFromDate }),
      ...(lastLoginToDate && { last_login_to: lastLoginToDate }),
    },
    dependencies: [
      currentPage, 
      debouncedSearchTerm, 
      roleFilter, 
      statusFilter, 
      institutionFilter,
      sortField,
      sortOrder,
      createdFromDate,
      createdToDate,
      lastLoginFromDate,
      lastLoginToDate
    ]
  });

  // Extract users and pagination from response
  const users = usersResponse?.users || [];
  const totalPages = usersResponse?.meta?.last_page || 1;
  const totalUsers = usersResponse?.meta?.total || 0;

  // 🚀 NEW: Regional institutions fetching - avtomatik olaraq user scope tətbiq edir
  const {
    data: institutionsData
  } = useRegionalData<{institutions?: Institution[]} | Institution[]>('institutions');

  // Set institutions from role-based data
  useEffect(() => {
    if (institutionsData) {
      // Handle different response formats
      let institutionsArray: Institution[] = [];
      
      try {
        if (Array.isArray(institutionsData)) {
          // Direct array
          institutionsArray = institutionsData;
        } else if (institutionsData && typeof institutionsData === 'object') {
          // Check for institutions property
          if ('institutions' in institutionsData && Array.isArray(institutionsData.institutions)) {
            institutionsArray = institutionsData.institutions;
          } else if ('data' in institutionsData && Array.isArray(institutionsData.data)) {
            institutionsArray = institutionsData.data;
          } else if ('id' in institutionsData && 'name' in institutionsData) {
            // Single institution object
            institutionsArray = [institutionsData as any];
          }
        }
        
        console.log('🏢 Setting institutions:', institutionsArray);
        setInstitutions(Array.isArray(institutionsArray) ? institutionsArray : []);
      } catch (error) {
        console.error('❌ Error processing institutions data:', error);
        setInstitutions([]);
      }
    } else {
      // Ensure institutions is always an array
      setInstitutions([]);
    }
  }, [institutionsData]);

  const handleStatusToggle = (user: User) => {
    setStatusChangingUser(user);
  };

  const confirmStatusChange = async () => {
    if (!statusChangingUser) return;

    try {
      setStatusLoading(true);
      await api.put(`/users/${statusChangingUser.id}`, {
        is_active: !statusChangingUser.is_active
      });
      setStatusChangingUser(null);
      // 🚀 NEW: Use refetch instead of manual fetchUsers
      refetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Status dəyişdirilərkən xəta baş verdi');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUserDelete = (user: User) => {
    setDeletingUser(user);
  };

  const confirmUserDelete = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/users/${deletingUser.id}`);
      setDeletingUser(null);
      // 🚀 NEW: Use refetch instead of manual fetchUsers
      refetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'İstifadəçi silinərkən xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Heç vaxt';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role: User['role']) => {
    if (!role || !role.name) return 'Təyin edilməyib';
    
    const roleNames: { [key: string]: string } = {
      'superadmin': 'Super Administrator',
      'regionadmin': 'Regional Administrator',
      'schooladmin': 'School Administrator',
      'müəllim': 'Müəllim',
      'regionoperator': 'Regional Operator'
    };
    
    return role.display_name || roleNames[role.name] || role.name;
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // 🚀 NEW: Use refetch instead of manual fetchUsers
    refetchUsers();
  };

  const handleEditSuccess = () => {
    setEditingUserId(null);
    // 🚀 NEW: Use refetch instead of manual fetchUsers
    refetchUsers();
  };

  // Modal handlers
  const handleUserView = (user: User) => {
    setViewingUser(user);
  };

  const handleEditFromView = () => {
    if (viewingUser) {
      setEditingUserId(viewingUser.id);
      setViewingUser(null);
    }
  };

  const handleDeleteFromView = () => {
    if (viewingUser) {
      setDeletingUser(viewingUser);
      setViewingUser(null);
    }
  };

  const handleStatusToggleFromView = () => {
    if (viewingUser) {
      setStatusChangingUser(viewingUser);
      setViewingUser(null);
    }
  };

  // Sort handlers
  const handleAlphabetSort = (field: 'username' | 'email' | 'created_at' | 'last_login_at', order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setInstitutionFilter('');
    setCreatedFromDate('');
    setCreatedToDate('');
    setLastLoginFromDate('');
    setLastLoginToDate('');
    setSortField('username');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>İstifadəçilər yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-list">

      {(error || errorMessage) && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error || errorMessage}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Enhanced Sort Controls */}
      <div className="sort-controls">
        <label>Sıralama:</label>
        <div className="sort-buttons">
          <button 
            className={`sort-btn ${sortField === 'username' && sortOrder === 'asc' ? 'active' : ''}`}
            onClick={() => handleAlphabetSort('username', 'asc')}
          >
            👤 A-Z
          </button>
          <button 
            className={`sort-btn ${sortField === 'username' && sortOrder === 'desc' ? 'active' : ''}`}
            onClick={() => handleAlphabetSort('username', 'desc')}
          >
            👤 Z-A  
          </button>
          <button 
            className={`sort-btn ${sortField === 'email' && sortOrder === 'asc' ? 'active' : ''}`}
            onClick={() => handleAlphabetSort('email', 'asc')}
          >
            📧 A-Z
          </button>
          <button 
            className={`sort-btn ${sortField === 'created_at' && sortOrder === 'desc' ? 'active' : ''}`}
            onClick={() => handleAlphabetSort('created_at', 'desc')}
          >
            📅 Yeni
          </button>
          <button 
            className={`sort-btn ${sortField === 'last_login_at' && sortOrder === 'desc' ? 'active' : ''}`}
            onClick={() => handleAlphabetSort('last_login_at', 'desc')}
          >
            🔄 Son Giriş
          </button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      <div className="enhanced-filters">
        <div className="filter-grid">
          {/* Combined Search */}
          <div className="form-group">
            <label htmlFor="search">🔍 Axtarış</label>
            <input
              id="search"
              type="text"
              placeholder="İstifadəçi adı, email, ad və ya təşkilat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Role Filter */}
          <div className="form-group">
            <label htmlFor="role">👥 Rol</label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">İstənəc rol</option>
              <option value="superadmin">Super Administrator</option>
              <option value="regionadmin">Regional Administrator</option>
              <option value="schooladmin">School Administrator</option>
              <option value="müəllim">Müəllim</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label htmlFor="status">⚙️ Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">İstənəc status</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </div>

          {/* Institution Filter */}
          <div className="form-group">
            <label htmlFor="institution">🏢 Təşkilat</label>
            <select
              id="institution"
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">İstənəc təşkilat</option>
              {(institutions || []).map(institution => (
                <option key={institution.id} value={institution.id}>
                  {institution.name} ({institution.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="created-from">📅 Qeydiyyat tarixi (başlanğıc)</label>
            <input
              id="created-from"
              type="date"
              value={createdFromDate}
              onChange={(e) => setCreatedFromDate(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="created-to">📅 Qeydiyyat tarixi (son)</label>
            <input
              id="created-to"
              type="date"
              value={createdToDate}
              onChange={(e) => setCreatedToDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-from">🔄 Son giriş (başlanğıc)</label>
            <input
              id="login-from"
              type="date"
              value={lastLoginFromDate}
              onChange={(e) => setLastLoginFromDate(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="login-to">🔄 Son giriş (son)</label>
            <input
              id="login-to"
              type="date"
              value={lastLoginToDate}
              onChange={(e) => setLastLoginToDate(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button 
            onClick={resetFilters}
            className="reset-filters-btn"
          >
            🔄 Filterləri Sıfırla
          </button>
          <button 
            className="add-user-button"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Yeni İstifadəçi
          </button>
        </div>
      </div>

      <div className="users-grid">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onView={handleUserView}
            onEdit={(user) => setEditingUserId(user.id)}
            onDelete={handleUserDelete}
            onStatusToggle={handleStatusToggle}
          />
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="no-users">
          <p>Heç bir istifadəçi tapılmadı</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            {totalUsers} istifadəçidən {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalUsers)} arası göstərilir
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ⏮️ İlk
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ◀️ Əvvəlki
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ▶️ Növbəti
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              ⏭️ Son
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <UserCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {viewingUser && (
        <UserViewModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={handleEditFromView}
          onDelete={handleDeleteFromView}
          onStatusToggle={handleStatusToggleFromView}
        />
      )}

      {editingUserId && (
        <UserEditForm
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingUser && (
        <UserDeleteConfirm
          user={deletingUser}
          onConfirm={confirmUserDelete}
          onCancel={() => setDeletingUser(null)}
          loading={deleteLoading}
        />
      )}

      {statusChangingUser && (
        <UserStatusConfirm
          user={statusChangingUser}
          onConfirm={confirmStatusChange}
          onCancel={() => setStatusChangingUser(null)}
          loading={statusLoading}
        />
      )}
    </div>
  );
};

export default UsersList;