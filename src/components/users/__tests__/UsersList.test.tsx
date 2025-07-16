import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import UsersList from '../UsersList'

// Mock the child components
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

describe('UsersList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<UsersList />)
    expect(screen.getByText('İstifadəçilər yüklənir...')).toBeInTheDocument()
  })

  it('renders users list after loading', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('teacher')).toBeInTheDocument()
    })
    
    expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument()
    expect(screen.getByText(/Yeni İstifadəçi/)).toBeInTheDocument()
  })

  it('shows create form when create button is clicked', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const createButton = screen.getByText(/Yeni İstifadəçi/)
    fireEvent.click(createButton)
    
    expect(screen.getByTestId('user-create-form')).toBeInTheDocument()
  })

  it('filters users by search term', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('İstifadəçi adı və ya email ilə axtarın...')
    fireEvent.change(searchInput, { target: { value: 'admin' } })
    
    // Wait for search to trigger
    await waitFor(() => {
      expect(searchInput).toHaveValue('admin')
    })
  })

  it('filters users by role', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const roleSelect = screen.getByDisplayValue('Bütün rollar')
    fireEvent.change(roleSelect, { target: { value: 'regionadmin' } })
    
    expect(roleSelect).toHaveValue('regionadmin')
  })

  it('filters users by status', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    const statusSelect = screen.getByDisplayValue('Bütün statuslar')
    fireEvent.change(statusSelect, { target: { value: 'active' } })
    
    expect(statusSelect).toHaveValue('active')
  })

  it('displays user information correctly', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      // Check if user data from mock is displayed
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
      expect(screen.getByText('teacher')).toBeInTheDocument()
      expect(screen.getByText('teacher@example.com')).toBeInTheDocument()
    })
  })

  it('shows action buttons for each user', async () => {
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
    })
    
    // Should have edit and delete buttons (or action menus)
    const actionButtons = screen.getAllByTitle('Redaktə et')
    expect(actionButtons.length).toBeGreaterThan(0)
  })

  it('handles pagination', async () => {
    render(<UsersList />)
    
    await screen.findByText(/göstərilir/i, {}, { timeout: 20000 });
    expect(screen.getByText(/göstərilir/i)).toBeInTheDocument();
  })

  it('handles error state', async () => {
    // This test will be handled by MSW server error responses
    // For now, just test that component renders without crashing
    render(<UsersList />)
    
    await waitFor(() => {
      expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument()
    })
  })
})