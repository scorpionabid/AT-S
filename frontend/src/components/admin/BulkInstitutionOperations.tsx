import React, { useState, useEffect } from 'react';
import { institutionService } from '../../services/institutionService';

interface BulkInstitutionOperationsProps {
  selectedInstitutionIds: number[];
  onOperationComplete: () => void;
  onClose: () => void;
}

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
  parent_id?: number;
}

interface BulkStats {
  total_institutions: number;
  active_institutions: number;
  inactive_institutions: number;
  by_type: Record<string, number>;
  by_level: Record<string, number>;
  by_region: Record<string, number>;
  hierarchy_stats: {
    root_institutions: number;
    max_level: number;
    institutions_with_children: number;
  };
}

const institutionTypes = [
  { value: 'ministry', label: 'Nazirlik', level: 1 },
  { value: 'region', label: 'Regional İdarə', level: 2 },
  { value: 'sektor', label: 'Sektor', level: 3 },
  { value: 'school', label: 'Məktəb', level: 4 },
  { value: 'vocational', label: 'Peşə Məktəbi', level: 4 },
  { value: 'university', label: 'Universitet', level: 5 }
];

const BulkInstitutionOperations: React.FC<BulkInstitutionOperationsProps> = ({
  selectedInstitutionIds,
  onOperationComplete,
  onClose
}) => {
  const [activeOperation, setActiveOperation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [bulkStats, setBulkStats] = useState<BulkStats | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeHierarchy, setIncludeHierarchy] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [institutionsData, statsData] = await Promise.all([
        institutionService.getInstitutions({ per_page: 200 }),
        institutionService.getBulkStatistics()
      ]);

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
          result = await institutionService.bulkActivate(selectedInstitutionIds);
          break;
        case 'deactivate':
          result = await institutionService.bulkDeactivate(selectedInstitutionIds);
          break;
        case 'assign-parent':
          if (!selectedParentId) {
            setMessage({ type: 'error', text: 'Lütfən ana təşkilat seçin' });
            return;
          }
          result = await institutionService.bulkAssignParent(selectedInstitutionIds, selectedParentId);
          break;
        case 'update-type':
          if (!selectedType) {
            setMessage({ type: 'error', text: 'Lütfən tip seçin' });
            return;
          }
          result = await institutionService.bulkUpdateType(selectedInstitutionIds, selectedType);
          break;
        case 'export':
          result = await institutionService.exportInstitutions(exportFormat, {}, includeHierarchy);
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
        a.download = `institutions_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
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
      case 'assign-parent':
        // Filter out institutions that are in the selected list to prevent circular references
        const availableParents = institutions.filter(inst => 
          !selectedInstitutionIds.includes(inst.id)
        );

        return (
          <div className="operation-form">
            <h4>Ana Təşkilat Təyinatı</h4>
            <div className="form-group">
              <label>Ana təşkilat seçin:</label>
              <select 
                value={selectedParentId || ''} 
                onChange={(e) => setSelectedParentId(Number(e.target.value))}
                className="form-select"
              >
                <option value="">-- Ana təşkilat seçin --</option>
                {availableParents.map(institution => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name} ({institution.type} - Level {institution.level})
                  </option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('assign-parent')}
                disabled={!selectedParentId || loading}
                className="btn btn-primary"
              >
                {loading ? 'Təyin edilir...' : 'Ana təşkilat təyin et'}
              </button>
              <button onClick={() => setActiveOperation('')} className="btn btn-secondary">
                Ləğv et
              </button>
            </div>
          </div>
        );

      case 'update-type':
        return (
          <div className="operation-form">
            <h4>Tip Yeniləməsi</h4>
            <div className="form-group">
              <label>Yeni tip seçin:</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
              >
                <option value="">-- Tip seçin --</option>
                {institutionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} (Level {type.level})
                  </option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleBulkOperation('update-type')}
                disabled={!selectedType || loading}
                className="btn btn-primary"
              >
                {loading ? 'Yenilənir...' : 'Tip yenilə'}
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
            <h4>Təşkilatları Export et</h4>
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
                  checked={includeHierarchy}
                  onChange={(e) => setIncludeHierarchy(e.target.checked)}
                />
                Ierarxiya məlumatlarını daxil et
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
            <h3>Təşkilat Bulk Əməliyyatları</h3>
            <button onClick={onClose} className="close-button">×</button>
          </div>

          <div className="modal-body">
            {message && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="selection-info">
              <p><strong>{selectedInstitutionIds.length}</strong> təşkilat seçildi</p>
            </div>

            {bulkStats && (
              <div className="bulk-stats">
                <h4>Sistem Statistikası</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Ümumi Təşkilat</span>
                    <span className="stat-value">{bulkStats.total_institutions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Aktiv</span>
                    <span className="stat-value">{bulkStats.active_institutions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Deaktiv</span>
                    <span className="stat-value">{bulkStats.inactive_institutions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Kök Təşkilat</span>
                    <span className="stat-value">{bulkStats.hierarchy_stats.root_institutions}</span>
                  </div>
                </div>

                <div className="by-type-stats">
                  <h5>Tip üzrə:</h5>
                  <div className="type-stats">
                    {Object.entries(bulkStats.by_type).map(([type, count]) => (
                      <span key={type} className="type-stat">
                        {type}: {count}
                      </span>
                    ))}
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
                  onClick={() => setActiveOperation('assign-parent')}
                  disabled={loading}
                  className="operation-btn assign-parent"
                >
                  <span className="btn-icon">🏗️</span>
                  <span className="btn-text">Ana təşkilat təyin et</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('update-type')}
                  disabled={loading}
                  className="operation-btn update-type"
                >
                  <span className="btn-icon">🔄</span>
                  <span className="btn-text">Tip yenilə</span>
                </button>

                <button 
                  onClick={() => setActiveOperation('export')}
                  disabled={loading}
                  className="operation-btn export"
                >
                  <span className="btn-icon">📥</span>
                  <span className="btn-text">Export et</span>
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

export default BulkInstitutionOperations;