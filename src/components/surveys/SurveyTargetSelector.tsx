import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  children?: Institution[];
  parent?: {
    id: number;
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
  short_name: string;
  institution_id: number;
  is_active: boolean;
}

interface TargetingStats {
  institutions: number;
  departments: number;
  estimatedUsers: number;
}

interface SurveyTargetSelectorProps {
  selectedInstitutions: number[];
  selectedDepartments: number[];
  onInstitutionsChange: (institutions: number[]) => void;
  onDepartmentsChange: (departments: number[]) => void;
  onStatsChange?: (stats: TargetingStats) => void;
}

const SurveyTargetSelector: React.FC<SurveyTargetSelectorProps> = ({
  selectedInstitutions,
  selectedDepartments,
  onInstitutionsChange,
  onDepartmentsChange,
  onStatsChange
}) => {
  const [hierarchy, setHierarchy] = useState<Institution[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'individual' | 'hierarchy' | 'bulk'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const institutionTypes = [
    { value: 'ministry', label: 'Nazirlik' },
    { value: 'region', label: 'Regional İdarə' },
    { value: 'sektor', label: 'Sektor' },
    { value: 'school', label: 'Məktəb' },
    { value: 'vocational', label: 'Peşə Məktəbi' },
    { value: 'university', label: 'Universitet' }
  ];

  const levelOptions = [
    { value: 1, label: 'Səviyyə 1 - Nazirlik' },
    { value: 2, label: 'Səviyyə 2 - Regional' },
    { value: 3, label: 'Səviyyə 3 - Sektor' },
    { value: 4, label: 'Səviyyə 4 - Məktəb' },
    { value: 5, label: 'Səviyyə 5 - Şöbə' }
  ];

  useEffect(() => {
    fetchHierarchy();
    fetchAllInstitutions();
    fetchDepartments();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [selectedInstitutions, selectedDepartments, allInstitutions, departments]);

  const fetchHierarchy = async () => {
    try {
      const response = await api.get('/institutions-hierarchy?active_only=true');
      setHierarchy(response.data.hierarchy || []);
      
      // Auto-expand root nodes
      const rootIds = response.data.hierarchy?.map((item: Institution) => item.id) || [];
      setExpandedNodes(new Set(rootIds));
    } catch (error) {
      console.error('Hierarchy fetch error:', error);
    }
  };

  const fetchAllInstitutions = async () => {
    try {
      const response = await api.get('/institutions?per_page=1000&is_active=true');
      setAllInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Institutions fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments?per_page=1000&is_active=true');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Departments fetch error:', error);
    }
  };

  const calculateStats = async () => {
    if (!onStatsChange) return;

    try {
      // Calculate stats based on selected institutions and departments
      const stats: TargetingStats = {
        institutions: selectedInstitutions.length,
        departments: selectedDepartments.length,
        estimatedUsers: 0
      };

      // Estimate users based on selections
      if (selectedInstitutions.length > 0) {
        const response = await api.post('/surveys/estimate-recipients', {
          target_institutions: selectedInstitutions,
          target_departments: selectedDepartments
        });
        stats.estimatedUsers = response.data.estimated_users || 0;
      }

      onStatsChange(stats);
    } catch (error) {
      console.error('Stats calculation error:', error);
    }
  };

  const toggleExpanded = (institutionId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(institutionId)) {
        newSet.delete(institutionId);
      } else {
        newSet.add(institutionId);
      }
      return newSet;
    });
  };

  const toggleInstitutionSelection = (institutionId: number) => {
    const newSelection = selectedInstitutions.includes(institutionId)
      ? selectedInstitutions.filter(id => id !== institutionId)
      : [...selectedInstitutions, institutionId];
    
    onInstitutionsChange(newSelection);
  };

  const selectInstitutionWithChildren = (institution: Institution) => {
    const getAllDescendantIds = (inst: Institution): number[] => {
      let ids = [inst.id];
      if (inst.children) {
        inst.children.forEach(child => {
          ids = ids.concat(getAllDescendantIds(child));
        });
      }
      return ids;
    };

    const descendantIds = getAllDescendantIds(institution);
    const newSelection = [
      ...selectedInstitutions.filter(id => !descendantIds.includes(id)),
      ...descendantIds
    ];
    
    onInstitutionsChange([...new Set(newSelection)]);
  };

  const selectByType = (type: string) => {
    const typeInstitutions = allInstitutions
      .filter(inst => inst.type === type)
      .map(inst => inst.id);
    
    const newSelection = [...new Set([...selectedInstitutions, ...typeInstitutions])];
    onInstitutionsChange(newSelection);
  };

  const selectByLevel = (level: number) => {
    const levelInstitutions = allInstitutions
      .filter(inst => inst.level === level)
      .map(inst => inst.id);
    
    const newSelection = [...new Set([...selectedInstitutions, ...levelInstitutions])];
    onInstitutionsChange(newSelection);
  };

  const clearAllSelections = () => {
    onInstitutionsChange([]);
    onDepartmentsChange([]);
  };

  const selectAllInstitutions = () => {
    const allIds = allInstitutions.map(inst => inst.id);
    onInstitutionsChange(allIds);
  };

  const getFilteredInstitutions = () => {
    return allInstitutions.filter(institution => {
      const matchesSearch = !searchTerm || 
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.short_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || institution.type === typeFilter;
      const matchesLevel = !levelFilter || institution.level.toString() === levelFilter;
      
      return matchesSearch && matchesType && matchesLevel;
    });
  };

  const renderHierarchyNode = (institution: Institution, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(institution.id);
    const isSelected = selectedInstitutions.includes(institution.id);
    const hasChildren = institution.children && institution.children.length > 0;
    
    return (
      <div key={institution.id} className="hierarchy-node">
        <div 
          className={`node-content level-${institution.level} ${isSelected ? 'selected' : ''}`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="node-toggle">
            {hasChildren ? (
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

          <div className="node-selection">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleInstitutionSelection(institution.id)}
              className="institution-checkbox"
            />
          </div>

          <div className="node-info">
            <span className="node-name">{institution.name}</span>
            {institution.short_name && (
              <span className="node-short-name">({institution.short_name})</span>
            )}
            <span className={`type-badge type-${institution.type}`}>
              {institutionTypes.find(t => t.value === institution.type)?.label || institution.type}
            </span>
          </div>

          <div className="node-actions">
            {hasChildren && (
              <button
                onClick={() => selectInstitutionWithChildren(institution)}
                className="select-all-children"
                title="Bu və bütün alt təşkilatları seç"
              >
                📦 Hamısını seç
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="hierarchy-children">
            {institution.children!.map(child => renderHierarchyNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="target-selector-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Targeting options yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-target-selector">
      <div className="selector-header">
        <h3>Sorğu Hədəfləməsi</h3>
        <div className="selection-mode-toggle">
          <button
            className={`mode-button ${selectionMode === 'individual' ? 'active' : ''}`}
            onClick={() => setSelectionMode('individual')}
          >
            🎯 Fərdi
          </button>
          <button
            className={`mode-button ${selectionMode === 'hierarchy' ? 'active' : ''}`}
            onClick={() => setSelectionMode('hierarchy')}
          >
            🌳 İerarxiya
          </button>
          <button
            className={`mode-button ${selectionMode === 'bulk' ? 'active' : ''}`}
            onClick={() => setSelectionMode('bulk')}
          >
            📦 Toplu
          </button>
        </div>
      </div>

      {/* Selection Stats */}
      <div className="selection-stats">
        <div className="stat-item">
          <span className="stat-label">Seçilmiş təşkilatlar:</span>
          <span className="stat-value">{selectedInstitutions.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Seçilmiş departmentlər:</span>
          <span className="stat-value">{selectedDepartments.length}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={selectAllInstitutions} className="quick-action">
          📋 Bütün təşkilatları seç
        </button>
        <button onClick={clearAllSelections} className="quick-action danger">
          🗑️ Seçimi təmizlə
        </button>
      </div>

      {selectionMode === 'individual' && (
        <div className="individual-selection">
          <div className="filters">
            <input
              type="text"
              placeholder="Təşkilat adı ilə axtarın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Bütün tiplər</option>
              {institutionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Bütün səviyyələr</option>
              {levelOptions.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="institutions-list">
            {getFilteredInstitutions().map(institution => (
              <label key={institution.id} className="institution-item">
                <input
                  type="checkbox"
                  checked={selectedInstitutions.includes(institution.id)}
                  onChange={() => toggleInstitutionSelection(institution.id)}
                />
                <span className="institution-name">{institution.name}</span>
                <span className="institution-details">
                  {institution.short_name && `(${institution.short_name})`}
                  <span className={`type-badge type-${institution.type}`}>
                    {institutionTypes.find(t => t.value === institution.type)?.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selectionMode === 'hierarchy' && (
        <div className="hierarchy-selection">
          <div className="hierarchy-controls">
            <button
              onClick={() => setExpandedNodes(new Set(allInstitutions.map(i => i.id)))}
              className="expand-all"
            >
              📖 Hamısını aç
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="collapse-all"
            >
              📕 Hamısını bağla
            </button>
          </div>

          <div className="hierarchy-tree">
            {hierarchy.map(institution => renderHierarchyNode(institution))}
          </div>
        </div>
      )}

      {selectionMode === 'bulk' && (
        <div className="bulk-selection">
          <div className="bulk-section">
            <h4>Tip üzrə seçim</h4>
            <div className="bulk-buttons">
              {institutionTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => selectByType(type.value)}
                  className="bulk-select-button"
                >
                  {type.label} ({allInstitutions.filter(i => i.type === type.value).length})
                </button>
              ))}
            </div>
          </div>

          <div className="bulk-section">
            <h4>Səviyyə üzrə seçim</h4>
            <div className="bulk-buttons">
              {levelOptions.map(level => (
                <button
                  key={level.value}
                  onClick={() => selectByLevel(level.value)}
                  className="bulk-select-button"
                >
                  {level.label} ({allInstitutions.filter(i => i.level === level.value).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Department Selection */}
      {selectedInstitutions.length > 0 && (
        <div className="department-selection">
          <h4>Departament Seçimi</h4>
          <div className="departments-grid">
            {departments
              .filter(dept => selectedInstitutions.includes(dept.institution_id))
              .map(department => (
                <label key={department.id} className="department-item">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(department.id)}
                    onChange={() => {
                      const newSelection = selectedDepartments.includes(department.id)
                        ? selectedDepartments.filter(id => id !== department.id)
                        : [...selectedDepartments, department.id];
                      onDepartmentsChange(newSelection);
                    }}
                  />
                  <span className="department-name">{department.name}</span>
                  <span className="department-short">({department.short_name})</span>
                </label>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyTargetSelector;