// ====================
// ATİS Unified Task Service
// Main task service combining all task operations
// ====================

import { TaskServiceWorkflow } from './task/TaskServiceWorkflow';

// Re-export types for backwards compatibility
export type {
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  TaskStats,
  TaskWorkflowAction,
  BulkTaskOperation,
  CreateRecurringTaskData,
  BulkExportOptions
} from '../types/taskTypes';

// Main unified task service
export class TaskServiceUnified extends TaskServiceWorkflow {
  // All functionality is inherited from TaskServiceWorkflow
  // which extends TaskServiceCore
}

// Export unified service instance
export const taskService = new TaskServiceUnified();

// Re-export taskUtils for convenience
export { taskUtils } from '../utils/taskUtils';

export default taskService;