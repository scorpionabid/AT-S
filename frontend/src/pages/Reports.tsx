import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsService } from '../services/reportsService';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiBarChart2 } from 'react-icons/fi';
import { StatsGrid, ContentCard, TabNavigation, type StatCard, type Tab } from '../components/ui';
import type { 
  OverviewStats, 
  InstitutionalPerformance, 
  SurveyAnalytics, 
  UserActivityReport,
  ReportFilters 
} from '../services/reportsService';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [institutionalPerformance, setInstitutionalPerformance] = useState<InstitutionalPerformance | null>(null);
  const [surveyAnalytics, setSurveyAnalytics] = useState<SurveyAnalytics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityReport | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState<ReportFilters>({});

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const requestFilters = { ...filters, ...dateRange };

      switch (activeTab) {
        case 'overview':
          const overview = await reportsService.getOverviewStats(requestFilters);
          setOverviewStats(overview);
          break;
        case 'institutional':
          const institutional = await reportsService.getInstitutionalPerformance(requestFilters);
          setInstitutionalPerformance(institutional);
          break;
        case 'surveys':
          const surveys = await reportsService.getSurveyAnalytics(requestFilters);
          setSurveyAnalytics(surveys);
          break;
        case 'users':
          const users = await reportsService.getUserActivityReport(requestFilters);
          setUserActivity(users);
          break;
      }
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      setError(error.message || 'Hesabat məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'json' | 'pdf') => {
    setLoading(true);
    try {
      const result = await reportsService.exportReport(activeTab, format, { ...filters, ...dateRange });
      
      // Create download link
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : format === 'pdf' ? 'application/pdf' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Show success message
      setError(null);
    } catch (error: any) {
      setError('Export zamanı xəta baş verdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewStats = () => {
    if (!overviewStats) return null;

    const statsData: StatCard[] = [
      {
        title: 'İstifadəçi Statistikası',
        value: overviewStats.user_statistics.total_users,
        icon: '👥',
        color: 'blue',
        change: `Aktiv: ${overviewStats.user_statistics.active_users}, Yeni: ${overviewStats.user_statistics.new_users}`
      },
      {
        title: 'Təşkilat Statistikası',
        value: overviewStats.institution_statistics.total_institutions,
        icon: '🏢',
        color: 'green',
        change: `Aktiv: ${overviewStats.institution_statistics.active_institutions}`
      },
      {
        title: 'Sorğu Statistikası',
        value: overviewStats.survey_statistics.total_surveys,
        icon: '📊',
        color: 'purple',
        change: `Dərc edilmiş: ${overviewStats.survey_statistics.published_surveys}`
      }
    ];

    return <StatsGrid stats={statsData} />;
  };

  const renderInstitutionalPerformance = () => {
    return (
      <ContentCard title="Təşkilat Performansı" loading={!institutionalPerformance}>
        <div className="text-sm text-neutral-600">
          Bu bölmə həyata keçirilir...
        </div>
      </ContentCard>
    );
  };

  const renderSurveyAnalytics = () => {
    return (
      <ContentCard title="Sorğu Analitikası" loading={!surveyAnalytics}>
        <div className="text-sm text-neutral-600">
          Bu bölmə həyata keçirilir...
        </div>
      </ContentCard>
    );
  };

  const renderUserActivity = () => {
    return (
      <ContentCard title="İstifadəçi Aktivliyi" loading={!userActivity}>
        <div className="text-sm text-neutral-600">
          Bu bölmə həyata keçirilir...
        </div>
      </ContentCard>
    );
  };

  return (
    <StandardPageLayout
      title="Hesabatlar"
      subtitle="Sistem məlumatları və analitika"
      icon={<FiBarChart2 className="w-6 h-6 text-blue-600" />}
    >
      <div className="dashboard-container">
        {/* Header Controls */}
        <ContentCard
          title="Filtr və Export"
          subtitle="Hesabat parametrləri"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tarix aralığı:</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
              <span>-</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExportReport('csv')}
                disabled={loading}
                className="px-3 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                📄 CSV
              </button>
              <button
                onClick={() => handleExportReport('json')}
                disabled={loading}
                className="px-3 py-2 bg-neutral-500 text-white rounded-md text-sm hover:bg-neutral-600 disabled:opacity-50"
              >
                📋 JSON
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                disabled={loading}
                className="px-3 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                📑 PDF
              </button>
            </div>
          </div>
        </ContentCard>

        {/* Tabs Navigation */}
        <TabNavigation
          tabs={[
            { id: 'overview', label: 'Ümumi Baxış', icon: '📈' },
            { id: 'institutional', label: 'Təşkilat Performansı', icon: '🏢' },
            { id: 'surveys', label: 'Sorğu Analitikası', icon: '📊' },
            { id: 'users', label: 'İstifadəçi Aktivliyi', icon: '👥' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Area */}
        {error && (
          <div className="dashboard-error">
            <div className="error-content">
              <div className="error-title">⚠️ Xəta baş verdi</div>
              <div className="error-message">{error}</div>
              <button onClick={fetchReportData} className="error-button">
                Yenidən cəhd et
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            <div>Hesabat məlumatları yüklənir...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewStats()}
            {activeTab === 'institutional' && renderInstitutionalPerformance()}
            {activeTab === 'surveys' && renderSurveyAnalytics()}
            {activeTab === 'users' && renderUserActivity()}
          </>
        )}
      </div>
    </StandardPageLayout>
  );
};

export default Reports;