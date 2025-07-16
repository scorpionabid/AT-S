import React, { useState } from 'react';
import { FilterBar, PerformanceCard } from '../../../common/regionadmin';
import SectorCard from './SectorCard';
import type { SectorData } from '../../../../services/regionAdminService';

interface SectorsListProps {
  sectors: SectorData[];
  selectedSector: number | null;
  expandedSectors: Set<number>;
  onSectorSelect: (sectorId: number | null) => void;
  onToggleExpansion: (sectorId: number) => void;
}

const SectorsList: React.FC<SectorsListProps> = ({
  sectors,
  selectedSector,
  expandedSectors,
  onSectorSelect,
  onToggleExpansion
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'schools' | 'users' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter sectors based on search and performance
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesPerformance = !performanceFilter || 
      (performanceFilter === 'excellent' && sector.activity_rate >= 80) ||
      (performanceFilter === 'good' && sector.activity_rate >= 60 && sector.activity_rate < 80) ||
      (performanceFilter === 'fair' && sector.activity_rate >= 40 && sector.activity_rate < 60) ||
      (performanceFilter === 'poor' && sector.activity_rate < 40);
    
    return matchesSearch && matchesPerformance;
  });

  // Sort sectors
  const sortedSectors = [...filteredSectors].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'schools':
        aValue = a.schools_count;
        bValue = b.schools_count;
        break;
      case 'users':
        aValue = a.total_users;
        bValue = b.total_users;
        break;
      case 'activity':
        aValue = a.activity_rate;
        bValue = b.activity_rate;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue, 'az-AZ')
        : bValue.localeCompare(aValue, 'az-AZ');
    }

    return sortOrder === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const performanceOptions = [
    { label: 'Əla (≥80%)', value: 'excellent' },
    { label: 'Yaxşı (60-79%)', value: 'good' },
    { label: 'Orta (40-59%)', value: 'fair' },
    { label: 'Zəif (<40%)', value: 'poor' }
  ];

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const expandAll = () => {
    sectors.forEach(sector => {
      if (!expandedSectors.has(sector.id)) {
        onToggleExpansion(sector.id);
      }
    });
  };

  const collapseAll = () => {
    sectors.forEach(sector => {
      if (expandedSectors.has(sector.id)) {
        onToggleExpansion(sector.id);
      }
    });
  };

  return (
    <div className="sectors-list">
      <div className="sectors-header">
        <h3 className="sectors-title">🏢 Sektorlar Siyahısı</h3>
        <div className="sectors-controls">
          <button onClick={expandAll} className="control-btn">
            📂 Hamısını Aç
          </button>
          <button onClick={collapseAll} className="control-btn">
            📁 Hamısını Bağla
          </button>
        </div>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Sektor axtar..."
        filters={[
          {
            id: 'performance',
            label: 'Performans',
            value: performanceFilter,
            options: performanceOptions,
            onChange: setPerformanceFilter
          }
        ]}
        actions={
          <div className="sort-controls">
            <label>Sıralama:</label>
            <select 
              value={sortBy} 
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="sort-select"
            >
              <option value="name">Ad</option>
              <option value="schools">Məktəb Sayı</option>
              <option value="users">İstifadəçi Sayı</option>
              <option value="activity">Aktivlik Dərəcəsi</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              title={sortOrder === 'asc' ? 'Azalan sıralama' : 'Artan sıralama'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        }
        className="sectors-filter"
      />

      {/* Statistics Summary */}
      <div className="sectors-stats">
        <div className="stats-row">
          <PerformanceCard
            title="Filtrlənmiş Sektorlar"
            score={filteredSectors.length}
            maxScore={sectors.length}
            color="blue"
            size="small"
            showProgress={false}
          />
          <PerformanceCard
            title="Ümumi Məktəblər"
            score={filteredSectors.reduce((sum, s) => sum + s.schools_count, 0)}
            maxScore={sectors.reduce((sum, s) => sum + s.schools_count, 0)}
            color="green"
            size="small"
            showProgress={false}
          />
          <PerformanceCard
            title="Orta Aktivlik"
            score={filteredSectors.length > 0 
              ? Math.round(filteredSectors.reduce((sum, s) => sum + s.activity_rate, 0) / filteredSectors.length)
              : 0}
            color="yellow"
            size="small"
          />
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="sectors-grid">
        {sortedSectors.length === 0 ? (
          <div className="no-sectors">
            <span className="no-sectors-icon">🔍</span>
            <p>Heç bir sektor tapılmadı</p>
            <p>Axtarış kriteriyalarınızı dəyişdirin</p>
          </div>
        ) : (
          sortedSectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              isSelected={selectedSector === sector.id}
              isExpanded={expandedSectors.has(sector.id)}
              onSelect={() => onSectorSelect(
                selectedSector === sector.id ? null : sector.id
              )}
              onToggleExpansion={() => onToggleExpansion(sector.id)}
            />
          ))
        )}
      </div>

      {/* Pagination could be added here for large datasets */}
      {sortedSectors.length > 20 && (
        <div className="sectors-pagination">
          <p className="pagination-info">
            {sortedSectors.length} sektordan {Math.min(20, sortedSectors.length)} göstərilir
          </p>
        </div>
      )}
    </div>
  );
};

export default SectorsList;