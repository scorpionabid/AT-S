import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils'
import LoginForm from '../LoginForm'

describe('LoginForm Component', () => {
  it('renders login form with all elements', () => {
    render(<LoginForm />)
    
    // Check separate title elements
    expect(screen.getByText('ATİS')).toBeInTheDocument()
    expect(screen.getByText('Azərbaycan Təhsil İdarəetmə Sistemi')).toBeInTheDocument()
    // Use getAllByText for text that appears multiple times
    const sistemGirisElements = screen.getAllByText('Sisteme Giriş')
    expect(sistemGirisElements.length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Şifrənizi daxil edin')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sisteme Giriş' })).toBeInTheDocument()
    expect(screen.getByText('© 2025 Azərbaycan Təhsil Nazirliyi')).toBeInTheDocument()
  })

  it('updates input values when typing', () => {
    render(<LoginForm />)
    
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    
    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('testpassword')
  })

  it('shows validation error for empty fields', async () => {
    await act(async () => {
      render(<LoginForm />)
    })
    
    const submitButton = screen.getByRole('button', { name: 'Sisteme Giriş' })
    
    await act(async () => {
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('İstifadəçi adı/email və şifrə mütləqdir')).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    await act(async () => {
      render(<LoginForm />)
    })
    
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    const submitButton = screen.getByRole('button', { name: 'Sisteme Giriş' })
    
    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Şifrə ən azı 8 simvol olmalıdır')).toBeInTheDocument()
    })
  })

  it('calls login function with correct credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({})
    
    render(<LoginForm />, {
      authValue: { 
        login: mockLogin,
        isLoading: false 
      }
    })
    
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    const submitButton = screen.getByRole('button', { name: 'Sisteme Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        login: 'testuser',
        password: 'testpassword',
        rememberMe: false
      })
    })
  })

  it('shows loading state during login', () => {
    render(<LoginForm />, {
      authValue: { 
        isLoading: true 
      }
    })
    
    const submitButton = screen.getByRole('button', { name: 'Giriş edilir...' })
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    
    expect(submitButton).toBeDisabled()
    expect(usernameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it('handles login error correctly', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Yanlış istifadəçi adı və ya şifrə'
        }
      }
    })
    
    render(<LoginForm />, {
      authValue: { 
        login: mockLogin,
        isLoading: false 
      }
    })
    
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    const submitButton = screen.getByRole('button', { name: 'Sisteme Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Yanlış istifadəçi adı və ya şifrə')).toBeInTheDocument()
    })
  })

  it('handles rate limiting error', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: {
        status: 429,
        data: {
          message: 'Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin'
        }
      }
    })
    
    render(<LoginForm />, {
      authValue: { 
        login: mockLogin,
        isLoading: false 
      }
    })
    
    const usernameInput = screen.getByPlaceholderText('İstifadəçi adınızı və ya email ünvanınızı daxil edin')
    const passwordInput = screen.getByPlaceholderText('Şifrənizi daxil edin')
    const submitButton = screen.getByRole('button', { name: 'Sisteme Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin')).toBeInTheDocument()
    })
  })
})