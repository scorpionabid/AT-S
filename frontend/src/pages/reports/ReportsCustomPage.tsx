import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiSettings, FiPlay, FiSave, FiEye, FiFilter, FiCalendar, FiBarChart } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];
  lastUsed?: string;
}

interface CustomReportConfig {
  name: string;
  description: string;
  dataSource: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    institution: string[];
    region: string[];
    type: string[];
  };
  fields: string[];
  groupBy: string;
  sortBy: string;
  format: 'table' | 'chart' | 'summary';
}

const ReportsCustomPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'saved'>('builder');
  const [config, setConfig] = useState<CustomReportConfig>({
    name: '',
    description: '',
    dataSource: 'institutions',
    dateRange: {
      start: '',
      end: ''
    },
    filters: {
      institution: [],
      region: [],
      type: []
    },
    fields: [],
    groupBy: '',
    sortBy: '',
    format: 'table'
  });

  const [templates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Müəssisə Performans Hesabatı',
      description: 'Təhsil müəssisələrinin ümumi performans göstəriciləri',
      category: 'Performans',
      fields: ['name', 'studentCount', 'teacherCount', 'averageGrade', 'attendanceRate'],
      lastUsed: '2024-01-10'
    },
    {
      id: '2',
      name: 'Regional Müqayisə Analizi',
      description: 'Regionlar arası müqayisəli təhlil',
      category: 'Analitika',
      fields: ['region', 'totalInstitutions', 'totalStudents', 'budget', 'performance'],
      lastUsed: '2024-01-08'
    },
    {
      id: '3',
      name: 'Davamiyyət Həftəlik Hesabatı',
      description: 'Həftəlik davamiyyət statistikaları',
      category: 'Davamiyyət',
      fields: ['date', 'totalStudents', 'presentStudents', 'attendanceRate', 'absenceReasons']
    },
    {
      id: '4',
      name: 'Müəllim Bölgü Hesabatı',
      description: 'Müəllimlərin fənn və yaş qrupları üzrə bölgüsü',
      category: 'Kadr',
      fields: ['subject', 'teacherCount', 'ageGroup', 'experience', 'qualification']
    }
  ]);

  const availableFields = {
    institutions: [
      { id: 'name', label: 'Müəssisə Adı' },
      { id: 'code', label: 'Kod' },
      { id: 'type', label: 'Növ' },
      { id: 'region', label: 'Region' },
      { id: 'studentCount', label: 'Şagird Sayı' },
      { id: 'teacherCount', label: 'Müəllim Sayı' },
      { id: 'classCount', label: 'Sinif Sayı' },
      { id: 'attendanceRate', label: 'Davamiyyət Faizi' },
      { id: 'averageGrade', label: 'Orta Qiymət' },
      { id: 'budget', label: 'Büdcə' },
      { id: 'performance', label: 'Performans' }
    ],
    surveys: [
      { id: 'title', label: 'Anket Adı' },
      { id: 'type', label: 'Növ' },
      { id: 'responseCount', label: 'Cavab Sayı' },
      { id: 'responseRate', label: 'Cavab Nisbəti' },
      { id: 'averageRating', label: 'Orta Reytinq' },
      { id: 'startDate', label: 'Başlama Tarixi' },
      { id: 'endDate', label: 'Bitmə Tarixi' }
    ],
    users: [
      { id: 'name', label: 'Ad Soyad' },
      { id: 'role', label: 'Rol' },
      { id: 'institution', label: 'Müəssisə' },
      { id: 'lastLogin', label: 'Son Giriş' },
      { id: 'status', label: 'Status' }
    ]
  };

  const handleFieldToggle = (fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const applyTemplate = (template: ReportTemplate) => {
    setConfig(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      fields: template.fields
    }));
    setActiveTab('builder');
  };

  const generateReport = () => {
    alert('Hesabat hazırlanır və nəticələr görüntülənəcək...');
  };

  const saveReport = () => {
    if (!config.name) {
      alert('Hesabat adı daxil edin!');
      return;
    }
    alert(`"${config.name}" hesabatı saxlanıldı!`);
  };

  const previewReport = () => {
    alert('Hesabat önbaxışı açılır...');
  };

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Xüsusi Hesabat Yaradıcısı"
        subtitle="Tələblərə uyğun hesabat və analitik məlumatlar yaradın"
        icon={<FiSettings className="w-6 h-6 text-purple-600" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previewReport}>
              <FiEye className="w-4 h-4 mr-2" />
              Önbaxış
            </Button>
            <Button size="sm" onClick={generateReport}>
              <FiPlay className="w-4 h-4 mr-2" />
              Hesabatı Çap Et
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <Card className="p-1">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'builder' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('builder')}
                className="flex-1"
              >
                Hesabat Yaradıcısı
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('templates')}
                className="flex-1"
              >
                Şablonlar
              </Button>
              <Button
                variant={activeTab === 'saved' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                className="flex-1"
              >
                Saxlanmış Hesabatlar
              </Button>
            </div>
          </Card>

          {/* Report Builder Tab */}
          {activeTab === 'builder' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Əsas Məlumatlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hesabat Adı
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({...config, name: e.target.value})}
                      placeholder="Hesabatın adını daxil edin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Məlumat Mənbəyi
                    </label>
                    <select
                      value={config.dataSource}
                      onChange={(e) => setConfig({...config, dataSource: e.target.value, fields: []})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="institutions">Müəssisələr</option>
                      <option value="surveys">Anketlər</option>
                      <option value="users">İstifadəçilər</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Təsvir
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({...config, description: e.target.value})}
                    placeholder="Hesabatın təsvirini daxil edin"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </Card>

              {/* Date Range */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  Tarix Aralığı
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlama Tarixi
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: {...config.dateRange, start: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitmə Tarixi
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: {...config.dateRange, end: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Fields Selection */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  Sahələr
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableFields[config.dataSource as keyof typeof availableFields]?.map((field) => (
                    <label key={field.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={config.fields.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Output Format */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart className="w-5 h-5" />
                  Çıxış Formatı
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="table"
                      checked={config.format === 'table'}
                      onChange={(e) => setConfig({...config, format: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Cədvəl</p>
                      <p className="text-sm text-gray-600">Məlumatları cədvəl formatında göstər</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="chart"
                      checked={config.format === 'chart'}
                      onChange={(e) => setConfig({...config, format: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Qrafik</p>
                      <p className="text-sm text-gray-600">Vizual qrafiklər ilə göstər</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="summary"
                      checked={config.format === 'summary'}
                      onChange={(e) => setConfig({...config, format: e.target.value as any})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium">Xülasə</p>
                      <p className="text-sm text-gray-600">Qısa xülasə şəklində göstər</p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={saveReport}>
                  <FiSave className="w-4 h-4 mr-2" />
                  Saxla
                </Button>
                <Button onClick={generateReport}>
                  <FiPlay className="w-4 h-4 mr-2" />
                  Hesabatı Hazırla
                </Button>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-blue-600">{template.category}</p>
                    </div>
                    <Button size="sm" onClick={() => applyTemplate(template)}>
                      İstifadə Et
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    Sahələr: {template.fields.length} vahid
                    {template.lastUsed && (
                      <span className="ml-3">Son istifadə: {template.lastUsed}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Saved Reports Tab */}
          {activeTab === 'saved' && (
            <Card className="p-8 text-center">
              <FiSave className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Saxlanmış Hesabat Yoxdur
              </h3>
              <p className="text-gray-500 mb-4">
                Hesabat yaradıcısından istifadə edərək yeni hesabat yaradın və saxlayın.
              </p>
              <Button onClick={() => setActiveTab('builder')}>
                Hesabat Yaradıcısına Keç
              </Button>
            </Card>
          )}
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ReportsCustomPage;