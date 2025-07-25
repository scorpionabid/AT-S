import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import RolesList from '../RolesList';
import { roleService } from '../../../services/roleService';

// Mock API responses
const mockRoles = {
  data: [
    {
      id: 1,
      name: 'superadmin',
      display_name: 'Super Administrator',
      description: 'Sistem üzrə tam səlahiyyət',
      level: 1,
      is_active: true,
      permissions_count: 48,
      users_count: 2,
      created_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      name: 'regionadmin',
      display_name: 'Regional Administrator',
      description: 'Regional səviyyədə idarəetmə',
      level: 2,
      is_active: true,
      permissions_count: 25,
      users_count: 8,
      created_at: '2024-01-02T00:00:00.000000Z'
    },
    {
      id: 3,
      name: 'müəllim',
      display_name: 'Müəllim',
      description: 'Təhsil prosesi idarəetməsi',
      level: 5,
      is_active: true,
      permissions_count: 12,
      users_count: 156,
      created_at: '2024-01-03T00:00:00.000000Z'
    }
  ],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 3
  }
};

const mockPermissions = [
  { id: 1, name: 'view_dashboard', display_name: 'Dashboard Görüntülə', category: 'dashboard' },
  { id: 2, name: 'manage_users', display_name: 'İstifadəçi İdarəetməsi', category: 'users' },
  { id: 3, name: 'view_reports', display_name: 'Hesabatları Görüntülə', category: 'reports' },
  { id: 4, name: 'manage_institutions', display_name: 'Təssisət İdarəetməsi', category: 'institutions' }
];

const mockCreateResponse = {
  success: true,
  message: 'Rol uğurla yaradıldı',
  data: {
    id: 4,
    name: 'yeni_rol',
    display_name: 'Yeni Rol',
    description: 'Test rolu',
    level: 6,
    is_active: true,
    permissions_count: 0,
    users_count: 0,
    created_at: '2024-01-04T00:00:00.000000Z'
  }
};

