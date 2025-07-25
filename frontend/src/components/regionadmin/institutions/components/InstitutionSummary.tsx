import React from 'react';
import { MetricCard, PerformanceCard } from '../../../common/regionadmin';
import type { RegionInstitutionStats } from '../../../../services/regionAdminService';

interface InstitutionSummaryProps {
  stats: RegionInstitutionStats | null;
  onRefresh: () => void;
}

const InstitutionSummary: React.FC<InstitutionSummaryProps> = ({ 
  stats, 
  onRefresh 
}) => {
  if (!stats) return null;

  const averageActivityRate = stats.sectors.length > 0 
    ? Math.round(stats.sectors.reduce((sum, sector) => sum + sector.activity_rate, 0) / stats.sectors.length)
    : 0;

  const getPerformanceColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate >= 70) return 'green';
    if (rate >= 50) return 'yellow';
    return 'red';
  };

  return (
    <div className="institution-summary">
      <div className="summary-header">
        <h2 className="summary-title">📊 Təşkilat Xülasəsi</h2>
        <div className="summary-actions">
          <span className="last-updated">
            Son yenilənmə: {new Date().toLocaleTimeString('az-AZ')}
          </span>
          <button onClick={onRefresh} className="refresh-btn" title="Məlumatları yenilə">
            🔄
          </button>
        </div>
      </div>

      <div className="summary-metrics">
        <MetricCard
          title="Ümumi Sektorlar"
          value={stats.total_sectors}
          icon="🏢"
          className="metric-sectors"
        />
        
        <MetricCard
          title="Ümumi Məktəblər"
          value={stats.total_schools}
          icon="🏫"
          className="metric-schools"
        />
        
        <MetricCard
          title="Ümumi İstifadəçilər"
          value={stats.total_users}
          icon="👥"
          trend={{
            value: Math.round((stats.total_active_users / stats.total_users) * 100),
            isPositive: stats.total_active_users > stats.total_users * 0.6
          }}
          className="metric-users"
        />
        
        <MetricCard
          title="Aktiv İstifadəçilər"
          value={stats.total_active_users}
          icon="✅"
          trend={{
            value: Math.round((stats.total_active_users / stats.total_users) * 100),
            isPositive: stats.total_active_users > stats.total_users * 0.7
          }}
          className="metric-active-users"
        />
      </div>

      <div className="summary-performance">
        <PerformanceCard
          title="Orta Aktivlik Dərəcəsi"
          score={averageActivityRate}
          color={getPerformanceColor(averageActivityRate)}
          description={`Bütün sektorlarda orta aktivlik səviyyəsi`}
          size="large"
        />
        
        <div className="performance-breakdown">
          <h4 className="breakdown-title">Sektor Performans Bölgüsü</h4>
          <div className="breakdown-stats">
            <div className="breakdown-item">
              <span className="breakdown-label">Yüksək Performans (≥70%)</span>
              <span className="breakdown-value excellent">
                {stats.sectors.filter(s => s.activity_rate >= 70).length}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Orta Performans (50-69%)</span>
              <span className="breakdown-value good">
                {stats.sectors.filter(s => s.activity_rate >= 50 && s.activity_rate < 70).length}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Aşağı Performans (&lt;50%)</span>
              <span className="breakdown-value poor">
                {stats.sectors.filter(s => s.activity_rate < 50).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSummary;