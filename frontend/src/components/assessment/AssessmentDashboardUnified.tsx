/**
 * ATİS Assessment Dashboard - Real Implementation
 * KSQ və BSQ nəticələrinin idarəetməsi
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import assessmentService, { AssessmentAnalytics, KSQResult, BSQResult } from '../../services/assessmentService';
import BSQResultForm from './BSQResultForm';
import KSQResultForm from './KSQResultForm';
import { FiAward, FiUsers, FiTrendingUp, FiAlertCircle, FiPlus, FiEye } from 'react-icons/fi';

const AssessmentDashboardUnified: React.FC = () => {
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ksq' | 'bsq' | 'create'>('overview');
  const [showKSQForm, setShowKSQForm] = useState(false);
  const [showBSQForm, setShowBSQForm] = useState(false);
  const [recentKSQ, setRecentKSQ] = useState<KSQResult[]>([]);
  const [recentBSQ, setRecentBSQ] = useState<BSQResult[]>([]);

  useEffect(() => {
    fetchAssessmentData();
    fetchRecentResults();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAssessmentAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const [ksqResults, bsqResults] = await Promise.all([
        assessmentService.getKSQResults({ limit: 5 }),
        assessmentService.getBSQResults({ limit: 5 })
      ]);
      setRecentKSQ(ksqResults.data);
      setRecentBSQ(bsqResults.data);
    } catch (error) {
      console.error('Failed to fetch recent results:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KSQ Qiymətləndirmələri</p>
              <p className="text-2xl font-bold text-blue-600">{analytics?.ksq_analytics.total_assessments}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">BSQ Qiymətləndirmələri</p>
              <p className="text-2xl font-bold text-green-600">{analytics?.bsq_analytics.total_assessments}</p>
            </div>
            <FiAward className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orta KSQ Bal</p>
              <p className="text-2xl font-bold text-purple-600">{analytics?.ksq_analytics.average_score.toFixed(1)}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Təkrar İzləmə</p>
              <p className="text-2xl font-bold text-orange-600">{analytics?.ksq_analytics.follow_up_required}</p>
            </div>
            <FiAlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Son KSQ Nəticələri</h3>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('ksq')}>
              <FiEye className="w-4 h-4 mr-2" />
              Hamısına Bax
            </Button>
          </div>
          <div className="space-y-3">
            {recentKSQ.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{result.teacher_name}</p>
                  <p className="text-sm text-gray-600">{result.assessment_date}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.grade === 'A' ? 'bg-green-100 text-green-800' :
                    result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.grade}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{result.total_score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Son BSQ Nəticələri</h3>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('bsq')}>
              <FiEye className="w-4 h-4 mr-2" />
              Hamısına Bax
            </Button>
          </div>
          <div className="space-y-3">
            {recentBSQ.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{result.school_name}</p>
                  <p className="text-sm text-gray-600">{result.assessment_date}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.grade === 'A' ? 'bg-green-100 text-green-800' :
                    result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.grade}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{result.total_score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Ümumi Baxış', icon: FiTrendingUp },
            { id: 'ksq', label: 'KSQ Nəticələri', icon: FiUsers },
            { id: 'bsq', label: 'BSQ Nəticələri', icon: FiAward },
            { id: 'create', label: 'Yeni Qiymətləndirmə', icon: FiPlus }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'ksq' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">KSQ Qiymətləndirmə Nəticələri</h2>
            <Button onClick={() => setShowKSQForm(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni KSQ
            </Button>
          </div>
          <Card className="p-6">
            <p className="text-gray-600">KSQ nəticələri burada göstəriləcək...</p>
          </Card>
        </div>
      )}
      {activeTab === 'bsq' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">BSQ Qiymətləndirmə Nəticələri</h2>
            <Button onClick={() => setShowBSQForm(true)}>
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni BSQ
            </Button>
          </div>
          <Card className="p-6">
            <p className="text-gray-600">BSQ nəticələri burada göstəriləcək...</p>
          </Card>
        </div>
      )}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">KSQ Qiymətləndirməsi</h3>
            <p className="text-gray-600 mb-4">Müəllim üçün Kompetensiya və Səlahiyyət Qiymətləndirməsi</p>
            <Button onClick={() => setShowKSQForm(true)} className="w-full">
              KSQ Formu Aç
            </Button>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">BSQ Qiymətləndirməsi</h3>
            <p className="text-gray-600 mb-4">Məktəb üçün Buraxılış Standart Qiymətləndirməsi</p>
            <Button onClick={() => setShowBSQForm(true)} className="w-full">
              BSQ Formu Aç
            </Button>
          </Card>
        </div>
      )}

      {/* Modals */}
      {showKSQForm && <KSQResultForm onClose={() => setShowKSQForm(false)} onSave={fetchRecentResults} />}
      {showBSQForm && <BSQResultForm onClose={() => setShowBSQForm(false)} onSave={fetchRecentResults} />}
    </div>
  );
};

export default AssessmentDashboardUnified;