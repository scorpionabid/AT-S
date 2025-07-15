import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Calendar,
  FileText,
  Target,
  Users
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import KSQResultForm from './KSQResultForm';
import BSQResultForm from './BSQResultForm';
import AssessmentAnalytics from './AssessmentAnalytics';
import '../../styles/assessment/assessment-dashboard.css';

interface AssessmentOverview {
  ksq_analytics: {
    total_assessments: number;
    average_score: number;
    latest_score: number;
    latest_date: string;
    performance_level: string;
    follow_up_required: number;
    overdue_follow_ups: number;
  };
  bsq_analytics: {
    total_assessments: number;
    latest_score: number;
    latest_date: string;
    performance_level: string;
    international_ranking: number;
    national_ranking: number;
    certification_analysis: {
      current_status: string;
      accreditation_level: string;
      near_expiration: boolean;
      requires_reassessment: boolean;
    };
  };
  overall_performance: {
    overall_score: number;
    performance_category: {
      level: string;
      description: string;
    };
    ksq_score: number;
    bsq_score: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    action_items: string[];
  }>;
}

const AssessmentDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AssessmentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'ksq' | 'bsq' | 'analytics'>('overview');
  const [showKSQForm, setShowKSQForm] = useState(false);
  const [showBSQForm, setShowBSQForm] = useState(false);

  useEffect(() => {
    fetchAssessmentOverview();
  }, []);

  const fetchAssessmentOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Qiymətləndirmə məlumatları yüklənə bilmədi');
      }

      const data = await response.json();
      setOverview(data.data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'satisfactory': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-orange-600 bg-orange-100';
      case 'unsatisfactory': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
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
        <Button onClick={fetchAssessmentOverview}>Yenidən Yüklə</Button>
      </div>
    );
  }

  return (
    <div className="assessment-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Qiymətləndirmə İdarəetməsi</h1>
        <div className="action-buttons">
          <Button 
            onClick={() => setShowKSQForm(true)}
            className="btn-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            KSQ Nəticəsi Əlavə Et
          </Button>
          <Button 
            onClick={() => setShowBSQForm(true)}
            className="btn-secondary"
          >
            <Award className="w-4 h-4 mr-2" />
            BSQ Nəticəsi Əlavə Et
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Ümumi Baxış
        </button>
        <button
          className={`tab-button ${activeTab === 'ksq' ? 'active' : ''}`}
          onClick={() => setActiveTab('ksq')}
        >
          <Target className="w-4 h-4 mr-2" />
          KSQ Nəticələri
        </button>
        <button
          className={`tab-button ${activeTab === 'bsq' ? 'active' : ''}`}
          onClick={() => setActiveTab('bsq')}
        >
          <Award className="w-4 h-4 mr-2" />
          BSQ Nəticələri
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Analitika
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="overview-content">
          {/* Performance Summary Cards */}
          <div className="summary-cards">
            <Card className="summary-card overall-performance">
              <div className="card-header">
                <h3>Ümumi Performans</h3>
                <div className={`performance-badge ${getPerformanceLevelColor(overview.overall_performance.performance_category.level)}`}>
                  {overview.overall_performance.performance_category.description}
                </div>
              </div>
              <div className="performance-score">
                {overview.overall_performance.overall_score}%
              </div>
              <div className="score-breakdown">
                <div className="score-item">
                  <span>KSQ:</span>
                  <span>{overview.overall_performance.ksq_score}%</span>
                </div>
                <div className="score-item">
                  <span>BSQ:</span>
                  <span>{overview.overall_performance.bsq_score}%</span>
                </div>
              </div>
            </Card>

            <Card className="summary-card ksq-summary">
              <div className="card-header">
                <h3>KSQ Qiymətləndirmə</h3>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className="metric-row">
                <span>Son Nəticə:</span>
                <span className="metric-value">{overview.ksq_analytics.latest_score}%</span>
              </div>
              <div className="metric-row">
                <span>Orta Bal:</span>
                <span className="metric-value">{overview.ksq_analytics.average_score}%</span>
              </div>
              <div className="metric-row">
                <span>Ümumi Qiymətləndirmə:</span>
                <span className="metric-value">{overview.ksq_analytics.total_assessments}</span>
              </div>
              {overview.ksq_analytics.overdue_follow_ups > 0 && (
                <div className="alert-row">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>{overview.ksq_analytics.overdue_follow_ups} gecikmiş təqib</span>
                </div>
              )}
            </Card>

            <Card className="summary-card bsq-summary">
              <div className="card-header">
                <h3>BSQ Qiymətləndirmə</h3>
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div className="metric-row">
                <span>Son Nəticə:</span>
                <span className="metric-value">{overview.bsq_analytics.latest_score}%</span>
              </div>
              <div className="metric-row">
                <span>Milli Reytinq:</span>
                <span className="metric-value">#{overview.bsq_analytics.national_ranking}</span>
              </div>
              <div className="metric-row">
                <span>Beynəlxalq Reytinq:</span>
                <span className="metric-value">#{overview.bsq_analytics.international_ranking}</span>
              </div>
              <div className="metric-row">
                <span>Akkreditasiya:</span>
                <span className="metric-value">{overview.bsq_analytics.certification_analysis.accreditation_level}</span>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          {overview.recommendations && overview.recommendations.length > 0 && (
            <Card className="recommendations-card">
              <h3>Tövsiyələr</h3>
              <div className="recommendations-list">
                {overview.recommendations.map((recommendation, index) => (
                  <div key={index} className={`recommendation-item ${getPriorityColor(recommendation.priority)}`}>
                    <div className="recommendation-header">
                      <h4>{recommendation.title}</h4>
                      <span className={`priority-badge priority-${recommendation.priority}`}>
                        {recommendation.priority === 'high' ? 'Yüksək' : 
                         recommendation.priority === 'medium' ? 'Orta' : 'Aşağı'}
                      </span>
                    </div>
                    <p>{recommendation.description}</p>
                    {recommendation.action_items && recommendation.action_items.length > 0 && (
                      <ul className="action-items">
                        {recommendation.action_items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AssessmentAnalytics />
      )}

      {/* KSQ Form Modal */}
      {showKSQForm && (
        <KSQResultForm 
          onClose={() => setShowKSQForm(false)}
          onSuccess={() => {
            setShowKSQForm(false);
            fetchAssessmentOverview();
          }}
        />
      )}

      {/* BSQ Form Modal */}
      {showBSQForm && (
        <BSQResultForm 
          onClose={() => setShowBSQForm(false)}
          onSuccess={() => {
            setShowBSQForm(false);
            fetchAssessmentOverview();
          }}
        />
      )}
    </div>
  );
};

export default AssessmentDashboard;