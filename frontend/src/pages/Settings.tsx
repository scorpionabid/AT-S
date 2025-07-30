import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiSettings } from 'react-icons/fi';
import type { 
  SystemConfig, 
  SystemHealth, 
  ScheduledReport,
  MaintenanceTask 
} from '../services/systemConfigService';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Data states
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  // Form states
  const [configChanges, setConfigChanges] = useState<Record<string, any>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    const hasSuperAdminRole = user?.roles?.includes('superadmin') || 
                            (typeof user?.role === 'string' && user?.role === 'superadmin') ||
                            (typeof user?.role === 'object' && user?.role?.name === 'superadmin');
    
    if (hasSuperAdminRole) {
      fetchSystemConfig();
      if (activeTab === 'health') {
        fetchSystemHealth();
      } else if (activeTab === 'schedules') {
        fetchScheduledReports();
      }
    }
  }, [user, activeTab]);

  const fetchSystemConfig = async () => {
    setLoading(true);
    try {
      // Mock system config for development
      const mockConfig: SystemConfig = {
        general: {
          app_name: 'ATİS - Azərbaycan Təhsil İdarəetmə Sistemi',
          timezone: 'Asia/Baku',
          language: 'az',
          items_per_page: 20,
          max_upload_size: '50MB',
          maintenance_mode: false
        },
        security: {
          session_timeout: 60,
          max_login_attempts: 5,
          lockout_duration: 15,
          password_min_length: 8,
          password_expire_days: 90,
          password_require_special: false,
          password_require_numbers: true,
          two_factor_enabled: false
        },
        email: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_username: '',
          smtp_password: '',
          smtp_encryption: 'tls',
          from_address: 'noreply@atis.az',
          from_name: 'ATİS System'
        },
        system: {
          debug_mode: true,
          log_level: 'info',
          cache_enabled: true,
          queue_enabled: true,
          backup_retention_days: 30
        },
        integration: {
          api_rate_limit: 1000,
          webhook_secret: '',
          external_auth_enabled: false,
          ldap_enabled: false
        }
      };
      
      setSystemConfig(mockConfig);
      setError(null);
    } catch (error: any) {
      setError('Sistem konfiqurasiyası yüklənərkən xəta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      // Mock system health data
      const mockHealth: SystemHealth = {
        overall_health: 'healthy',
        components: {
          database: {
            status: 'healthy',
            response_time: '12ms',
            connections: 5,
            max_connections: 100
          },
          cache: {
            status: 'healthy',
            hit_rate: '85%',
            memory_usage: '45%'
          },
          storage: {
            status: 'warning',
            disk_usage: '78%',
            free_space: '2.5GB'
          },
          api: {
            status: 'healthy',
            avg_response: '150ms',
            requests_per_min: 45
          }
        },
        recommendations: [
          'Disk sahəsi 80%-ə yaxındır, təmizlik aparın',
          'Cache performansı yaxşıdır',
          'Database əlaqələri normal səviyyədədir'
        ],
        last_checked: new Date().toISOString()
      };
      
      setSystemHealth(mockHealth);
    } catch (error: any) {
      setError('Sistem sağlamlığı yoxlanılarkən xəta: ' + error.message);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      // Mock scheduled reports data
      const mockReports: ScheduledReport[] = [
        {
          id: 1,
          name: 'Aylıq Performans Hesabatı',
          description: 'Aylıq məktəb performans məlumatları',
          report_type: 'overview',
          frequency: 'monthly',
          format: 'pdf',
          recipients: ['admin@atis.az', 'director@atis.az'],
          time: '09:00',
          day_of_month: 1,
          next_run: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_run: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setScheduledReports(mockReports);
    } catch (error: any) {
      setError('Planlanmış hesabatlar yüklənərkən xəta: ' + error.message);
    }
  };

  const handleConfigChange = (category: string, key: string, value: any) => {
    setConfigChanges(prev => ({
      ...prev,
      [`${category}.${key}`]: value
    }));
  };

  const saveConfigChanges = async (category: string) => {
    if (!configChanges) return;

    setLoading(true);
    try {
      const categoryChanges = Object.entries(configChanges)
        .filter(([key]) => key.startsWith(category + '.'))
        .reduce((acc, [key, value]) => {
          const cleanKey = key.replace(category + '.', '');
          acc[cleanKey] = value;
          return acc;
        }, {} as Record<string, any>);

      if (Object.keys(categoryChanges).length === 0) {
        setError('Heç bir dəyişiklik edilməyib');
        return;
      }

      // Mock update for development
      console.log('Updating config:', category, categoryChanges);
      setSuccess('Konfiqurasiya uğurla yeniləndi (Mock)');
      setConfigChanges({});
      await fetchSystemConfig();
    } catch (error: any) {
      setError('Konfiqurasiya yenilənərkən xəta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async (tasks: MaintenanceTask[]) => {
    setLoading(true);
    try {
      // Mock maintenance for development
      console.log('Performing maintenance tasks:', tasks);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work
      
      setSuccess(`Bakım tamamlandı: ${tasks.join(', ')} (Mock)`);
      await fetchSystemHealth();
    } catch (error: any) {
      setError('Sistem bakımı zamanı xəta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => {
    if (!systemConfig) return null;

    const { general } = systemConfig;

    return (
      <div className="settings-section">
        <h3>Ümumi Tənzimləmələr</h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label>Tətbiq Adı</label>
            <input
              type="text"
              value={configChanges['general.app_name'] ?? general.app_name}
              onChange={(e) => handleConfigChange('general', 'app_name', e.target.value)}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Zaman Zonası</label>
            <select
              value={configChanges['general.timezone'] ?? general.timezone}
              onChange={(e) => handleConfigChange('general', 'timezone', e.target.value)}
              className="setting-select"
            >
              <option value="Asia/Baku">Asia/Baku</option>
              <option value="Europe/Istanbul">Europe/Istanbul</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Dil</label>
            <select
              value={configChanges['general.language'] ?? general.language}
              onChange={(e) => handleConfigChange('general', 'language', e.target.value)}
              className="setting-select"
            >
              <option value="az">Azərbaycan</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Səhifə başına element sayı</label>
            <input
              type="number"
              min="5"
              max="100"
              value={configChanges['general.items_per_page'] ?? general.items_per_page}
              onChange={(e) => handleConfigChange('general', 'items_per_page', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Maksimum fayl ölçüsü</label>
            <input
              type="text"
              value={configChanges['general.max_upload_size'] ?? general.max_upload_size}
              onChange={(e) => handleConfigChange('general', 'max_upload_size', e.target.value)}
              className="setting-input"
            />
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={configChanges['general.maintenance_mode'] ?? general.maintenance_mode}
                onChange={(e) => handleConfigChange('general', 'maintenance_mode', e.target.checked)}
              />
              Bakım rejimi
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button
            onClick={() => saveConfigChanges('general')}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saxlanılır...' : 'Saxla'}
          </button>
        </div>
      </div>
    );
  };

  const renderSecuritySettings = () => {
    if (!systemConfig) return null;

    const { security } = systemConfig;

    return (
      <div className="settings-section">
        <h3>Təhlükəsizlik Tənzimləmələri</h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <label>Session timeout (dəqiqə)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={configChanges['security.session_timeout'] ?? security.session_timeout}
              onChange={(e) => handleConfigChange('security', 'session_timeout', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Maksimum giriş cəhdi</label>
            <input
              type="number"
              min="3"
              max="10"
              value={configChanges['security.max_login_attempts'] ?? security.max_login_attempts}
              onChange={(e) => handleConfigChange('security', 'max_login_attempts', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Qadağa müddəti (dəqiqə)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={configChanges['security.lockout_duration'] ?? security.lockout_duration}
              onChange={(e) => handleConfigChange('security', 'lockout_duration', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Minimum şifrə uzunluğu</label>
            <input
              type="number"
              min="6"
              max="32"
              value={configChanges['security.password_min_length'] ?? security.password_min_length}
              onChange={(e) => handleConfigChange('security', 'password_min_length', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>Şifrə etibarlılıq müddəti (gün)</label>
            <input
              type="number"
              min="30"
              max="365"
              value={configChanges['security.password_expire_days'] ?? security.password_expire_days}
              onChange={(e) => handleConfigChange('security', 'password_expire_days', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={configChanges['security.password_require_special'] ?? security.password_require_special}
                onChange={(e) => handleConfigChange('security', 'password_require_special', e.target.checked)}
              />
              Şifrədə xüsusi simvol tələb et
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={configChanges['security.password_require_numbers'] ?? security.password_require_numbers}
                onChange={(e) => handleConfigChange('security', 'password_require_numbers', e.target.checked)}
              />
              Şifrədə rəqəm tələb et
            </label>
          </div>

          <div className="setting-item checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={configChanges['security.two_factor_enabled'] ?? security.two_factor_enabled}
                onChange={(e) => handleConfigChange('security', 'two_factor_enabled', e.target.checked)}
              />
              İki faktorlu autentifikasiya
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button
            onClick={() => saveConfigChanges('security')}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saxlanılır...' : 'Saxla'}
          </button>
        </div>
      </div>
    );
  };

  const renderSystemHealth = () => {
    if (!systemHealth) return null;

    return (
      <div className="settings-section">
        <div className="health-header">
          <h3>Sistem Sağlamlığı</h3>
          <div className={`overall-status ${systemHealth.overall_health}`}>
            {systemHealth.overall_health === 'healthy' ? '✅ Sağlam' : 
             systemHealth.overall_health === 'warning' ? '⚠️ Xəbərdarlıq' : '❌ Problem'}
          </div>
          <button onClick={fetchSystemHealth} className="btn btn-secondary">
            🔄 Yenilə
          </button>
        </div>

        <div className="health-grid">
          {Object.entries(systemHealth.components).map(([component, status]) => (
            <div key={component} className={`health-card ${status.status}`}>
              <div className="health-card-header">
                <h4>{component.replace('_', ' ').toUpperCase()}</h4>
                <span className={`status-badge ${status.status}`}>
                  {status.status === 'healthy' ? '✅' : status.status === 'warning' ? '⚠️' : '❌'}
                </span>
              </div>
              <div className="health-details">
                {Object.entries(status).map(([key, value]) => 
                  key !== 'status' && (
                    <div key={key} className="health-metric">
                      <span className="metric-name">{key.replace('_', ' ')}</span>
                      <span className="metric-value">{value}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {systemHealth.recommendations.length > 0 && (
          <div className="recommendations">
            <h4>Tövsiyyələr</h4>
            <ul>
              {systemHealth.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="maintenance-section">
          <h4>Sistem Bakımı</h4>
          <div className="maintenance-buttons">
            <button
              onClick={() => handleMaintenance(['clear_cache'])}
              disabled={loading}
              className="btn btn-warning"
            >
              🗑️ Cache Təmizlə
            </button>
            <button
              onClick={() => handleMaintenance(['optimize_db'])}
              disabled={loading}
              className="btn btn-warning"
            >
              ⚡ DB Optimize et
            </button>
            <button
              onClick={() => handleMaintenance(['cleanup_logs'])}
              disabled={loading}
              className="btn btn-warning"
            >
              📄 Logları Təmizlə
            </button>
            <button
              onClick={() => handleMaintenance(['backup_db'])}
              disabled={loading}
              className="btn btn-info"
            >
              💾 Backup Yarat
            </button>
            <button
              onClick={() => handleMaintenance(['clear_cache', 'optimize_db', 'cleanup_logs'])}
              disabled={loading}
              className="btn btn-danger"
            >
              🔧 Tam Bakım
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduledReports = () => {
    return (
      <div className="settings-section">
        <div className="schedules-header">
          <h3>Planlanmış Hesabatlar</h3>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn btn-primary"
          >
            ➕ Yeni Hesabat
          </button>
        </div>

        <div className="schedules-table">
          <div className="table-header">
            <span>Ad</span>
            <span>Tip</span>
            <span>Tezlik</span>
            <span>Format</span>
            <span>Status</span>
            <span>Növbəti İcra</span>
            <span>Əməliyyatlar</span>
          </div>
          
          {scheduledReports.map((schedule) => (
            <div key={schedule.id} className="table-row">
              <span className="schedule-name">{schedule.name}</span>
              <span className="schedule-type">{schedule.report_type}</span>
              <span className="schedule-frequency">{schedule.frequency}</span>
              <span className="schedule-format">{schedule.format.toUpperCase()}</span>
              <span className={`schedule-status ${schedule.status}`}>
                {schedule.status === 'active' ? 'Aktiv' : 
                 schedule.status === 'paused' ? 'Dayandırılmış' : 'Deaktiv'}
              </span>
              <span className="schedule-next">
                {schedule.next_run ? new Date(schedule.next_run).toLocaleString('az-AZ') : 'N/A'}
              </span>
              <span className="schedule-actions">
                <button className="btn-icon edit">✏️</button>
                <button className="btn-icon delete">🗑️</button>
              </span>
            </div>
          ))}
        </div>

        {scheduledReports.length === 0 && (
          <div className="empty-state">
            <p>Hələlik planlanmış hesabat yoxdur</p>
          </div>
        )}
      </div>
    );
  };

  // Check if user has superadmin role
  const hasSuperAdminRole = user?.roles?.includes('superadmin') || 
                          (typeof user?.role === 'string' && user?.role === 'superadmin') ||
                          (typeof user?.role === 'object' && user?.role?.name === 'superadmin');

  if (!hasSuperAdminRole) {
    return (
      <div className="settings-page">
        <div className="access-denied">
          <h2>⚠️ Giriş qadağandır</h2>
          <p>Bu səhifəyə yalnız SuperAdmin istifadəçiləri daxil ola bilər.</p>
        </div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title="Sistem Tənzimləmələri"
      subtitle="Sistem konfiqurasiyası və bakım əməliyyatları"
      icon={<FiSettings className="w-6 h-6 text-blue-600" />}
    >
      <div className="dashboard-container">
        {/* Messages */}
        {error && (
          <div className="dashboard-error">
            <div className="error-content">
              <div className="error-title">⚠️ Xəta</div>
              <div className="error-message">{error}</div>
              <button onClick={() => setError(null)} className="error-button">
                Bağla
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-success-50 border border-success-200 rounded-md p-3 mb-6">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="text-success-800">{success}</span>
              <button 
                onClick={() => setSuccess(null)} 
                className="ml-auto text-success-600 hover:text-success-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex border-b border-neutral-200 mb-6">
          <button
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'general' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('general')}
          >
            🔧 Ümumi
          </button>
          <button
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'security' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Təhlükəsizlik
          </button>
          <button
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'health' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('health')}
          >
            🏥 Sistem Sağlamlığı
          </button>
          <button
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'schedules' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            onClick={() => setActiveTab('schedules')}
          >
            📅 Planlanmış Hesabatlar
          </button>
        </div>

        {/* Content Area */}
        {loading && !systemConfig ? (
          <div className="dashboard-loading">
            <div>Tənzimləmələr yüklənir...</div>
          </div>
        ) : (
          <>
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'health' && renderSystemHealth()}
            {activeTab === 'schedules' && renderScheduledReports()}
          </>
        )}
      </div>
    </StandardPageLayout>
  );
};

export default Settings;