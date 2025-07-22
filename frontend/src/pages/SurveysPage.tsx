import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiFileText, FiPlus, FiRefreshCw, FiBarChart } from 'react-icons/fi';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import SurveysList from '../components/surveys/SurveysList';
import SurveyStatsOverview from '../components/surveys/SurveyStatsOverview';
import SurveysManagement from '../components/surveys/SurveysManagement';
import SurveyAnalyticsView from '../components/surveys/SurveyAnalyticsView';
import { Button } from '../components/ui/Button';
import { regionAdminService } from '../services/regionAdminService';
import type { RegionSurveyAnalytics } from '../services/regionAdminService';

const SurveysPage: React.FC = () => {
  const { user } = useAuth();
  const [surveyAnalytics, setSurveyAnalytics] = useState<RegionSurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'analytics' | 'create'>('surveys');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Show regional analytics for RegionAdmin users
  const isRegionAdmin = user?.role === 'regionadmin';

  useEffect(() => {
    if (isRegionAdmin) {
      fetchSurveyAnalytics();
    }
  }, [isRegionAdmin]);

  const fetchSurveyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getSurveyAnalytics();
      setSurveyAnalytics(data);
    } catch (error: any) {
      setError(error.message || 'Sorğu məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isRegionAdmin) {
      fetchSurveyAnalytics();
    }
  };

  // Page actions based on role
  const pageActions = (
    <div className="flex items-center space-x-3">
      {isRegionAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenilə
        </Button>
      )}
      <Button 
        variant="primary" 
        size="sm"
        onClick={() => {
          if (isRegionAdmin) {
            setActiveTab('create');
          } else {
            setShowCreateModal(true);
          }
        }}
      >
        <FiPlus className="w-4 h-4 mr-2" />
        Yeni Sorğu
      </Button>
    </div>
  );

  // Tabs for RegionAdmin
  const renderTabs = () => {
    if (!isRegionAdmin) return null;

    const tabs = [
      { id: 'overview', label: 'Ümumi Baxış', icon: FiBarChart, count: surveyAnalytics?.totalSurveys },
      { id: 'surveys', label: 'Sorğular', icon: FiFileText, count: surveyAnalytics?.activeSurveys },
      { id: 'analytics', label: 'Analitika', icon: FiBarChart },
      { id: 'create', label: 'Yeni Sorğu', icon: FiPlus }
    ];

    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
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
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  const renderContent = () => {
    if (isRegionAdmin) {
      if (error) {
        return (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={handleRefresh}>Yenidən Yüklə</Button>
          </div>
        );
      }

      switch (activeTab) {
        case 'overview':
          return surveyAnalytics ? (
            <SurveyStatsOverview analytics={surveyAnalytics} onRefresh={handleRefresh} />
          ) : null;
        case 'analytics':
          return surveyAnalytics ? (
            <SurveyAnalyticsView analytics={surveyAnalytics} />
          ) : null;
        case 'create':
          return (
            <SurveysManagement onSurveyCreated={handleRefresh} />
          );
        default:
          return <SurveysList showCreateModal={showCreateModal} onCreateModalClose={() => setShowCreateModal(false)} />;
      }
    }

    // Default view for other roles
    return <SurveysList showCreateModal={showCreateModal} onCreateModalClose={() => setShowCreateModal(false)} />;
  };

  return (
    <StandardPageLayout
      title="Sorğu İdarəetməsi"
      subtitle={isRegionAdmin 
        ? "Regional sorğuların idarəetməsi və analitika"
        : "Sistem sorğularının idarəetməsi"
      }
      icon={<FiFileText className="w-6 h-6 text-green-600" />}
      actions={pageActions}
    >
      {renderTabs()}
      {renderContent()}
    </StandardPageLayout>
  );
};

export default SurveysPage;