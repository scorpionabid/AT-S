import { useState, useEffect, useCallback } from 'react';
import { regionAdminService } from '../../../../services/regionAdminService';
import type { RegionDashboardData } from '../../../../services/regionAdminService';

export const useRegionDashboard = () => {
  const [dashboardData, setDashboardData] = useState<RegionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getDashboardStats();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || 'Dashboard məlumatları yüklənərkən xəta baş verdi');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getPerformanceColor = useCallback((rate: number): string => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  }, []);

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  const getActivityTypeIcon = useCallback((type: string): string => {
    switch (type) {
      case 'survey': return '📊';
      case 'task': return '📋';
      case 'user': return '👤';
      case 'institution': return '🏢';
      default: return '📌';
    }
  }, []);

  return {
    dashboardData,
    loading,
    error,
    lastUpdated,
    fetchDashboardData,
    refreshData,
    getPerformanceColor,
    formatNumber,
    getActivityTypeIcon
  };
};