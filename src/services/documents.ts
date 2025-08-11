import { BaseService, BaseEntity, PaginationParams } from './BaseService';
import { apiClient } from './api';

export interface Document extends BaseEntity {
  title: string;
  description?: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category?: string;
  is_public: boolean;
  shared_with?: string[];
  uploaded_by: number;
  expires_at?: string;
  download_count: number;
  uploader?: {
    id: number;
    name: string;
  };
  institution?: {
    id: number;
    name: string;
  };
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  category?: string;
  is_public?: boolean;
  shared_with?: string[];
  expires_at?: string;
  file: File;
}

export interface DocumentFilters extends PaginationParams {
  category?: string;
  uploaded_by?: number;
  is_public?: boolean;
  mime_type?: string;
  expires_after?: string;
  expires_before?: string;
}

export interface DocumentStats {
  total: number;
  total_size: number;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
  recent_uploads: number;
  public_documents: number;
}

class DocumentService extends BaseService<Document> {
  constructor() {
    super('/documents');
  }

  async uploadDocument(data: CreateDocumentData): Promise<Document> {
    const formData = new FormData();
    
    // Add file
    formData.append('file', data.file);
    
    // Add other fields
    Object.keys(data).forEach(key => {
      if (key !== 'file' && data[key as keyof CreateDocumentData] !== undefined) {
        const value = data[key as keyof CreateDocumentData];
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${(apiClient as any).baseURL}${this.baseEndpoint}`, {
      method: 'POST',
      headers: {
        ...((apiClient as any).getHeaders()),
        // Don't set Content-Type, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Document upload failed');
    }

    const result = await response.json();
    return result.data;
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await fetch(`${(apiClient as any).baseURL}${this.baseEndpoint}/${id}/download`, {
      method: 'GET',
      headers: (apiClient as any).getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  async shareDocument(id: number, userIds: number[], message?: string): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/${id}/share`, {
      user_ids: userIds,
      message
    });
  }

  async getSharedWithMe(params?: PaginationParams) {
    const response = await apiClient.get<Document[]>(`${this.baseEndpoint}/shared-with-me`, params);
    return response as any; // PaginatedResponse
  }

  async getMyUploads(params?: PaginationParams) {
    const response = await apiClient.get<Document[]>(`${this.baseEndpoint}/my-uploads`, params);
    return response as any; // PaginatedResponse
  }

  async getPublicDocuments(params?: PaginationParams) {
    const response = await apiClient.get<Document[]>(`${this.baseEndpoint}/public`, params);
    return response as any; // PaginatedResponse
  }

  async getStats(): Promise<DocumentStats> {
    const response = await apiClient.get<DocumentStats>(`${this.baseEndpoint}/stats`);
    if (!response.data) {
      throw new Error('Failed to get document statistics');
    }
    return response.data;
  }

  async updatePermissions(id: number, permissions: { is_public?: boolean; shared_with?: string[]; expires_at?: string }) {
    const response = await apiClient.put(`${this.baseEndpoint}/${id}/permissions`, permissions);
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseEndpoint}/categories`);
    return response.data || [];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const documentService = new DocumentService();