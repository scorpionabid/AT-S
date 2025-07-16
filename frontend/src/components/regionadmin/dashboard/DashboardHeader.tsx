import React from 'react';
import { MetricCard } from '../../common/regionadmin';
import type { RegionDashboardData } from '../../../services/regionAdminService';

interface DashboardHeaderProps {
  dashboardData: RegionDashboardData | null;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  dashboardData, 
  onRefresh 
}) => {
  if (!dashboardData) return null;

  const { region_overview, survey_metrics, task_metrics } = dashboardData;

  return (
    <div className="dashboard-header">
      <div className="metrics-grid">
        <MetricCard
          title="Ümumi İstifadəçi"
          value={region_overview.total_users}
          icon="👥"
          trend={{
            value: region_overview.user_activity_rate,
            isPositive: region_overview.user_activity_rate > 50
          }}
        />
        
        <MetricCard
          title="Aktiv İstifadəçi"
          value={region_overview.active_users}
          icon="✅"
          trend={{
            value: region_overview.user_activity_rate,
            isPositive: region_overview.user_activity_rate > 60
          }}
        />
        
        <MetricCard
          title="Ümumi Sektorlar"
          value={region_overview.total_sectors}
          icon="🏢"
        />
        
        <MetricCard
          title="Ümumi Məktəblər"
          value={region_overview.total_schools}
          icon="🏫"
        />
        
        <MetricCard
          title="Aktiv Sorğular"
          value={survey_metrics.active_surveys}
          icon="📊"
          trend={{
            value: survey_metrics.response_rate,
            isPositive: survey_metrics.response_rate > 50
          }}
        />
        
        <MetricCard
          title="Tamamlanan Tapşırıqlar"
          value={`${task_metrics.completion_rate}%`}
          icon="✔️"
          trend={{
            value: task_metrics.completion_rate,
            isPositive: task_metrics.completion_rate > 70
          }}
        />
      </div>
      
      <div className="header-actions">
        <div className="last-updated">
          Son yenilənmə: {new Date().toLocaleTimeString('az-AZ')}
        </div>
        <button 
          onClick={onRefresh} 
          className="refresh-btn"
          title="Məlumatları yenilə"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;