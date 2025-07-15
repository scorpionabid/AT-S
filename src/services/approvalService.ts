import apiService from './api';

export interface ApprovalRequest {
  id: number;
  workflow_name: string;
  approvable_type: string;
  requester_name: string;
  requester_full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ApprovalStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
}

export interface ApprovalAction {
  comments?: string;
}

class ApprovalService {
  async getApprovals(status: string = 'pending', type?: string): Promise<ApprovalRequest[]> {
    const params = new URLSearchParams({ status });
    if (type) params.append('type', type);
    
    const response = await apiService.get(`/approvals/?${params.toString()}`);
    return response.data.data.data; // Laravel pagination response
  }

  async approveRequest(id: number, action: ApprovalAction): Promise<void> {
    await apiService.post(`/approvals/${id}/approve`, action);
  }

  async rejectRequest(id: number, action: ApprovalAction): Promise<void> {
    await apiService.post(`/approvals/${id}/reject`, action);
  }

  async getStats(): Promise<ApprovalStats> {
    const response = await apiService.get('/approvals/stats');
    return response.data.data;
  }
}

export default new ApprovalService();