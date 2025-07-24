// ====================
// ATİS Task Service Core
// Basic CRUD operations for tasks
// ====================

import { GenericCrudService } from '../base/GenericCrudService';
import { 
  ATİSTypes,
  BaseTask,
  TaskWithRelations,
} from '../../types/shared';
import { 
  CreateTaskData, 
  UpdateTaskData, 
  TaskFilters, 
  TaskStats 
} from '../../types/taskTypes';

export class TaskServiceCore extends GenericCrudService<TaskWithRelations, CreateTaskData, UpdateTaskData> {
  constructor() {
    super('/tasks');
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(filters?: TaskFilters) {
    return this.getAll(filters);
  }

  /**
   * Get task with all relations (assignee, assigner, institution, comments, etc.)
   */
  async getTaskWithRelations(id: number): Promise<TaskWithRelations> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskWithRelations;
    }>(`${this.endpoint}/${id}/with-relations`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Task tapılmadı');
  }

  /**
   * Get task statistics with filtering
   */
  async getTaskStats(filters?: Omit<TaskFilters, 'page' | 'per_page'>): Promise<TaskStats> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskStats;
    }>(`${this.endpoint}/statistics`, { params: filters });
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Statistikalar yüklənə bilmədi');
  }

  /**
   * Get my assigned tasks
   */
  async getMyTasks(filters?: Omit<TaskFilters, 'assigned_to'>): Promise<{
    data: TaskWithRelations[];
    meta: any;
  }> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskWithRelations[];
      meta: any;
    }>(`${this.endpoint}/my-tasks`, { params: filters });
    
    if (response.data.status === 'success') {
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    }
    throw new Error('Mənim tapşırıqlarım yüklənə bilmədi');
  }

  /**
   * Get tasks assigned by me
   */
  async getTasksAssignedByMe(filters?: Omit<TaskFilters, 'assigned_by'>): Promise<{
    data: TaskWithRelations[];
    meta: any;
  }> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskWithRelations[];
      meta: any;
    }>(`${this.endpoint}/assigned-by-me`, { params: filters });
    
    if (response.data.status === 'success') {
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    }
    throw new Error('Təyin etdiyim tapşırıqlar yüklənə bilmədi');
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<TaskWithRelations[]> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskWithRelations[];
    }>(`${this.endpoint}/overdue`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Gecikmiş tapşırıqlar yüklənə bilmədi');
  }

  /**
   * Get task dependencies
   */
  async getTaskDependencies(taskId: number): Promise<TaskWithRelations[]> {
    const response = await this.apiClient.get<{
      status: string;
      data: TaskWithRelations[];
    }>(`${this.endpoint}/${taskId}/dependencies`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Task asılılıqları yüklənə bilmədi');
  }

  /**
   * Duplicate task
   */
  async duplicateTask(taskId: number, data?: Partial<CreateTaskData>): Promise<TaskWithRelations> {
    const response = await this.apiClient.post<{
      status: string;
      data: TaskWithRelations;
    }>(`${this.endpoint}/${taskId}/duplicate`, data);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error('Task kopyalana bilmədi');
  }
}