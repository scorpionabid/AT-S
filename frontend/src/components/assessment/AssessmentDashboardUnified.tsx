/**
 * ATİS Assessment Dashboard - Unified Implementation
 * Using DashboardFactory pattern
 */

import React from 'react';
import { DashboardFactory, DashboardType } from '../dashboard/DashboardFactory';
import { api } from '../../services/api';

const AssessmentDashboardUnified: React.FC = () => {
  const fetchAssessmentData = async () => {
    try {
      // TODO: Replace with actual assessment API calls
      const response = await api.get('/assessment/overview').catch(() => null);
      
      if (response?.data) {
        return {
          assessmentStats: {
            totalAssessments: response.data.ksq_analytics?.total_assessments || 0,
            completedAssessments: response.data.bsq_analytics?.total_assessments || 0,
            avgScore: response.data.ksq_analytics?.average_score || 0,
            pendingReviews: response.data.ksq_analytics?.follow_up_required || 0
          },
          recentResults: response.data.recent_results || [],
          performanceTrends: response.data.performance_trends || []
        };
      }

      // Fallback mock data
      return {
        assessmentStats: {
          totalAssessments: 45,
          completedAssessments: 38,
          avgScore: 87.5,
          pendingReviews: 7
        },
        recentResults: [],
        performanceTrends: []
      };
    } catch (error) {
      console.error('Failed to fetch assessment data:', error);
      throw error;
    }
  };

  const customConfig = {
    dataService: fetchAssessmentData,
    refreshInterval: 180000, // 3 minutes
    enableAutoRefresh: true
  };

  return (
    <DashboardFactory 
      type={DashboardType.ASSESSMENT}
      customConfig={customConfig}
    />
  );
};

export default AssessmentDashboardUnified;