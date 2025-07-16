import { useState, useEffect, useCallback } from 'react';
import { regionAdminService } from '../../../../services/regionAdminService';
import type { RegionInstitutionStats } from '../../../../services/regionAdminService';

export const useInstitutionStats = () => {
  const [institutionStats, setInstitutionStats] = useState<RegionInstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [expandedSectors, setExpandedSectors] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInstitutionStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getInstitutionStats();
      setInstitutionStats(data);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message || 'Institution məlumatları yüklənərkən xəta baş verdi');
      console.error('Institution stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchInstitutionStats();
  }, [fetchInstitutionStats]);

  const toggleSectorExpansion = useCallback((sectorId: number) => {
    setExpandedSectors(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectorId)) {
        newExpanded.delete(sectorId);
      } else {
        newExpanded.add(sectorId);
      }
      return newExpanded;
    });
  }, []);

  const expandAllSectors = useCallback(() => {
    if (institutionStats?.sectors) {
      setExpandedSectors(new Set(institutionStats.sectors.map(s => s.id)));
    }
  }, [institutionStats?.sectors]);

  const collapseAllSectors = useCallback(() => {
    setExpandedSectors(new Set());
  }, []);

  const getPerformanceColor = useCallback((rate: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'fair';
    return 'poor';
  }, []);

  const getSectorById = useCallback((sectorId: number) => {
    return institutionStats?.sectors.find(s => s.id === sectorId);
  }, [institutionStats?.sectors]);

  const getTotalActiveUsers = useCallback(() => {
    return institutionStats?.total_active_users || 0;
  }, [institutionStats?.total_active_users]);

  const getAverageActivityRate = useCallback(() => {
    if (!institutionStats?.sectors || institutionStats.sectors.length === 0) {
      return 0;
    }
    const totalRate = institutionStats.sectors.reduce((sum, sector) => sum + sector.activity_rate, 0);
    return Math.round(totalRate / institutionStats.sectors.length);
  }, [institutionStats?.sectors]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    fetchInstitutionStats();
    
    const interval = setInterval(() => {
      fetchInstitutionStats();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchInstitutionStats]);

  return {
    institutionStats,
    loading,
    error,
    lastUpdated,
    selectedSector,
    expandedSectors,
    setSelectedSector,
    fetchInstitutionStats,
    refreshData,
    toggleSectorExpansion,
    expandAllSectors,
    collapseAllSectors,
    getPerformanceColor,
    getSectorById,
    getTotalActiveUsers,
    getAverageActivityRate
  };
};