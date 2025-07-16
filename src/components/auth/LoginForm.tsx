import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth';
import { FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
// Removed SCSS module import - using Tailwind CSS classes

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1>ATİS - Azərbaycan Təhsil İdarəetmə Sistemi</h1>
          <h2>Sisteme Giriş</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" data-testid="error-message">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">İstifadəçi adı və ya Email:</label>
            <input
              type="text"
              id="login"
              name="login"
              value={credentials.login}
              onChange={handleChange}
              placeholder="İstifadəçi adı və ya email daxil edin"
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {credentials.login && (
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <FiInfo size={12} className="mr-1" />
                <span>{detectInputType(credentials.login)}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifrə:</label>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 p-1"
                onMouseEnter={() => setShowPasswordRequirements(true)}
                onMouseLeave={() => setShowPasswordRequirements(false)}
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
              >
                <FiInfo size={16} />
              </button>
            </div>
            <div className="relative">
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
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {credentials.password && (
              <div className="mt-1 text-xs">
                <span style={{ color: getPasswordStrength(credentials.password).color }}>
                  Şifrə gücü: {getPasswordStrength(credentials.password).strength}
                </span>
              </div>
            )}
            {showPasswordRequirements && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
                <h4 className="font-medium text-gray-700 mb-2">Şifrə tələbləri:</h4>
                <ul className="space-y-1">
                  <li className={credentials.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                    Ən azı 8 simvol
                  </li>
                  <li className={/[a-z]/.test(credentials.password) ? 'text-green-600' : 'text-red-600'}>
                    Kiçik hərf (a-z)
                  </li>
                  <li className={/[A-Z]/.test(credentials.password) ? 'text-green-600' : 'text-red-600'}>
                    Böyük hərf (A-Z)
                  </li>
                  <li className={/\d/.test(credentials.password) ? 'text-green-600' : 'text-red-600'}>
                    Rəqəm (0-9)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Məni xatırla (30 gün)</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş edilir...' : 'Giriş'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">© 2025 Azərbaycan Təhsil Nazirliyi</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