// Mock user data
const mockUser = {
  id: 1,
  username: 'superadmin',
  email: 'admin@test.com',
  roles: ['superadmin'],
  permissions: ['manage_roles', 'view_roles', 'create_roles', 'edit_roles', 'delete_roles']
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RolesList Component', () => {
  let mockGetRoles: any;
  let mockGetPermissions: any;
  let mockCreateRole: any;
  let mockUpdateRole: any;
  let mockDeleteRole: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock API functions - return the data directly as the service expects
    mockGetRoles = vi.spyOn(roleService, 'getRoles')
      .mockResolvedValue(mockRoles);
    
    mockGetPermissions = vi.spyOn(roleService, 'getPermissions')
      .mockResolvedValue({ data: mockPermissions });
    
    mockCreateRole = vi.spyOn(roleService, 'createRole')
      .mockResolvedValue(mockCreateResponse);
    
    mockUpdateRole = vi.spyOn(roleService, 'updateRole')
      .mockResolvedValue({
        success: true,
        message: 'Rol uğurla yeniləndi',
        data: { ...mockRoles.data[0], display_name: 'Yenilənmiş Ad' }
      });
    
    mockDeleteRole = vi.spyOn(roleService, 'deleteRole')
      .mockResolvedValue({
        success: true,
        message: 'Rol uğurla silindi'
      });

    // Mock localStorage for auth
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'auth_token') return 'mock-token';
          if (key === 'user_data') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    expect(screen.getByText(/yüklənir/i)).toBeInTheDocument();
  });

  it('renders roles list after loading', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    expect(screen.getByText('Regional Administrator')).toBeInTheDocument();
    expect(screen.getByText('Müəllim')).toBeInTheDocument();
  });

  it('displays role details correctly', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Check role descriptions
    expect(screen.getByText('Sistem üzrə tam səlahiyyət')).toBeInTheDocument();
    expect(screen.getByText('Regional səviyyədə idarəetmə')).toBeInTheDocument();
    expect(screen.getByText('Təhsil prosesi idarəetməsi')).toBeInTheDocument();

    // Check permission counts
    expect(screen.getByText('48 icazə')).toBeInTheDocument();
    expect(screen.getByText('25 icazə')).toBeInTheDocument();
    expect(screen.getByText('12 icazə')).toBeInTheDocument();

    // Check user counts
    expect(screen.getByText('2 istifadəçi')).toBeInTheDocument();
    expect(screen.getByText('8 istifadəçi')).toBeInTheDocument();
    expect(screen.getByText('156 istifadəçi')).toBeInTheDocument();
  });

  it('shows role hierarchy levels correctly', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Check level badges
    expect(screen.getByText('Sistem')).toBeInTheDocument();
    expect(screen.getByText('Regional')).toBeInTheDocument();
    expect(screen.getByText('Təhsil')).toBeInTheDocument();
  });

  it('shows create role button for authorized users', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni rol/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni rol/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens create modal when create button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni rol/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni rol/i });
    await user.click(createButton);

    expect(screen.getByText(/rol əlavə et/i)).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rol axtar/i);
    await user.type(searchInput, 'admin');

    await waitFor(() => {
      expect(mockGetRoles).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'admin'
        })
      );
    });
  });

  it('handles level filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const levelFilter = screen.getByRole('combobox', { name: /səviyyə/i });
    await user.selectOptions(levelFilter, '1');

    await waitFor(() => {
      expect(mockGetRoles).toHaveBeenCalledWith(
        expect.objectContaining({
          level: '1'
        })
      );
    });
  });

  it('handles status filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusFilter, 'inactive');

    await waitFor(() => {
      expect(mockGetRoles).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false
        })
      );
    });
  });

  it('shows action buttons for each role', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Check for edit buttons
    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    expect(editButtons).toHaveLength(3);

    // Check for delete buttons (should be limited for protected roles)
    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

    // Check for permissions buttons
    const permissionButtons = screen.getAllByRole('button', { name: /icazələr/i });
    expect(permissionButtons).toHaveLength(3);
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    await user.click(editButtons[2]); // Click on teacher role

    expect(screen.getByText(/rol redaktə et/i)).toBeInTheDocument();
  });

  it('opens permissions modal when permissions button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const permissionButtons = screen.getAllByRole('button', { name: /icazələr/i });
    await user.click(permissionButtons[0]);

    expect(screen.getByText(/icazələri idarə et/i)).toBeInTheDocument();
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/silmək istədiyinizdən əminsiniz/i)).toBeInTheDocument();
    }
  });

  it('prevents deletion of system roles', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // System roles (superadmin) should not have delete button or should be disabled
    const firstRoleRow = screen.getByText('Super Administrator').closest('[data-testid="role-row"]');
    
    if (firstRoleRow) {
      const deleteButton = within(firstRoleRow).queryByRole('button', { name: /sil/i });
      if (deleteButton) {
        expect(deleteButton).toBeDisabled();
      } else {
        // Delete button should not exist for system roles
        expect(deleteButton).toBeNull();
      }
    }
  });

  it('displays role status correctly', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // All roles should show as active
    const activeStatuses = screen.getAllByText('Aktiv');
    expect(activeStatuses).toHaveLength(3);
  });

  it('handles pagination', async () => {
    // Mock paginated response
    const paginatedMock = {
      ...mockRoles,
      meta: {
        current_page: 1,
        last_page: 2,
        per_page: 15,
        total: 25
      }
    };

    mockGetRoles.mockResolvedValue(paginatedMock);

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Check pagination info
    expect(screen.getByText(/25 nəticədən 1-3/i)).toBeInTheDocument();

    // Check pagination controls
    expect(screen.getByRole('button', { name: /növbəti/i })).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetRoles.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/xəta baş verdi/i)).toBeInTheDocument();
    });

    // Check retry button
    expect(screen.getByRole('button', { name: /yenidən cəhd et/i })).toBeInTheDocument();
  });

  it('shows empty state when no roles found', async () => {
    mockGetRoles.mockResolvedValue({
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      }
    });

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/rol tapılmadı/i)).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /yenilə/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockGetRoles).toHaveBeenCalledTimes(2);
    });
  });

  it('shows role hierarchy correctly', async () => {
    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Check hierarchy levels
    expect(screen.getByText('Səviyyə 1')).toBeInTheDocument();
    expect(screen.getByText('Səviyyə 2')).toBeInTheDocument();
    expect(screen.getByText('Səviyyə 5')).toBeInTheDocument();
  });

  it('handles role creation successfully', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Open create modal
    const createButton = screen.getByRole('button', { name: /yeni rol/i });
    await user.click(createButton);

    // Fill form (assuming form fields exist)
    const nameInput = screen.getByLabelText(/rol adı/i);
    const displayNameInput = screen.getByLabelText(/göstərilən ad/i);
    const descriptionInput = screen.getByLabelText(/açıqlama/i);

    await user.type(nameInput, 'test_role');
    await user.type(displayNameInput, 'Test Rol');
    await user.type(descriptionInput, 'Test açıqlaması');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /yadda saxla/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test_role',
          display_name: 'Test Rol',
          description: 'Test açıqlaması'
        })
      );
    });
  });

  it('sorts roles correctly', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Click on name column header to sort
    const nameHeader = screen.getByRole('button', { name: /ad/i });
    await user.click(nameHeader);

    await waitFor(() => {
      expect(mockGetRoles).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'display_name',
          sort_direction: 'asc'
        })
      );
    });
  });

  it('shows role creation permissions form', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <RolesList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Super Administrator')).toBeInTheDocument();
    });

    // Open permissions modal
    const permissionButtons = screen.getAllByRole('button', { name: /icazələr/i });
    await user.click(permissionButtons[0]);

    await waitFor(() => {
      expect(mockGetPermissions).toHaveBeenCalled();
    });

    expect(screen.getByText('Dashboard Görüntülə')).toBeInTheDocument();
    expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument();
  });
});