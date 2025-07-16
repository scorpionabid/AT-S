import React from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import RegionAdminInstitutionsList from '../../institutions/RegionAdminInstitutionsList';
import type { RegionDashboardData } from '../../../../services/regionAdminService';

interface InstitutionsTabProps {
  dashboardData: RegionDashboardData | null;
}

const InstitutionsTab: React.FC<InstitutionsTabProps> = ({ dashboardData }) => {
  const { user } = useAuth();

  return (
    <div className="institutions-tab">
      <div className="tab-header">
        <h2>Təşkilat İdarəetməsi</h2>
        <p>Regionunuza aid sektorlar və məktəbləri idarə edin</p>
      </div>

      {dashboardData && (
        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-icon">🏛️</span>
            <div className="stat-content">
              <h3>{dashboardData.region_overview?.total_sectors || 0}</h3>
              <p>Sektor</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏫</span>
            <div className="stat-content">
              <h3>{dashboardData.region_overview?.total_schools || 0}</h3>
              <p>Məktəb</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <h3>{dashboardData.region_overview?.total_users || 0}</h3>
              <p>İstifadəçi</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <h3>{dashboardData.region_overview?.active_users || 0}</h3>
              <p>Aktiv İstifadəçi</p>
            </div>
          </div>
        </div>
      )}

      <div className="institutions-content">
        <RegionAdminInstitutionsList />
      </div>
    </div>
  );
};

export default InstitutionsTab;