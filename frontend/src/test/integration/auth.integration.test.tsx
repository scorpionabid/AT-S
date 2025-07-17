import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginForm from '../../components/auth/LoginForm'
import { authService } from '../../services/authService'

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

describe('Authentication Integration Tests', () => {
  let mockLogin: any
  let mockLogout: any
  let mockGetCurrentUser: any

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock authService functions
    mockLogin = vi.spyOn(authService, 'login')
    mockLogout = vi.spyOn(authService, 'logout')
    mockGetCurrentUser = vi.spyOn(authService, 'getCurrentUser')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full login workflow', async () => {
    const user = userEvent.setup()
    
    // Mock successful login response
    mockLogin.mockResolvedValue({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: ['müəllim'],
        permissions: ['dashboard.view']
      },
      token: 'mock-token'
    })

    mockGetCurrentUser.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['müəllim'],
      permissions: ['dashboard.view']
    })

    render(
      <IntegrationTestWrapper>
        <LoginForm />
      </IntegrationTestWrapper>
    )

    // Step 1: User enters credentials
    const usernameInput = screen.getByLabelText(/istifadəçi adı/i)
    const passwordInput = screen.getByLabelText(/şifrə/i)
    const submitButton = screen.getByRole('button', { name: /daxil ol/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')

    // Step 2: User submits form
    await user.click(submitButton)

    // Step 3: Verify API call was made
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        login: 'testuser',
        password: 'password123'
      })
    })

    // Step 4: Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-token')
    expect(localStorage.setItem).toHaveBeenCalledWith('user_data', expect.any(String))
  })

  it('should handle login failure and show error message', async () => {
    const user = userEvent.setup()
    
    // Mock failed login response
    mockLogin.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Yanlış istifadəçi adı və ya şifrə'
        }
      }
    })

    render(
      <IntegrationTestWrapper>
        <LoginForm />
      </IntegrationTestWrapper>
    )

    // Step 1: User enters invalid credentials
    const usernameInput = screen.getByLabelText(/istifadəçi adı/i)
    const passwordInput = screen.getByLabelText(/şifrə/i)
    const submitButton = screen.getByRole('button', { name: /daxil ol/i })

    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpassword')

    // Step 2: User submits form
    await user.click(submitButton)

    // Step 3: Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/yanlış istifadəçi adı və ya şifrə/i)).toBeInTheDocument()
    })

    // Step 4: Verify localStorage was not updated
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle rate limiting gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock rate limit response
    mockLogin.mockRejectedValue({
      response: {
        status: 429,
        data: {
          message: 'Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin'
        }
      }
    })

    render(
      <IntegrationTestWrapper>
        <LoginForm />
      </IntegrationTestWrapper>
    )

    // Step 1: User enters credentials
    const usernameInput = screen.getByLabelText(/istifadəçi adı/i)
    const passwordInput = screen.getByLabelText(/şifrə/i)
    const submitButton = screen.getByRole('button', { name: /daxil ol/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')

    // Step 2: User submits form
    await user.click(submitButton)

    // Step 3: Verify rate limit message is shown
    await waitFor(() => {
      expect(screen.getByText(/çox sayda cəhd/i)).toBeInTheDocument()
    })

    // Step 4: Verify submit button is disabled temporarily
    expect(submitButton).toBeDisabled()
  })

  it('should maintain authentication state across page refreshes', async () => {
    // Mock existing token in localStorage
    const mockToken = 'existing-token'
    const mockUserData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['müəllim'],
      permissions: ['dashboard.view']
    }

    localStorage.getItem = vi.fn((key) => {
      if (key === 'auth_token') return mockToken
      if (key === 'user_data') return JSON.stringify(mockUserData)
      return null
    })

    mockGetCurrentUser.mockResolvedValue(mockUserData)

    render(
      <IntegrationTestWrapper>
        <div data-testid="auth-status">
          {/* This would be replaced with actual auth state display */}
        </div>
      </IntegrationTestWrapper>
    )

    // Verify that the auth context loads existing token
    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token')
      expect(localStorage.getItem).toHaveBeenCalledWith('user_data')
    })
  })

  it('should handle logout workflow correctly', async () => {
    const user = userEvent.setup()
    
    // Mock logout response
    mockLogout.mockResolvedValue({ message: 'Uğurla çıxış edildi' })

    // Mock initial authenticated state
    localStorage.getItem = vi.fn((key) => {
      if (key === 'auth_token') return 'mock-token'
      if (key === 'user_data') return JSON.stringify({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      })
      return null
    })

    render(
      <IntegrationTestWrapper>
        <button onClick={() => authService.logout()}>
          Çıxış
        </button>
      </IntegrationTestWrapper>
    )

    // Step 1: User clicks logout
    const logoutButton = screen.getByRole('button', { name: /çıxış/i })
    await user.click(logoutButton)

    // Step 2: Verify logout API call was made
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })

    // Step 3: Verify localStorage was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
  })

  it('should handle session expiry gracefully', async () => {
    // Mock expired token scenario
    mockGetCurrentUser.mockRejectedValue({
      response: {
        status: 401,
        data: {
          message: 'Token müddəti bitib'
        }
      }
    })

    localStorage.getItem = vi.fn((key) => {
      if (key === 'auth_token') return 'expired-token'
      return null
    })

    render(
      <IntegrationTestWrapper>
        <div data-testid="auth-status">
          Protected content
        </div>
      </IntegrationTestWrapper>
    )

    // Verify that expired token triggers logout
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_data')
    })
  })
})