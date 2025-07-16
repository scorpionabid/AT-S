import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth';
import { FiEye, FiEyeOff, FiInfo, FiMail, FiLock, FiUser, FiShield, FiCheck } from 'react-icons/fi';

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
  const [focusedField, setFocusedField] = useState<string>('');

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

  const detectInputType = (value: string): { type: string; icon: React.ReactNode; text: string } => {
    if (value.includes('@')) {
      return { type: 'email', icon: <FiMail className="w-5 h-5" />, text: 'Email formatında' };
    } else if (value.length > 0) {
      return { type: 'username', icon: <FiUser className="w-5 h-5" />, text: 'İstifadəçi adı formatında' };
    }
    return { type: '', icon: <FiUser className="w-5 h-5 text-gray-400" />, text: '' };
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string; bgColor: string } => {
    if (password.length < 6) return { strength: 'Zəif', color: 'text-red-500', width: '25%', bgColor: 'bg-red-500' };
    if (password.length < 8) return { strength: 'Orta', color: 'text-orange-500', width: '50%', bgColor: 'bg-orange-500' };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'Güclü', color: 'text-green-500', width: '100%', bgColor: 'bg-green-500' };
    }
    return { strength: 'Yaxşı', color: 'text-yellow-500', width: '75%', bgColor: 'bg-yellow-500' };
  };

  const inputType = detectInputType(credentials.login);
  const passwordStrength = getPasswordStrength(credentials.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main decorative circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-lg rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-blue-300/20 rounded-full animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-300/50 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Enhanced Header Section - Much Larger */}
        <div className="text-center mb-16 px-4">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/15 backdrop-blur-xl rounded-full mb-8 border border-white/20 shadow-2xl">
            <FiShield className="w-16 h-16 text-white drop-shadow-lg" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-7xl font-black text-white mb-4 tracking-tight leading-tight">
                ATİS
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mb-6"></div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-blue-100 leading-relaxed">
                Azərbaycan Təhsil İdarəetmə Sistemi
              </h2>
              <p className="text-xl text-blue-200/90 font-medium leading-relaxed max-w-2xl mx-auto">
                Təhsil sahəsində rəqəmsal transformasiyanın mərkəzi platforması
              </p>
              <div className="flex items-center justify-center space-x-4 text-blue-300/80 text-lg">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Təhlükəsiz
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Etibarlı
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Səmərəli
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Login Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 relative overflow-hidden max-w-xl mx-auto">
          {/* Card inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl"></div>
          
          <div className="relative space-y-8">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Sisteme Giriş</h3>
              <p className="text-white/70">Daxil olmaq üçün məlumatlarınızı daxil edin</p>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-6 py-5 rounded-2xl text-sm backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-400 rounded-full mr-4 animate-pulse"></div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced Login Field */}
            <div className="space-y-4">
              <label className="block text-base font-bold text-white/90">
                İstifadəçi adı və ya Email
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="login"
                  value={credentials.login}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('login')}
                  onBlur={() => setFocusedField('')}
                  placeholder="İstifadəçi adınızı və ya email ünvanınızı daxil edin"
                  disabled={isLoading}
                  required
                  className={`w-full px-6 py-5 pl-16 border-2 rounded-2xl transition-all duration-300 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 text-lg ${
                    focusedField === 'login' 
                      ? 'border-blue-400 ring-4 ring-blue-400/30 bg-white/10' 
                      : 'border-white/20 hover:border-white/30'
                  } disabled:opacity-50`}
                />
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/70 group-hover:text-white transition-colors">
                  {inputType.icon}
                </div>
                {focusedField === 'login' && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none"></div>
                )}
              </div>
              {credentials.login && (
                <div className="flex items-center text-sm text-blue-200/80 mt-3">
                  <FiInfo className="w-4 h-4 mr-2" />
                  <span>{inputType.text || 'Giriş məlumatları'}</span>
                </div>
              )}
            </div>

            {/* Enhanced Password Field */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-base font-bold text-white/90">
                  Şifrə
                </label>
                <button
                  type="button"
                  className="text-blue-300 hover:text-blue-200 text-sm flex items-center transition-colors font-medium"
                  onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                >
                  <FiInfo className="w-4 h-4 mr-1" />
                  Tələblər
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Şifrənizi daxil edin"
                  disabled={isLoading}
                  required
                  minLength={8}
                  className={`w-full px-6 py-5 pl-16 pr-16 border-2 rounded-2xl transition-all duration-300 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 text-lg ${
                    focusedField === 'password' 
                      ? 'border-blue-400 ring-4 ring-blue-400/30 bg-white/10' 
                      : 'border-white/20 hover:border-white/30'
                  } disabled:opacity-50`}
                />
                <FiLock className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                <button
                  type="button"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
                {focusedField === 'password' && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none"></div>
                )}
              </div>

              {/* Enhanced Password Strength Indicator */}
              {credentials.password && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Şifrə gücü:</span>
                    <span className={`font-bold ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${passwordStrength.bgColor}`}
                      style={{ width: passwordStrength.width }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Enhanced Password Requirements */}
              {showPasswordRequirements && (
                <div className="mt-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-sm">
                  <h4 className="font-bold text-white mb-4">Şifrə tələbləri:</h4>
                  <ul className="space-y-3">
                    <li className={`flex items-center ${credentials.password.length >= 8 ? 'text-green-300' : 'text-red-300'}`}>
                      <div className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center ${credentials.password.length >= 8 ? 'bg-green-500' : 'bg-red-500'}`}>
                        {credentials.password.length >= 8 && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      Ən azı 8 simvol
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(credentials.password) ? 'text-green-300' : 'text-red-300'}`}>
                      <div className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center ${/[a-z]/.test(credentials.password) ? 'bg-green-500' : 'bg-red-500'}`}>
                        {/[a-z]/.test(credentials.password) && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      Kiçik hərf (a-z)
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(credentials.password) ? 'text-green-300' : 'text-red-300'}`}>
                      <div className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center ${/[A-Z]/.test(credentials.password) ? 'bg-green-500' : 'bg-red-500'}`}>
                        {/[A-Z]/.test(credentials.password) && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      Böyük hərf (A-Z)
                    </li>
                    <li className={`flex items-center ${/\d/.test(credentials.password) ? 'text-green-300' : 'text-red-300'}`}>
                      <div className={`w-5 h-5 rounded-full mr-4 flex items-center justify-center ${/\d/.test(credentials.password) ? 'bg-green-500' : 'bg-red-500'}`}>
                        {/\d/.test(credentials.password) && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      Rəqəm (0-9)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Enhanced Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50' 
                    : 'border-white/30 hover:border-white/50 bg-white/5'
                }`}>
                  {rememberMe && (
                    <FiCheck className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
                <span className="ml-4 text-base text-white/90 group-hover:text-white transition-colors font-medium">
                  Məni xatırla (30 gün)
                </span>
              </label>
            </div>

            {/* Enhanced Login Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              className={`w-full py-6 px-8 rounded-2xl font-bold text-white text-lg transition-all duration-300 relative overflow-hidden ${
                isLoading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] shadow-xl'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Giriş edilir...
                </div>
              ) : (
                <span className="relative z-10">Sisteme Giriş</span>
              )}
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-10 text-center space-y-3">
            <p className="text-sm text-white/60">
              © 2025 Azərbaycan Təhsil Nazirliyi
            </p>
            <p className="text-sm text-white/50">
              Bütün hüquqlar qorunur | Versiya 2.0
            </p>
          </div>
        </div>

        {/* Enhanced Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center text-lg text-white/70 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <FiShield className="w-5 h-5 mr-3" />
            <span>256-bit SSL şifrələməsi ilə qorunur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;