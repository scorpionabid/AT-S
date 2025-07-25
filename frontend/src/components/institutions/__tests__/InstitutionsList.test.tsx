import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import InstitutionsList from '../InstitutionsList';
import { institutionService } from '../../../services/institutionService';

// Mock API responses
const mockInstitutions = {
  data: [
    {
      id: 1,
      name: 'Təhsil Nazirliyi',
      level: 1,
      type: 'ministry',
      is_active: true,
      parent_id: null,
      children_count: 5,
      created_at: '2024-01-01T00:00:00.000000Z'
    },
    {
      id: 2,
      name: 'Bakı Şəhər Təhsil İdarəsi',
      level: 2,
      type: 'region',
      is_active: true,
      parent_id: 1,
      children_count: 10,
      created_at: '2024-01-02T00:00:00.000000Z'
    },
    {
      id: 3,
      name: 'Test Məktəbi',
      level: 4,
      type: 'school',
      is_active: true,
      parent_id: 2,
      children_count: 0,
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

const mockCreateResponse = {
  success: true,
  message: 'Təssisət uğurla yaradıldı',
  data: {
    id: 4,
    name: 'Yeni Məktəb',
    level: 4,
    type: 'school',
    is_active: true,
    parent_id: 2,
    children_count: 0,
    created_at: '2024-01-04T00:00:00.000000Z'
  }
};

// Mock user data
const mockUser = {
  id: 1,
  username: 'superadmin',
  email: 'admin@test.com',
  roles: ['superadmin'],
  permissions: ['manage_institutions', 'view_institutions', 'create_institutions']
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

describe('InstitutionsList Component', () => {
  let mockGetInstitutions: any;
  let mockCreateInstitution: any;
  let mockUpdateInstitution: any;
  let mockDeleteInstitution: any;

  beforeEach(() => {
    // Mock API functions
    mockGetInstitutions = vi.spyOn(institutionService, 'getInstitutions')
      .mockResolvedValue(mockInstitutions);
    
    mockCreateInstitution = vi.spyOn(institutionService, 'createInstitution')
      .mockResolvedValue(mockCreateResponse);
    
    mockUpdateInstitution = vi.spyOn(institutionService, 'updateInstitution')
      .mockResolvedValue({
        success: true,
        message: 'Təssisət uğurla yeniləndi',
        data: { ...mockInstitutions.data[0], name: 'Yenilənmiş Ad' }
      });
    
    mockDeleteInstitution = vi.spyOn(institutionService, 'deleteInstitution')
      .mockResolvedValue({
        success: true,
        message: 'Təssisət uğurla silindi'
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
        <InstitutionsList />
      </TestWrapper>
    );

    expect(screen.getByText(/yüklənir/i)).toBeInTheDocument();
  });

  it('renders institutions list after loading', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    expect(screen.getByText('Bakı Şəhər Təhsil İdarəsi')).toBeInTheDocument();
    expect(screen.getByText('Test Məktəbi')).toBeInTheDocument();
  });

  it('displays institution details correctly', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Check institution types and levels
    expect(screen.getByText('Nazirlik')).toBeInTheDocument();
    expect(screen.getByText('Regional İdarə')).toBeInTheDocument();
    expect(screen.getByText('Məktəb')).toBeInTheDocument();

    // Check children count
    expect(screen.getByText('5 alt təssisət')).toBeInTheDocument();
    expect(screen.getByText('10 alt təssisət')).toBeInTheDocument();
  });

  it('shows create institution button for authorized users', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni təssisət/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni təssisət/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens create modal when create button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni təssisət/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni təssisət/i });
    await user.click(createButton);

    expect(screen.getByText(/təssisət əlavə et/i)).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/təssisət axtar/i);
    await user.type(searchInput, 'Bakı');

    await waitFor(() => {
      expect(mockGetInstitutions).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Bakı'
        })
      );
    });
  });

  it('handles level filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Find and click level filter
    const levelFilter = screen.getByRole('combobox', { name: /səviyyə/i });
    await user.selectOptions(levelFilter, '4');

    await waitFor(() => {
      expect(mockGetInstitutions).toHaveBeenCalledWith(
        expect.objectContaining({
          level: '4'
        })
      );
    });
  });

  it('handles type filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Find and click type filter
    const typeFilter = screen.getByRole('combobox', { name: /növ/i });
    await user.selectOptions(typeFilter, 'school');

    await waitFor(() => {
      expect(mockGetInstitutions).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'school'
        })
      );
    });
  });

  it('handles status filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Find and click status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusFilter, 'inactive');

    await waitFor(() => {
      expect(mockGetInstitutions).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: false
        })
      );
    });
  });

  it('shows action buttons for each institution', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Check for edit buttons
    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    expect(editButtons).toHaveLength(3);

    // Check for delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    expect(deleteButtons).toHaveLength(3);

    // Check for view details buttons
    const viewButtons = screen.getAllByRole('button', { name: /ətraflı/i });
    expect(viewButtons).toHaveLength(3);
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    await user.click(editButtons[0]);

    expect(screen.getByText(/təssisət redaktə et/i)).toBeInTheDocument();
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    await user.click(deleteButtons[2]); // Click delete on Test Məktəbi

    expect(screen.getByText(/silmək istədiyinizdən əminsiniz/i)).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    // Mock paginated response
    const paginatedMock = {
      ...mockInstitutions,
      meta: {
        current_page: 1,
        last_page: 3,
        per_page: 15,
        total: 45
      }
    };

    mockGetInstitutions.mockResolvedValue(paginatedMock);

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Check pagination info
    expect(screen.getByText(/45 nəticədən 1-3/i)).toBeInTheDocument();

    // Check pagination controls
    expect(screen.getByRole('button', { name: /növbəti/i })).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetInstitutions.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/xəta baş verdi/i)).toBeInTheDocument();
    });

    // Check retry button
    expect(screen.getByRole('button', { name: /yenidən cəhd et/i })).toBeInTheDocument();
  });

  it('shows empty state when no institutions found', async () => {
    mockGetInstitutions.mockResolvedValue({
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
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/təssisət tapılmadı/i)).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /yenilə/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockGetInstitutions).toHaveBeenCalledTimes(2);
    });
  });

  it('displays institution hierarchy correctly', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Check hierarchy indicators
    const hierarchyItems = screen.getAllByTestId('institution-hierarchy');
    expect(hierarchyItems).toHaveLength(3);

    // Check level badges
    expect(screen.getByText('Səviyyə 1')).toBeInTheDocument();
    expect(screen.getByText('Səviyyə 2')).toBeInTheDocument();
    expect(screen.getByText('Səviyyə 4')).toBeInTheDocument();
  });

  it('shows institution status correctly', async () => {
    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // All institutions should show as active
    const activeStatuses = screen.getAllByText('Aktiv');
    expect(activeStatuses).toHaveLength(3);
  });

  it('handles bulk operations', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <InstitutionsList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Təhsil Nazirliyi')).toBeInTheDocument();
    });

    // Select multiple institutions
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First institution
    await user.click(checkboxes[2]); // Second institution

    // Check if bulk action buttons appear
    expect(screen.getByText(/seçilmiş/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toplu əməliyyat/i })).toBeInTheDocument();
  });
});