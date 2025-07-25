import { useMemo, useCallback, useState } from 'react';

interface BadgeData {
  notifications: number;
  messages: number;
  tasks: number;
  approvals: number;
  surveys: number;
  documents: number;
}

interface BadgeCalculationResult {
  totalBadges: number;
  criticalBadges: number;
  hasAnyBadges: boolean;
  badgesByCategory: {
    urgent: number;
    normal: number;
    info: number;
  };
  formattedBadges: {
    [key: string]: {
      count: number;
      display: string;
      variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
      pulse: boolean;
    };
  };
}

export const useBadgeCalculations = (badgeData: BadgeData): BadgeCalculationResult => {
  // Memoize badge calculations to prevent unnecessary re-renders
  const calculations = useMemo(() => {
    const { notifications, messages, tasks, approvals, surveys, documents } = badgeData;
    
    // Calculate totals
    const totalBadges = notifications + messages + tasks + approvals + surveys + documents;
    const criticalBadges = notifications + approvals; // Critical items need immediate attention
    const hasAnyBadges = totalBadges > 0;
    
    // Categorize badges by urgency
    const badgesByCategory = {
      urgent: notifications + approvals, // Red badges - immediate attention
      normal: tasks + surveys, // Blue badges - normal priority
      info: messages + documents // Green badges - informational
    };
    
    // Format badges for display
    const formattedBadges = {
      notifications: {
        count: notifications,
        display: notifications > 99 ? '99+' : notifications.toString(),
        variant: 'error' as const,
        pulse: notifications > 0
      },
      messages: {
        count: messages,
        display: messages > 99 ? '99+' : messages.toString(),
        variant: 'success' as const,
        pulse: messages > 0
      },
      tasks: {
        count: tasks,
        display: tasks > 99 ? '99+' : tasks.toString(),
        variant: 'primary' as const,
        pulse: tasks > 5 // Pulse when many tasks
      },
      approvals: {
        count: approvals,
        display: approvals > 99 ? '99+' : approvals.toString(),
        variant: 'warning' as const,
        pulse: approvals > 0
      },
      surveys: {
        count: surveys,
        display: surveys > 99 ? '99+' : surveys.toString(),
        variant: 'secondary' as const,
        pulse: surveys > 10 // Pulse when many surveys
      },
      documents: {
        count: documents,
        display: documents > 99 ? '99+' : documents.toString(),
        variant: 'primary' as const,
        pulse: documents > 20 // Pulse when many documents
      }
    };
    
    return {
      totalBadges,
      criticalBadges,
      hasAnyBadges,
      badgesByCategory,
      formattedBadges
    };
  }, [badgeData]);
  
  return calculations;
};

// Hook for individual badge formatting
export const useFormattedBadge = (count: number, type: 'notification' | 'message' | 'task' | 'approval' | 'survey' | 'document') => {
  return useMemo(() => {
    const variants = {
      notification: 'error',
      message: 'success',
      task: 'primary',
      approval: 'warning',
      survey: 'secondary',
      document: 'primary'
    } as const;
    
    const pulseThresholds = {
      notification: 0,
      message: 0,
      task: 5,
      approval: 0,
      survey: 10,
      document: 20
    };
    
    return {
      count,
      display: count > 99 ? '99+' : count.toString(),
      variant: variants[type],
      pulse: count > pulseThresholds[type],
      hasValue: count > 0
    };
  }, [count, type]);
};

// Hook for badge performance monitoring
export const useBadgePerformance = () => {
  const logBadgeUpdate = useCallback((badgeType: string, newCount: number, oldCount: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Badge update: ${badgeType} ${oldCount} → ${newCount}`);
    }
  }, []);
  
  const measureBadgeRender = useCallback((componentName: string, callback: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      callback();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // Log if render takes more than 16ms (60fps threshold)
        console.warn(`Slow badge render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    } else {
      callback();
    }
  }, []);
  
  return { logBadgeUpdate, measureBadgeRender };
};

// Hook for badge state management with persistence
export const useBadgeState = (initialBadgeData: BadgeData) => {
  const [badgeData, setBadgeData] = useState<BadgeData>(initialBadgeData);
  
  const updateBadge = useCallback((category: keyof BadgeData, newCount: number) => {
    setBadgeData(prev => ({
      ...prev,
      [category]: Math.max(0, newCount) // Ensure non-negative
    }));
  }, []);
  
  const incrementBadge = useCallback((category: keyof BadgeData, amount: number = 1) => {
    setBadgeData(prev => ({
      ...prev,
      [category]: prev[category] + amount
    }));
  }, []);
  
  const decrementBadge = useCallback((category: keyof BadgeData, amount: number = 1) => {
    setBadgeData(prev => ({
      ...prev,
      [category]: Math.max(0, prev[category] - amount)
    }));
  }, []);
  
  const resetBadge = useCallback((category: keyof BadgeData) => {
    setBadgeData(prev => ({
      ...prev,
      [category]: 0
    }));
  }, []);
  
  const resetAllBadges = useCallback(() => {
    setBadgeData({
      notifications: 0,
      messages: 0,
      tasks: 0,
      approvals: 0,
      surveys: 0,
      documents: 0
    });
  }, []);
  
  return {
    badgeData,
    updateBadge,
    incrementBadge,
    decrementBadge,
    resetBadge,
    resetAllBadges
  };
};

// Export default hook for most common use case
export default useBadgeCalculations;