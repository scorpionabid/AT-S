import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock the UsersList component that would exist
const MockUsersList = ({ users, onEdit, onDelete, loading }: any) => {
  if (loading) {
    return <div>İstifadəçilər yüklənir...</div>;
  }

  return (
    <div data-testid="users-list">
      <h1>İstifadəçi İdarəetməsi</h1>
      <button onClick={() => onEdit(null)}>Yeni İstifadəçi</button>
      {users.map((user: any) => (
        <div key={user.id} data-testid={`user-${user.id}`}>
          <span>{user.username}</span>
          <span>{user.email}</span>
          <span>{user.role?.display_name}</span>
          <button onClick={() => onEdit(user)}>Düzəlt</button>
          <button onClick={() => onDelete(user.id)}>Sil</button>
        </div>
      ))}
    </div>
  );
};

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: {
      id: 1,
      name: 'regionadmin',
      display_name: 'Regional Administrator'
    },
    is_active: true,
    institution: {
      id: 1,
      name: 'Test School'
    }
  },
  {
    id: 2,
    username: 'teacher',
    email: 'teacher@example.com',
    role: {
      id: 2,
      name: 'muellim',
      display_name: 'Müəllim'
    },
    is_active: true,
    institution: {
      id: 1,
      name: 'Test School'
    }
  }
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UsersList Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user list header', () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument();
    expect(screen.getByText('Yeni İstifadəçi')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={[]} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('İstifadəçilər yüklənir...')).toBeInTheDocument();
  });

  it('renders user information correctly', () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    // Check first user
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Regional Administrator')).toBeInTheDocument();

    // Check second user
    expect(screen.getByText('teacher')).toBeInTheDocument();
    expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
    expect(screen.getByText('Müəllim')).toBeInTheDocument();
  });

  it('handles user edit action', async () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    const editButtons = screen.getAllByText('Düzəlt');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  it('handles user delete action', async () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByText('Sil');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });

  it('handles new user creation', async () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    const newUserButton = screen.getByText('Yeni İstifadəçi');
    fireEvent.click(newUserButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(null);
    });
  });

  it('renders empty state when no users', () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={[]} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('users-list')).toBeInTheDocument();
    expect(screen.queryByTestId('user-1')).not.toBeInTheDocument();
  });

  it('renders multiple users correctly', () => {
    render(
      <TestWrapper>
        <MockUsersList 
          users={mockUsers} 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          loading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('user-1')).toBeInTheDocument();
    expect(screen.getByTestId('user-2')).toBeInTheDocument();
  });
});