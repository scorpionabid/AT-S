import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiMapPin, FiUsers, FiBarChart, FiCalendar, FiSettings, FiMail } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface RegionalConfig {
  region: {
    name: string;
    code: string;
    timezone: string;
    language: string;
    currency: string;
  };
  workflow: {
    approvalLevels: number;
    autoApprovalLimit: number;
    reportingFrequency: string;
    dataValidationStrict: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    urgentOnly: boolean;
    weekendNotifications: boolean;
  };
  academicYear: {
    startDate: string;
    endDate: string;
    terms: number;
    examPeriods: string[];
  };
  permissions: {
    schoolDataAccess: boolean;
    reportGeneration: boolean;
    userManagement: boolean;
    systemSettings: boolean;
  };
}

const RegionalSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<RegionalConfig>({
    region: {
      name: 'Bakı Şəhər Təhsil İdarəsi',
      code: 'BTI',
      timezone: 'Asia/Baku',
      language: 'az',
      currency: 'AZN'
    },
    workflow: {
      approvalLevels: 2,
      autoApprovalLimit: 1000,
      reportingFrequency: 'weekly',
      dataValidationStrict: true
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      urgentOnly: false,
      weekendNotifications: false
    },
    academicYear: {
      startDate: '2024-09-15',
      endDate: '2025-06-15',
      terms: 2,
      examPeriods: ['2024-12-20', '2025-05-20']
    },
    permissions: {
      schoolDataAccess: true,
      reportGeneration: true,
      userManagement: false,
      systemSettings: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'region' | 'workflow' | 'academic' | 'permissions'>('region');

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Regional tənzimləmələr saxlanıldı!');
    } catch (error) {
      alert('Tənzimləmələr saxlanılmadı!');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    const confirm = window.confirm('Bütün tənzimləmələri standart vəziyyətə qaytarmaq istədiyinizə əminsiniz?');
    if (confirm) {
      // Reset config to default values
      alert('Tənzimləmələr standart vəziyyətə qaytarıldı!');
    }
  };

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Regional Tənzimləmələr"
        subtitle="Regional idarəetmə və workflow tənzimləmələri"
        icon={<FiMapPin className="w-6 h-6 text-green-600" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Standart Ayarlar
            </Button>
            <Button size="sm" onClick={handleSaveConfig} disabled={loading}>
              {loading ? 'Saxlanır...' : 'Tənzimləmələri Saxla'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Regional Info Card */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center">
                <FiMapPin className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{config.region.name}</h3>
                <p className="text-gray-600">Kod: {config.region.code}</p>
                <p className="text-sm text-gray-500">Regional Administrator Panel</p>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="p-1">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'region' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('region')}
                className="flex-1"
              >
                Regional Məlumatlar
              </Button>
              <Button
                variant={activeTab === 'workflow' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('workflow')}
                className="flex-1"
              >
                İş Prosesi
              </Button>
              <Button
                variant={activeTab === 'academic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('academic')}
                className="flex-1"
              >
                Akademik İl
              </Button>
              <Button
                variant={activeTab === 'permissions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('permissions')}
                className="flex-1"
              >
                İcazələr
              </Button>
            </div>
          </Card>

          {/* Region Tab */}
          {activeTab === 'region' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  Regional Məlumatlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Regional İdarə Adı
                    </label>
                    <input
                      type="text"
                      value={config.region.name}
                      onChange={(e) => setConfig({
                        ...config,
                        region: { ...config.region, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Regional Kod
                    </label>
                    <input
                      type="text"
                      value={config.region.code}
                      onChange={(e) => setConfig({
                        ...config,
                        region: { ...config.region, code: e.target.value.toUpperCase() }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaxt Zonası
                    </label>
                    <select
                      value={config.region.timezone}
                      onChange={(e) => setConfig({
                        ...config,
                        region: { ...config.region, timezone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Baku">Bakı (GMT+4)</option>
                      <option value="Europe/Moscow">Moskva (GMT+3)</option>
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Əsas Dil
                    </label>
                    <select
                      value={config.region.language}
                      onChange={(e) => setConfig({
                        ...config,
                        region: { ...config.region, language: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="az">Azərbaycan dili</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiMail className="w-5 h-5" />
                  Bildiriş Tənzimləmələri
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.notifications.emailAlerts}
                      onChange={(e) => setConfig({
                        ...config,
                        notifications: { ...config.notifications, emailAlerts: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Email Bildirişləri</p>
                      <p className="text-sm text-gray-500">Mühüm hadisələr üçün email bildirişləri al</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.notifications.smsAlerts}
                      onChange={(e) => setConfig({
                        ...config,
                        notifications: { ...config.notifications, smsAlerts: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">SMS Bildirişləri</p>
                      <p className="text-sm text-gray-500">Təcili həlllər üçün SMS bildirişləri</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.notifications.urgentOnly}
                      onChange={(e) => setConfig({
                        ...config,
                        notifications: { ...config.notifications, urgentOnly: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Yalnız Təcili Bildirişlər</p>
                      <p className="text-sm text-gray-500">Yalnız yüksək prioritetli bildirişləri al</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.notifications.weekendNotifications}
                      onChange={(e) => setConfig({
                        ...config,
                        notifications: { ...config.notifications, weekendNotifications: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Həftə Sonu Bildirişləri</p>
                      <p className="text-sm text-gray-500">Həftə sonları da bildirişləri al</p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>
          )}

          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                İş Prosesi Tənzimləmələri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Təsdiq Səviyyəsi Sayı
                    </label>
                    <select
                      value={config.workflow.approvalLevels}
                      onChange={(e) => setConfig({
                        ...config,
                        workflow: { ...config.workflow, approvalLevels: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 Səviyyə</option>
                      <option value={2}>2 Səviyyə</option>
                      <option value={3}>3 Səviyyə</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avtomatik Təsdiq Limiti (AZN)
                    </label>
                    <input
                      type="number"
                      value={config.workflow.autoApprovalLimit}
                      onChange={(e) => setConfig({
                        ...config,
                        workflow: { ...config.workflow, autoApprovalLimit: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hesabat Tezliyi
                    </label>
                    <select
                      value={config.workflow.reportingFrequency}
                      onChange={(e) => setConfig({
                        ...config,
                        workflow: { ...config.workflow, reportingFrequency: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Günlük</option>
                      <option value="weekly">Həftəlik</option>
                      <option value="monthly">Aylıq</option>
                      <option value="quarterly">Rüblük</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config.workflow.dataValidationStrict}
                        onChange={(e) => setConfig({
                          ...config,
                          workflow: { ...config.workflow, dataValidationStrict: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium">Sərt Məlumat Yoxlanması</p>
                        <p className="text-sm text-gray-500">Məlumat daxil edilərkən əlavə yoxlamalar aparır</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Akademik İl Tənzimləmələri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Akademik İlin Başlanğıcı
                  </label>
                  <input
                    type="date"
                    value={config.academicYear.startDate}
                    onChange={(e) => setConfig({
                      ...config,
                      academicYear: { ...config.academicYear, startDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Akademik İlin Sonu
                  </label>
                  <input
                    type="date"
                    value={config.academicYear.endDate}
                    onChange={(e) => setConfig({
                      ...config,
                      academicYear: { ...config.academicYear, endDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semestr Sayı
                  </label>
                  <select
                    value={config.academicYear.terms}
                    onChange={(e) => setConfig({
                      ...config,
                      academicYear: { ...config.academicYear, terms: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 Semestr</option>
                    <option value={3}>3 Semestr</option>
                    <option value={4}>4 Semestr</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Regional İcazələr
              </h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.permissions.schoolDataAccess}
                    onChange={(e) => setConfig({
                      ...config,
                      permissions: { ...config.permissions, schoolDataAccess: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium">Məktəb Məlumatlarına Giriş</p>
                    <p className="text-sm text-gray-500">Regiondakı bütün məktəblərin məlumatlarını görə bilir</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.permissions.reportGeneration}
                    onChange={(e) => setConfig({
                      ...config,
                      permissions: { ...config.permissions, reportGeneration: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium">Hesabat Yaratma</p>
                    <p className="text-sm text-gray-500">Regional və məktəb hesabatları yarada bilir</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.permissions.userManagement}
                    onChange={(e) => setConfig({
                      ...config,
                      permissions: { ...config.permissions, userManagement: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium">İstifadəçi İdarəetməsi</p>
                    <p className="text-sm text-gray-500">Regional səviyyədə istifadəçiləri idarə edə bilir</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.permissions.systemSettings}
                    disabled
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                  />
                  <div>
                    <p className="font-medium text-gray-400">Sistem Tənzimləmələri</p>
                    <p className="text-sm text-gray-400">Yalnız SuperAdmin üçün - Regional Admin üçün məhdudlaşdırılıb</p>
                  </div>
                </label>
              </div>
            </Card>
          )}
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default RegionalSettingsPage;