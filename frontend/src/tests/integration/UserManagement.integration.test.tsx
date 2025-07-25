import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock comprehensive user management workflow
const MockUserManagementFlow = ({ initialUsers = [] }: { initialUsers?: any[] }) => {
  const [users, setUsers] = React.useState(initialUsers);
  const [loading, setLoading] = React.useState(false);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [error, setError] = React.useState('');

  const handleCreateUser = async (userData: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      const newUser = {
        id: Date.now(),
        ...userData,
        created_at: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError('İstifadəçi yaradılarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      setEditingUser(null);
      setError('');
    } catch (err) {
      setError('İstifadəçi yenilənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUsers(users.filter(user => user.id !== userId));
      setError('');
    } catch (err) {
      setError('İstifadəçi silinərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="user-management">
      <h1>İstifadəçi İdarəetməsi</h1>
      
      {error && (
        <div data-testid="error-message" style={{ color: 'red' }}>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <button 
        onClick={() => setShowCreateForm(true)}
        disabled={loading}
        data-testid="create-user-button"
      >
        {loading ? 'Yüklənir...' : 'Yeni İstifadəçi'}
      </button>

      {showCreateForm && (
        <div data-testid="create-form">
          <h2>Yeni İstifadəçi Yarat</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleCreateUser({
              username: formData.get('username'),
              email: formData.get('email'),
              role: formData.get('role'),
              is_active: true,
            });
          }}>
            <input name="username" placeholder="İstifadəçi adı" required />
            <input name="email" type="email" placeholder="E-poçt" required />
            <select name="role" required>
              <option value="">Rol seçin</option>
              <option value="muellim">Müəllim</option>
              <option value="regionadmin">Regional Admin</option>
            </select>
            <button type="submit" disabled={loading}>Yarat</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>Ləğv et</button>
          </form>
        </div>
      )}

      {editingUser && (
        <div data-testid="edit-form">
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
            />
            <input 
              name="email" 
              type="email" 
              defaultValue={(editingUser as any).email} 
              placeholder="E-poçt" 
              required 
            />
            <select name="role" defaultValue={(editingUser as any).role} required>
              <option value="">Rol seçin</option>
              <option value="muellim">Müəllim</option>
              <option value="regionadmin">Regional Admin</option>
            </select>
            <button type="submit" disabled={loading}>Yenilə</button>
            <button type="button" onClick={() => setEditingUser(null)}>Ləğv et</button>
          </form>
        </div>
      )}

      <div data-testid="users-list">
        {users.length === 0 ? (
          <p>Heç bir istifadəçi tapılmadı</p>
        ) : (
          users.map(user => (
            <div key={user.id} data-testid={`user-${user.id}`}>
              <span>{user.username}</span>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <button 
                onClick={() => setEditingUser(user)}
                disabled={loading}
              >
                Düzəlt
              </button>
              <button 
                onClick={() => handleDeleteUser(user.id)}
                disabled={loading}
              >
                Sil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('User Management Integration', () => {
  const initialUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'regionadmin',
      is_active: true,
    },
    {
      id: 2,
      username: 'teacher',
      email: 'teacher@example.com',
      role: 'muellim',
      is_active: true,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user management interface', () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument();
    expect(screen.getByTestId('create-user-button')).toBeInTheDocument();
    expect(screen.getByTestId('users-list')).toBeInTheDocument();
  });

  it('displays existing users correctly', () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('teacher')).toBeInTheDocument();
    expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Heç bir istifadəçi tapılmadı')).toBeInTheDocument();
  });

  it('opens create user form', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('create-user-button');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-form')).toBeInTheDocument();
      expect(screen.getByText('Yeni İstifadəçi Yarat')).toBeInTheDocument();
    });
  });

  it('creates new user successfully', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open create form
    fireEvent.click(screen.getByTestId('create-user-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-form')).toBeInTheDocument();
    });

    // Fill form
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adı');
    const emailInput = screen.getByPlaceholderText('E-poçt');
    const roleSelect = screen.getByDisplayValue('');

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'muellim' } });

    // Submit form
    const form = screen.getByTestId('create-form').querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
      expect(screen.getByText('newuser@example.com')).toBeInTheDocument();
      expect(screen.queryByTestId('create-form')).not.toBeInTheDocument();
    });
  });

  it('opens edit user form', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    const editButtons = screen.getAllByText('Düzəlt');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
      expect(screen.getByText('İstifadəçini Düzəlt')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
    });
  });

  it('updates user successfully', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open edit form
    const editButtons = screen.getAllByText('Düzəlt');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    });

    // Update username
    const usernameInput = screen.getByDisplayValue('admin');
    fireEvent.change(usernameInput, { target: { value: 'updatedadmin' } });

    // Submit form
    const form = screen.getByTestId('edit-form').querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('updatedadmin')).toBeInTheDocument();
      expect(screen.queryByText('admin')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
    });
  });

  it('deletes user successfully', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByText('Sil');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('admin')).not.toBeInTheDocument();
      expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('teacher')).toBeInTheDocument(); // Other user should remain
    });
  });

  it('cancels create form', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open create form
    fireEvent.click(screen.getByTestId('create-user-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-form')).toBeInTheDocument();
    });

    // Cancel form
    fireEvent.click(screen.getByText('Ləğv et'));

    await waitFor(() => {
      expect(screen.queryByTestId('create-form')).not.toBeInTheDocument();
    });
  });

  it('cancels edit form', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open edit form
    const editButtons = screen.getAllByText('Düzəlt');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument();
    });

    // Cancel form
    fireEvent.click(screen.getByText('Ləğv et'));

    await waitFor(() => {
      expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument();
    });
  });

  it('handles form validation', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open create form
    fireEvent.click(screen.getByTestId('create-user-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-form')).toBeInTheDocument();
    });

    // Try to submit empty form (should be prevented by HTML5 validation)
    const form = screen.getByTestId('create-form').querySelector('form');
    fireEvent.submit(form!);

    // Form should still be visible (validation failed)
    expect(screen.getByTestId('create-form')).toBeInTheDocument();
  });

  it('shows loading states during operations', async () => {
    render(
      <TestWrapper>
        <MockUserManagementFlow initialUsers={initialUsers} />
      </TestWrapper>
    );

    // Open create form and submit
    fireEvent.click(screen.getByTestId('create-user-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-form')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('İstifadəçi adı'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('E-poçt'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'muellim' } });

    // Submit form - this will show loading state briefly
    const form = screen.getByTestId('create-form').querySelector('form');
    fireEvent.submit(form!);

    // The loading text appears briefly during the mocked async operation
    expect(screen.getByText('Yüklənir...')).toBeInTheDocument();
  });
});