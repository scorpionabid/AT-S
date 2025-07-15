import React, { useState } from 'react';
import { FilterBar, DataTable } from '../../../common/regionadmin';
import type { RegionDashboardData, RegionNotification } from '../../../../services/regionAdminService';

interface AlertsTabProps {
  dashboardData: RegionDashboardData | null;
}

const AlertsTab: React.FC<AlertsTabProps> = ({ dashboardData }) => {
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  if (!dashboardData) return null;

  const { notifications } = dashboardData;

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'read' && notification.is_read) ||
                         (statusFilter === 'unread' && !notification.is_read);
    const matchesType = !typeFilter || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'urgent': return '🚨';
      default: return '🔔';
    }
  };

  const getNotificationTypeLabel = (type: string): string => {
    switch (type) {
      case 'info': return 'Məlumat';
      case 'warning': return 'Xəbərdarlıq';
      case 'error': return 'Xəta';
      case 'success': return 'Uğur';
      case 'urgent': return 'Təcili';
      default: return 'Bildiriş';
    }
  };

  const statusOptions = [
    { label: 'Oxunmuş', value: 'read' },
    { label: 'Oxunmamış', value: 'unread' }
  ];

  const typeOptions = [
    { label: 'Məlumat', value: 'info' },
    { label: 'Xəbərdarlıq', value: 'warning' },
    { label: 'Xəta', value: 'error' },
    { label: 'Uğur', value: 'success' },
    { label: 'Təcili', value: 'urgent' }
  ];

  const tableColumns = [
    {
      key: 'type',
      label: 'Tip',
      sortable: false,
      width: '80px',
      render: (value: string) => (
        <div className="notification-type">
          <span className="notification-icon">{getNotificationIcon(value)}</span>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Başlıq',
      sortable: false,
      render: (value: string, row: RegionNotification) => (
        <div className={`notification-title ${!row.is_read ? 'unread' : ''}`}>
          <div className="title-text">{value}</div>
          <div className="title-meta">
            <span className="notification-type-label">
              {getNotificationTypeLabel(row.type)}
            </span>
            {!row.is_read && <span className="unread-badge">Yeni</span>}
          </div>
        </div>
      )
    },
    {
      key: 'message',
      label: 'Mesaj',
      sortable: false,
      render: (value: string) => (
        <div className="notification-message">
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </div>
      )
    },
    {
      key: 'time_ago',
      label: 'Vaxt',
      sortable: false,
      width: '120px',
      render: (value: string) => (
        <div className="notification-time">
          <span className="time-relative">{value}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Əməliyyatlar',
      sortable: false,
      width: '120px',
      render: (value: any, row: RegionNotification) => (
        <div className="notification-actions">
          {!row.is_read && (
            <button 
              className="action-btn read-btn"
              title="Oxunmuş kimi işarələ"
            >
              ✓
            </button>
          )}
          <button 
            className="action-btn delete-btn"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  // Get notification statistics
  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
    urgent: notifications.filter(n => n.type === 'urgent').length,
    byType: notifications.reduce((stats, notification) => {
      stats[notification.type] = (stats[notification.type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>)
  };

  return (
    <div className="alerts-tab">
      {/* Notification Statistics */}
      <div className="notification-stats">
        <h3 className="section-title">🔔 Bildiriş Statistikası</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{notificationStats.total}</div>
              <div className="stat-label">Ümumi Bildiriş</div>
            </div>
          </div>
          
          <div className="stat-card unread">
            <div className="stat-icon">🔴</div>
            <div className="stat-info">
              <div className="stat-value">{notificationStats.unread}</div>
              <div className="stat-label">Oxunmamış</div>
            </div>
          </div>
          
          <div className="stat-card read">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{notificationStats.read}</div>
              <div className="stat-label">Oxunmuş</div>
            </div>
          </div>
          
          <div className="stat-card urgent">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <div className="stat-value">{notificationStats.urgent}</div>
              <div className="stat-label">Təcili</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Type Breakdown */}
      <div className="notification-breakdown">
        <h4 className="breakdown-title">Bildiriş Növləri</h4>
        <div className="breakdown-items">
          {Object.entries(notificationStats.byType).map(([type, count]) => (
            <div key={type} className="breakdown-item">
              <span className="breakdown-icon">{getNotificationIcon(type)}</span>
              <span className="breakdown-label">{getNotificationTypeLabel(type)}</span>
              <span className="breakdown-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="notification-actions-bar">
        <div className="bulk-actions">
          <button className="bulk-action-btn">
            ✓ Hamısını oxunmuş işarələ
          </button>
          <button className="bulk-action-btn danger">
            🗑️ Oxunmuşları sil
          </button>
        </div>
        <div className="action-info">
          {notificationStats.unread > 0 && (
            <span className="unread-count">
              {notificationStats.unread} oxunmamış bildiriş
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Bildiriş axtar..."
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            options: statusOptions,
            onChange: setStatusFilter
          },
          {
            id: 'type',
            label: 'Tip',
            value: typeFilter,
            options: typeOptions,
            onChange: setTypeFilter
          }
        ]}
        className="notifications-filter"
      />

      {/* Urgent Notifications */}
      {notifications.filter(n => n.type === 'urgent' && !n.is_read).length > 0 && (
        <div className="urgent-notifications">
          <h3 className="section-title urgent">🚨 Təcili Bildirişlər</h3>
          <div className="urgent-list">
            {notifications
              .filter(n => n.type === 'urgent' && !n.is_read)
              .map((notification) => (
                <div key={notification.id} className="urgent-notification">
                  <div className="urgent-icon">🚨</div>
                  <div className="urgent-content">
                    <div className="urgent-title">{notification.title}</div>
                    <div className="urgent-message">{notification.message}</div>
                    <div className="urgent-time">{notification.time_ago}</div>
                  </div>
                  <div className="urgent-actions">
                    <button className="urgent-action-btn">Oxu</button>
                    <button className="urgent-action-btn secondary">Təxirə sal</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="recent-notifications">
        <h3 className="section-title">📬 Son Bildirişlər</h3>
        
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">📭</span>
            <p>Heç bir bildiriş tapılmadı</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-indicator">
                  <span className="indicator-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  {!notification.is_read && <div className="unread-dot" />}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{notification.time_ago}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className="notification-type">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                  </div>
                </div>
                
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button className="notification-action-btn">
                      Oxunmuş işarələ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Notifications Table */}
      <div className="notifications-table-section">
        <h3 className="section-title">📋 Bütün Bildirişlər</h3>
        <DataTable
          columns={tableColumns}
          data={filteredNotifications}
          emptyMessage="Heç bir bildiriş tapılmadı"
          className="notifications-table"
        />
      </div>
    </div>
  );
};

export default AlertsTab;