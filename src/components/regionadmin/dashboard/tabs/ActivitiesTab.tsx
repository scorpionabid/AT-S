import React, { useState } from 'react';
import { FilterBar, DataTable } from '../../../common/regionadmin';
import type { RegionDashboardData, RegionActivity } from '../../../../services/regionAdminService';

interface ActivitiesTabProps {
  dashboardData: RegionDashboardData | null;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ dashboardData }) => {
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  if (!dashboardData) return null;

  const { recent_activities } = dashboardData;

  // Filter activities
  const filteredActivities = recent_activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchValue.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = !typeFilter || activity.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'survey': return '📊';
      case 'task': return '📋';
      case 'user': return '👤';
      case 'institution': return '🏢';
      default: return '📌';
    }
  };

  const getActivityTypeLabel = (type: string): string => {
    switch (type) {
      case 'survey': return 'Sorğu';
      case 'task': return 'Tapşırıq';
      case 'user': return 'İstifadəçi';
      case 'institution': return 'Təşkilat';
      default: return 'Digər';
    }
  };

  const activityTypeOptions = [
    { label: 'Sorğu', value: 'survey' },
    { label: 'Tapşırıq', value: 'task' },
    { label: 'İstifadəçi', value: 'user' },
    { label: 'Təşkilat', value: 'institution' }
  ];

  const tableColumns = [
    {
      key: 'type',
      label: 'Tip',
      sortable: false,
      width: '80px',
      render: (value: string) => (
        <div className="activity-type">
          <span className="activity-icon">{getActivityIcon(value)}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Fəaliyyət',
      sortable: false,
      render: (value: string, row: RegionActivity) => (
        <div className="activity-action">
          <div className="action-text">{value}</div>
          <div className="action-meta">
            <span className="activity-type-label">{getActivityTypeLabel(row.type)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'İstifadəçi',
      sortable: false,
      width: '150px',
      render: (value: string) => (
        <div className="activity-user">
          <span className="user-icon">👤</span>
          <span className="user-name">{value}</span>
        </div>
      )
    },
    {
      key: 'time',
      label: 'Vaxt',
      sortable: false,
      width: '120px',
      render: (value: string) => (
        <div className="activity-time">
          <span className="time-relative">{value}</span>
        </div>
      )
    }
  ];

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('az-AZ');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, RegionActivity[]>);

  // Get activity statistics
  const activityStats = {
    total: recent_activities.length,
    today: recent_activities.filter(activity => {
      const today = new Date().toDateString();
      const activityDate = new Date(activity.timestamp).toDateString();
      return today === activityDate;
    }).length,
    thisWeek: recent_activities.filter(activity => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(activity.timestamp) >= weekAgo;
    }).length,
    byType: recent_activities.reduce((stats, activity) => {
      stats[activity.type] = (stats[activity.type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>)
  };

  return (
    <div className="activities-tab">
      {/* Activity Statistics */}
      <div className="activity-stats">
        <h3 className="section-title">📈 Fəaliyyət Statistikası</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{activityStats.total}</div>
              <div className="stat-label">Ümumi Fəaliyyət</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-value">{activityStats.today}</div>
              <div className="stat-label">Bu gün</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📆</div>
            <div className="stat-info">
              <div className="stat-value">{activityStats.thisWeek}</div>
              <div className="stat-label">Bu həftə</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">
                {Object.keys(activityStats.byType).length}
              </div>
              <div className="stat-label">Fəaliyyət Növü</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Type Breakdown */}
      <div className="activity-breakdown">
        <h4 className="breakdown-title">Fəaliyyət Növləri</h4>
        <div className="breakdown-items">
          {Object.entries(activityStats.byType).map(([type, count]) => (
            <div key={type} className="breakdown-item">
              <span className="breakdown-icon">{getActivityIcon(type)}</span>
              <span className="breakdown-label">{getActivityTypeLabel(type)}</span>
              <span className="breakdown-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Fəaliyyət axtar..."
        filters={[
          {
            id: 'type',
            label: 'Tip',
            value: typeFilter,
            options: activityTypeOptions,
            onChange: setTypeFilter
          }
        ]}
        className="activities-filter"
      />

      {/* Activities Timeline */}
      <div className="activities-timeline">
        <h3 className="section-title">⏰ Son Fəaliyyətlər</h3>
        
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="no-activities">
            <span className="no-activities-icon">📭</span>
            <p>Heç bir fəaliyyət tapılmadı</p>
          </div>
        ) : (
          Object.entries(groupedActivities)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, activities]) => (
              <div key={date} className="timeline-group">
                <div className="timeline-date">
                  <span className="date-icon">📅</span>
                  <span className="date-text">{date}</span>
                  <span className="date-count">({activities.length} fəaliyyət)</span>
                </div>
                
                <div className="timeline-activities">
                  {activities.map((activity, index) => (
                    <div key={`${activity.id}-${index}`} className="timeline-item">
                      <div className="timeline-marker">
                        <span className="marker-icon">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-action">{activity.action}</div>
                        <div className="timeline-meta">
                          <span className="timeline-user">👤 {activity.user}</span>
                          <span className="timeline-time">🕐 {activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Detailed Activities Table */}
      <div className="activities-table-section">
        <h3 className="section-title">📋 Ətraflı Fəaliyyət Siyahısı</h3>
        <DataTable
          columns={tableColumns}
          data={filteredActivities}
          emptyMessage="Heç bir fəaliyyət tapılmadı"
          className="activities-table"
        />
      </div>
    </div>
  );
};

export default ActivitiesTab;