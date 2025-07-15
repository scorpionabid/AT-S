import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth';
import { FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
import styles from './LoginForm.module.scss';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.login || !credentials.password) {
      setError('İstifadəçi adı/email və şifrə mütləqdir');
      return;
    }

    if (credentials.password.length < 8) {
      setError('Şifrə ən azı 8 simvol olmalıdır');
      return;
    }

    try {
      await login({ ...credentials, rememberMe });
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        setError('Şəbəkə xətası: Server əlçatan deyil. Lütfən internetinizi yoxlayın və ya bir az sonra yenidən cəhd edin.');
      } else if (error.response?.status === 422) {
        const message = error.response.data?.errors?.login?.[0] || 
                       error.response.data?.message || 
                       'Yanlış istifadəçi adı və ya şifrə';
        setError(message);
      } else if (error.response?.status === 429) {
        const message = error.response.data?.message || 
                       'Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin';
        setError(message);
      } else if (error.response?.status === 500) {
        setError('Server xətası. Lütfən daha sonra yenidən cəhd edin.');
      } else if (error.response?.status === 0 || !error.response) {
        setError('Server ilə əlaqə qurula bilmir. CORS və ya şəbəkə problemi ola bilər.');
      } else {
        const statusText = error.response?.statusText || 'Bilinməyən xəta';
        const status = error.response?.status || 'N/A';
        setError(`Giriş zamanı xəta baş verdi (${status}: ${statusText})`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const detectInputType = (value: string): string => {
    if (value.includes('@')) {
      return 'Email formatında daxil edirsiniz';
    } else if (value.length > 0) {
      return 'İstifadəçi adı formatında daxil edirsiniz';
    }
    return '';
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length < 6) return { strength: 'Zəif', color: '#ff4444' };
    if (password.length < 8) return { strength: 'Orta', color: '#ff8c00' };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'Güclü', color: '#00aa00' };
    }
    return { strength: 'Yaxşı', color: '#ffaa00' };
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-form']}>
        <div className={styles['login-header']}>
          <h1>ATİS - Azərbaycan Təhsil İdarəetmə Sistemi</h1>
          <h2>Sisteme Giriş</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className={styles['error-message']} data-testid="error-message">
              {error}
            </div>
          )}

          <div className={styles['form-group']}>
            <label htmlFor="login">İstifadəçi adı və ya Email:</label>
            <input
              type="text"
              id="login"
              name="login"
              value={credentials.login}
              onChange={handleChange}
              placeholder="İstifadəçi adı və ya email daxil edin"
              disabled={isLoading}
              required
            />
            {credentials.login && (
              <div className={styles['input-hint']}>
                <FiInfo size={12} />
                <span>{detectInputType(credentials.login)}</span>
              </div>
            )}
          </div>

          <div className={styles['form-group']}>
            <div className={styles['password-label-group']}>
              <label htmlFor="password">Şifrə:</label>
              <button
                type="button"
                className={styles['info-button']}
                onMouseEnter={() => setShowPasswordRequirements(true)}
                onMouseLeave={() => setShowPasswordRequirements(false)}
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
              >
                <FiInfo size={16} />
              </button>
            </div>
            <div className={styles['password-input-group']}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Şifrənizi daxil edin"
                disabled={isLoading}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles['password-toggle']}
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {credentials.password && (
              <div className={styles['password-strength']}>
                <span style={{ color: getPasswordStrength(credentials.password).color }}>
                  Şifrə gücü: {getPasswordStrength(credentials.password).strength}
                </span>
              </div>
            )}
            {showPasswordRequirements && (
              <div className={styles['password-requirements']}>
                <h4>Şifrə tələbləri:</h4>
                <ul>
                  <li className={credentials.password.length >= 8 ? 'met' : 'unmet'}>
                    Ən azı 8 simvol
                  </li>
                  <li className={/[a-z]/.test(credentials.password) ? 'met' : 'unmet'}>
                    Kiçik hərf (a-z)
                  </li>
                  <li className={/[A-Z]/.test(credentials.password) ? 'met' : 'unmet'}>
                    Böyük hərf (A-Z)
                  </li>
                  <li className={/\d/.test(credentials.password) ? 'met' : 'unmet'}>
                    Rəqəm (0-9)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className={`${styles['form-group']} ${styles['remember-me']}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span className={styles['checkbox-text']}>Məni xatırla (30 gün)</span>
            </label>
          </div>

          <button
            type="submit"
            className={styles['login-button']}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş edilir...' : 'Giriş'}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2025 Azərbaycan Təhsil Nazirliyi</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;