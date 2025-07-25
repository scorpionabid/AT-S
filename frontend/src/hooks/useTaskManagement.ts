// ====================
// ATİS Task Management Hook
// Main hook combining all task management functionality
// ====================

import { useEffect } from 'react';
import { useTaskData, UseTaskDataOptions } from './task/useTaskData';
import { useTaskCrud } from './task/useTaskCrud';
import { useTaskBulkOperations } from './task/useTaskBulkOperations';

export interface UseTaskManagementOptions extends UseTaskDataOptions {
  // Additional options can be added here
}

export interface UseTaskManagementReturn extends 
  ReturnType<typeof useTaskData>,
  ReturnType<typeof useTaskCrud>,
  ReturnType<typeof useTaskBulkOperations> {
  // All functionality is combined from the sub-hooks
}

export const useTaskManagement = (options: UseTaskManagementOptions = {}): UseTaskManagementReturn => {
  // Data management
  const dataHook = useTaskData(options);
  
  // CRUD operations
  const crudHook = useTaskCrud();
  
  // Bulk operations
  const bulkHook = useTaskBulkOperations();

  // Auto-load data on mount if enabled
  useEffect(() => {
    if (options.autoLoad) {
      dataHook.loadTasks(options.initialFilters);
      dataHook.loadTaskStats();
    }
  }, [options.autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time updates polling
  useEffect(() => {
    if (options.enableRealTimeUpdates && options.pollingInterval) {
      const interval = setInterval(() => {
        dataHook.refresh();
      }, options.pollingInterval);

      return () => clearInterval(interval);
    }
  }, [options.enableRealTimeUpdates, options.pollingInterval, dataHook.refresh]);

  // Combine all hook returns
  return {
    ...dataHook,
    ...crudHook,
    ...bulkHook
  };
};