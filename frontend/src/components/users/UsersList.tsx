import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import UserDeleteConfirm from './UserDeleteConfirm';
import UserStatusConfirm from './UserStatusConfirm';
import UserViewModal from './UserViewModal';
import '../../styles/users.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: {
    id: number | null;
    name: string | null;
    display_name: string | null;
    level: number | null;
  } | null;
  role_display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  institution: {
    id: number | null;
    name: string | null;
  };
  created_at: string;
}

interface UsersResponse {
  users: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
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
  const [institutions, setInstitutions] = useState<{id: number, name: string, type: string}[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [statusChangingUser, setStatusChangingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(institutionFilter && { institution: institutionFilter }),
        ...(sortField && { sort: sortField }),
        ...(sortOrder && { order: sortOrder }),
        ...(createdFromDate && { created_from: createdFromDate }),
        ...(createdToDate && { created_to: createdToDate }),
        ...(lastLoginFromDate && { last_login_from: lastLoginFromDate }),
        ...(lastLoginToDate && { last_login_to: lastLoginToDate })
      });

      const response = await api.get(`/users?${params}`);
      const data: UsersResponse = response.data;
      
      setUsers(data.users);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.last_page);
      setTotalUsers(data.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/users/institutions/available');
      setInstitutions(response.data.institutions);
    } catch (err: any) {
      console.error('Institutions loading error:', err);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter, institutionFilter, sortField, sortOrder, createdFromDate, createdToDate, lastLoginFromDate, lastLoginToDate]);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Search debouncingdə avtomatik işləyir, manual search lazım deyil
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setCurrentPage(1);
  //   fetchUsers(1);
  // };

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
      fetchUsers(currentPage);
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
      fetchUsers(currentPage);
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
    fetchUsers(currentPage);
  };

  const handleEditSuccess = () => {
    setEditingUserId(null);
    fetchUsers(currentPage);
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
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">İstifadəçi İdarəetməsi</h1>
          <p className="page-description">Sistem istifadəçilərini idarə edin</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowCreateForm(true)}
            className="add-user-button btn-with-icon"
          >
            <span className="btn-icon">➕</span>
            Yeni İstifadəçi
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
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
              {institutions.map(institution => (
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

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>İstifadəçi</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Təşkilat</th>
              <th>Status</th>
              <th>Son Giriş</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="user-id">ID: {user.id}</span>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role?.name || 'no-role'}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </td>
                <td>{user.institution?.name || 'Təyin edilməyib'}</td>
                <td>
                  <button
                    onClick={() => handleStatusToggle(user)}
                    className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
                  >
                    {user.is_active ? '✅ Aktiv' : '❌ Deaktiv'}
                  </button>
                </td>
                <td>{formatDate(user.last_login_at)}</td>
                <td>
                  <div className="actions">
                    <button 
                      className="action-button view" 
                      title="Məlumatları gör"
                      onClick={() => handleUserView(user)}
                    >
                      👁️
                    </button>
                    <button 
                      className="action-button edit" 
                      title="Redaktə et"
                      onClick={() => setEditingUserId(user.id)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-button delete" 
                      title="Sil"
                      onClick={() => handleUserDelete(user)}
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