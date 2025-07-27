import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { regionAdminService } from '../../../services/regionAdminService';
import type { RegionDashboardData } from '../../../services/regionAdminService';

// Common components
import { PageHeader, TabNavigation } from '../../common/regionadmin';

// Dashboard specific components
import DashboardHeader from './DashboardHeader';
import OverviewTab from './tabs/OverviewTab';
import SectorsTab from './tabs/SectorsTab';
import InstitutionsTab from './tabs/InstitutionsTab';
import ActivitiesTab from './tabs/ActivitiesTab';
import AlertsTab from './tabs/AlertsTab';
import UsersTab from '../tabs/UsersTab';

// Hooks
import { useRegionDashboard } from './hooks/useRegionDashboard';

// Styles

const RegionAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'institutions' | 'users' | 'activities' | 'alerts'>('overview');
  const [showHelp, setShowHelp] = useState(false);
  
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    refreshData
  } = useRegionDashboard();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Sabahınız xeyir';
    if (hour < 18) return 'Günortanız xeyir';
    return 'Axşamınız xeyir';
  };

  const exportData = (type: string) => {
    try {
      let data: any;
      let filename: string;
      
      switch (type) {
        case 'overview':
          data = dashboardData?.region_overview;
          filename = `region-overview-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'sectors':
          data = dashboardData?.sector_performance;
          filename = `sector-performance-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'surveys':
          data = dashboardData?.survey_metrics;
          filename = `survey-metrics-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'activities':
          data = dashboardData?.recent_activities;
          filename = `recent-activities-${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          data = dashboardData;
          filename = `region-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export zamanı xəta baş verdi');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTab('overview');
            break;
          case '2':
            event.preventDefault();
            setActiveTab('sectors');
            break;
          case '3':
            event.preventDefault();
            setActiveTab('institutions');
            break;
          case '4':
            event.preventDefault();
            setActiveTab('users');
            break;
          case '5':
            event.preventDefault();
            setActiveTab('activities');
            break;
          case '6':
            event.preventDefault();
            setActiveTab('alerts');
            break;
          case 'r':
            event.preventDefault();
            refreshData();
            break;
          case 'e':
            event.preventDefault();
            exportData('full');
            break;
          case 'h':
            event.preventDefault();
            setShowHelp(true);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [refreshData]);

  const tabs = [
    { id: 'overview', label: 'Ümumi Baxış', icon: '📊', count: undefined },
    { id: 'sectors', label: 'Sektorlar', icon: '🏢', count: dashboardData?.region_overview?.total_sectors },
    { id: 'institutions', label: 'Təşkilatlar', icon: '🏛️', count: dashboardData?.region_overview?.total_institutions },
    { id: 'users', label: 'İstifadəçilər', icon: '👥', count: dashboardData?.region_overview?.total_users },
    { id: 'activities', label: 'Fəaliyyətlər', icon: '📈', count: dashboardData?.recent_activities?.length },
    { id: 'alerts', label: 'Bildirişlər', icon: '🔔', count: dashboardData?.notifications?.filter(n => !n.is_read)?.length }
  ];

  if (loading) {
    return (
      <div className="region-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Dashboard yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="region-dashboard">
        <div className="dashboard-error">
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
    <div className="region-dashboard">
      <PageHeader
        title={`${getWelcomeMessage()}, ${user?.username}!`}
        subtitle={`${dashboardData?.region_overview?.region_name} Regional İdarəetmə Paneli`}
        icon="🏛️"
        actions={
          <button onClick={refreshData} className="refresh-btn">
            🔄 Yenilə
          </button>
        }
      />

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-button primary"
          onClick={() => setActiveTab('institutions')}
          title="Təşkilatlara keç"
        >
          🏛️ Təşkilatlar
        </button>
        <button 
          className="action-button secondary"
          onClick={() => setActiveTab('sectors')}
          title="Sektorlara keç"
        >
          🏢 Sektorlar
        </button>
        <button 
          className="action-button tertiary"
          onClick={() => setActiveTab('users')}
          title="İstifadəçilərə keç"
        >
          👥 İstifadəçilər
        </button>
        <button 
          className="action-button quaternary"
          onClick={() => window.location.href = '/surveys'}
          title="Sorğulara keç"
        >
          📊 Sorğular
        </button>
        <button 
          className="action-button refresh"
          onClick={refreshData}
          title="Dashboard-u yenilə"
        >
          🔄 Yenilə
        </button>
        <button 
          className="action-button help"
          onClick={() => setShowHelp(true)}
          title="Yardımı göstər"
        >
          ❓ Yardım
        </button>
      </div>

      <DashboardHeader 
        dashboardData={dashboardData} 
        onRefresh={refreshData}
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        className="dashboard-tabs"
      />

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab dashboardData={dashboardData} />
        )}
        {activeTab === 'sectors' && (
          <SectorsTab dashboardData={dashboardData} />
        )}
        {activeTab === 'institutions' && (
          <InstitutionsTab dashboardData={dashboardData} />
        )}
        {activeTab === 'users' && (
          <UsersTab />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab dashboardData={dashboardData} />
        )}
        {activeTab === 'alerts' && (
          <AlertsTab dashboardData={dashboardData} />
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>🎹 Klaviatura Qısayolları</h3>
              <button className="close-help" onClick={() => setShowHelp(false)}>✕</button>
            </div>
            <div className="help-modal-content">
              <div className="shortcut-group">
                <h4>📋 Naviqasiya</h4>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 1</span>
                  <span className="shortcut-desc">Ümumi Baxış</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 2</span>
                  <span className="shortcut-desc">Sektorlar</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 3</span>
                  <span className="shortcut-desc">Təşkilatlar</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 4</span>
                  <span className="shortcut-desc">İstifadəçilər</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 5</span>
                  <span className="shortcut-desc">Fəaliyyətlər</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + 6</span>
                  <span className="shortcut-desc">Bildirişlər</span>
                </div>
              </div>
              
              <div className="shortcut-group">
                <h4>⚡ Sürətli Əməliyyatlar</h4>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + R</span>
                  <span className="shortcut-desc">Dashboard Yenilə</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + E</span>
                  <span className="shortcut-desc">Məlumat Export</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Ctrl + H</span>
                  <span className="shortcut-desc">Bu Yardım</span>
                </div>
              </div>
              
              <div className="help-note">
                <p><strong>Qeyd:</strong> Mac istifadəçiləri üçün Ctrl əvəzinə Cmd düyməsini istifadə edin.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionAdminDashboard;