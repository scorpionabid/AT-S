// ====================
// ATİS Task Bulk Operations Hook
// Bulk operations functionality for tasks
// ====================

import { useCallback } from 'react';
import { taskService } from '../../services/taskServiceUnified';
import { BulkTaskOperation } from '../../types/taskTypes';
import { ATİSTypes } from '../../types/shared';

export interface UseTaskBulkOperationsReturn {
  bulkOperation: (operation: BulkTaskOperation) => Promise<ATİSTypes.BulkOperationResultType>;
  bulkAssign: (taskIds: number[], assigneeId: number) => Promise<ATİSTypes.BulkOperationResultType>;
  bulkUpdateStatus: (taskIds: number[], status: string) => Promise<ATİSTypes.BulkOperationResultType>;
  bulkUpdatePriority: (taskIds: number[], priority: string) => Promise<ATİSTypes.BulkOperationResultType>;
  bulkDelete: (taskIds: number[]) => Promise<ATİSTypes.BulkOperationResultType>;
  bulkDuplicate: (taskIds: number[]) => Promise<ATİSTypes.BulkOperationResultType>;
}

export const useTaskBulkOperations = (): UseTaskBulkOperationsReturn => {
  const bulkOperation = useCallback(async (operation: BulkTaskOperation): Promise<ATİSTypes.BulkOperationResultType> => {
    try {
      const result = await taskService.bulkOperation(operation);
      return result;
    } catch (error) {
      console.error('Bulk operation error:', error);
      throw error;
    }
  }, []);

  const bulkAssign = useCallback(async (taskIds: number[], assigneeId: number): Promise<ATİSTypes.BulkOperationResultType> => {
    return bulkOperation({
      task_ids: taskIds,
      operation: 'assign',
      data: { assigned_to: assigneeId }
    });
  }, [bulkOperation]);

  const bulkUpdateStatus = useCallback(async (taskIds: number[], status: string): Promise<ATİSTypes.BulkOperationResultType> => {
    return bulkOperation({
      task_ids: taskIds,
      operation: 'update_status',
      data: { status: status as any }
    });
  }, [bulkOperation]);

  const bulkUpdatePriority = useCallback(async (taskIds: number[], priority: string): Promise<ATİSTypes.BulkOperationResultType> => {
    return bulkOperation({
      task_ids: taskIds,
      operation: 'update_priority',
      data: { priority: priority as any }
    });
  }, [bulkOperation]);

  const bulkDelete = useCallback(async (taskIds: number[]): Promise<ATİSTypes.BulkOperationResultType> => {
    return bulkOperation({
      task_ids: taskIds,
      operation: 'delete'
    });
  }, [bulkOperation]);

  const bulkDuplicate = useCallback(async (taskIds: number[]): Promise<ATİSTypes.BulkOperationResultType> => {
    return bulkOperation({
      task_ids: taskIds,
      operation: 'duplicate'
    });
  }, [bulkOperation]);

  return {
    bulkOperation,
    bulkAssign,
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkDelete,
    bulkDuplicate
  };
};