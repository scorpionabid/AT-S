import api from './api';

// Types
export interface SystemConfig {
  general: {
    app_name: string;
    timezone: string;
    language: string;
    items_per_page: number;
    max_upload_size: string;
    maintenance_mode: boolean;
  };
  security: {
    session_timeout: number;
    max_login_attempts: number;
    lockout_duration: number;
    password_min_length: number;
    password_expire_days: number;
    password_require_special: boolean;
    password_require_numbers: boolean;
    two_factor_enabled: boolean;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    smtp_encryption: string;
    from_address: string;
    from_name: string;
  };
  system: {
    debug_mode: boolean;
    log_level: string;
    cache_enabled: boolean;
    queue_enabled: boolean;
    backup_retention_days: number;
  };
  integration: {
    api_rate_limit: number;
    webhook_secret: string;
    external_auth_enabled: boolean;
    ldap_enabled: boolean;
  };
}

export interface SystemHealth {
  overall_health: 'healthy' | 'warning' | 'critical';
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      [key: string]: any;
    };
  };
  recommendations: string[];
  last_checked: string;
}

export interface ScheduledReport {
  id: number;
  name: string;
  description?: string;
  report_type: 'overview' | 'institutional' | 'survey' | 'user_activity';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'csv' | 'json' | 'pdf';
  recipients: string[];
  filters?: Record<string, any>;
  time: string;
  day_of_week?: number;
  day_of_month?: number;
  next_run?: string;
  last_run?: string;
  status: 'active' | 'paused' | 'disabled';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export type MaintenanceTask = 
  | 'clear_cache'
  | 'optimize_db'
  | 'cleanup_logs'
  | 'backup_db'
  | 'update_indexes'
  | 'clean_temp_files';

export interface MaintenanceResult {
  results: Record<string, string>;
  errors: Record<string, string>;
  duration: number;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  changes?: Record<string, any>;
  created_at: string;
}

class SystemConfigService {
  // System Configuration
  async getSystemConfig(): Promise<SystemConfig> {
    const response = await api.get('/system/config');
    return response.data;
  }

  async updateSystemConfig(category: string, config: Record<string, any>): Promise<SystemConfig> {
    const response = await api.put('/system/config', {
      category,
      config
    });
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await api.get('/system/health');
    return response.data;
  }

  async performMaintenance(tasks: MaintenanceTask[]): Promise<MaintenanceResult> {
    const response = await api.post('/system/maintenance', { tasks });
    return response.data;
  }

  // Scheduled Reports
  async getScheduledReports(): Promise<{ schedules: ScheduledReport[]; total: number }> {
    const response = await api.get('/system/schedules');
    return response.data;
  }

  async createScheduledReport(schedule: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<ScheduledReport> {
    const response = await api.post('/system/schedules', schedule);
    return response.data;
  }

  async updateScheduledReport(id: number, schedule: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const response = await api.put(`/system/schedules/${id}`, schedule);
    return response.data;
  }

  async deleteScheduledReport(id: number): Promise<void> {
    await api.delete(`/system/schedules/${id}`);
  }

  async pauseScheduledReport(id: number): Promise<ScheduledReport> {
    const response = await api.put(`/system/schedules/${id}`, { status: 'paused' });
    return response.data;
  }

  async resumeScheduledReport(id: number): Promise<ScheduledReport> {
    const response = await api.put(`/system/schedules/${id}`, { status: 'active' });
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
    action?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    logs: AuditLog[];
    total: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  }> {
    const response = await api.get('/system/audit-logs', { params });
    return response.data;
  }

  // Configuration Helpers
  async resetToDefaults(category: string): Promise<SystemConfig> {
    const response = await api.post('/system/config/reset', { category });
    return response.data;
  }

  async exportConfiguration(): Promise<Blob> {
    const response = await api.get('/system/config/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  async importConfiguration(file: File): Promise<SystemConfig> {
    const formData = new FormData();
    formData.append('config_file', file);
    
    const response = await api.post('/system/config/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // System Statistics
  async getSystemStatistics(): Promise<{
    disk_usage: number;
    memory_usage: number;
    cpu_usage: number;
    database_size: number;
    active_users: number;
    failed_jobs: number;
    cache_hit_rate: number;
    response_time: number;
  }> {
    const response = await api.get('/system/statistics');
    return response.data;
  }

  // Backup Management
  async createBackup(options?: {
    include_files?: boolean;
    include_database?: boolean;
    compress?: boolean;
  }): Promise<{
    filename: string;
    size: number;
    created_at: string;
  }> {
    const response = await api.post('/system/backup', options);
    return response.data;
  }

  async listBackups(): Promise<Array<{
    filename: string;
    size: number;
    created_at: string;
    type: string;
  }>> {
    const response = await api.get('/system/backups');
    return response.data;
  }

  async downloadBackup(filename: string): Promise<Blob> {
    const response = await api.get(`/system/backups/${filename}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteBackup(filename: string): Promise<void> {
    await api.delete(`/system/backups/${filename}`);
  }
}

export const systemConfigService = new SystemConfigService();
export default systemConfigService;