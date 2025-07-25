import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../styles/institutions.css';

interface HierarchyDepartment {
  id: number;
  name: string;
  short_name: string;
  department_type: string;
  is_active: boolean;
  users_count: number;
  active_users_count: number;
  children?: HierarchyDepartment[];
}

interface HierarchyInstitution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  is_active: boolean;
  children: HierarchyInstitution[];
  departments?: HierarchyDepartment[];
}

interface InstitutionHierarchyViewProps {
  onEditClick: (institutionId: number) => void;
  canManage: boolean;
  onRefresh?: () => void;
}

const InstitutionHierarchyView: React.FC<InstitutionHierarchyViewProps> = ({ onEditClick, canManage, onRefresh }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      // Use the new hierarchy endpoint with include_inactive parameter
      const response = await api.get('/institutions/hierarchy?include_inactive=1&include_departments=0');
      console.log('Hierarchy API response:', response.data);
      
      setHierarchy(response.data.institutions || []);
      
      // Auto-expand root items
      const rootIds = response.data.institutions?.map((item: HierarchyInstitution) => item.id) || [];
      setExpandedItems(new Set(rootIds));
      
      console.log('Hierarchy data loaded:', response.data.institutions);
      console.log('Total institutions:', response.data.total);
    } catch (err: any) {
      console.error('Hierarchy fetch error:', err);
      setError(err.response?.data?.message || 'Ierarxiya yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (institutionId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(institutionId)) {
        newSet.delete(institutionId);
      } else {
        newSet.add(institutionId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      ministry: '🏛️',
      region: '🌍',
      sektor: '🏢',
      school: '🏫',
      vocational: '🔧',
      university: '🎓'
    };
    return icons[type] || '🏢';
  };

  const getDepartmentTypeIcon = (departmentType: string) => {
    const icons: { [key: string]: string } = {
      maliyyə: '💰',
      inzibati: '📋',
      texniki: '🔧',
      təlim: '📚',
      kadr: '👥',
      təhlükəsizlik: '🔒',
      hüquqi: '⚖️',
      informatika: '💻',
      layihə: '📊',
      mədəni: '🎭',
      idman: '⚽',
      tibb: '🏥',
      ərzaq: '🍽️',
      təchizat: '📦',
      nəqliyyat: '🚗'
    };
    return icons[departmentType] || '📁';
  };

  const getInstitutionStats = (institution: HierarchyInstitution) => {
    // Mock data - real API data will replace this
    return {
      userCount: Math.floor(Math.random() * 50) + 5,
      activeUsers: Math.floor(Math.random() * 30) + 2
    };
  };

  const getTypeDisplayName = (type: string) => {
    const typeNames: { [key: string]: string } = {
      ministry: 'Nazirlik',
      region: 'Regional İdarə',
      sektor: 'Sektor',
      school: 'Məktəb',
      vocational: 'Peşə Məktəbi',
      university: 'Universitet'
    };
    return typeNames[type] || type;
  };

  const getDepartmentTypeDisplayName = (departmentType: string) => {
    const typeNames: { [key: string]: string } = {
      maliyyə: 'Maliyyə Şöbəsi',
      inzibati: 'İnzibati Şöbə',
      texniki: 'Texniki Şöbə',
      təlim: 'Təlim Şöbəsi',
      kadr: 'Kadr Şöbəsi',
      təhlükəsizlik: 'Təhlükəsizlik Şöbəsi',
      hüquqi: 'Hüquqi Şöbə',
      informatika: 'İnformatika Şöbəsi',
      layihə: 'Layihə İdarəetməsi',
      mədəni: 'Mədəniyyət Şöbəsi',
      idman: 'İdman Şöbəsi',
      tibb: 'Tibb Şöbəsi',
      ərzaq: 'Ərzaq Şöbəsi',
      təchizat: 'Təchizat Şöbəsi',
      nəqliyyat: 'Nəqliyyat Şöbəsi'
    };
    return typeNames[departmentType] || departmentType;
  };

  const renderDepartment = (department: HierarchyDepartment, depth: number, institutionId: number): React.ReactNode => {
    const departmentKey = `dept-${institutionId}-${department.id}`;
    const hasDepartmentChildren = department.children && department.children.length > 0;
    const isDepartmentExpanded = expandedItems.has(department.id + 10000); // Offset to avoid conflicts
    const indentStyle = { marginLeft: `${depth * 30}px` };

    return (
      <div key={departmentKey} className="hierarchy-item department-item">
        <div 
          className={`hierarchy-node department-node ${!department.is_active ? 'inactive' : ''}`}
          style={indentStyle}
        >
          <div className="node-content">
            <div className="node-toggle">
              {hasDepartmentChildren ? (
                <button
                  onClick={() => toggleExpanded(department.id + 10000)}
                  className={`toggle-button ${isDepartmentExpanded ? 'expanded' : 'collapsed'}`}
                >
                  {isDepartmentExpanded ? '▼' : '▶'}
                </button>
              ) : (
                <span className="no-children">●</span>
              )}
            </div>

            <div className="node-info">
              <div className="node-header">
                <span className="node-icon">{getDepartmentTypeIcon(department.department_type)}</span>
                <span className="node-name">{department.name}</span>
                {department.short_name && (
                  <span className="node-short-name">({department.short_name})</span>
                )}
              </div>
              
              <div className="node-details">
                <span className={`type-badge department-badge type-${department.department_type}`}>
                  {getDepartmentTypeDisplayName(department.department_type)}
                </span>
                {!department.is_active && (
                  <span className="status-badge inactive">Deaktiv</span>
                )}
                <span className="user-count">
                  👥 {department.active_users_count}/{department.users_count} istifadəçi
                </span>
                {hasDepartmentChildren && (
                  <span className="children-count">
                    {department.children!.length} alt şöbə
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasDepartmentChildren && isDepartmentExpanded && (
          <div className="hierarchy-children">
            {department.children!.map(child => renderDepartment(child, depth + 1, institutionId))}
          </div>
        )}
      </div>
    );
  };

  const renderInstitution = (institution: HierarchyInstitution, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedItems.has(institution.id);
    const hasChildren = institution.children && institution.children.length > 0;
    const hasDepartments = institution.departments && institution.departments.length > 0;
    const indentStyle = { marginLeft: `${depth * 30}px` };

    return (
      <div key={institution.id} className="hierarchy-item">
        <div 
          className={`hierarchy-node level-${institution.level} ${!institution.is_active ? 'inactive' : ''}`}
          style={indentStyle}
        >
          <div className="node-content">
            <div className="node-toggle">
              {hasChildren || hasDepartments ? (
                <button
                  onClick={() => toggleExpanded(institution.id)}
                  className={`toggle-button ${isExpanded ? 'expanded' : 'collapsed'}`}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              ) : (
                <span className="no-children">●</span>
              )}
            </div>

            <div className="node-info">
              <div className="node-header">
                <span className="node-icon">{getTypeIcon(institution.type)}</span>
                <span className="node-name">{institution.name}</span>
                {institution.short_name && (
                  <span className="node-short-name">({institution.short_name})</span>
                )}
              </div>
              
              <div className="node-details">
                <span className={`type-badge type-${institution.type}`}>
                  {getTypeDisplayName(institution.type)}
                </span>
                <span className={`level-badge level-${institution.level}`}>
                  Səviyyə {institution.level}
                </span>
                {!institution.is_active && (
                  <span className="status-badge inactive">Deaktiv</span>
                )}
                {hasChildren && (
                  <span className="children-count">
                    {institution.children.length} alt təşkilat
                  </span>
                )}
                {hasDepartments && (
                  <span className="department-count">
                    📂 {institution.departments!.length} şöbə
                  </span>
                )}
                {(() => {
                  const stats = getInstitutionStats(institution);
                  return (
                    <span className="user-count">
                      👥 {stats.userCount} istifadəçi
                    </span>
                  );
                })()}
              </div>
            </div>

            {canManage && (
              <div className="node-actions">
                <button
                  onClick={() => onEditClick(institution.id)}
                  className="action-button edit"
                  title="Redaktə et"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </div>

        {(hasChildren || hasDepartments) && isExpanded && (
          <div className="hierarchy-children">
            {hasDepartments && institution.departments!.map(department => 
              renderDepartment(department, depth + 1, institution.id)
            )}
            {hasChildren && institution.children.map(child => renderInstitution(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="hierarchy-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Ierarxiya yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hierarchy-error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchHierarchy} className="retry-button">
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: HierarchyInstitution[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        
        // Add department IDs
        if (item.departments) {
          item.departments.forEach(dept => {
            allIds.add(dept.id + 10000); // Offset for departments
            const collectDepartmentIds = (depts: HierarchyDepartment[]) => {
              depts.forEach(d => {
                allIds.add(d.id + 10000);
                if (d.children && d.children.length > 0) {
                  collectDepartmentIds(d.children);
                }
              });
            };
            if (dept.children && dept.children.length > 0) {
              collectDepartmentIds(dept.children);
            }
          });
        }
        
        if (item.children && item.children.length > 0) {
          collectIds(item.children);
        }
      });
    };
    collectIds(hierarchy);
    setExpandedItems(allIds);
  };

  const getTotalInstitutions = (items: HierarchyInstitution[]): number => {
    let total = items.length;
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        total += getTotalInstitutions(item.children);
      }
    });
    return total;
  };

  const getActiveInstitutions = (items: HierarchyInstitution[]): number => {
    let active = items.filter(item => item.is_active).length;
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        active += getActiveInstitutions(item.children);
      }
    });
    return active;
  };

  return (
    <div className="institution-hierarchy">
      <div className="hierarchy-header">
        <div>
          <h3>Təşkilat İerarxiyası</h3>
          <p className="hierarchy-stats">
            📊 {getTotalInstitutions(hierarchy)} təşkilat • 
            ✅ {getActiveInstitutions(hierarchy)} aktiv • 
            📈 {Math.round((getActiveInstitutions(hierarchy) / getTotalInstitutions(hierarchy)) * 100) || 0}% aktiv nisbəti
          </p>
        </div>
        <div className="hierarchy-controls">
          <button
            onClick={() => {
              fetchHierarchy();
              onRefresh?.();
            }}
            className="refresh-button"
          >
            🔄 Yenilə
          </button>
          <button
            onClick={expandAll}
            className="expand-all-button"
          >
            📖 Hamısını aç
          </button>
          <button
            onClick={() => setExpandedItems(new Set())}
            className="collapse-all-button"
          >
            📕 Hamısını bağla
          </button>
        </div>
      </div>

      <div className="hierarchy-tree">
        {hierarchy.length === 0 ? (
          <div className="no-hierarchy">
            <p>Heç bir təşkilat ierarxiyası tapılmadı</p>
          </div>
        ) : (
          hierarchy.map(institution => renderInstitution(institution))
        )}
      </div>

      <div className="hierarchy-legend">
        <h4>📋 İerarxiya Səviyyələri</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-icon">🏛️</span>
            <span className="legend-text">Səviyyə 1: Nazirlik</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🌍</span>
            <span className="legend-text">Səviyyə 2: Regional İdarə</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏢</span>
            <span className="legend-text">Səviyyə 3: Sektor</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏫</span>
            <span className="legend-text">Səviyyə 4: Məktəb/Universitet</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">📂</span>
            <span className="legend-text">Səviyyə 5: Şöbə</span>
          </div>
        </div>
        
        <div className="hierarchy-summary">
          <h4>📈 Xülasə</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-value">{hierarchy.length}</span>
              <span className="summary-label">Kök təşkilat</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{expandedItems.size}</span>
              <span className="summary-label">Açıq node</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{getTotalInstitutions(hierarchy)}</span>
              <span className="summary-label">Ümumi təşkilat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionHierarchyView;