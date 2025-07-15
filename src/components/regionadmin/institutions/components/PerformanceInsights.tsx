import React from 'react';
import { PerformanceCard, PerformanceChart } from '../../../common/regionadmin';
import type { SectorData } from '../../../../services/regionAdminService';

interface PerformanceInsightsProps {
  sectors: SectorData[];
  selectedSector: number | null;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  sectors,
  selectedSector
}) => {
  // Sort sectors by performance
  const sortedByPerformance = [...sectors].sort((a, b) => b.activity_rate - a.activity_rate);
  
  // Get top and bottom performers
  const topPerformers = sortedByPerformance.slice(0, 3);
  const bottomPerformers = sortedByPerformance.slice(-3).reverse();
  
  // Get sectors needing attention (activity rate < 50%)
  const needsAttention = sectors.filter(s => s.activity_rate < 50);
  
  // Selected sector details
  const selectedSectorData = selectedSector 
    ? sectors.find(s => s.id === selectedSector)
    : null;

  // Prepare chart data
  const chartData = sectors.map(sector => ({
    label: sector.name.length > 10 ? sector.name.substring(0, 10) + '...' : sector.name,
    value: sector.activity_rate,
    color: sector.activity_rate >= 70 ? '#10b981' : 
           sector.activity_rate >= 50 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="performance-insights">
      {/* Selected Sector Details */}
      {selectedSectorData && (
        <div className="insight-section selected-sector">
          <h4 className="insight-title">🎯 Seçilmiş Sektor</h4>
          <div className="selected-sector-details">
            <h5 className="selected-sector-name">{selectedSectorData.name}</h5>
            
            <div className="selected-metrics">
              <PerformanceCard
                title="Aktivlik Dərəcəsi"
                score={selectedSectorData.activity_rate}
                color={selectedSectorData.activity_rate >= 70 ? 'green' : 
                       selectedSectorData.activity_rate >= 50 ? 'yellow' : 'red'}
                description={`${selectedSectorData.active_users}/${selectedSectorData.total_users} aktiv istifadəçi`}
              />
            </div>

            <div className="selected-stats">
              <div className="selected-stat">
                <span className="stat-label">Məktəblər:</span>
                <span className="stat-value">{selectedSectorData.schools_count}</span>
              </div>
              <div className="selected-stat">
                <span className="stat-label">Sorğular:</span>
                <span className="stat-value">{selectedSectorData.surveys_count}</span>
              </div>
              <div className="selected-stat">
                <span className="stat-label">Ən aktiv məktəb:</span>
                <span className="stat-value">
                  {selectedSectorData.schools.length > 0
                    ? selectedSectorData.schools.reduce((prev, current) => 
                        prev.activity_rate > current.activity_rate ? prev : current
                      ).name
                    : 'Yoxdur'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="insight-section top-performers">
        <h4 className="insight-title">🏆 Ən Yaxşı Performans</h4>
        <div className="performers-list">
          {topPerformers.map((sector, index) => (
            <div key={sector.id} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-info">
                <div className="performer-name">{sector.name}</div>
                <div className="performer-stats">
                  {sector.schools_count} məktəb • {sector.total_users} istifadəçi
                </div>
              </div>
              <div className="performer-score">{sector.activity_rate}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Attention Needed */}
      {needsAttention.length > 0 && (
        <div className="insight-section attention-needed">
          <h4 className="insight-title">⚠️ Diqqət Tələb Edən</h4>
          <div className="attention-list">
            {needsAttention.map((sector) => (
              <div key={sector.id} className="attention-item">
                <div className="attention-info">
                  <div className="attention-name">{sector.name}</div>
                  <div className="attention-issue">
                    Aşağı aktivlik: {sector.activity_rate}%
                  </div>
                  <div className="attention-details">
                    {sector.active_users}/{sector.total_users} aktiv istifadəçi
                  </div>
                </div>
                <div className="attention-actions">
                  <button className="attention-btn">Dəstək</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Performers */}
      {bottomPerformers.length > 0 && (
        <div className="insight-section bottom-performers">
          <h4 className="insight-title">📉 İyiləşdirmə Potensialı</h4>
          <div className="performers-list">
            {bottomPerformers.map((sector, index) => (
              <div key={sector.id} className="performer-item low">
                <div className="performer-rank">
                  #{sectors.length - index}
                </div>
                <div className="performer-info">
                  <div className="performer-name">{sector.name}</div>
                  <div className="performer-stats">
                    {sector.active_users}/{sector.total_users} aktiv
                  </div>
                </div>
                <div className="performer-score low">{sector.activity_rate}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="insight-section performance-chart">
        <h4 className="insight-title">📊 Performans Müqayisəsi</h4>
        <PerformanceChart
          data={chartData}
          type="bar"
          height={200}
          showValues={true}
        />
      </div>

      {/* Overall Statistics */}
      <div className="insight-section overall-stats">
        <h4 className="insight-title">📈 Ümumi Statistika</h4>
        <div className="overall-metrics">
          <div className="overall-metric">
            <span className="metric-label">Orta Performans:</span>
            <span className="metric-value">
              {Math.round(sectors.reduce((sum, s) => sum + s.activity_rate, 0) / sectors.length)}%
            </span>
          </div>
          <div className="overall-metric">
            <span className="metric-label">Yüksək Performans:</span>
            <span className="metric-value">
              {sectors.filter(s => s.activity_rate >= 70).length}/{sectors.length}
            </span>
          </div>
          <div className="overall-metric">
            <span className="metric-label">Ümumi Məktəblər:</span>
            <span className="metric-value">
              {sectors.reduce((sum, s) => sum + s.schools_count, 0)}
            </span>
          </div>
          <div className="overall-metric">
            <span className="metric-label">Aktivlik Nisbəti:</span>
            <span className="metric-value">
              {Math.round(
                (sectors.reduce((sum, s) => sum + s.active_users, 0) /
                sectors.reduce((sum, s) => sum + s.total_users, 0)) * 100
              )}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="insight-section quick-actions">
        <h4 className="insight-title">⚡ Sürətli Əməliyyatlar</h4>
        <div className="action-buttons">
          <button className="action-btn full-width">
            📊 Ətraflı Hesabat
          </button>
          <button className="action-btn full-width">
            📋 Toplu Sorğu Yarat
          </button>
          <button className="action-btn full-width">
            👥 İstifadəçi Analizi
          </button>
          <button className="action-btn full-width">
            📈 Performans Təhlili
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;