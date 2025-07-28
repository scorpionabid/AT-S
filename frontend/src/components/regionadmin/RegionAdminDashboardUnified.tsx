/**
 * ATİS Region Admin Dashboard - Unified Implementation
 * Using DashboardFactory pattern
 */

import React from 'react';
import { DashboardFactory, DashboardType } from '../dashboard/DashboardFactory';
import { regionAdminService } from '../../services/regionAdminService';

const RegionAdminDashboardUnified: React.FC = () => {
  const fetchRegionAdminData = async () => {
    try {
      // TODO: Replace with actual region admin service calls
      const regionStats = await regionAdminService?.getRegionStats?.() || {
        institutionsInRegion: 15,
        activeUsers: 245,
        pendingApprovals: 8,
        totalStudents: 3200,
        totalTeachers: 180
      };

      return {
        regionStats,
        institutionsList: [], // TODO: Implement
        recentSurveys: [],    // TODO: Implement
        regionalAlerts: []    // TODO: Implement
      };
    } catch (error) {
      console.error('Failed to fetch region admin data:', error);
      throw error;
    }
  };

  const customConfig = {
    dataService: fetchRegionAdminData,
    refreshInterval: 60000, // 1 minute
    enableAutoRefresh: true
  };

  return (
    <DashboardFactory 
      type={DashboardType.REGION_ADMIN}
      customConfig={customConfig}
    />
  );
};

export default RegionAdminDashboardUnified;