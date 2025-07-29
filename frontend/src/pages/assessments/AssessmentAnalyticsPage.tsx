import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiBarChart, FiTrendingUp, FiTrendingDown, FiPieChart, FiActivity, FiUsers, FiCalendar, FiDownload, FiFilter } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingPage, ErrorState } from '../../components/ui/Loading';
import { LineChart, PieChart, StatsCard, ChartContainer } from '../../components/charts/ChartComponents';
import { apiService } from '../../services/apiService';

interface AnalyticsData {
  overview: {
    totalAssessments: number;
    completedAssessments: number;
    averageScore: number;
    participationRate: number;
    improvementRate: number;
  };
  trends: {
    month: string;
    assessments: number;
    averageScore: number;
    participationRate: number;
  }[];
  categories: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  topPerformers: {
    institutionName: string;
    institutionCode: string;
    averageScore: number;
    assessmentCount: number;
    improvementRate: number;
  }[];
  lowPerformers: {
    institutionName: string;
    institutionCode: string;
    averageScore: number;
    assessmentCount: number;
    areas: string[];
  }[];
}

const AssessmentAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedAssessmentType]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Use API service with fallback data
      const response = await apiService.getAnalytics('assessments', {
        date_from: selectedPeriod === '3months' ? '2024-10-01' : '2024-08-01',
        date_to: '2025-01-31'
      });
      
      const mockData: AnalyticsData = response.data as any || {
        overview: {
          totalAssessments: 156,
          completedAssessments: 142,
          averageScore: 78.5,
          participationRate: 91.0,
          improvementRate: 12.3
        },
        trends: [
          { month: '2024-08', assessments: 23, averageScore: 75.2, participationRate: 88 },
          { month: '2024-09', assessments: 28, averageScore: 76.8, participationRate: 89 },
          { month: '2024-10', assessments: 31, averageScore: 78.1, participationRate: 92 },
          { month: '2024-11', assessments: 26, averageScore: 79.3, participationRate: 90 },
          { month: '2024-12', assessments: 22, averageScore: 80.1, participationRate: 93 },
          { month: '2025-01', assessments: 18, averageScore: 81.2, participationRate: 94 }
        ],
        categories: [
          { name: 'BSQ (Başçılıq)', value: 45, percentage: 28.8, color: '#3B82F6' },
          { name: 'Performans', value: 38, percentage: 24.4, color: '#10B981' },
          { name: 'Təhlükəsizlik', value: 32, percentage: 20.5, color: '#F59E0B' },
          { name: 'İnnovasiya', value: 25, percentage: 16.0, color: '#8B5CF6' },
          { name: 'Digər', value: 16, percentage: 10.3, color: '#6B7280' }
        ],
        topPerformers: [
          {
            institutionName: 'Bakı 23 saylı məktəb',
            institutionCode: 'BTI-M023',
            averageScore: 92.5,
            assessmentCount: 8,
            improvementRate: 15.2
          },
          {
            institutionName: 'Gəncə Texniki Kolleci',
            institutionCode: 'GTC-001',
            averageScore: 89.8,
            assessmentCount: 6,
            improvementRate: 12.7
          },
          {
            institutionName: 'Sumqayıt 67 saylı məktəb',
            institutionCode: 'STI-M067',
            averageScore: 87.3,
            assessmentCount: 7,
            improvementRate: 18.5
          },
          {
            institutionName: 'Şəki Regional Lisey',
            institutionCode: 'SRL-001',
            averageScore: 85.9,
            assessmentCount: 5,
            improvementRate: 14.1
          }
        ],
        lowPerformers: [
          {
            institutionName: 'Naxçıvan 15 saylı məktəb',
            institutionCode: 'NTI-M015',
            averageScore: 62.1,
            assessmentCount: 4,
            areas: ['Liderlik bacarıqları', 'Kommunikasiya', 'Texnoloji adaptasiya']
          },
          {
            institutionName: 'Quba Kənd Məktəbi',
            institutionCode: 'QKM-042',
            averageScore: 58.7,
            assessmentCount: 3,
            areas: ['İdarəetmə sistemi', 'Kadr inkişafı', 'Maliyyə planlaşdırması']
          },
          {
            institutionName: 'Zaqatala Orta Məktəb',
            institutionCode: 'ZOM-018',
            averageScore: 55.4,
            assessmentCount: 3,
            areas: ['Pedaqoji yeniliklər', 'Informasiya texnologiyaları', 'Şagird motivasiyası']
          }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingPage 
          title="Analitik Məlumatlar Yüklənir"
          subtitle="Qiymətləndirmə statistikaları hazırlanır..."
          cardCount={5}
          className="p-6"
        />
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <ErrorState 
            title="Analitik Məlumatlar Yüklənə Bilmədi"
            description="Server ilə əlaqə problemi baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin."
            onRetry={fetchAnalyticsData}
            className="mt-8"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Qiymətləndirmə Analitikası"
        subtitle="Qiymətləndirmə nəticələrinin ətraflı analizi və tendensiyalar"
        icon={<FiBarChart className="w-6 h-6 atis-assessment" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FiFilter className="w-4 h-4 mr-2" />
              Filtrlər
            </Button>
            <Button size="sm">
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müddət
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3months">Son 3 ay</option>
                  <option value="6months">Son 6 ay</option>
                  <option value="1year">Son 1 il</option>
                  <option value="all">Hamısı</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qiymətləndirmə Növü
                </label>
                <select
                  value={selectedAssessmentType}
                  onChange={(e) => setSelectedAssessmentType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Hamısı</option>
                  <option value="bsq">BSQ</option>
                  <option value="performance">Performans</option>
                  <option value="security">Təhlükəsizlik</option>
                  <option value="innovation">İnnovasiya</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatsCard
              title="Ümumi Qiymətləndirmə"
              value={analyticsData.overview.totalAssessments}
              icon={<FiActivity className="w-6 h-6" />}
              color="blue"
            />
            
            <StatsCard
              title="Tamamlanmış"
              value={analyticsData.overview.completedAssessments}
              change={8.2}
              changeLabel="son ay"
              icon={<FiUsers className="w-6 h-6" />}
              color="green"
            />
            
            <StatsCard
              title="Orta Bal"
              value={`${analyticsData.overview.averageScore}%`}
              change={3.1}
              changeLabel="artış"
              icon={<FiBarChart className="w-6 h-6" />}
              color="purple"
            />
            
            <StatsCard
              title="İştirak Nisbəti"
              value={`${analyticsData.overview.participationRate}%`}
              change={5.3}
              changeLabel="yaxşılaşma"
              icon={<FiCalendar className="w-6 h-6" />}
              color="orange"
            />
            
            <StatsCard
              title="Təkmilləşmə"
              value={`+${analyticsData.overview.improvementRate}%`}
              change={analyticsData.overview.improvementRate}
              changeLabel="ümumi artım"
              icon={<FiTrendingUp className="w-6 h-6" />}
              color="green"
            />
          </div>

          {/* Trends Chart */}
          <ChartContainer
            title="Aylıq Tendensiyalar"
            subtitle={`Son 6 ayda orta bal: ${analyticsData.trends[analyticsData.trends.length - 1]?.averageScore}%`}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Detallar</Button>
                <Button variant="outline" size="sm">
                  <FiDownload className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            }
          >
            <LineChart
              data={analyticsData.trends.map(trend => ({
                name: new Date(trend.month + '-01').toLocaleDateString('az-AZ', { month: 'short' }),
                value: trend.averageScore
              }))}
              height={280}
              showGrid={true}
              showValues={true}
              className="w-full"
            />
          </ChartContainer>

          {/* Category Distribution */}
          <ChartContainer
            title="Qiymətləndirmə Kateqoriyaları"
            subtitle="Qiymətləndirmə növlərinin paylanması"
            actions={
              <Button variant="outline" size="sm">
                <FiPieChart className="w-4 h-4 mr-1" />
                Tam Məlumat
              </Button>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
              <div className="space-y-3">
                {analyticsData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.value}</p>
                      <p className="text-sm text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <PieChart
                  data={analyticsData.categories}
                  size={240}
                  showLabels={true}
                  showLegend={false}
                />
              </div>
            </div>
          </ChartContainer>

          {/* Top and Low Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-600">
                <FiTrendingUp className="w-5 h-5" />
                Ən Yüksək Performans
              </h3>
              <div className="space-y-3">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-green-800">{performer.institutionName}</p>
                        <p className="text-sm text-green-600">{performer.institutionCode}</p>
                      </div>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                        {performer.averageScore}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-green-700">
                      <span>{performer.assessmentCount} qiymətləndirmə</span>
                      <span>+{performer.improvementRate}% artım</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Low Performers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <FiTrendingDown className="w-5 h-5" />
                Təkmilləşmə Tələb Edən
              </h3>
              <div className="space-y-3">
                {analyticsData.lowPerformers.map((performer, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-red-800">{performer.institutionName}</p>
                        <p className="text-sm text-red-600">{performer.institutionCode}</p>
                      </div>
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                        {performer.averageScore}%
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-red-700">{performer.assessmentCount} qiymətləndirmə</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {performer.areas.map((area, areaIndex) => (
                        <span key={areaIndex} className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Monthly Trends Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aylıq Məlumatlar</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Ay</th>
                    <th className="text-left py-3 px-2">Qiymətləndirmə Sayı</th>
                    <th className="text-left py-3 px-2">Orta Bal</th>
                    <th className="text-left py-3 px-2">İştirak Nisbəti</th>
                    <th className="text-left py-3 px-2">Dəyişiklik</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.trends.map((trend, index) => {
                    const prevTrend = analyticsData.trends[index - 1];
                    const scoreChange = prevTrend ? trend.averageScore - prevTrend.averageScore : 0;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">
                          {new Date(trend.month + '-01').toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' })}
                        </td>
                        <td className="py-3 px-2">{trend.assessments}</td>
                        <td className="py-3 px-2">{trend.averageScore}%</td>
                        <td className="py-3 px-2">{trend.participationRate}%</td>
                        <td className="py-3 px-2">
                          {scoreChange !== 0 && (
                            <span className={`flex items-center gap-1 ${scoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scoreChange > 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                              {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default AssessmentAnalyticsPage;