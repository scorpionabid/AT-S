import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { AuthContext, AuthContextType } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'

// Mock user data
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: { id: 1, name: 'müəllim', display_name: 'Müəllim' },
  role_display_name: 'Müəllim',
  role_level: 6,
  institution: {
    id: 1,
    name: 'Test School',
    type: 'school',
    level: 4
  },
  departments: ['Test Department'],
  last_login_at: '2025-01-01T00:00:00Z',
  profile: {
    first_name: 'Test',
    last_name: 'User',
    patronymic: 'Testovich',
    full_name: 'Test User Testovich',
    birth_date: '1990-01-01',
    gender: 'male',
    contact_phone: '+994501234567'
  }
}

// Mock auth context
const mockAuthContext: AuthContextType = {
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
}

// Create a wrapper component for tests
interface AllTheProvidersProps {
  children: React.ReactNode
  authValue?: Partial<AuthContextType>
}

const AllTheProviders = ({ children, authValue = {} }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const finalAuthValue = { ...mockAuthContext, ...authValue }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider value={finalAuthValue}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<AuthContextType>
}

const customRender = (
  ui: ReactElement,
  { authValue, ...options }: CustomRenderOptions = {}
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>{children}</AllTheProviders>
    ),
    ...options,
  })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }