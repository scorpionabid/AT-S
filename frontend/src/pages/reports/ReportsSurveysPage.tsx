import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiTrendingUp, FiDownload, FiEye, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SurveyReport {
  id: string;
  title: string;
  type: 'teacher_satisfaction' | 'parent_feedback' | 'student_evaluation' | 'staff_survey';
  status: 'active' | 'completed' | 'draft';
  totalResponses: number;
  targetResponses: number;
  responseRate: number;
  averageRating: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  keyInsights: string[];
}

const ReportsSurveysPage: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: '30'
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: SurveyReport[] = [
      {
        id: '1',
        title: 'Müəllim Məmnuniyyət Anketi 2024',
        type: 'teacher_satisfaction',
        status: 'completed',
        totalResponses: 285,
        targetResponses: 300,
        responseRate: 95.0,
        averageRating: 4.2,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        createdBy: 'Rəşad Məmmədov',
        keyInsights: [
          'İş şəraiti ilə məmnuniyyət yüksəkdir (4.5/5)',
          'Peşəkar inkişaf imkanları təkmilləşdirilməlidir',
          'Texniki dəstək xidmətləri yaxşılaşdırılmalıdır'
        ]
      },
      {
        id: '2', 
        title: 'Valideyn Rəy və Təklifləri',
        type: 'parent_feedback',
        status: 'active',
        totalResponses: 456,
        targetResponses: 600,
        responseRate: 76.0,
        averageRating: 4.0,
        startDate: '2024-01-10',
        endDate: '2024-01-25',
        createdBy: 'Leyla Həsənova',
        keyInsights: [
          'Təhsil keyfiyyəti yüksək qiymətləndirilir',
          'İnfrastruktur və avadanlıq yaxşılaşdırılmalıdır',
          'Əlavə tədris fəaliyyətləri tələb olunur'
        ]
      },
      {
        id: '3',
        title: 'Şagird Təhsil Qiymətləndirməsi',
        type: 'student_evaluation',
        status: 'completed', 
        totalResponses: 1250,
        targetResponses: 1200,
        responseRate: 104.2,
        averageRating: 3.8,
        startDate: '2023-12-15',
        endDate: '2024-01-05',
        createdBy: 'Əli Quliyev',
        keyInsights: [
          'Dərs materialları müasir və maraqlıdır',
          'Müəllim-şagird əlaqəsi pozitivdir',
          'Qiymətləndirmə sistemi şəffaflıq tələb edir'
        ]
      },
      {
        id: '4',
        title: 'Heyət İçi Əməkdaşlıq Anketi',
        type: 'staff_survey',
        status: 'draft',
        totalResponses: 0,
        targetResponses: 150,
        responseRate: 0,
        averageRating: 0,
        startDate: '2024-01-20',
        endDate: '2024-02-05',
        createdBy: 'Cavid Məmmədov',
        keyInsights: []
      }
    ];
    
    setSurveys(mockData);
    setLoading(false);
  }, [filters]);

  const getTypeText = (type: string) => {
    switch (type) {
      case 'teacher_satisfaction': return 'Müəllim Məmnuniyyəti';
      case 'parent_feedback': return 'Valideyn Rəyi';
      case 'student_evaluation': return 'Şagird Qiymətləndirməsi';
      case 'staff_survey': return 'Heyət Anketi';
      default: return 'Naməlum';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Tamamlandı';
      case 'draft': return 'Qaralama';
      default: return 'Naməlum';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportSurveyData = (surveyId: string) => {
    alert(`Anket ${surveyId} məlumatları Excel formatında endirilir...`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Anket hesabatları yüklənir...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Anket Hesabatları"
        subtitle="Anketlərin nəticələri və analitik məlumatlar"
        icon={<FiTrendingUp className="w-6 h-6 text-green-600" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FiDownload className="w-4 h-4 mr-2" />
              Ümumi Report
            </Button>
            <Button size="sm">
              <FiTrendingUp className="w-4 h-4 mr-2" />
              Trend Analizi
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{surveys.length}</p>
                <p className="text-sm text-gray-600">Ümumi Anket</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {surveys.filter(s => s.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Tamamlanmış</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {surveys.reduce((sum, s) => sum + s.totalResponses, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Ümumi Cavab</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {surveys.filter(s => s.status === 'completed').length > 0 
                    ? (surveys.filter(s => s.status === 'completed')
                        .reduce((sum, s) => sum + s.averageRating, 0) / 
                       surveys.filter(s => s.status === 'completed').length).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-sm text-gray-600">Orta Reytinq</p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Filtrlər</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anket Növü
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hamısı</option>
                  <option value="teacher_satisfaction">Müəllim Məmnuniyyəti</option>
                  <option value="parent_feedback">Valideyn Rəyi</option>
                  <option value="student_evaluation">Şagird Qiymətləndirməsi</option>
                  <option value="staff_survey">Heyət Anketi</option>
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
                  <option value="">Hamısı</option>
                  <option value="active">Aktiv</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="draft">Qaralama</option>
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

          {/* Survey Reports */}
          <div className="space-y-4">
            {surveys.map((survey) => (
              <Card key={survey.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{survey.title}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(survey.status)}`}>
                        {getStatusText(survey.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{getTypeText(survey.type)}</p>
                    <p className="text-sm text-gray-500">
                      Yaradıcı: {survey.createdBy} • {survey.startDate} - {survey.endDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => exportSurveyData(survey.id)}>
                      <FiDownload className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <FiEye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-blue-600">{survey.totalResponses}</p>
                    <p className="text-sm text-gray-600">Cavab</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-green-600">{survey.targetResponses}</p>
                    <p className="text-sm text-gray-600">Hədəf</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-orange-600">{survey.responseRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Cavab Nisbəti</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className={`text-lg font-bold ${getRatingColor(survey.averageRating)}`}>
                      {survey.averageRating > 0 ? survey.averageRating.toFixed(1) : '-'}
                    </p>
                    <p className="text-sm text-gray-600">Orta Reytinq</p>
                  </div>
                </div>

                {survey.keyInsights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      Əsas Nəticələr:
                    </h4>
                    <ul className="space-y-1">
                      {survey.keyInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ReportsSurveysPage;