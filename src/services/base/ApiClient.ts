/**
 * API Client - Centralized HTTP client for all API communications
 */

import { BaseService } from './BaseService';

export class ApiClient extends BaseService {
  private static instance: ApiClient;

  private constructor() {
    super();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Authentication endpoints
  public async login(credentials: { login: string; password: string }) {
    try {
      const response = await this.post<{ token: string; user: any }>('/login', credentials);
      
      if (response.success && response.data.token) {
        this.updateToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async logout() {
    try {
      const response = await this.post<{}>('/logout');
      this.updateToken(null);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getCurrentUser() {
    try {
      return await this.get<any>('/user');
    } catch (error) {
      return this.handleError(error);
    }
  }

  // User management endpoints
  public async getUsers(params?: Record<string, any>) {
    try {
      return await this.getPaginated<any>('/users', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createUser(userData: any) {
    try {
      return await this.post<any>('/users', userData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateUser(id: number, userData: any) {
    try {
      return await this.put<any>(`/users/${id}`, userData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteUser(id: number) {
    try {
      return await this.delete<any>(`/users/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async toggleUserStatus(id: number) {
    try {
      return await this.post<any>(`/users/${id}/toggle-status`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Institution management endpoints
  public async getInstitutions(params?: Record<string, any>) {
    try {
      return await this.get<any>('/institutions', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createInstitution(institutionData: any) {
    try {
      return await this.post<any>('/institutions', institutionData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateInstitution(id: number, institutionData: any) {
    try {
      return await this.put<any>(`/institutions/${id}`, institutionData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteInstitution(id: number) {
    try {
      return await this.delete<any>(`/institutions/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Role management endpoints
  public async getRoles() {
    try {
      return await this.get<any>('/roles');
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getPermissions() {
    try {
      return await this.get<any>('/permissions');
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createRole(roleData: any) {
    try {
      return await this.post<any>('/roles', roleData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateRole(id: number, roleData: any) {
    try {
      return await this.put<any>(`/roles/${id}`, roleData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteRole(id: number) {
    try {
      return await this.delete<any>(`/roles/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Survey management endpoints
  public async getSurveys(params?: Record<string, any>) {
    try {
      return await this.getPaginated<any>('/surveys', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createSurvey(surveyData: any) {
    try {
      return await this.post<any>('/surveys', surveyData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateSurvey(id: number, surveyData: any) {
    try {
      return await this.put<any>(`/surveys/${id}`, surveyData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteSurvey(id: number) {
    try {
      return await this.delete<any>(`/surveys/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async publishSurvey(id: number) {
    try {
      return await this.post<any>(`/surveys/${id}/publish`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Document management endpoints
  public async getDocuments(params?: Record<string, any>) {
    try {
      return await this.getPaginated<any>('/documents', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async uploadDocument(file: File, metadata?: Record<string, any>) {
    try {
      return await this.uploadFile<any>('/documents', file, metadata);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteDocument(id: number) {
    try {
      return await this.delete<any>(`/documents/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Task management endpoints
  public async getTasks(params?: Record<string, any>) {
    try {
      return await this.getPaginated<any>('/tasks', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createTask(taskData: any) {
    try {
      return await this.post<any>('/tasks', taskData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateTask(id: number, taskData: any) {
    try {
      return await this.put<any>(`/tasks/${id}`, taskData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteTask(id: number) {
    try {
      return await this.delete<any>(`/tasks/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Approval workflow endpoints
  public async getApprovals(params?: Record<string, any>) {
    try {
      return await this.getPaginated<any>('/approvals', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async approveRequest(id: number, action: 'approve' | 'reject', comment?: string) {
    try {
      return await this.post<any>(`/approvals/${id}/${action}`, { comment });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Class attendance endpoints
  public async getClassAttendance(classId: number, date?: string) {
    try {
      return await this.get<any>(`/classes/${classId}/attendance`, { date });
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateClassAttendance(classId: number, attendanceData: any) {
    try {
      return await this.put<any>(`/classes/${classId}/attendance`, attendanceData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Teaching load endpoints
  public async getTeachingLoads(params?: Record<string, any>) {
    try {
      return await this.get<any>('/teaching-loads', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateTeachingLoad(id: number, loadData: any) {
    try {
      return await this.put<any>(`/teaching-loads/${id}`, loadData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Schedule endpoints
  public async getSchedules(params?: Record<string, any>) {
    try {
      return await this.get<any>('/schedules', params);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createSchedule(scheduleData: any) {
    try {
      return await this.post<any>('/schedules', scheduleData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateSchedule(id: number, scheduleData: any) {
    try {
      return await this.put<any>(`/schedules/${id}`, scheduleData);
    } catch (error) {
      return this.handleError(error);
    }
  }
}