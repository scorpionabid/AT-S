import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/Loading';

interface SetupStatus {
  needs_setup: boolean;
  checks: {
    superadmin_exists: boolean;
    institutions_exist: boolean;
    roles_configured: boolean;
    permissions_configured: boolean;
  };
  recommendations: string[];
}

interface SystemInitData {
  superadmin_username: string;
  superadmin_email: string;
  superadmin_password: string;
  ministry_name: string;
  ministry_code: string;
  system_name: string;
  system_locale: string;
}

interface ValidationResult {
  status: 'healthy' | 'needs_attention';
  summary: {
    total_users: number;
    total_institutions: number;
    total_issues: number;
    total_warnings: number;
  };
  issues: string[];
  warnings: string[];
  suggestions: string[];
  next_actions: string[];
}

const SetupWizard: React.FC = () => {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const [systemData, setSystemData] = useState<SystemInitData>({
    superadmin_username: '',
    superadmin_email: '',
    superadmin_password: '',
    ministry_name: 'Azərbaycan Respublikası Təhsil Nazirliyi',
    ministry_code: 'MoE-AZ',
    system_name: 'ATİS - Azərbaycan Təhsil İdarəetmə Sistemi',
    system_locale: 'az'
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setup/status');
      const data = await response.json();
      setSetupStatus(data);
      
      if (!data.needs_setup) {
        setCurrentStep(4); // Go to validation step if already setup
        validateSystemData();
      }
    } catch (err) {
      setError('Setup status yoxlanıla bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setup/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(systemData)
      });

      const result = await response.json();
      
      if (response.ok) {
        setCurrentStep(3);
      } else {
        setError(result.message || 'Sistem qurulumu uğursuz oldu');
      }
    } catch (err) {
      setError('Sistem qurulumu zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const validateSystemData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setup/validate');
      const data = await response.json();
      setValidationResult(data);
    } catch (err) {
      setError('Məlumat validasiyası uğursuz oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SystemInitData, value: string) => {
    setSystemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep1 = () => (
    <div className="setup-step">
      <div className="step-header">
        <h2>Sistem Status Yoxlanışı</h2>
        <p>Sistemin cari vəziyyəti yoxlanır...</p>
      </div>

      {setupStatus && (
        <div className="status-checks">
          <div className={`check-item ${setupStatus.checks.superadmin_exists ? 'success' : 'warning'}`}>
            <span className="check-icon">
              {setupStatus.checks.superadmin_exists ? '✅' : '⚠️'}
            </span>
            <span>SuperAdmin istifadəçisi</span>
          </div>

          <div className={`check-item ${setupStatus.checks.institutions_exist ? 'success' : 'warning'}`}>
            <span className="check-icon">
              {setupStatus.checks.institutions_exist ? '✅' : '⚠️'}
            </span>
            <span>Təşkilat strukturu</span>
          </div>

          <div className={`check-item ${setupStatus.checks.roles_configured ? 'success' : 'warning'}`}>
            <span className="check-icon">
              {setupStatus.checks.roles_configured ? '✅' : '⚠️'}
            </span>
            <span>Roller və icazələr</span>
          </div>

          <div className={`check-item ${setupStatus.checks.permissions_configured ? 'success' : 'warning'}`}>
            <span className="check-icon">
              {setupStatus.checks.permissions_configured ? '✅' : '⚠️'}
            </span>
            <span>İcazə sistemi</span>
          </div>
        </div>
      )}

      {setupStatus?.needs_setup ? (
        <div className="setup-needed">
          <h3>Sistem quraşdırılması lazımdır</h3>
          <ul>
            {setupStatus.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentStep(2)}
          >
            Quraşdırmaya başla
          </button>
        </div>
      ) : (
        <div className="setup-complete">
          <h3>✅ Sistem düzgün qurulub</h3>
          <p>Sistem artıq konfiqurasiya olunub və istifadəyə hazırdır.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentStep(4)}
          >
            Məlumat validasiyası
          </button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="setup-step">
      <div className="step-header">
        <h2>Sistem Quraşdırılması</h2>
        <p>Əsas sistem konfiqurasiyasını tamamlayın</p>
      </div>

      <form className="setup-form" onSubmit={(e) => { e.preventDefault(); initializeSystem(); }}>
        <div className="form-section">
          <h3>SuperAdmin İstifadəçisi</h3>
          <div className="form-group">
            <label>İstifadəçi adı *</label>
            <input
              type="text"
              value={systemData.superadmin_username}
              onChange={(e) => handleInputChange('superadmin_username', e.target.value)}
              required
              placeholder="superadmin"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={systemData.superadmin_email}
              onChange={(e) => handleInputChange('superadmin_email', e.target.value)}
              required
              placeholder="admin@atis.az"
            />
          </div>

          <div className="form-group">
            <label>Parol *</label>
            <input
              type="password"
              value={systemData.superadmin_password}
              onChange={(e) => handleInputChange('superadmin_password', e.target.value)}
              required
              minLength={8}
              placeholder="Ən azı 8 simvol"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Təşkilat Məlumatları</h3>
          <div className="form-group">
            <label>Nazirlik adı *</label>
            <input
              type="text"
              value={systemData.ministry_name}
              onChange={(e) => handleInputChange('ministry_name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nazirlik kodu *</label>
            <input
              type="text"
              value={systemData.ministry_code}
              onChange={(e) => handleInputChange('ministry_code', e.target.value)}
              required
              placeholder="MoE-AZ"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Sistem Tənzimləmələri</h3>
          <div className="form-group">
            <label>Sistem adı *</label>
            <input
              type="text"
              value={systemData.system_name}
              onChange={(e) => handleInputChange('system_name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Dil *</label>
            <select
              value={systemData.system_locale}
              onChange={(e) => handleInputChange('system_locale', e.target.value)}
              required
            >
              <option value="az">Azərbaycan</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">
            Geri
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Qurulur...' : 'Sistemi qur'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="setup-step">
      <div className="step-header">
        <h2>✅ Sistem Uğurla Quruldu</h2>
        <p>Əsas konfiqurasiya tamamlandı</p>
      </div>

      <div className="success-message">
        <div className="success-icon">🎉</div>
        <h3>Təbriklər!</h3>
        <p>ATİS sistemi uğurla quraşdırıldı və istifadəyə hazırdır.</p>
        
        <div className="next-steps">
          <h4>Növbəti addımlar:</h4>
          <ul>
            <li>Regional idarələri yaradın</li>
            <li>Sektor və məktəb strukturunu qurun</li>
            <li>İstifadəçiləri əlavə edin</li>
            <li>Departamentləri konfiqurasiya edin</li>
          </ul>
        </div>

        <div className="form-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentStep(4)}
          >
            Məlumat validasiyası
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/dashboard'}
          >
            Dashboard-a get
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="setup-step">
      <div className="step-header">
        <h2>Məlumat Validasiyası</h2>
        <p>Sistem məlumatlarının yoxlanması</p>
      </div>

      {validationResult && (
        <div className="validation-results">
          <div className={`status-banner ${validationResult.status}`}>
            <span className="status-icon">
              {validationResult.status === 'healthy' ? '✅' : '⚠️'}
            </span>
            <span>
              {validationResult.status === 'healthy' ? 'Sistem sağlamdır' : 'Diqqət tələb edir'}
            </span>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-value">{validationResult.summary.total_users}</span>
              <span className="summary-label">İstifadəçilər</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{validationResult.summary.total_institutions}</span>
              <span className="summary-label">Təşkilatlar</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{validationResult.summary.total_issues}</span>
              <span className="summary-label">Problemlər</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{validationResult.summary.total_warnings}</span>
              <span className="summary-label">Xəbərdarlıqlar</span>
            </div>
          </div>

          {validationResult.issues.length > 0 && (
            <div className="validation-section issues">
              <h4>🔴 Problemlər</h4>
              <ul>
                {validationResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="validation-section warnings">
              <h4>🟡 Xəbərdarlıqlar</h4>
              <ul>
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.suggestions.length > 0 && (
            <div className="validation-section suggestions">
              <h4>💡 Təkliflər</h4>
              <ul>
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="next-actions">
            <h4>Növbəti addımlar:</h4>
            <ul>
              {validationResult.next_actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button 
          className="btn btn-secondary"
          onClick={validateSystemData}
          disabled={loading}
        >
          {loading ? 'Yoxlanılır...' : 'Yenidən yoxla'}
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/dashboard'}
        >
          Dashboard-a get
        </button>
      </div>
    </div>
  );

  if (loading && !setupStatus && !validationResult) {
    return (
      <div className="setup-loading">
        <LoadingSpinner size="lg" text="Setup yoxlanılır..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="setup-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={() => { setError(null); checkSetupStatus(); }} className="btn btn-primary">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-wizard">
      <div className="wizard-header">
        <h1>ATİS Setup Wizard</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
        </div>
      </div>

      <div className="wizard-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default SetupWizard;