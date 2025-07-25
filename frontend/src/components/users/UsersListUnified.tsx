import React from 'react';
import { useCRUD } from '../../hooks';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import '../../styles/users.css';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  institution_id: number;
  institution_name?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface UsersListProps {
  // Optional filters from parent
  initialFilters?: Record<string, any>;
}

const UsersListUnified: React.FC<UsersListProps> = ({ 
  initialFilters = {} 
}) => {
  // Use our CRUD hook for all list operations
  const {
    // Data state
    data: users,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalCount,
    
    // Filters & Search
    searchTerm,
    filters,
    
    // Modal states
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingItem: editingUser,
    deletingItem: deletingUser,
    
    // Actions
    setCurrentPage,
    setSearchTerm,
    updateFilter,
    clearFilters,
    
    // CRUD Operations
    deleteItem,
    
    // Modal controls
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
    
    // Bulk operations
    bulkDelete,
    
    // Refresh
    refetch
  } = useCRUD<User>({
    apiEndpoint: '/users',
    initialFilters,
    pageSize: 10,
    onError: (error) => console.error('Users error:', error),
    onSuccess: (message) => console.log('Users success:', message)
  });

  // Handle status toggle
  const handleStatusToggle = async (user: User) => {
    try {
      const response = await fetch(`/users/${user.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        refetch(); // Refresh data
      }
    } catch (error) {
      console.error('Status toggle error:', error);
    }
  };

  // Bulk action handlers
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([]);
  
  const handleSelectUser = (userId: number, selected: boolean) => {
    if (selected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUserIds(users.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkDelete = async (soft: boolean = true) => {
    if (selectedUserIds.length === 0) return;
    
    try {
      await bulkDelete(selectedUserIds, soft);
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
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
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">İstifadəçi İdarəsi</h1>
          <p className="page-description">
            Sistemdə qeydiyyatdan keçmiş bütün istifadəçiləri idarə edin
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={openCreateModal}
            className="add-user-button btn-base btn-primary"
          >
            <span className="btn-icon">+</span>
            Yeni İstifadəçi
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => refetch()} 
            className="error-close"
            title="Yenidən yüklə"
          >
            ↻
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="users-controls">
        <div className="users-filters">
          {/* Search */}
          <div className="search-form">
            <input
              type="text"
              placeholder="İstifadəçi axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role || ''}
            onChange={(e) => updateFilter('role', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">Bütün rollar</option>
            <option value="superadmin">Super Admin</option>
            <option value="regionadmin">Region Admin</option>
            <option value="schooladmin">Məktəb Admin</option>
            <option value="müəllim">Müəllim</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.is_active || ''}
            onChange={(e) => updateFilter('is_active', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">Bütün statuslar</option>
            <option value="1">Aktiv</option>
            <option value="0">Deaktiv</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="btn-base btn-secondary"
          >
            Filtrləri Təmizlə
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUserIds.length > 0 && (
        <div className="bulk-actions">
          <p>{selectedUserIds.length} istifadəçi seçildi</p>
          <div className="bulk-action-buttons">
            <button
              onClick={() => handleBulkDelete(true)}
              className="btn-base btn-warning"
            >
              Seçilənləri Arxivlə
            </button>
            <button
              onClick={() => handleBulkDelete(false)}
              className="btn-base btn-danger"
            >
              Seçilənləri Sil
            </button>
            <button
              onClick={() => setSelectedUserIds([])}
              className="btn-base btn-secondary"
            >
              Seçimi Ləğv Et
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUserIds.length === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                  />
                </td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="username">{user.name} {user.surname}</div>
                      <div className="user-id">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.institution_name || '-'}</td>
                <td>
                  <button
                    onClick={() => handleStatusToggle(user)}
                    className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
                  >
                    {user.is_active ? 'Aktiv' : 'Deaktiv'}
                  </button>
                </td>
                <td>
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString('az-AZ')
                    : 'Heç vaxt'
                  }
                </td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => openEditModal(user)}
                      className="action-button edit"
                      title="Düzəliş et"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="action-button delete"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-users">
            <p>Heç bir istifadəçi tapılmadı</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            {totalCount} istifadəçidən {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalCount)} arası göstərilir
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Əvvəlki
            </button>
            
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Növbəti
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <UserCreateForm
          onClose={closeModals}
          onSuccess={refetch}
        />
      )}

      {showEditModal && editingUser && (
        <UserEditForm
          userId={editingUser.id}
          onClose={closeModals}
          onSuccess={refetch}
        />
      )}

      {showDeleteModal && deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content user-delete-modal">
            <div className="delete-confirm-content">
              <div className="warning-icon">⚠️</div>
              <div className="confirm-message">
                <h3>İstifadəçini silmək istədiyinizə əminsiniz?</h3>
                <p>Bu əməliyyat geri qaytarıla bilməz.</p>
                
                <div className="user-info-box">
                  <div className="user-detail">
                    <span className="label">Ad:</span>
                    <span className="value">{deletingUser.name} {deletingUser.surname}</span>
                  </div>
                  <div className="user-detail">
                    <span className="label">Email:</span>
                    <span className="value">{deletingUser.email}</span>
                  </div>
                  <div className="user-detail">
                    <span className="label">Rol:</span>
                    <span className="value">{deletingUser.role}</span>
                  </div>
                </div>

                <div className="warning-text">
                  <strong>Diqqət:</strong> Bu istifadəçinin bütün fəaliyyətləri və məlumatları silinəcək.
                </div>
              </div>
              
              <div className="form-button-group">
                <button
                  onClick={closeModals}
                  className="btn-base btn-secondary"
                >
                  Ləğv et
                </button>
                <button
                  onClick={() => deleteItem(deletingUser.id, true)}
                  className="btn-base btn-warning"
                >
                  Arxivlə
                </button>
                <button
                  onClick={() => deleteItem(deletingUser.id, false)}
                  className="btn-base btn-danger"
                >
                  Tam Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersListUnified;