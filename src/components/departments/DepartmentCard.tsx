import React from 'react';

interface Department {
  id: number;
  name: string;
  short_name: string;
  department_type: string;
  department_type_display: string;
  description: string;
  capacity: number | null;
  budget_allocation: number | null;
  functional_scope: string;
  is_active: boolean;
  institution: {
    id: number;
    name: string;
    type: string;
  };
  parent: {
    id: number;
    name: string;
    department_type: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface DepartmentCardProps {
  department: Department;
  onEdit: (id: number) => void;
  onToggleStatus: (department: Department) => void;
  onDelete: (department: Department) => void;
  canManage: boolean;
  compactView?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onToggleStatus,
  onDelete,
  canManage,
  compactView = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const formatBudget = (amount: number | null) => {
    if (!amount) return 'Təyin edilməyib';
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(amount);
  };

  const getDepartmentTypeIcon = (type: string) => {
    const icons = {
      'maliyyə': '💰',
      'inzibati': '📄', 
      'təsərrüfat': '🔧',
      'müavin': '👨‍💼',
      'ubr': '📚',
      'psixoloq': '🧠',
      'müəllim': '📖',
      'general': '🏢',
      'other': '📁'
    };
    return icons[type as keyof typeof icons] || '📁';
  };

  const getDepartmentTypeColor = (type: string) => {
    const colors = {
      'maliyyə': 'type-finance',
      'inzibati': 'type-admin',
      'təsərrüfat': 'type-maintenance',
      'müavin': 'type-academic',
      'ubr': 'type-events',
      'psixoloq': 'type-support',
      'müəllim': 'type-teaching',
      'general': 'type-general',
      'other': 'type-other'
    };
    return colors[type as keyof typeof colors] || 'type-other';
  };

  return (
    <div className={`department-card ${compactView ? 'compact' : ''} ${!department.is_active ? 'inactive' : ''}`}>
      <div className="department-card-header">
        <div className="department-title-section">
          <div className="department-icon">
            {getDepartmentTypeIcon(department.department_type)}
          </div>
          <div className="department-info">
            <h3 className="department-title">{department.name}</h3>
            {department.short_name && (
              <span className="department-short-name">({department.short_name})</span>
            )}
            <div className="department-badges">
              <span className={`type-badge ${getDepartmentTypeColor(department.department_type)}`}>
                {department.department_type_display}
              </span>
              <span className={`status-badge ${department.is_active ? 'active' : 'inactive'}`}>
                {department.is_active ? 'Aktiv' : 'Deaktiv'}
              </span>
              {department.parent && (
                <span className="parent-badge">
                  Ana: {department.parent.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {canManage && (
          <div className="department-actions">
            <button 
              onClick={() => onEdit(department.id)}
              className="action-button edit"
              title="Redaktə et"
            >
              ✏️
            </button>
            <button 
              onClick={() => onToggleStatus(department)}
              className={`action-button ${department.is_active ? 'deactivate' : 'activate'}`}
              title={department.is_active ? 'Deaktiv et' : 'Aktiv et'}
            >
              {department.is_active ? '⏸️' : '▶️'}
            </button>
            <button 
              onClick={() => onDelete(department)}
              className="action-button delete"
              title="Sil"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="department-card-content">
        {department.description && (
          <div className="department-description">
            <span className="description-label">Təsvir:</span>
            <span className="description-text">{department.description}</span>
          </div>
        )}

        {!compactView && (
          <>
            {department.functional_scope && (
              <div className="functional-scope">
                <span className="scope-label">Funksional sahə:</span>
                <span className="scope-text">{department.functional_scope}</span>
              </div>
            )}

            <div className="department-stats">
              {department.capacity && (
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span className="stat-label">Tutum:</span>
                  <span className="stat-value">{department.capacity} nəfər</span>
                </div>
              )}

              {department.budget_allocation && (
                <div className="stat-item">
                  <span className="stat-icon">💰</span>
                  <span className="stat-label">Büdcə:</span>
                  <span className="stat-value">{formatBudget(department.budget_allocation)}</span>
                </div>
              )}

              <div className="stat-item">
                <span className="stat-icon">🏗️</span>
                <span className="stat-label">Alt şöbələr:</span>
                <span className="stat-value">{department.children_count}</span>
              </div>
            </div>

            <div className="department-meta">
              <div className="meta-item">
                <span className="meta-label">Təşkilat:</span>
                <span className="meta-value">{department.institution.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Yaradılma tarixi:</span>
                <span className="meta-value">{formatDate(department.created_at)}</span>
              </div>
              {department.updated_at !== department.created_at && (
                <div className="meta-item">
                  <span className="meta-label">Son yenilənmə:</span>
                  <span className="meta-value">{formatDate(department.updated_at)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {compactView && (
        <div className="department-summary">
          <div className="summary-stats">
            {department.capacity && (
              <span className="summary-stat">
                👥 {department.capacity}
              </span>
            )}
            <span className="summary-stat">
              🏗️ {department.children_count}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentCard;