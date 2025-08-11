import { BaseService, BaseEntity, PaginationParams } from './BaseService';
import { apiClient } from './api';

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date?: string;
  assigned_to: number;
  assigned_by: number;
  institution_id?: number;
  department_id?: number;
  progress: number;
  notes?: string;
  attachments?: TaskAttachment[];
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  assigner?: {
    id: number;
    name: string;
  };
  institution?: {
    id: number;
    name: string;
  };
}

export interface TaskAttachment {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: Task['priority'];
  due_date?: string;
  assigned_to: number;
  institution_id?: number;
  department_id?: number;
  attachments?: File[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  due_date?: string;
  progress?: number;
  notes?: string;
}

export interface TaskFilters extends PaginationParams {
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: number;
  assigned_by?: number;
  institution_id?: number;
  department_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  by_priority: Record<string, number>;
  completion_rate: number;
  average_completion_time: number;
}

class TaskService extends BaseService<Task> {
  constructor() {
    super('/tasks');
  }

  async assign(data: CreateTaskData) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'attachments' && data.attachments) {
        data.attachments.forEach(file => {
          formData.append('attachments[]', file);
        });
      } else if (data[key as keyof CreateTaskData] !== undefined) {
        formData.append(key, String(data[key as keyof CreateTaskData]));
      }
    });

    const response = await fetch(`${(apiClient as any).baseURL}${this.baseEndpoint}`, {
      method: 'POST',
      headers: {
        ...((apiClient as any).getHeaders()),
        'Content-Type': 'multipart/form-data'
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Task assignment failed');
    }

    return response.json();
  }

  async updateStatus(id: number, status: Task['status'], notes?: string) {
    const response = await apiClient.put(`${this.baseEndpoint}/${id}/status`, {
      status,
      notes
    });
    return response.data;
  }

  async updateProgress(id: number, progress: number, notes?: string) {
    const response = await apiClient.put(`${this.baseEndpoint}/${id}/progress`, {
      progress,
      notes
    });
    return response.data;
  }

  async addComment(id: number, comment: string) {
    const response = await apiClient.post(`${this.baseEndpoint}/${id}/comments`, {
      comment
    });
    return response.data;
  }

  async getComments(id: number) {
    const response = await apiClient.get(`${this.baseEndpoint}/${id}/comments`);
    return response.data || [];
  }

  async bulkAssign(taskData: Omit<CreateTaskData, 'assigned_to'> & { assigned_to: number[] }) {
    const response = await apiClient.post(`${this.baseEndpoint}/bulk-assign`, taskData);
    return response.data;
  }

  async bulkUpdateStatus(taskIds: number[], status: Task['status']) {
    const response = await apiClient.put(`${this.baseEndpoint}/bulk-status`, {
      task_ids: taskIds,
      status
    });
    return response.data;
  }

  async getMyTasks(filters?: Omit<TaskFilters, 'assigned_to'>) {
    const response = await apiClient.get<Task[]>(`${this.baseEndpoint}/my-tasks`, filters);
    return response as any; // PaginatedResponse
  }

  async getAssignedByMe(filters?: Omit<TaskFilters, 'assigned_by'>) {
    const response = await apiClient.get<Task[]>(`${this.baseEndpoint}/assigned-by-me`, filters);
    return response as any; // PaginatedResponse
  }

  async getStats(filters?: Partial<TaskFilters>) {
    const response = await apiClient.get<TaskStats>(`${this.baseEndpoint}/stats`, filters);
    return response.data;
  }

  async downloadAttachment(taskId: number, attachmentId: number) {
    const response = await fetch(`${(apiClient as any).baseURL}${this.baseEndpoint}/${taskId}/attachments/${attachmentId}`, {
      method: 'GET',
      headers: (apiClient as any).getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }
}

export const taskService = new TaskService();