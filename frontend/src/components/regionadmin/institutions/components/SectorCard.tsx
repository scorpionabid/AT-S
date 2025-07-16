import React from 'react';
import { PerformanceCard } from '../../../common/regionadmin';
import type { SectorData, SchoolData } from '../../../../services/regionAdminService';

interface SectorCardProps {
  sector: SectorData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpansion: () => void;
}

const SectorCard: React.FC<SectorCardProps> = ({
  sector,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpansion
}) => {
  const getPerformanceColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate >= 70) return 'green';
    if (rate >= 50) return 'yellow';
    return 'red';
  };

  const renderSchoolCard = (school: SchoolData) => (
    <div key={school.id} className="school-card">
      <div className="school-header">
        <div className="school-info">
          <span className="school-icon">🏫</span>
          <h5 className="school-name">{school.name}</h5>
        </div>
        <div className="school-stats">
          <span className="school-users">👥 {school.user_count}</span>
          <span className="school-active">✅ {school.active_users}</span>
        </div>
      </div>
      
      <div className="school-performance">
        <PerformanceCard
          title="Aktivlik Dərəcəsi"
          score={school.activity_rate}
          color={getPerformanceColor(school.activity_rate)}
          size="small"
          description={`${school.active_users}/${school.user_count} aktiv`}
        />
      </div>
    </div>
  );

  return (
    <div className={`sector-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="sector-header" onClick={onSelect}>
        <div className="sector-main-info">
          <div className="sector-title">
            <span className="sector-icon">🏢</span>
            <h4 className="sector-name">{sector.name}</h4>
            {isSelected && <span className="selected-badge">Seçilmiş</span>}
          </div>
          
          <div className="sector-quick-stats">
            <div className="quick-stat">
              <span className="stat-icon">🏫</span>
              <span className="stat-value">{sector.schools_count}</span>
              <span className="stat-label">Məktəb</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{sector.total_users}</span>
              <span className="stat-label">İstifadəçi</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">✅</span>
              <span className="stat-value">{sector.active_users}</span>
              <span className="stat-label">Aktiv</span>
            </div>
          </div>
        </div>

        <div className="sector-actions">
          <PerformanceCard
            title="Aktivlik"
            score={sector.activity_rate}
            color={getPerformanceColor(sector.activity_rate)}
            size="small"
          />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpansion();
            }}
            className="expand-btn"
            title={isExpanded ? 'Məktəbləri gizlə' : 'Məktəbləri göstər'}
          >
            {isExpanded ? '📁' : '📂'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="sector-details">
          <div className="sector-overview">
            <div className="overview-stats">
              <div className="overview-stat">
                <span className="overview-label">Ümumi Sorğular:</span>
                <span className="overview-value">{sector.surveys_count}</span>
              </div>
              <div className="overview-stat">
                <span className="overview-label">Aktivlik Dərəcəsi:</span>
                <span className={`overview-value rate-${getPerformanceColor(sector.activity_rate)}`}>
                  {sector.activity_rate}%
                </span>
              </div>
            </div>
          </div>

          <div className="schools-section">
            <div className="schools-header">
              <h5 className="schools-title">
                📚 Məktəblər ({sector.schools.length})
              </h5>
              {sector.schools.length > 0 && (
                <div className="schools-summary">
                  <span className="summary-item">
                    Orta aktivlik: {Math.round(
                      sector.schools.reduce((sum, s) => sum + s.activity_rate, 0) / sector.schools.length
                    )}%
                  </span>
                </div>
              )}
            </div>

            <div className="schools-grid">
              {sector.schools.length === 0 ? (
                <div className="no-schools">
                  <span className="no-schools-icon">🏫</span>
                  <p>Bu sektorda məktəb qeydiyyatda deyil</p>
                </div>
              ) : (
                sector.schools.map(renderSchoolCard)
              )}
            </div>
          </div>

          {/* Action buttons for sector management */}
          <div className="sector-actions-expanded">
            <button className="action-btn primary">
              📊 Ətraflı Hesabat
            </button>
            <button className="action-btn secondary">
              👥 İstifadəçiləri İdarə Et
            </button>
            <button className="action-btn secondary">
              📋 Sorğu Yarat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorCard;