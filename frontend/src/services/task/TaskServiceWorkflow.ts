// ====================
// ATİS Task Service Workflow
// Workflow operations, collaboration and advanced features
// ====================

import { TaskServiceCore } from './TaskServiceCore';
import { api } from '../api';
import { 
  ATİSTypes,
  TaskWithRelations,
  TaskComment,
  TaskAttachment,
} from '../../types/shared';
import { 
  CreateTaskData,
  TaskWorkflowAction,
  BulkTaskOperation,
  CreateRecurringTaskData,
  BulkExportOptions
} from '../../types/taskTypes';

export class TaskServiceWorkflow extends TaskServiceCore {
  /**
   * Create task with dependencies and workflow
   */
  async createTaskWithWorkflow(data: CreateTaskData): Promise<TaskWithRelations> {
    const response = await api.post<{
      status: string;
      data: TaskWithRelations;
      message: string;
    }>(`${this.endpoint}/with-workflow`, data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Task yaradıla bilmədi');
  }

  /**
   * Update task status with workflow actions
   */
  async updateTaskStatus(taskId: number, action: TaskWorkflowAction): Promise<TaskWithRelations> {
    const response = await api.patch<{
      status: string;
      data: TaskWithRelations;
      message: string;
    }>(`${this.endpoint}/${taskId}/workflow`, action);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Task statusu yenilənə bilmədi');
  }

  /**
   * Assign task to user with notification
   */
  async assignTask(taskId: number, assigneeId: number, comment?: string): Promise<void> {
    const response = await api.patch<{
      status: string;
      message: string;
    }>(`${this.endpoint}/${taskId}/assign`, {
      assigned_to: assigneeId,
      comment
    });
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Task təyin edilə bilmədi');
    }
  }

  /**
   * Bulk operations on multiple tasks
   */
  async bulkOperation(operation: BulkTaskOperation): Promise<ATİSTypes.BulkOperationResultType> {
    try {
      const response = await api.post<{
        status: string;
        data: ATİSTypes.BulkOperationResultType;
        message: string;
      }>(`${this.endpoint}/bulk-${operation.operation}`, operation);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Bulk əməliyyat uğursuz oldu');
    } catch (error) {
      console.error('Bulk operation error:', error);
      throw error;
    }
  }

  /**
   * Create recurring task
   */
  async createRecurringTask(data: CreateRecurringTaskData): Promise<TaskWithRelations> {
    const response = await api.post<{
      status: string;
      data: TaskWithRelations;
    }>(`${this.endpoint}/recurring`, data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Təkrarlanan tapşırıq yaradıla bilmədi');
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: number, comment: string, mentions?: number[]): Promise<TaskComment> {
    const response = await api.post<{
      status: string;
      data: TaskComment;
    }>(`${this.endpoint}/${taskId}/comments`, {
      comment,
      mentions
    });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Şərh əlavə edilə bilmədi');
  }

  /**
   * Get task comments
   */
  async getComments(taskId: number): Promise<TaskComment[]> {
    const response = await api.get<{
      status: string;
      data: TaskComment[];
    }>(`${this.endpoint}/${taskId}/comments`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Şərhlər yüklənə bilmədi');
  }

  /**
   * Upload file attachment
   */
  async uploadAttachment(taskId: number, file: File): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{
      status: string;
      data: TaskAttachment;
    }>(`${this.endpoint}/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Fayl yüklənə bilmədi');
  }

  /**
   * Get task attachments
   */
  async getAttachments(taskId: number): Promise<TaskAttachment[]> {
    const response = await api.get<{
      status: string;
      data: TaskAttachment[];
    }>(`${this.endpoint}/${taskId}/attachments`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Fayllar yüklənə bilmədi');
  }

  /**
   * Export tasks to various formats
   */
  async exportTasks(
    format: 'csv' | 'excel' | 'pdf',
    filters?: any,
    options?: BulkExportOptions
  ): Promise<Blob> {
    const response = await api.post<Blob>(
      `${this.endpoint}/export`,
      { format, filters, options },
      { responseType: 'blob' }
    );
    
    return response.data;
  }
}