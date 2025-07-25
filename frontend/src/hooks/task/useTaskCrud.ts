// ====================
// ATİS Task CRUD Hook
// Basic CRUD operations for tasks
// ====================

import { useState, useCallback } from 'react';
import { taskService } from '../../services/taskServiceUnified';
import { TaskWithRelations } from '../../types/shared';
import { CreateTaskData, UpdateTaskData, TaskWorkflowAction } from '../../types/taskTypes';

export interface UseTaskCrudReturn {
  actionLoading: boolean;
  createTask: (data: CreateTaskData) => Promise<TaskWithRelations>;
  updateTask: (id: number, data: UpdateTaskData) => Promise<TaskWithRelations>;
  deleteTask: (id: number) => Promise<void>;
  updateTaskStatus: (id: number, action: TaskWorkflowAction) => Promise<TaskWithRelations>;
  assignTask: (taskId: number, assigneeId: number, comment?: string) => Promise<void>;
}

export const useTaskCrud = (): UseTaskCrudReturn => {
  const [actionLoading, setActionLoading] = useState(false);

  const createTask = useCallback(async (data: CreateTaskData): Promise<TaskWithRelations> => {
    setActionLoading(true);
    try {
      const result = await taskService.create(data);
      return result;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: number, data: UpdateTaskData): Promise<TaskWithRelations> => {
    setActionLoading(true);
    try {
      const result = await taskService.update(id, data);
      return result;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    setActionLoading(true);
    try {
      await taskService.delete(id);
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: number, action: TaskWorkflowAction): Promise<TaskWithRelations> => {
    setActionLoading(true);
    try {
      const result = await taskService.updateTaskStatus(id, action);
      return result;
    } catch (error) {
      console.error('Update task status error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const assignTask = useCallback(async (taskId: number, assigneeId: number, comment?: string): Promise<void> => {
    setActionLoading(true);
    try {
      await taskService.assignTask(taskId, assigneeId, comment);
    } catch (error) {
      console.error('Assign task error:', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    actionLoading,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask
  };
};