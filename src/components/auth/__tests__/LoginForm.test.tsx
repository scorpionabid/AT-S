import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import LoginForm from '../LoginForm'

describe('LoginForm Component', () => {
  it('renders login form with all elements', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('ATİS - Azərbaycan Təhsil İdarəetmə Sistemi')).toBeInTheDocument()
    expect(screen.getByText('Sisteme Giriş')).toBeInTheDocument()
    expect(screen.getByLabelText('İstifadəçi adı və ya Email:')).toBeInTheDocument()
    expect(screen.getByLabelText('Şifrə:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Giriş' })).toBeInTheDocument()
    expect(screen.getByText('© 2025 Azərbaycan Təhsil Nazirliyi')).toBeInTheDocument()
  })

  it('updates input values when typing', () => {
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    
    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('testpassword')
  })

  it('shows validation error for empty fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Giriş' })
    await fireEvent.click(submitButton)
    
    const errorMessage = await screen.findByTestId('error-message');
    expect(errorMessage).toHaveTextContent('İstifadəçi adı/email və şifrə mütləqdir');
  })

  it('shows validation error for short password', async () => {
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    const submitButton = screen.getByRole('button', { name: 'Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)
    
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
    
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    const submitButton = screen.getByRole('button', { name: 'Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        login: 'testuser',
        password: 'testpassword'
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
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    
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
    
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    const submitButton = screen.getByRole('button', { name: 'Giriş' })
    
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
    
    const usernameInput = screen.getByLabelText('İstifadəçi adı və ya Email:')
    const passwordInput = screen.getByLabelText('Şifrə:')
    const submitButton = screen.getByRole('button', { name: 'Giriş' })
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin')).toBeInTheDocument()
    })
  })
})