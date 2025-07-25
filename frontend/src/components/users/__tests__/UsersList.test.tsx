import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils'
import UsersList from '../UsersList'
import * as apiService from '../../../services/api'

// Mock the API service instead of relying on MSW for this complex component
vi.mock('../../../services/api', () => ({
  api: {
    get: vi.fn()
  }
}))

// Mock the child components to simplify testing
vi.mock('../UserCreateForm', () => ({
  default: vi.fn(() => <div data-testid="user-create-form">User Create Form</div>)
}))

vi.mock('../UserEditForm', () => ({
  default: vi.fn(() => <div data-testid="user-edit-form">User Edit Form</div>)
}))

vi.mock('../UserDeleteConfirm', () => ({
  default: vi.fn(() => <div data-testid="user-delete-confirm">User Delete Confirm</div>)
}))

vi.mock('../UserStatusConfirm', () => ({
  default: vi.fn(() => <div data-testid="user-status-confirm">User Status Confirm</div>)
}))

vi.mock('../UserViewModal', () => ({
  default: vi.fn(() => <div data-testid="user-view-modal">User View Modal</div>)
}))

const mockUsersResponse = {
  data: {
    users: [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: {
          id: 1,
          name: 'regionadmin',
          display_name: 'Regional Administrator',
          level: 2
        },
        role_display_name: 'Regional Administrator',
        is_active: true,
        last_login_at: '2025-01-15T10:30:00Z',
        institution: {
          id: 1,
          name: 'Test School'
        },
        created_at: '2024-12-01T00:00:00Z'
      },
      {
        id: 2,
        username: 'teacher',
        email: 'teacher@example.com',
        role: {
          id: 2,
          name: 'müəllim',
          display_name: 'Müəllim',
          level: 6
        },
        role_display_name: 'Müəllim',
        is_active: true,
        last_login_at: '2025-01-14T14:20:00Z',
        institution: {
          id: 1,
          name: 'Test School'
        },
        created_at: '2024-12-15T00:00:00Z'
      }
    ],
    meta: {
      current_page: 1,
      per_page: 10,
      total: 2,
      last_page: 1,
      from: 1,
      to: 2
    }
  }
}

const mockInstitutionsResponse = {
  data: {
    institutions: [
      { id: 1, name: 'Test School', institution_code: 'TST001', type: 'school' }
    ]
  }
}

describe('UsersList Component', () => {
  const mockApiGet = apiService.api.get as any

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup default successful API responses
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/users/institutions/available')) {
        return Promise.resolve(mockInstitutionsResponse)
      } else if (url.includes('/users')) {
        return Promise.resolve(mockUsersResponse)
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  it('renders loading state initially', async () => {
    // Mock API with delay to capture loading state
    let resolveUsers: (value: any) => void
    const usersPromise = new Promise(resolve => { resolveUsers = resolve })
    
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/users/institutions/available')) {
        return Promise.resolve(mockInstitutionsResponse)
      } else if (url.includes('/users')) {
        return usersPromise
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
    
    await act(async () => {
      render(<UsersList />)
    })
    
    // Check loading state before resolving
    expect(screen.getByText('İstifadəçilər yüklənir...')).toBeInTheDocument()
    
    // Resolve the promise to clean up
    await act(async () => {
      resolveUsers!(mockUsersResponse)
    })
  })

  it('renders users list after loading', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    // Wait for API calls to complete and component to update
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('teacher')).toBeInTheDocument()
    // Check for role badges specifically, not the dropdown options
    const regionalAdminBadges = screen.getAllByText('Regional Administrator')
    expect(regionalAdminBadges.length).toBeGreaterThan(0)
    const teacherBadges = screen.getAllByText('Müəllim')
    expect(teacherBadges.length).toBeGreaterThan(0)
  })

  it('shows create form when create button is clicked', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const createButton = screen.getByText('➕ Yeni İstifadəçi')
    
    await act(async () => {
      fireEvent.click(createButton)
    })
    
    expect(screen.getByTestId('user-create-form')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('İstifadəçi adı, email, ad və ya təşkilat...')
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'admin' } })
    })
    
    // API should be called with search parameter
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining('search=admin')
      )
    })
  })

  it('handles error state', async () => {
    // Mock API to return error
    mockApiGet.mockRejectedValue(new Error('Network error'))
    
    await act(async () => {
      render(<UsersList />)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/İstifadəçilər yüklənərkən xəta baş verdi/)).toBeInTheDocument()
    })
  })

  it('renders action buttons for each user', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    // Check for action buttons (Edit, Delete, etc.)
    const editButtons = screen.getAllByText('✏️')
    const deleteButtons = screen.getAllByText('🗑️')
    
    expect(editButtons).toHaveLength(2) // One for each user
    expect(deleteButtons).toHaveLength(2) // One for each user
  })

  it('handles pagination', async () => {
    // Mock response with pagination
    const mockPaginatedResponse = {
      data: {
        users: mockUsersResponse.data.users,
        meta: {
          current_page: 1,
          per_page: 10,
          total: 25,
          last_page: 3,
          from: 1,
          to: 10
        }
      }
    }
    
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes('/users/institutions/available')) {
        return Promise.resolve(mockInstitutionsResponse)
      } else if (url.includes('/users')) {
        return Promise.resolve(mockPaginatedResponse)
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
    
    await act(async () => {
      render(<UsersList />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    // Should show pagination controls
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText(/25 istifadəçidən.*arası göstərilir/)).toBeInTheDocument()
  })

  it('filters users by role', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const roleSelect = screen.getByLabelText('👥 Rol')
    
    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'regionadmin' } })
    })
    
    // API should be called with role filter
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining('role=regionadmin')
      )
    })
  })

  it('shows user details when view button is clicked', async () => {
    await act(async () => {
      render(<UsersList />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const viewButtons = screen.getAllByText('👁️')
    
    await act(async () => {
      fireEvent.click(viewButtons[0])
    })
    
    expect(screen.getByTestId('user-view-modal')).toBeInTheDocument()
  })
})