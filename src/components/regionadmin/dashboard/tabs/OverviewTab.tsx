import React from 'react';
import { Link } from 'react-router-dom';
import { PerformanceCard, SummaryCard, PerformanceChart } from '../../../common/regionadmin';
import type { RegionDashboardData } from '../../../../services/regionAdminService';

interface OverviewTabProps {
  dashboardData: RegionDashboardData | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData }) => {
  if (!dashboardData) return null;

  const { region_overview, survey_metrics, task_metrics, sector_performance } = dashboardData;

  // Prepare chart data for sector performance
  const chartData = sector_performance.map(sector => ({
    label: sector.sector_name,
    value: sector.completion_rate,
    color: sector.completion_rate >= 80 ? '#10b981' : 
           sector.completion_rate >= 60 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Region Summary */}
        <div className="overview-section">
          <h3 className="section-title">📊 Regional Xülasə</h3>
          <div className="cards-grid">
            <PerformanceCard
              title="İstifadəçi Aktivliyi"
              score={region_overview.user_activity_rate}
              color={region_overview.user_activity_rate >= 70 ? 'green' : 
                     region_overview.user_activity_rate >= 50 ? 'yellow' : 'red'}
              description={`${region_overview.active_users} / ${region_overview.total_users} aktiv istifadəçi`}
            />
            
            <PerformanceCard
              title="Sorğu Cavab Dərəcəsi"
              score={survey_metrics.response_rate}
              color={survey_metrics.response_rate >= 60 ? 'green' : 
                     survey_metrics.response_rate >= 40 ? 'yellow' : 'red'}
              description={`${survey_metrics.total_responses} ümumi cavab`}
            />
            
            <PerformanceCard
              title="Tapşırıq Tamamlanma"
              score={task_metrics.completion_rate}
              color={task_metrics.completion_rate >= 80 ? 'green' : 
                     task_metrics.completion_rate >= 60 ? 'yellow' : 'red'}
              description={`${task_metrics.completed_tasks} / ${task_metrics.total_tasks} tamamlanıb`}
            />
          </div>
        </div>

        {/* Institution Overview */}
        <div className="overview-section">
          <h3 className="section-title">🏢 Təşkilat Baxışı</h3>
          <SummaryCard
            title="Təşkilat Statistikası"
            icon="🏛️"
            items={[
              { label: 'Ümumi Sektorlar', value: region_overview.total_sectors, highlight: true },
              { label: 'Ümumi Məktəblər', value: region_overview.total_schools, highlight: true },
              { label: 'Ümumi İstifadəçi', value: region_overview.total_users },
              { label: 'Aktiv İstifadəçi', value: region_overview.active_users }
            ]}
            actionButton={{
              label: 'Təşkilatları İdarə Et',
              onClick: () => window.location.href = '/institutions'
            }}
          />
        </div>

        {/* Survey Overview */}
        <div className="overview-section">
          <h3 className="section-title">📋 Sorğu Baxışı</h3>
          <SummaryCard
            title="Sorğu Statistikası"
            icon="📊"
            items={[
              { label: 'Ümumi Sorğular', value: survey_metrics.total_surveys, highlight: true },
              { label: 'Aktiv Sorğular', value: survey_metrics.active_surveys, highlight: true },
              { label: 'Ümumi Cavablar', value: survey_metrics.total_responses },
              { label: 'Cavab Dərəcəsi', value: `${survey_metrics.response_rate}%` }
            ]}
            actionButton={{
              label: 'Sorğuları İdarə Et',
              onClick: () => window.location.href = '/surveys'
            }}
          />
        </div>

        {/* Task Overview */}
        <div className="overview-section">
          <h3 className="section-title">✅ Tapşırıq Baxışı</h3>
          <SummaryCard
            title="Tapşırıq Statistikası"
            icon="📋"
            items={[
              { label: 'Ümumi Tapşırıqlar', value: task_metrics.total_tasks, highlight: true },
              { label: 'Tamamlanmış', value: task_metrics.completed_tasks },
              { label: 'Gözləyən', value: task_metrics.pending_tasks },
              { label: 'Tamamlanma Dərəcəsi', value: `${task_metrics.completion_rate}%`, highlight: true }
            ]}
            actionButton={{
              label: 'Tapşırıqları İdarə Et',
              onClick: () => window.location.href = '/tasks'
            }}
          />
        </div>
      </div>

      {/* Sector Performance Chart */}
      {sector_performance.length > 0 && (
        <div className="overview-section chart-section">
          <h3 className="section-title">📈 Sektor Performansı</h3>
          <PerformanceChart
            title="Sektorlar üzrə Tamamlanma Dərəcəsi"
            data={chartData}
            type="bar"
            height={300}
            showValues={true}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="overview-section">
        <h3 className="section-title">⚡ Sürətli Əməliyyatlar</h3>
        <div className="quick-actions">
          <Link to="/surveys" className="quick-action-card">
            <span className="action-icon">📊</span>
            <span className="action-label">Yeni Sorğu</span>
          </Link>
          <Link to="/users" className="quick-action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">İstifadəçi Əlavə Et</span>
          </Link>
          <Link to="/institutions" className="quick-action-card">
            <span className="action-icon">🏢</span>
            <span className="action-label">Təşkilat İdarəetmə</span>
          </Link>
          <Link to="/reports" className="quick-action-card">
            <span className="action-icon">📈</span>
            <span className="action-label">Hesabatlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;