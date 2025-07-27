import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.login || !credentials.password) {
      setError('İstifadəçi adı və şifrə mütləqdir');
      return;
    }

    try {
      await login(credentials);
    } catch (err: any) {
      setError(err.message || 'Giriş xətası');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            ATİS Giriş
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Hesabınıza daxil olun
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              İstifadəçi adı və ya email
            </label>
            <input
              type="text"
              value={credentials.login}
              onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Şifrə
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isLoading ? 'Giriş edilir...' : 'Daxil ol'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;