import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiSettings, FiServer, FiDatabase, FiMail, FiShield, FiCpu, FiHardDrive, FiWifi } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SystemConfig {
  general: {
    systemName: string;
    systemVersion: string;
    maintenanceMode: boolean;
    maxUsers: number;
    sessionTimeout: number;
  };
  database: {
    host: string;
    port: number;
    name: string;
    maxConnections: number;
    backupEnabled: boolean;
    backupFrequency: string;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      username: string;
      encryption: string;
    };
    fromAddress: string;
    fromName: string;
  };
  security: {
    passwordMinLength: number;
    passwordComplexity: boolean;
    twoFactorAuth: boolean;
    sessionSecurity: boolean;
    auditLogging: boolean;
  };
}

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  uptime: string;
}

const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      systemName: 'ATİS - Azerbaijan Education System',
      systemVersion: '2.1.4',
      maintenanceMode: false,
      maxUsers: 5000,
      sessionTimeout: 30
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'atis_db',
      maxConnections: 100,
      backupEnabled: true,
      backupFrequency: 'daily'
    },
    email: {
      smtp: {
        host: 'smtp.edu.az',
        port: 587,
        username: 'noreply@atis.edu.az',
        encryption: 'TLS'
      },
      fromAddress: 'noreply@atis.edu.az',
      fromName: 'ATİS System'
    },
    security: {
      passwordMinLength: 8,
      passwordComplexity: true,
      twoFactorAuth: false,
      sessionSecurity: true,
      auditLogging: true
    }
  });

  const [stats, setStats] = useState<SystemStats>({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 12,
    activeUsers: 1247,
    uptime: '15 gün 4 saat'
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'email' | 'security' | 'monitoring'>('general');

  // Simulate real-time stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 20))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Sistem tənzimləmələri saxlanıldı!');
    } catch (error) {
      alert('Tənzimləmələr saxlanılmadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = () => {
    const newMode = !config.general.maintenanceMode;
    if (newMode) {
      const confirm = window.confirm('Sistem baxım rejiminə keçsin? Bu zaman istifadəçilər sistemə daxil ola bilməyəcək.');
      if (confirm) {
        setConfig(prev => ({
          ...prev,
          general: { ...prev.general, maintenanceMode: true }
        }));
      }
    } else {
      setConfig(prev => ({
        ...prev,
        general: { ...prev.general, maintenanceMode: false }
      }));
    }
  };

  const testEmailConnection = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Email əlaqəsi uğurla test edildi!');
    } catch (error) {
      alert('Email əlaqəsi xətası!');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-green-600';
    if (value < 80) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Sistem Tənzimləmələri"
        subtitle="Sistem konfiqurasiyası və performans monitorinqi"
        icon={<FiSettings className="w-6 h-6 text-purple-600" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMaintenanceToggle}>
              {config.general.maintenanceMode ? 'Baxımı Bitir' : 'Baxım Rejimi'}
            </Button>
            <Button size="sm" onClick={handleSaveConfig} disabled={loading}>
              {loading ? 'Saxlanır...' : 'Tənzimləmələri Saxla'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* System Status Alert */}
          {config.general.maintenanceMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <FiSettings className="w-5 h-5" />
                <span className="font-medium">Sistem Baxım Rejimindədir</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                İstifadəçilər sistemə daxil ola bilmir. Baxım işləri tamamlandıqdan sonra rejimi söndürün.
              </p>
            </div>
          )}

          {/* Tabs */}
          <Card className="p-1">
            <div className="flex gap-1 overflow-x-auto">
              <Button
                variant={activeTab === 'general' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('general')}
                className="whitespace-nowrap"
              >
                Ümumi
              </Button>
              <Button
                variant={activeTab === 'database' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('database')}
                className="whitespace-nowrap"
              >
                Verilənlər Bazası
              </Button>
              <Button
                variant={activeTab === 'email' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('email')}
                className="whitespace-nowrap"
              >
                Email
              </Button>
              <Button
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('security')}
                className="whitespace-nowrap"
              >
                Təhlükəsizlik
              </Button>
              <Button
                variant={activeTab === 'monitoring' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('monitoring')}
                className="whitespace-nowrap"
              >
                Monitoring
              </Button>
            </div>
          </Card>

          {/* General Tab */}
          {activeTab === 'general' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiServer className="w-5 h-5" />
                Ümumi Tənzimləmələr
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sistem Adı
                  </label>
                  <input
                    type="text"
                    value={config.general.systemName}
                    onChange={(e) => setConfig({
                      ...config,
                      general: { ...config.general, systemName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sistem Versiyası
                  </label>
                  <input
                    type="text"
                    value={config.general.systemVersion}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimum İstifadəçi Sayı
                  </label>
                  <input
                    type="number"
                    value={config.general.maxUsers}
                    onChange={(e) => setConfig({
                      ...config,
                      general: { ...config.general, maxUsers: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sessiya Vaxtı (dəqiqə)
                  </label>
                  <input
                    type="number"
                    value={config.general.sessionTimeout}
                    onChange={(e) => setConfig({
                      ...config,
                      general: { ...config.general, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiDatabase className="w-5 h-5" />
                Verilənlər Bazası Tənzimləmələri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    value={config.database.host}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, host: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={config.database.port}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, port: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verilənlər Bazası Adı
                  </label>
                  <input
                    type="text"
                    value={config.database.name}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimum Bağlantı
                  </label>
                  <input
                    type="number"
                    value={config.database.maxConnections}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, maxConnections: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.database.backupEnabled}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, backupEnabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Avtomatik Backup Aktiv</span>
                </label>
                {config.database.backupEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backup Tezliyi
                    </label>
                    <select
                      value={config.database.backupFrequency}
                      onChange={(e) => setConfig({
                        ...config,
                        database: { ...config.database, backupFrequency: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">Saatlıq</option>
                      <option value="daily">Günlük</option>
                      <option value="weekly">Həftəlik</option>
                      <option value="monthly">Aylıq</option>
                    </select>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiMail className="w-5 h-5" />
                Email Tənzimləmələri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={config.email.smtp.host}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { 
                        ...config.email, 
                        smtp: { ...config.email.smtp, host: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={config.email.smtp.port}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { 
                        ...config.email, 
                        smtp: { ...config.email.smtp, port: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Göndərən Email
                  </label>
                  <input
                    type="email"
                    value={config.email.fromAddress}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, fromAddress: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Göndərən Ad
                  </label>
                  <input
                    type="text"
                    value={config.email.fromName}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, fromName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={testEmailConnection} disabled={loading}>
                  Email Əlaqəsini Test Et
                </Button>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5" />
                Təhlükəsizlik Tənzimləmələri
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Şifrə Uzunluğu
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={config.security.passwordMinLength}
                      onChange={(e) => setConfig({
                        ...config,
                        security: { ...config.security, passwordMinLength: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.security.passwordComplexity}
                      onChange={(e) => setConfig({
                        ...config,
                        security: { ...config.security, passwordComplexity: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Şifrə Mürəkkəbliyi</p>
                      <p className="text-sm text-gray-500">Böyük hərf, kiçik hərf, rəqəm və simvol tələb edir</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.security.twoFactorAuth}
                      onChange={(e) => setConfig({
                        ...config,
                        security: { ...config.security, twoFactorAuth: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">2FA (İki Faktorlu Kimlik Doğrulama)</p>
                      <p className="text-sm text-gray-500">Əlavə təhlükəsizlik üçün SMS/App kodu tələb edir</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.security.sessionSecurity}
                      onChange={(e) => setConfig({
                        ...config,
                        security: { ...config.security, sessionSecurity: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Sessiya Təhlükəsizliyi</p>
                      <p className="text-sm text-gray-500">IP adresi dəyişikliyi zamanı yenidən giriş tələb edir</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.security.auditLogging}
                      onChange={(e) => setConfig({
                        ...config,
                        security: { ...config.security, auditLogging: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Audit Qeydiyyatı</p>
                      <p className="text-sm text-gray-500">Bütün sistem əməliyyatlarını qeydə alır</p>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">CPU İstifadəsi</span>
                    <FiCpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(stats.cpu)}`}
                        style={{ width: `${stats.cpu}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{stats.cpu}%</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Yaddaş</span>
                    <FiHardDrive className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(stats.memory)}`}
                        style={{ width: `${stats.memory}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{stats.memory}%</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Disk Sahəsi</span>
                    <FiHardDrive className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(stats.disk)}`}
                        style={{ width: `${stats.disk}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{stats.disk}%</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Şəbəkə</span>
                    <FiWifi className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(stats.network)}`}
                        style={{ width: `${stats.network}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{stats.network}%</span>
                  </div>
                </Card>
              </div>

              {/* System Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sistem Məlumatları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aktiv İstifadəçilər:</span>
                      <span className="font-medium">{stats.activeUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sistem İşləmə Müddəti:</span>
                      <span className="font-medium">{stats.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verilənlər Bazası:</span>
                      <span className="font-medium text-green-600">Aktiv</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Son Backup:</span>
                      <span className="font-medium">Bu gün 03:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sistem Statusu:</span>
                      <span className="font-medium text-green-600">Sağlam</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Son Yenilənmə:</span>
                      <span className="font-medium">2024-01-15</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default SystemSettingsPage;