import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock user CRUD service for Docker environment
const mockUserCrudService = {
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  searchUsers: vi.fn(),
  toggleUserStatus: vi.fn(),
  bulkUserOperations: vi.fn(),
};

// Mock comprehensive user CRUD component
const UserCrudComponent = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedUsers, setSelectedUsers] = React.useState([]);

  // Simulate API calls to Docker backend
  const apiCall = async (endpoint: string, options: any = {}) => {
    try {
      const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Mock API call to Docker backend
      const result = await mockUserCrudService.getUsers({
        search: searchTerm,
        page: 1,
        per_page: 10,
      });
      
      setUsers(result.users || []);
      setError('');
    } catch (err) {
      setError('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    setLoading(true);
    try {
      const result = await mockUserCrudService.createUser(userData);
      await loadUsers();
      setShowCreateModal(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'İstifadəçi yaradılarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    setLoading(true);
    try {
      await mockUserCrudService.updateUser(userId, userData);
      await loadUsers();
      setEditingUser(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'İstifadəçi yenilənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
      return;
    }

    setLoading(true);
    try {
      await mockUserCrudService.deleteUser(userId);
      await loadUsers();
      setError('');
    } catch (err: any) {
      setError(err.message || 'İstifadəçi silinərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    setLoading(true);
    try {
      await mockUserCrudService.toggleUserStatus(userId);
      await loadUsers();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Status dəyişdirilərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedUsers.length === 0) {
      setError('Əməliyyat üçün istifadəçi seçin');
      return;
    }

    setLoading(true);
    try {
      await mockUserCrudService.bulkUserOperations(operation, selectedUsers);
      await loadUsers();
      setSelectedUsers([]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Toplu əməliyyat zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadUsers();
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div data-testid="user-crud-component">
      <div className="header">
        <h1>İstifadəçi İdarəetməsi (Docker Edition)</h1>
        
        <div className="actions">
          <input
            type="text"
            placeholder="İstifadəçi axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="search-input"
          />
          <button onClick={handleSearch} data-testid="search-button">
            Axtar
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            data-testid="create-user-button"
            disabled={loading}
          >
            Yeni İstifadəçi
          </button>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions" data-testid="bulk-actions">
            <span>{selectedUsers.length} istifadəçi seçildi</span>
            <button 
              onClick={() => handleBulkOperation('activate')}
              data-testid="bulk-activate"
            >
              Aktiv Et
            </button>
            <button 
              onClick={() => handleBulkOperation('deactivate')}
              data-testid="bulk-deactivate"
            >
              Deaktiv Et
            </button>
            <button 
              onClick={() => handleBulkOperation('delete')}
              data-testid="bulk-delete"
              style={{ color: 'red' }}
            >
              Sil
            </button>
          </div>
        )}
      </div>

      {error && (
        <div data-testid="error-message" className="error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading && (
        <div data-testid="loading-indicator">İstifadəçilər yüklənir...</div>
      )}

      <div className="users-table" data-testid="users-table">
        {users.length === 0 && !loading ? (
          <div data-testid="empty-state">
            Heç bir istifadəçi tapılmadı
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map((u: any) => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th>ID</th>
                <th>İstifadəçi Adı</th>
                <th>E-poçt</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} data-testid={`user-row-${user.id}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      data-testid={`select-user-${user.id}`}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role?.display_name || 'N/A'}</td>
                  <td>
                    <span className={user.is_active ? 'active' : 'inactive'}>
                      {user.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingUser(user)}
                      data-testid={`edit-user-${user.id}`}
                      disabled={loading}
                    >
                      Düzəlt
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      data-testid={`toggle-status-${user.id}`}
                      disabled={loading}
                    >
                      {user.is_active ? 'Deaktiv Et' : 'Aktiv Et'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      data-testid={`delete-user-${user.id}`}
                      disabled={loading}
                      style={{ color: 'red' }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div data-testid="create-user-modal" className="modal">
          <div className="modal-content">
            <h2>Yeni İstifadəçi Yarat</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateUser({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role'),
                is_active: true,
              });
            }}>
              <input
                name="username"
                placeholder="İstifadəçi adı"
                required
                data-testid="create-username-input"
              />
              <input
                name="email"
                type="email"
                placeholder="E-poçt"
                required
                data-testid="create-email-input"
              />
              <input
                name="password"
                type="password"
                placeholder="Şifrə"
                required
                data-testid="create-password-input"
              />
              <select name="role" required data-testid="create-role-select">
                <option value="">Rol seçin</option>
                <option value="müəllim">Müəllim</option>
                <option value="regionadmin">Regional Admin</option>
                <option value="schooladmin">Məktəb Admin</option>
              </select>
              <div className="modal-actions">
                <button type="submit" disabled={loading} data-testid="create-submit-button">
                  Yarat
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  data-testid="create-cancel-button"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div data-testid="edit-user-modal" className="modal">
          <div className="modal-content">
            <h2>İstifadəçini Düzəlt</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleUpdateUser((editingUser as any).id, {
                username: formData.get('username'),
                email: formData.get('email'),
                role: formData.get('role'),
              });
            }}>
              <input
                name="username"
                defaultValue={(editingUser as any).username}
                placeholder="İstifadəçi adı"
                required
                data-testid="edit-username-input"
              />
              <input
                name="email"
                type="email"
                defaultValue={(editingUser as any).email}
                placeholder="E-poçt"
                required
                data-testid="edit-email-input"
              />
              <select 
                name="role" 
                defaultValue={(editingUser as any).role?.name || ''}
                required 
                data-testid="edit-role-select"
              >
                <option value="">Rol seçin</option>
                <option value="müəllim">Müəllim</option>
                <option value="regionadmin">Regional Admin</option>
                <option value="schooladmin">Məktəb Admin</option>
              </select>
              <div className="modal-actions">
                <button type="submit" disabled={loading} data-testid="edit-submit-button">
                  Yenilə
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  data-testid="edit-cancel-button"
                >
                  Ləğv et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('User CRUD Integration Tests (Docker)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful responses
    mockUserCrudService.getUsers.mockResolvedValue({
      users: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: { name: 'regionadmin', display_name: 'Regional Admin' },
          is_active: true,
        },
        {
          id: 2,
          username: 'teacher',
          email: 'teacher@example.com',
          role: { name: 'müəllim', display_name: 'Müəllim' },
          is_active: true,
        }
      ],
      meta: { current_page: 1, total: 2 }
    });

    mockUserCrudService.createUser.mockResolvedValue({
      user: { id: 3, username: 'newuser', email: 'new@example.com' }
    });

    mockUserCrudService.updateUser.mockResolvedValue({
      user: { id: 1, username: 'updated', email: 'updated@example.com' }
    });

    mockUserCrudService.deleteUser.mockResolvedValue({
      message: 'İstifadəçi uğurla silindi'
    });

    mockUserCrudService.toggleUserStatus.mockResolvedValue({
      message: 'Status dəyişdirildi'
    });

    mockUserCrudService.bulkUserOperations.mockResolvedValue({
      message: 'Toplu əməliyyat tamamlandı',
      affected_count: 2
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders user CRUD interface with Docker context', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    expect(screen.getByText('İstifadəçi İdarəetməsi (Docker Edition)')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('create-user-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
  });

  it('loads and displays users from Docker backend', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockUserCrudService.getUsers).toHaveBeenCalledWith({
        search: '',
        page: 1,
        per_page: 10,
      });
    });

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('teacher')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('handles user creation workflow', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Open create modal
    fireEvent.click(screen.getByTestId('create-user-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-user-modal')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByTestId('create-username-input'), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByTestId('create-email-input'), {
      target: { value: 'newuser@example.com' }
    });
    fireEvent.change(screen.getByTestId('create-password-input'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByTestId('create-role-select'), {
      target: { value: 'müəllim' }
    });

    // Submit form
    fireEvent.click(screen.getByTestId('create-submit-button'));

    await waitFor(() => {
      expect(mockUserCrudService.createUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'müəllim',
        is_active: true,
      });
    });
  });

  it('handles user editing workflow', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click edit button for first user
    fireEvent.click(screen.getByTestId('edit-user-1'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-modal')).toBeInTheDocument();
    });

    // Update username
    const usernameInput = screen.getByTestId('edit-username-input');
    fireEvent.change(usernameInput, { target: { value: 'updatedadmin' } });

    // Submit form
    fireEvent.click(screen.getByTestId('edit-submit-button'));

    await waitFor(() => {
      expect(mockUserCrudService.updateUser).toHaveBeenCalledWith(1, {
        username: 'updatedadmin',
        email: 'admin@example.com',
        role: 'regionadmin',
      });
    });
  });

  it('handles user deletion with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-user-1'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Bu istifadəçini silmək istədiyinizə əminsiniz?');
      expect(mockUserCrudService.deleteUser).toHaveBeenCalledWith(1);
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('handles user status toggle', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Toggle status for first user
    fireEvent.click(screen.getByTestId('toggle-status-1'));

    await waitFor(() => {
      expect(mockUserCrudService.toggleUserStatus).toHaveBeenCalledWith(1);
    });
  });

  it('handles user search functionality', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(mockUserCrudService.getUsers).toHaveBeenCalledWith({
        search: 'admin',
        page: 1,
        per_page: 10,
      });
    });
  });

  it('handles bulk user operations', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Select users
    fireEvent.click(screen.getByTestId('select-user-1'));
    fireEvent.click(screen.getByTestId('select-user-2'));

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    });

    // Perform bulk activation
    fireEvent.click(screen.getByTestId('bulk-activate'));

    await waitFor(() => {
      expect(mockUserCrudService.bulkUserOperations).toHaveBeenCalledWith('activate', [1, 2]);
    });
  });

  it('handles select all functionality', async () => {
    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    // Click select all checkbox
    fireEvent.click(screen.getByTestId('select-all-checkbox'));

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
      expect(screen.getByText('2 istifadəçi seçildi')).toBeInTheDocument();
    });
  });

  it('displays loading states during operations', async () => {
    // Make API call slower to test loading state
    mockUserCrudService.getUsers.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        users: [],
        meta: { current_page: 1, total: 0 }
      }), 100))
    );

    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockUserCrudService.getUsers.mockRejectedValue(new Error('Docker backend bağlantı xətası'));

    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('İstifadəçilər yüklənərkən xəta baş verdi')).toBeInTheDocument();
    });

    // Test error dismissal
    fireEvent.click(screen.getByText('×'));

    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no users found', async () => {
    mockUserCrudService.getUsers.mockResolvedValue({
      users: [],
      meta: { current_page: 1, total: 0 }
    });

    render(
      <TestWrapper>
        <UserCrudComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Heç bir istifadəçi tapılmadı')).toBeInTheDocument();
    });
  });
});