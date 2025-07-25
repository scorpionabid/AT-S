import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// Common components
import { PageHeader } from '../../common/regionadmin';

// Institution specific components
import InstitutionSummary from './components/InstitutionSummary';
import SectorsList from './components/SectorsList';
import PerformanceInsights from './components/PerformanceInsights';

// Hooks
import { useInstitutionStats } from './hooks/useInstitutionStats';

// Styles
import '../../../styles/regionadmin/pages/institutions.css';

const RegionAdminInstitutions: React.FC = () => {
  const { user } = useAuth();
  
  const {
    institutionStats,
    loading,
    error,
    selectedSector,
    expandedSectors,
    setSelectedSector,
    toggleSectorExpansion,
    refreshData
  } = useInstitutionStats();

  if (loading) {
    return (
      <div className="region-institutions">
        <div className="institutions-loading">
          <div className="loading-spinner" />
          <p>Təşkilat məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="region-institutions">
        <div className="institutions-error">
          <span className="error-icon">⚠️</span>
          <h3>Xəta baş verdi</h3>
          <p>{error}</p>
          <button onClick={refreshData} className="retry-btn">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="region-institutions">
      <PageHeader
        title="Təşkilat İdarəetməsi"
        subtitle={`${institutionStats?.total_sectors || 0} sektor və ${institutionStats?.total_schools || 0} məktəbin idarə edilməsi`}
        icon="🏢"
        actions={
          <button onClick={refreshData} className="refresh-btn">
            🔄 Yenilə
          </button>
        }
      />

      <InstitutionSummary 
        stats={institutionStats} 
        onRefresh={refreshData}
      />

      <div className="institutions-content">
        <div className="institutions-main">
          <SectorsList
            sectors={institutionStats?.sectors || []}
            selectedSector={selectedSector}
            expandedSectors={expandedSectors}
            onSectorSelect={setSelectedSector}
            onToggleExpansion={toggleSectorExpansion}
          />
        </div>
        
        <div className="institutions-sidebar">
          <PerformanceInsights 
            sectors={institutionStats?.sectors || []}
            selectedSector={selectedSector}
          />
        </div>
      </div>
    </div>
  );
};

export default RegionAdminInstitutions;