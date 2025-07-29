import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiGrid, FiDownload, FiFilter, FiPieChart, FiBarChart } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstitutionReport {
  id: string;
  name: string;  
  type: 'region' | 'sector' | 'school';
  code: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averageClassSize: number;
  attendanceRate: number;
  performance: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

const ReportsInstitutionsPage: React.FC = () => {
  const [reports, setReports] = useState<InstitutionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    performance: '',
    region: '',
    dateRange: '30'
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: InstitutionReport[] = [
      {
        id: '1',
        name: 'Bakı Şəhər Təhsil İdarəsi',
        type: 'region',
        code: 'BTI',
        totalStudents: 45870,
        totalTeachers: 2340,
        totalClasses: 1890,
        averageClassSize: 24.3,
        attendanceRate: 94.5,
        performance: 'high',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        name: 'Yasamal Rayon Təhsil Sektoru',
        type: 'sector',
        code: 'YTS',
        totalStudents: 8750,
        totalTeachers: 420,
        totalClasses: 350,
        averageClassSize: 25.0,
        attendanceRate: 96.2,
        performance: 'high',
        lastUpdated: '2024-01-15'
      },
      {
        id: '3',
        name: '23 saylı məktəb',
        type: 'school',
        code: 'M023',
        totalStudents: 850,
        totalTeachers: 45,
        totalClasses: 32,
        averageClassSize: 26.6,
        attendanceRate: 97.8,
        performance: 'high',
        lastUpdated: '2024-01-15'
      },
      {
        id: '4',
        name: 'Gəncə Şəhər Təhsil İdarəsi',
        type: 'region',
        code: 'GTI',
        totalStudents: 28450,
        totalTeachers: 1560,
        totalClasses: 1180,
        averageClassSize: 24.1,
        attendanceRate: 92.3,
        performance: 'medium',
        lastUpdated: '2024-01-15'
      },
      {
        id: '5',
        name: '45 saylı məktəb',
        type: 'school',
        code: 'M045',
        totalStudents: 920,
        totalTeachers: 52,
        totalClasses: 36,
        averageClassSize: 25.6,
        attendanceRate: 89.2,
        performance: 'medium',
        lastUpdated: '2024-01-15'
      }
    ];
    
    setReports(mockData);
    setLoading(false);
  }, [filters]);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'high': return 'Yüksək';
      case 'medium': return 'Orta';
      case 'low': return 'Aşağı';
      default: return 'Bilinməyən';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'region': return 'Regional İdarə';
      case 'sector': return 'Sektor';  
      case 'school': return 'Məktəb';
      default: return 'Naməlum';
    }
  };

  const exportReport = () => {
    // Mock export functionality
    alert('Hesabat Excel formatında endirilir...');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Hesabat yüklənir...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Müəssisə Hesabatları"
        subtitle="Təhsil müəssisələrinin fəaliyyət və performans hesabatları"
        icon={<FiGrid className="w-6 h-6 text-blue-600" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportReport}>
              <FiDownload className="w-4 h-4 mr-2" />
              Excel Export
            </Button>
            <Button size="sm">
              <FiBarChart className="w-4 h-4 mr-2" />
              Analitika
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {reports.reduce((sum, r) => sum + r.totalStudents, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ümumi Şagird</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {reports.reduce((sum, r) => sum + r.totalTeachers, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ümumi Müəllim</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {reports.reduce((sum, r) => sum + r.totalClasses, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ümumi Sinif</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {(reports.reduce((sum, r) => sum + r.attendanceRate, 0) / reports.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Orta Davamiyyət</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Filtrlər</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müəssisə Növü
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hamısı</option>
                  <option value="region">Regional İdarə</option>
                  <option value="sector">Sektor</option>
                  <option value="school">Məktəb</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performans
                </label>
                <select
                  value={filters.performance}
                  onChange={(e) => setFilters({...filters, performance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hamısı</option>
                  <option value="high">Yüksək</option>
                  <option value="medium">Orta</option>
                  <option value="low">Aşağı</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hamısı</option>
                  <option value="baku">Bakı</option>
                  <option value="ganja">Gəncə</option>
                  <option value="sumgait">Sumqayıt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarix Aralığı
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 gün</option>
                  <option value="90">Son 3 ay</option>
                  <option value="365">Son 1 il</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Reports Table */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Müəssisə Hesabatları ({reports.length})
              </h3>
              <Button variant="outline" size="sm">
                <FiPieChart className="w-4 h-4 mr-2" />
                Qrafik Görünüş
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Müəssisə</th>
                    <th className="text-left py-3 px-2">Növ</th>
                    <th className="text-left py-3 px-2">Şagird</th>
                    <th className="text-left py-3 px-2">Müəllim</th>
                    <th className="text-left py-3 px-2">Sinif</th>
                    <th className="text-left py-3 px-2">Orta Həcm</th>
                    <th className="text-left py-3 px-2">Davamiyyət</th>
                    <th className="text-left py-3 px-2">Performans</th>
                    <th className="text-left py-3 px-2">Son Yenilənmə</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-gray-600">{report.code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">{getTypeText(report.type)}</span>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {report.totalStudents.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {report.totalTeachers.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {report.totalClasses}
                      </td>
                      <td className="py-3 px-2">
                        {report.averageClassSize.toFixed(1)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          report.attendanceRate >= 95 ? 'bg-green-100 text-green-800' :
                          report.attendanceRate >= 90 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(report.performance)}`}>
                          {getPerformanceText(report.performance)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {report.lastUpdated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ReportsInstitutionsPage;