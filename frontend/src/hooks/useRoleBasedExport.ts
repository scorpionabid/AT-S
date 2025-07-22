import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { getStandardizedRole, getRoleLevel } from '../constants/roles';

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  includePersonalData?: boolean;
  includeSystemData?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
}

interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * Role-based data export hook
 * Rollara görə export məhdudiyyətlərini tətbiq edir
 */
export function useRoleBasedExport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's export permissions
  const getExportPermissions = useCallback(() => {
    if (!user) {
      return {
        canExportPersonalData: false,
        canExportSystemData: false,
        canExportCrossRegional: false,
        maxRecords: 0,
        allowedFormats: [] as string[]
      };
    }

    const userRole = getStandardizedRole(
      typeof user.role === 'string' ? user.role : user.role?.name
    );
    const roleLevel = getRoleLevel(userRole);

    console.log('🔍 Export permissions for role:', {
      userRole,
      roleLevel,
      institutionId: user.institution_id
    });

    switch (userRole) {
      case 'superadmin':
        return {
          canExportPersonalData: true,
          canExportSystemData: true,
          canExportCrossRegional: true,
          maxRecords: 50000,
          allowedFormats: ['csv', 'xlsx', 'pdf', 'json']
        };

      case 'regionadmin':
        return {
          canExportPersonalData: true,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 10000,
          allowedFormats: ['csv', 'xlsx', 'pdf']
        };

      case 'regionoperator':
        return {
          canExportPersonalData: false,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 5000,
          allowedFormats: ['csv', 'xlsx']
        };

      case 'sektoradmin':
        return {
          canExportPersonalData: true,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 5000,
          allowedFormats: ['csv', 'xlsx']
        };

      case 'məktəbadmin':
      case 'mektebadmin':
        return {
          canExportPersonalData: true,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 2000,
          allowedFormats: ['csv', 'xlsx']
        };

      case 'müəllim':
        return {
          canExportPersonalData: false,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 500,
          allowedFormats: ['csv']
        };

      default:
        return {
          canExportPersonalData: false,
          canExportSystemData: false,
          canExportCrossRegional: false,
          maxRecords: 0,
          allowedFormats: []
        };
    }
  }, [user]);

  const exportData = useCallback(async (
    endpoint: string,
    options: ExportOptions
  ): Promise<ExportResult> => {
    if (!user) {
      return {
        success: false,
        error: 'İstifadəçi məlumatları tapılmadı'
      };
    }

    const permissions = getExportPermissions();

    // Check format permission
    if (!permissions.allowedFormats.includes(options.format)) {
      return {
        success: false,
        error: `${options.format.toUpperCase()} formatında export üçün icazəniz yoxdur`
      };
    }

    // Check personal data permission
    if (options.includePersonalData && !permissions.canExportPersonalData) {
      return {
        success: false,
        error: 'Şəxsi məlumatları export etmək üçün icazəniz yoxdur'
      };
    }

    // Check system data permission
    if (options.includeSystemData && !permissions.canExportSystemData) {
      return {
        success: false,
        error: 'Sistem məlumatlarını export etmək üçün icazəniz yoxdur'
      };
    }

    try {
      setLoading(true);
      setError(null);

      const userRole = getStandardizedRole(
        typeof user.role === 'string' ? user.role : user.role?.name
      );

      // Apply role-based scope to export
      const exportFilters = {
        ...options.filters,
        max_records: permissions.maxRecords,
        include_personal_data: options.includePersonalData && permissions.canExportPersonalData,
        include_system_data: options.includeSystemData && permissions.canExportSystemData
      };

      // Add user scope based on role
      switch (userRole) {
        case 'regionadmin':
          if (user.institution_id) {
            exportFilters.region_id = user.institution_id;
          }
          break;

        case 'regionoperator':
          if (user.institution_id) {
            exportFilters.region_id = user.institution_id;
          }
          if (user.department_ids?.length) {
            exportFilters.department_ids = user.department_ids;
          }
          break;

        case 'sektoradmin':
          if (user.institution_id) {
            exportFilters.sector_id = user.institution_id;
          }
          break;

        case 'məktəbadmin':
        case 'mektebadmin':
          if (user.institution_id) {
            exportFilters.school_id = user.institution_id;
          }
          break;

        case 'müəllim':
          exportFilters.user_id = user.id;
          if (user.institution_id) {
            exportFilters.school_id = user.institution_id;
          }
          break;
      }

      console.log('📤 Starting role-based export:', {
        endpoint,
        format: options.format,
        userRole,
        exportFilters,
        permissions
      });

      const response = await api.post(`${endpoint}/export`, {
        format: options.format,
        filters: exportFilters,
        date_range: options.dateRange
      });

      const result = response.data;

      if (result.success) {
        console.log('✅ Export successful:', result);
        return {
          success: true,
          downloadUrl: result.download_url,
          filename: result.filename
        };
      } else {
        return {
          success: false,
          error: result.error || 'Export zamanı xəta baş verdi'
        };
      }
    } catch (err: any) {
      console.error('❌ Export error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Export zamanı xəta baş verdi';
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [user, getExportPermissions]);

  const validateExportRequest = useCallback((options: ExportOptions): string | null => {
    const permissions = getExportPermissions();

    if (!permissions.allowedFormats.includes(options.format)) {
      return `${options.format.toUpperCase()} formatı dəstəklənmir. Mövcud formatlar: ${permissions.allowedFormats.join(', ')}`;
    }

    if (options.includePersonalData && !permissions.canExportPersonalData) {
      return 'Şəxsi məlumatları export etmək üçün səlahiyyətiniz yoxdur';
    }

    if (options.includeSystemData && !permissions.canExportSystemData) {
      return 'Sistem məlumatlarını export etmək üçün səlahiyyətiniz yoxdur';
    }

    return null;
  }, [getExportPermissions]);

  const downloadFile = useCallback(async (downloadUrl: string, filename: string) => {
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Fayl yüklənərkən xəta baş verdi');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ File downloaded successfully:', filename);
    } catch (err: any) {
      console.error('❌ Download error:', err);
      setError(err.message || 'Fayl yüklənərkən xəta baş verdi');
    }
  }, []);

  return {
    exportData,
    validateExportRequest,
    downloadFile,
    getExportPermissions,
    loading,
    error
  };
}