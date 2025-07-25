import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import UsersList from '../../components/users/UsersList'
import UserCreateForm from '../../components/users/UserCreateForm'
import { userService } from '../../services/userService'
import { institutionService } from '../../services/institutionService'
import { roleService } from '../../services/roleService'

// Integration test wrapper
const IntegrationTestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('User Management Integration Tests', () => {
  let mockGetUsers: any
  let mockCreateUser: any
  let mockUpdateUser: any
  let mockDeleteUser: any
  let mockGetInstitutions: any
  let mockGetRoles: any

  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      role: {
        id: 1,
        name: 'regionadmin',
        display_name: 'Regional Administrator',
        level: 2
      },
      institution: {
        id: 1,
        name: 'Test School'
      },
      is_active: true,
      last_login_at: '2025-01-15T10:30:00Z',
      created_at: '2024-12-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'teacher',
      email: 'teacher@example.com',
      first_name: 'Teacher',
      last_name: 'User',
      role: {
        id: 2,
        name: 'müəllim',
        display_name: 'Müəllim',
        level: 6
      },
      institution: {
        id: 1,
        name: 'Test School'
      },
      is_active: true,
      last_login_at: '2025-01-14T14:20:00Z',
      created_at: '2024-12-15T00:00:00Z'
    }
  ]

  const mockInstitutions = [
    {
      id: 1,
      name: 'Test School',
      institution_code: 'TST001',
      type: 'school',
      level: 4,
      is_active: true
    }
  ]

  const mockRoles = [
    {
      id: 1,
      name: 'regionadmin',
      display_name: 'Regional Administrator',
      description: 'Regional education management',
      level: 2
    },
    {
      id: 2,
      name: 'müəllim',
      display_name: 'Müəllim',
      description: 'Teacher',
      level: 6
    }
  ]

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'auth_token') return 'mock-token'
          if (key === 'user_data') return JSON.stringify({
            id: 1,
            username: 'admin',
            roles: ['regionadmin'],
            permissions: ['manage_users', 'create_users', 'view_users']
          })
          return null
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock API services
    mockGetUsers = vi.spyOn(userService, 'getUsers')
      .mockResolvedValue({
        users: mockUsers,
        meta: {
          current_page: 1,
          per_page: 10,
          total: 2,
          last_page: 1,
          from: 1,
          to: 2
        }
      })

    mockCreateUser = vi.spyOn(userService, 'createUser')
      .mockResolvedValue({
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        role: mockRoles[1],
        institution: mockInstitutions[0],
        is_active: true,
        created_at: '2025-01-20T00:00:00Z'
      })

    mockUpdateUser = vi.spyOn(userService, 'updateUser')
      .mockResolvedValue({
        ...mockUsers[0],
        first_name: 'Updated',
        last_name: 'Name'
      })

    mockDeleteUser = vi.spyOn(userService, 'deleteUser')
      .mockResolvedValue(true)

    mockGetInstitutions = vi.spyOn(institutionService, 'getInstitutions')
      .mockResolvedValue({
        data: mockInstitutions,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1
        }
      })

    mockGetRoles = vi.spyOn(roleService, 'getRoles')
      .mockResolvedValue({
        data: mockRoles,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2
        }
      })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load and display users list on component mount', async () => {
    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Step 1: Verify loading state
    expect(screen.getByText(/yüklənir/i)).toBeInTheDocument()

    // Step 2: Wait for API call to complete
    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalled()
    })

    // Step 3: Verify users are displayed
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('teacher')).toBeInTheDocument()
    })

    // Step 4: Verify user details are shown
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('teacher@example.com')).toBeInTheDocument()
    expect(screen.getByText('Regional Administrator')).toBeInTheDocument()
    expect(screen.getByText('Müəllim')).toBeInTheDocument()
  })

  it('should handle user search functionality', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Find and use search input
    const searchInput = screen.getByPlaceholderText(/istifadəçi axtar/i)
    await user.type(searchInput, 'admin')

    // Step 2: Verify search API call
    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'admin'
        })
      )
    })
  })

  it('should create new user through modal form', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Open create form
    const createButton = screen.getByRole('button', { name: /yeni istifadəçi/i })
    await user.click(createButton)

    // Step 2: Wait for modal to open and forms to load
    await waitFor(() => {
      expect(screen.getByText(/istifadəçi əlavə et/i)).toBeInTheDocument()
    })

    // Step 3: Fill form fields
    const usernameInput = screen.getByLabelText(/istifadəçi adı/i)
    const emailInput = screen.getByLabelText(/e-poçt/i)
    const firstNameInput = screen.getByLabelText(/ad/i)
    const lastNameInput = screen.getByLabelText(/soyad/i)
    const passwordInput = screen.getByLabelText(/şifrə/i)

    await user.type(usernameInput, 'newuser')
    await user.type(emailInput, 'newuser@example.com')
    await user.type(firstNameInput, 'New')
    await user.type(lastNameInput, 'User')
    await user.type(passwordInput, 'password123')

    // Step 4: Select role and institution
    const roleSelect = screen.getByLabelText(/rol/i)
    const institutionSelect = screen.getByLabelText(/təssisət/i)

    await user.selectOptions(roleSelect, '2')
    await user.selectOptions(institutionSelect, '1')

    // Step 5: Submit form
    const submitButton = screen.getByRole('button', { name: /yadda saxla/i })
    await user.click(submitButton)

    // Step 6: Verify API call was made
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        password: 'password123',
        role_id: 2,
        institution_id: 1
      })
    })

    // Step 7: Verify users list is refreshed
    expect(mockGetUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after create
  })

  it('should validate form fields before submission', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Open create form
    const createButton = screen.getByRole('button', { name: /yeni istifadəçi/i })
    await user.click(createButton)

    // Step 2: Try to submit empty form
    await waitFor(() => {
      expect(screen.getByText(/istifadəçi əlavə et/i)).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /yadda saxla/i })
    await user.click(submitButton)

    // Step 3: Verify validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/istifadəçi adı tələb olunur/i)).toBeInTheDocument()
      expect(screen.getByText(/e-poçt tələb olunur/i)).toBeInTheDocument()
      expect(screen.getByText(/şifrə tələb olunur/i)).toBeInTheDocument()
    })

    // Step 4: Verify API call was not made
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('should handle user update workflow', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Click edit button for first user
    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i })
    await user.click(editButtons[0])

    // Step 2: Wait for edit modal to open
    await waitFor(() => {
      expect(screen.getByText(/istifadəçi redaktə et/i)).toBeInTheDocument()
    })

    // Step 3: Update user information
    const firstNameInput = screen.getByDisplayValue('Admin')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Updated')

    const lastNameInput = screen.getByDisplayValue('User')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Name')

    // Step 4: Submit form
    const submitButton = screen.getByRole('button', { name: /yadda saxla/i })
    await user.click(submitButton)

    // Step 5: Verify API call was made
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(1, {
        first_name: 'Updated',
        last_name: 'Name'
      })
    })

    // Step 6: Verify users list is refreshed
    expect(mockGetUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after update
  })

  it('should handle user deletion with confirmation', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Click delete button for first user
    const deleteButtons = screen.getAllByRole('button', { name: /sil/i })
    await user.click(deleteButtons[0])

    // Step 2: Verify confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText(/silmək istədiyinizdən əminsiniz/i)).toBeInTheDocument()
    })

    // Step 3: Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /bəli/i })
    await user.click(confirmButton)

    // Step 4: Verify API call was made
    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith(1)
    })

    // Step 5: Verify users list is refreshed
    expect(mockGetUsers).toHaveBeenCalledTimes(2) // Initial load + refresh after delete
  })

  it('should handle pagination correctly', async () => {
    const user = userEvent.setup()

    // Mock paginated response
    mockGetUsers.mockResolvedValue({
      users: mockUsers,
      meta: {
        current_page: 1,
        per_page: 1,
        total: 2,
        last_page: 2,
        from: 1,
        to: 1
      }
    })

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })

    // Step 1: Verify pagination controls are shown
    expect(screen.getByText(/2 nəticədən 1-1/i)).toBeInTheDocument()
    
    // Step 2: Click next page
    const nextButton = screen.getByRole('button', { name: /növbəti/i })
    await user.click(nextButton)

    // Step 3: Verify API call for next page
    await waitFor(() => {
      expect(mockGetUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2
        })
      )
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockGetUsers.mockRejectedValue(new Error('Network error'))

    render(
      <IntegrationTestWrapper>
        <UsersList />
      </IntegrationTestWrapper>
    )

    // Step 1: Verify error state is shown
    await waitFor(() => {
      expect(screen.getByText(/xəta baş verdi/i)).toBeInTheDocument()
    })

    // Step 2: Verify retry button is available
    expect(screen.getByRole('button', { name: /yenidən cəhd et/i })).toBeInTheDocument()
  })
})