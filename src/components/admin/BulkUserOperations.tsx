import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { institutionService } from '../../services/institutionService';

interface BulkUserOperationsProps {
  selectedUserIds: number[];
  onOperationComplete: () => void;
  onClose: () => void;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface Institution {
  id: number;
  name: string;
  type: string;
}

interface BulkStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  by_role: Record<string, number>;
  by_institution: Record<string, number>;
}

const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({
  selectedUserIds,
  onOperationComplete,
  onClose
}) => {
  const [activeOperation, setActiveOperation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [bulkStats, setBulkStats] = useState<BulkStats | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeProfiles, setIncludeProfiles] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [rolesData, institutionsData, statsData] = await Promise.all([
        roleService.getRoles(),
        institutionService.getInstitutions({ per_page: 100 }),
        userService.getBulkStatistics()
      ]);

      setRoles(rolesData.roles || []);
      setInstitutions(institutionsData.data || []);
      setBulkStats(statsData.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setMessage({ type: 'error', text: 'Məlumatlar yüklənərkən xəta baş verdi' });
    }
  };

  const handleBulkOperation = async (operation: string) => {
    setLoading(true);
    setMessage(null);

    try {
      let result;
      
      switch (operation) {
        case 'activate':
          result = await userService.bulkActivate(selectedUserIds);
          break;
        case 'deactivate':
          result = await userService.bulkDeactivate(selectedUserIds);
          break;
        case 'assign-role':
          if (!selectedRoleId) {
            setMessage({ type: 'error', text: 'Lütfən rol seçin' });
            return;
          }
          result = await userService.bulkAssignRole(selectedUserIds, selectedRoleId);
          break;
        case 'assign-institution':
          if (!selectedInstitutionId) {
            setMessage({ type: 'error', text: 'Lütfən təşkilat seçin' });
            return;
          }
          result = await userService.bulkAssignInstitution(selectedUserIds, selectedInstitutionId);
          break;
        case 'delete':
          if (!deleteConfirmation) {
            setMessage({ type: 'error', text: 'Lütfən silmə təsdiqini işarələyin' });
            return;
          }
          result = await userService.bulkDelete(selectedUserIds, true);
          break;
        case 'export':
          result = await userService.exportUsers(exportFormat, {}, includeProfiles);
          break;
        default:
          return;
      }

      setMessage({ type: 'success', text: result.message });
      
      if (operation === 'export') {
        // Handle export data download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      setTimeout(() => {
        onOperationComplete();
        onClose();
      }, 1500);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Əməliyyat zamanı xəta baş verdi' });
    } finally {
      setLoading(false);
      setActiveOperation('');
    }
  };

  const renderOperationForm = () => {
    switch (activeOperation) {
      case 'assign-role':
        return (
          <div className="operation-form">
            <h4>Rol Təyinatı</h4>
            <div className="form-group">
              <label>Rol seçin:</label>
              <select 
                value={selectedRoleId || ''} 
                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                className="form-select"
              >
                <option value="">-- Rol seçin --</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name} ({role.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('assign-role')}
                disabled={!selectedRoleId || loading}
                className="btn btn-primary"
              >
                {loading ? 'Təyin edilir...' : 'Rol təyin et'}
              </button>
              <button onClick={() => setActiveOperation('')} className="btn btn-secondary">
                Ləğv et
              </button>
            </div>
          </div>
        );

      case 'assign-institution':
        return (
          <div className="operation-form">
            <h4>Təşkilat Təyinatı</h4>
            <div className="form-group">
              <label>Təşkilat seçin:</label>
              <select 
                value={selectedInstitutionId || ''} 
                onChange={(e) => setSelectedInstitutionId(Number(e.target.value))}
                className="form-select"
              >
                <option value="">-- Təşkilat seçin --</option>
                {institutions.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name} ({institution.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('assign-institution')}
                disabled={!selectedInstitutionId || loading}
                className="btn btn-primary"
              >
                {loading ? 'Təyin edilir...' : 'Təşkilat təyin et'}
              </button>
              <button onClick={() => setActiveOperation('')} className="btn btn-secondary">
                Ləğv et
              </button>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="operation-form danger">
            <h4>⚠️ İstifadəçiləri Sil</h4>
            <p>Bu əməliyyat geri alına bilməz. {selectedUserIds.length} istifadəçi həmişəlik silinəcək.</p>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.checked)}
                />
                Bəli, istifadəçiləri həmişəlik silmək istəyirəm
              </label>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('delete')}
                disabled={!deleteConfirmation || loading}
                className="btn btn-danger"
              >
                {loading ? 'Silinir...' : 'Həmişəlik sil'}
              </button>
              <button onClick={() => setActiveOperation('')} className="btn btn-secondary">
                Ləğv et
              </button>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="operation-form">
            <h4>İstifadəçiləri Export et</h4>
            <div className="form-group">
              <label>Format:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="format" 
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  />
                  CSV
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="format" 
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json')}
                  />
                  JSON
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={includeProfiles}
                  onChange={(e) => setIncludeProfiles(e.target.checked)}
                />
                Profil məlumatlarını daxil et
              </label>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('export')}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Export edilir...' : 'Export et'}
              </button>
              <button onClick={() => setActiveOperation('')} className="btn btn-secondary">
                Ləğv et
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bulk-operations-modal">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Bulk Əməliyyatlar</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>

          <div className="modal-body">
            {message && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="selection-info">
              <p><strong>{selectedUserIds.length}</strong> istifadəçi seçildi</p>
            </div>

            {bulkStats && (
              <div className="bulk-stats">
                <h4>Sistem Statistikası</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Ümumi İstifadəçi</span>
                    <span className="stat-value">{bulkStats.total_users}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Aktiv</span>
                    <span className="stat-value">{bulkStats.active_users}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Deaktiv</span>
                    <span className="stat-value">{bulkStats.inactive_users}</span>
                  </div>
                </div>
              </div>
            )}

            {!activeOperation ? (
              <div className="operations-grid">
                <button 
                  onClick={() => handleBulkOperation('activate')}
                  disabled={loading}
                  className="operation-btn activate"
                >
                  <span className="btn-icon">✅</span>
                  <span className="btn-text">Aktivləşdir</span>
                </button>

                <button 
                  onClick={() => handleBulkOperation('deactivate')}
                  disabled={loading}
                  className="operation-btn deactivate"
                >
                  <span className="btn-icon">❌</span>
                  <span className="btn-text">Deaktiv et</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('assign-role')}
                  disabled={loading}
                  className="operation-btn assign-role"
                >
                  <span className="btn-icon">🔐</span>
                  <span className="btn-text">Rol təyin et</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('assign-institution')}
                  disabled={loading}
                  className="operation-btn assign-institution"
                >
                  <span className="btn-icon">🏢</span>
                  <span className="btn-text">Təşkilat təyin et</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('export')}
                  disabled={loading}
                  className="operation-btn export"
                >
                  <span className="btn-icon">📥</span>
                  <span className="btn-text">Export et</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('delete')}
                  disabled={loading}
                  className="operation-btn delete"
                >
                  <span className="btn-icon">🗑️</span>
                  <span className="btn-text">Sil</span>
                </button>
              </div>
            ) : (
              renderOperationForm()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUserOperations;