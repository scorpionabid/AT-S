import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Calendar,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AnalyticsData {
  performance_trends: {
    ksq_trends: Array<{
      month: string;
      average_score: number;
      assessment_count: number;
    }>;
    bsq_trends: Array<{
      month: string;
      average_score: number;
      assessment_count: number;
    }>;
    trend_analysis: {
      ksq_direction: string;
      bsq_direction: string;
      overall_improvement: number;
    };
  };
  rankings: {
    regional_ranking: {
      position: number;
      total_institutions: number;
      score: number;
      percentile: number;
    };
    national_ranking: {
      position: number;
      total_institutions: number;
      score: number;
      percentile: number;
    };
  };
  comparison: {
    regional_average: number;
    national_average: number;
    improvement_rate: number;
    consistency_score: number;
  };
  improvement_areas: Array<{
    area: string;
    current_score: number;
    target_score: number;
    priority: string;
    recommendations: string[];
  }>;
  detailed_analytics: {
    criteria_performance: Record<string, {
      average_score: number;
      trend: string;
      assessment_count: number;
    }>;
    monthly_distribution: Record<string, number>;
    performance_consistency: number;
    goal_achievement_rate: number;
  };
}

const AssessmentAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('12');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [institutions, setInstitutions] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchInstitutions();
  }, [selectedPeriod, selectedInstitution]);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch('/api/institutions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        include_trends: 'true',
        include_rankings: 'true',
        include_recommendations: 'true'
      });

      if (selectedInstitution) {
        params.append('institution_id', selectedInstitution);
      }

      const response = await fetch(`/api/assessments/analytics?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (!response.ok) {
        throw new Error('Analitik məlumatlar yüklənə bilmədi');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (direction: string) => {
    switch (direction) {
      case 'improving':
        return 'Yaxşılaşır';
      case 'declining':
        return 'Pisləşir';
      default:
        return 'Sabit';
    }
  };

  const getPerformanceLevelColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchAnalytics}>Yenidən Yüklə</Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Analitik məlumat mövcud deyil</div>
      </div>
    );
  }

  return (
    <div className="assessment-analytics space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Müəssisə
          </label>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bütün müəssisələr</option>
            {institutions.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dövr
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="6">Son 6 ay</option>
            <option value="12">Son 12 ay</option>
            <option value="24">Son 24 ay</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button onClick={fetchAnalytics} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenilə
          </Button>
        </div>
      </div>

      {/* Performance Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
          Performans Trendləri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KSQ Trends */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">KSQ Trendləri</h4>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analytics.performance_trends.trend_analysis.ksq_direction)}
                <span className="text-sm text-gray-600">
                  {getTrendLabel(analytics.performance_trends.trend_analysis.ksq_direction)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {analytics.performance_trends.ksq_trends.slice(-6).map((trend, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{trend.average_score}%</span>
                    <span className="text-xs text-gray-500">({trend.assessment_count} qiymətləndirmə)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BSQ Trends */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">BSQ Trendləri</h4>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analytics.performance_trends.trend_analysis.bsq_direction)}
                <span className="text-sm text-gray-600">
                  {getTrendLabel(analytics.performance_trends.trend_analysis.bsq_direction)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {analytics.performance_trends.bsq_trends.slice(-6).map((trend, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{trend.average_score}%</span>
                    <span className="text-xs text-gray-500">({trend.assessment_count} qiymətləndirmə)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Improvement */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-900">Ümumi Təkmilləşmə</span>
            <span className={`font-bold text-lg ${analytics.performance_trends.trend_analysis.overall_improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.performance_trends.trend_analysis.overall_improvement > 0 ? '+' : ''}
              {analytics.performance_trends.trend_analysis.overall_improvement}%
            </span>
          </div>
        </div>
      </Card>

      {/* Rankings and Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rankings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Reytinq Mövqeyi
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Regional Reytinq</div>
                <div className="text-sm text-gray-600">
                  {analytics.rankings.regional_ranking.total_institutions} müəssisə içərisində
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  #{analytics.rankings.regional_ranking.position}
                </div>
                <div className="text-sm text-gray-600">
                  {analytics.rankings.regional_ranking.percentile}% persentil
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Milli Reytinq</div>
                <div className="text-sm text-gray-600">
                  {analytics.rankings.national_ranking.total_institutions} müəssisə içərisində
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  #{analytics.rankings.national_ranking.position}
                </div>
                <div className="text-sm text-gray-600">
                  {analytics.rankings.national_ranking.percentile}% persentil
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Müqayisəli Analiz
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Regional Ortalama</span>
              <span className={`font-semibold px-2 py-1 rounded ${getPerformanceLevelColor(analytics.comparison.regional_average)}`}>
                {analytics.comparison.regional_average}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Milli Ortalama</span>
              <span className={`font-semibold px-2 py-1 rounded ${getPerformanceLevelColor(analytics.comparison.national_average)}`}>
                {analytics.comparison.national_average}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Təkmilləşmə Sürəti</span>
              <span className={`font-semibold ${analytics.comparison.improvement_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.comparison.improvement_rate > 0 ? '+' : ''}
                {analytics.comparison.improvement_rate}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Ardıcıllıq Göstəricisi</span>
              <span className={`font-semibold px-2 py-1 rounded ${getPerformanceLevelColor(analytics.comparison.consistency_score)}`}>
                {analytics.comparison.consistency_score}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Improvement Areas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-red-500" />
          Təkmilləşdirmə Sahələri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.improvement_areas.map((area, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(area.priority)}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{area.area}</h4>
                <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                  {area.priority === 'high' ? 'Yüksək' : 
                   area.priority === 'medium' ? 'Orta' : 'Aşağı'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cari:</span>
                  <span className="font-medium">{area.current_score}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Hədəf:</span>
                  <span className="font-medium">{area.target_score}%</span>
                </div>

                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full" 
                    style={{ width: `${(area.current_score / area.target_score) * 100}%` }}
                  ></div>
                </div>

                {area.recommendations.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-1">Tövsiyələr:</div>
                    <ul className="text-xs space-y-1">
                      {area.recommendations.slice(0, 2).map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <span className="inline-block w-1 h-1 bg-current rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Criteria Performance */}
      {analytics.detailed_analytics.criteria_performance && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            Meyar üzrə Performans
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.detailed_analytics.criteria_performance).map(([criteria, performance]) => (
              <div key={criteria} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{criteria.replace('_', ' ').toUpperCase()}</h4>
                  {getTrendIcon(performance.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ortalama Bal:</span>
                    <span className="font-medium">{performance.average_score}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Qiymətləndirmə Sayı:</span>
                    <span className="font-medium">{performance.assessment_count}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${performance.average_score >= 80 ? 'bg-green-500' : 
                        performance.average_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${performance.average_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssessmentAnalytics;