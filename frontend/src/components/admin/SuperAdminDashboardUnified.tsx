/**
 * ATİS Super Admin Dashboard - Unified Implementation
 * Using DashboardFactory instead of duplicate custom implementation
 */

import React from 'react';
import { DashboardFactory, DashboardType } from '../dashboard/DashboardFactory';
import { dashboardServiceUnified } from '../../services/dashboardServiceUnified';

const SuperAdminDashboardUnified: React.FC = () => {
  // Custom data service for Super Admin
  const fetchSuperAdminData = async () => {
    try {
      // Use existing unified service
      const stats = await dashboardServiceUnified.getDashboardStats();
      const analytics = await dashboardServiceUnified.getSuperAdminAnalytics();
      
      return {
        systemStats: {
          totalUsers: stats.totalUsers,
          totalInstitutions: stats.totalInstitutions,
          activeSurveys: stats.activeSurveys,
          systemHealth: stats.systemStatus?.status || 'unknown'
        },
        recentActivities: stats.recentActivities || [],
        systemAlerts: analytics?.systemAlerts || [],
        usersByRole: stats.usersByRole || {},
        institutionsByLevel: stats.institutionsByLevel || {}
      };
    } catch (error) {
      console.error('Failed to fetch super admin data:', error);
      throw error;
    }
  };

  // Custom configuration for Super Admin dashboard
  const customConfig = {
    dataService: fetchSuperAdminData,
    refreshInterval: 30000, // 30 seconds
    enableAutoRefresh: true
  };

  return (
    <DashboardFactory 
      type={DashboardType.SUPER_ADMIN}
      customConfig={customConfig}
    />
  );
};

export default SuperAdminDashboardUnified;