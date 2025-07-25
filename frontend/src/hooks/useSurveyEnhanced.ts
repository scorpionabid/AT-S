import { useState, useEffect, useCallback, useRef } from 'react';
import { surveyEnhancedService, SurveyDashboardStatistics, SurveyAnalytics } from '../services/surveyEnhancedService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Enhanced Survey Management Hook
 * Provides comprehensive survey management functionality
 */
export const useSurveyEnhanced = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<SurveyDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurveys, setSelectedSurveys] = useState<number[]>([]);
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  
  // Auto-refresh interval ref
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load dashboard statistics
   */
  const loadDashboardStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const stats = await surveyEnhancedService.getDashboardStatistics();
      setDashboardStats(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading dashboard statistics');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Start auto-refresh for real-time updates
   */
  const startAutoRefresh = useCallback((intervalMs: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      loadDashboardStats();
    }, intervalMs);
  }, [loadDashboardStats]);

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Bulk publish surveys
   */
  const bulkPublishSurveys = useCallback(async (surveyIds?: number[]) => {
    const ids = surveyIds || selectedSurveys;
    if (ids.length === 0) return null;

    try {
      setBulkOperationLoading(true);
      const result = await surveyEnhancedService.bulkPublishSurveys(ids);
      
      // Refresh dashboard stats after successful operation
      await loadDashboardStats();
      
      // Clear selection
      setSelectedSurveys([]);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error publishing surveys';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setBulkOperationLoading(false);
    }
  }, [selectedSurveys, loadDashboardStats]);

  /**
   * Bulk close surveys
   */
  const bulkCloseSurveys = useCallback(async (surveyIds?: number[]) => {
    const ids = surveyIds || selectedSurveys;
    if (ids.length === 0) return null;

    try {
      setBulkOperationLoading(true);
      const result = await surveyEnhancedService.bulkCloseSurveys(ids);
      
      await loadDashboardStats();
      setSelectedSurveys([]);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error closing surveys';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setBulkOperationLoading(false);
    }
  }, [selectedSurveys, loadDashboardStats]);

  /**
   * Bulk archive surveys
   */
  const bulkArchiveSurveys = useCallback(async (surveyIds?: number[]) => {
    const ids = surveyIds || selectedSurveys;
    if (ids.length === 0) return null;

    try {
      setBulkOperationLoading(true);
      const result = await surveyEnhancedService.bulkArchiveSurveys(ids);
      
      await loadDashboardStats();
      setSelectedSurveys([]);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error archiving surveys';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setBulkOperationLoading(false);
    }
  }, [selectedSurveys, loadDashboardStats]);

  /**
   * Bulk delete surveys with confirmation
   */
  const bulkDeleteSurveys = useCallback(async (
    surveyIds?: number[], 
    confirmDelete: boolean = true
  ) => {
    const ids = surveyIds || selectedSurveys;
    if (ids.length === 0) return null;

    try {
      setBulkOperationLoading(true);
      const result = await surveyEnhancedService.bulkDeleteSurveys(ids, confirmDelete);
      
      await loadDashboardStats();
      setSelectedSurveys([]);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error deleting surveys';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setBulkOperationLoading(false);
    }
  }, [selectedSurveys, loadDashboardStats]);

  /**
   * Toggle survey selection
   */
  const toggleSurveySelection = useCallback((surveyId: number) => {
    setSelectedSurveys(prev => 
      prev.includes(surveyId)
        ? prev.filter(id => id !== surveyId)
        : [...prev, surveyId]
    );
  }, []);

  /**
   * Select all surveys
   */
  const selectAllSurveys = useCallback((surveyIds: number[]) => {
    setSelectedSurveys(surveyIds);
  }, []);

  /**
   * Clear all selections
   */
  const clearSurveySelection = useCallback(() => {
    setSelectedSurveys([]);
  }, []);

  /**
   * Get surveys needing attention
   */
  const getSurveysNeedingAttention = useCallback(async () => {
    try {
      return await surveyEnhancedService.getSurveysNeedingAttention();
    } catch (err: any) {
      console.error('Error getting surveys needing attention:', err);
      return [];
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data when user is available
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, loadDashboardStats]);

  // Cleanup auto-refresh on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    // State
    dashboardStats,
    loading,
    error,
    selectedSurveys,
    bulkOperationLoading,
    
    // Dashboard actions
    loadDashboardStats,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Bulk operations
    bulkPublishSurveys,
    bulkCloseSurveys,
    bulkArchiveSurveys,
    bulkDeleteSurveys,
    
    // Selection management
    toggleSurveySelection,
    selectAllSurveys,
    clearSurveySelection,
    
    // Utility functions
    getSurveysNeedingAttention,
    clearError,
    
    // Computed values
    hasSelectedSurveys: selectedSurveys.length > 0,
    selectedCount: selectedSurveys.length,
    canPerformBulkOperations: user && selectedSurveys.length > 0,
  };
};

/**
 * Hook for individual survey analytics
 */
export const useSurveyAnalytics = (surveyId: number | null) => {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!surveyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await surveyEnhancedService.getSurveyAnalytics(surveyId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading survey analytics');
      console.error('Error loading survey analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: loadAnalytics,
    clearError: () => setError(null)
  };
};

/**
 * Hook for real-time survey metrics
 */
export const useRealTimeSurveyMetrics = (refreshInterval: number = 10000) => {
  const [metrics, setMetrics] = useState({
    active_responses_count: 0,
    recent_completions: 0,
    pending_approvals: 0,
    expiring_soon: 0
  });
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await surveyEnhancedService.getRealTimeSurveyMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Error loading real-time metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load initial data
    loadMetrics();
    
    // Set up interval for real-time updates
    intervalRef.current = setInterval(loadMetrics, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadMetrics, refreshInterval]);

  return {
    metrics,
    loading,
    refetch: loadMetrics
  };
};

export default useSurveyEnhanced;