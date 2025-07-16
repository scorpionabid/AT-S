import React, { useState } from 'react';
import { PerformanceCard, DataTable, FilterBar } from '../../../common/regionadmin';
import type { RegionDashboardData, SectorPerformance } from '../../../../services/regionAdminService';

interface SectorsTabProps {
  dashboardData: RegionDashboardData | null;
}

const SectorsTab: React.FC<SectorsTabProps> = ({ dashboardData }) => {
  const [searchValue, setSearchValue] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('completion_rate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  if (!dashboardData) return null;

  const { sector_performance } = dashboardData;

  // Filter and sort sectors
  const filteredSectors = sector_performance
    .filter(sector => 
      sector.sector_name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortColumn as keyof SectorPerformance] as number;
      const bValue = b[sortColumn as keyof SectorPerformance] as number;
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getPerformanceColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate >= 80) return 'green';
    if (rate >= 60) return 'yellow';
    return 'red';
  };

  const tableColumns = [
    {
      key: 'sector_name',
      label: 'Sektor Adı',
      sortable: true,
      render: (value: string) => (
        <div className="sector-name">
          <span className="sector-icon">🏢</span>
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'schools_count',
      label: 'Məktəb Sayı',
      sortable: true,
      render: (value: number) => (
        <div className="schools-count">
          <span className="count-badge">{value}</span>
        </div>
      )
    },
    {
      key: 'users_count',
      label: 'İstifadəçi Sayı',
      sortable: true,
      render: (value: number) => (
        <div className="users-count">
          <span className="count-badge secondary">{value}</span>
        </div>
      )
    },
    {
      key: 'surveys_count',
      label: 'Sorğu Sayı',
      sortable: true,
      render: (value: number) => (
        <div className="surveys-count">
          <span className="count-badge tertiary">{value}</span>
        </div>
      )
    },
    {
      key: 'completion_rate',
      label: 'Tamamlanma Dərəcəsi',
      sortable: true,
      render: (value: number, row: SectorPerformance) => (
        <div className="completion-rate">
          <PerformanceCard
            title=""
            score={value}
            color={getPerformanceColor(value)}
            size="small"
            showProgress={true}
          />
        </div>
      )
    }
  ];

  // Calculate summary statistics
  const totalSchools = sector_performance.reduce((sum, sector) => sum + sector.schools_count, 0);
  const totalUsers = sector_performance.reduce((sum, sector) => sum + sector.users_count, 0);
  const averageCompletion = sector_performance.reduce((sum, sector) => sum + sector.completion_rate, 0) / sector_performance.length;

  return (
    <div className="sectors-tab">
      {/* Summary Cards */}
      <div className="sectors-summary">
        <h3 className="section-title">📊 Sektor Xülasəsi</h3>
        <div className="summary-cards">
          <PerformanceCard
            title="Ümumi Sektorlar"
            score={sector_performance.length}
            maxScore={sector_performance.length}
            description="Aktiv sektorlar"
            color="blue"
            showProgress={false}
          />
          
          <PerformanceCard
            title="Ümumi Məktəblər"
            score={totalSchools}
            maxScore={totalSchools}
            description="Bütün sektorlarda"
            color="blue"
            showProgress={false}
          />
          
          <PerformanceCard
            title="Ümumi İstifadəçilər"
            score={totalUsers}
            maxScore={totalUsers}
            description="Aktiv istifadəçilər"
            color="blue"
            showProgress={false}
          />
          
          <PerformanceCard
            title="Orta Performans"
            score={Math.round(averageCompletion)}
            description="Bütün sektorlarda"
            color={getPerformanceColor(averageCompletion)}
          />
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Sektor axtar..."
        className="sectors-filter"
      />

      {/* Sectors Table */}
      <div className="sectors-table-section">
        <h3 className="section-title">🏢 Sektor Detayları</h3>
        <DataTable
          columns={tableColumns}
          data={filteredSectors}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="Heç bir sektor tapılmadı"
          className="sectors-table"
        />
      </div>

      {/* Top and Bottom Performers */}
      <div className="performance-highlights">
        <div className="top-performers">
          <h4 className="highlight-title">🏆 Ən Yaxşı Performans</h4>
          {sector_performance
            .sort((a, b) => b.completion_rate - a.completion_rate)
            .slice(0, 3)
            .map((sector, index) => (
              <div key={sector.sector_name} className="performer-item">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{sector.sector_name}</div>
                  <div className="performer-stats">
                    {sector.schools_count} məktəb • {sector.users_count} istifadəçi
                  </div>
                </div>
                <div className="performer-score">
                  {sector.completion_rate}%
                </div>
              </div>
            ))
          }
        </div>

        <div className="attention-needed">
          <h4 className="highlight-title">⚠️ Diqqət Tələb Edən</h4>
          {sector_performance
            .filter(sector => sector.completion_rate < 60)
            .sort((a, b) => a.completion_rate - b.completion_rate)
            .slice(0, 3)
            .map((sector) => (
              <div key={sector.sector_name} className="attention-item">
                <div className="attention-icon">⚠️</div>
                <div className="attention-info">
                  <div className="attention-name">{sector.sector_name}</div>
                  <div className="attention-issue">
                    Aşağı performans: {sector.completion_rate}%
                  </div>
                </div>
                <div className="attention-action">
                  <button className="action-btn">Dəstək</button>
                </div>
              </div>
            ))
          }
          {sector_performance.filter(sector => sector.completion_rate < 60).length === 0 && (
            <div className="no-attention">
              <span className="success-icon">✅</span>
              <span>Bütün sektorlar yaxşı performans göstərir</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorsTab;