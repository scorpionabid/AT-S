import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiTrendingUp, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload, FiBarChart } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingPage } from '../../components/ui/Loading';

interface BSQResult {
  id: number;
  institutionName: string;
  institutionCode: string;
  assessmentDate: string;
  leadershipScore: number;
  managementScore: number;
  innovationScore: number;
  communicationScore: number;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'approved' | 'submitted' | 'draft' | 'rejected';
  evaluatorName: string;
  improvementAreas: string[];
}

const BSQResultsPage: React.FC = () => {
  const [results, setResults] = useState<BSQResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    institutionType: '',
    status: '',
    grade: '',
    dateRange: '30',
    search: ''
  });

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: BSQResult[] = [
        {
          id: 1,
          institutionName: 'Bakı 23 saylı məktəb',
          institutionCode: 'BTI-M023',
          assessmentDate: '2024-01-15',
          leadershipScore: 87,
          managementScore: 92,
          innovationScore: 78,
          communicationScore: 85,
          totalScore: 85.5,
          grade: 'A',
          status: 'approved',
          evaluatorName: 'Dr. Rəşad Məmmədov',
          improvementAreas: ['Texnoloji innovasiya', 'Kadr inkişafı']
        },
        {
          id: 2,
          institutionName: 'Gəncə 45 saylı məktəb',
          institutionCode: 'GTI-M045',
          assessmentDate: '2024-01-12',
          leadershipScore: 75,
          managementScore: 82,
          innovationScore: 69,
          communicationScore: 77,
          totalScore: 75.8,
          grade: 'B',
          status: 'submitted',
          evaluatorName: 'Prof. Leyla Həsənova',
          improvementAreas: ['İdarəetmə sistemi', 'Maliyyə planlaşdırması', 'Pedaqoji yeniliklər']
        },
        {
          id: 3,
          institutionName: 'Sumqayıt 67 saylı məktəb',
          institutionCode: 'STI-M067',
          assessmentDate: '2024-01-10',
          leadershipScore: 65,
          managementScore: 71,
          innovationScore: 58,
          communicationScore: 68,
          totalScore: 65.5,
          grade: 'C',
          status: 'draft',
          evaluatorName: 'Əli Quliyev',
          improvementAreas: ['Liderlik bacarıqları', 'İnnovasiya mədəniyyəti', 'Kommunikasiya strategiyası']
        }
      ];
      
      setResults(mockData);
    } catch (error) {
      console.error('Failed to fetch BSQ results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Təsdiqlənib';
      case 'submitted': return 'Təqdim edilib';
      case 'draft': return 'Qaralama';
      case 'rejected': return 'Rədd edilib';
      default: return 'Naməlum';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingPage 
          title="BSQ Nəticələri Yüklənir"
          subtitle="Başçılıq və Səlahiyyət Qiymətləndirmə məlumatları hazırlanır..."
          cardCount={4}
          className="p-6"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="BSQ Nəticələri"
        subtitle="Başçılıq və Səlahiyyət Qiymətləndirmə nəticələri"
        icon={<FiTrendingUp className="w-6 h-6 atis-assessment" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FiBarChart className="w-4 h-4 mr-2" />
              Analitika
            </Button>
            <Button size="sm">
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni BSQ
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{results.length}</p>
                <p className="text-sm text-gray-600">Ümumi BSQ</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">Təsdiqlənmiş</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {results.filter(r => r.grade === 'A' || r.grade === 'B').length}
                </p>
                <p className="text-sm text-gray-600">Yüksək Performans</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {(results.reduce((sum, r) => sum + r.totalScore, 0) / results.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Orta Bal</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müəssisə Növü
                </label>
                <select
                  value={filters.institutionType}
                  onChange={(e) => setFilters({...filters, institutionType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hamısı</option>
                  <option value="school">Məktəb</option>
                  <option value="kindergarten">Uşaq Bağçası</option>
                  <option value="college">Kollec</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bütün statuslar</option>
                  <option value="draft">Qaralama</option>
                  <option value="submitted">Təqdim edilib</option>
                  <option value="approved">Təsdiqlənib</option>
                  <option value="rejected">Rədd edilib</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qiymət
                </label>
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bütün qiymətlər</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Axtarış
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Müəssisə adı..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                BSQ Nəticələri ({results.length})
              </h3>
              <Button variant="outline" size="sm">
                <FiDownload className="w-4 h-4 mr-2" />
                Excel Export
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Müəssisə</th>
                    <th className="text-left py-3 px-2">Qiymətləndirmə Tarixi</th>
                    <th className="text-left py-3 px-2">Liderlik</th>
                    <th className="text-left py-3 px-2">İdarəetmə</th>
                    <th className="text-left py-3 px-2">İnnovasiya</th>
                    <th className="text-left py-3 px-2">Kommunikasiya</th>
                    <th className="text-left py-3 px-2">Ümumi Bal</th>
                    <th className="text-left py-3 px-2">Qiymət</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{result.institutionName}</p>
                          <p className="text-sm text-gray-600">{result.institutionCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">{result.assessmentDate}</td>
                      <td className="py-3 px-2">{result.leadershipScore}</td>
                      <td className="py-3 px-2">{result.managementScore}</td>
                      <td className="py-3 px-2">{result.innovationScore}</td>
                      <td className="py-3 px-2">{result.communicationScore}</td>
                      <td className="py-3 px-2 font-medium">{result.totalScore.toFixed(1)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FiEye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <FiEdit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {results.length === 0 && (
                <div className="text-center py-8">
                  <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Heç bir BSQ nəticəsi tapılmadı</p>
                </div>
              )}
            </div>
          </Card>

          {/* Improvement Areas Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Təkmilləşdirmə Sahələri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{result.institutionName}</h4>
                  <div className="space-y-1">
                    {result.improvementAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default BSQResultsPage;