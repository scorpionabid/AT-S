import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BaseListComponent, { 
  ColumnConfig, 
  ActionConfig, 
  FilterConfig,
  BaseEntity 
} from '../common/BaseListComponent';
import useCRUD from '../../hooks/useCRUD';
import InstitutionCreateForm from './InstitutionCreateForm';
import InstitutionEditForm from './InstitutionEditForm';
import InstitutionDetails from './InstitutionDetails';

// Institution interface extending BaseEntity
interface Institution extends BaseEntity {
  name: string;
  short_name: string;
  type: string;
  level: number;
  region_code: string;
  institution_code: string;
  is_active: boolean;
  established_date: string;
  hierarchy_path: string;
  parent: {
    id: number;
    name: string;
    type: string;
  } | null;
  children_count: number;
}

const InstitutionsListRefactored: React.FC = () => {
  const { user } = useAuth();
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [editingInstitutionId, setEditingInstitutionId] = useState<number | null>(null);
  const [viewingInstitutionId, setViewingInstitutionId] = useState<number | null>(null);

  // CRUD operations using our new hook
  const crud = useCRUD<Institution>({
    endpoint: '/institutions',
    initialFilters: {
      page: 1,
      per_page: 12
    },
    onSuccess: (message) => {
      console.log('✅ Success:', message);
      // You can integrate with toast system here
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      // You can integrate with toast system here
    }
  });

  // Check permissions
  const canCreate = user?.role === 'superadmin' || user?.role === 'regionadmin';
  const canEdit = user?.role === 'superadmin' || user?.role === 'regionadmin';
  const canDelete = user?.role === 'superadmin';
  const canView = true;

  // Column configuration
  const columns: ColumnConfig<Institution>[] = [
    {
      key: 'name',
      label: 'Təşkilat Adı',
      sortable: true,
      render: (institution) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {institution.name}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {institution.short_name}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Növ',
      sortable: true,
      render: (institution) => {
        const typeColors: Record<string, string> = {
          'ministry': '#dc2626',
          'region': '#059669', 
          'sektor': '#7c3aed',
          'school': '#2563eb',
          'vocational': '#ea580c',
          'university': '#7c2d12'
        };
        
        const typeLabels: Record<string, string> = {
          'ministry': 'Nazirlik',
          'region': 'Regional İdarə',
          'sektor': 'Sektor',
          'school': 'Məktəb',
          'vocational': 'Peşə Məktəbi',
          'university': 'Universitet'
        };

        return (
          <span style={{
            background: typeColors[institution.type] || '#6b7280',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {typeLabels[institution.type] || institution.type}
          </span>
        );
      }
    },
    {
      key: 'level',
      label: 'Səviyyə',
      sortable: true,
      width: '80px',
      render: (institution) => (
        <span style={{
          background: '#f3f4f6',
          color: '#374151',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          L{institution.level}
        </span>
      )
    },
    {
      key: 'region_code',
      label: 'Region',
      width: '100px'
    },
    {
      key: 'children_count',
      label: 'Alt Təşkilat',
      width: '100px',
      render: (institution) => (
        <span style={{
          color: institution.children_count > 0 ? '#059669' : '#6b7280',
          fontWeight: '500'
        }}>
          {institution.children_count}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: (institution) => (
        <span style={{
          background: institution.is_active ? '#dcfce7' : '#fee2e2',
          color: institution.is_active ? '#166534' : '#991b1b',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {institution.is_active ? 'Aktiv' : 'Deaktiv'}
        </span>
      )
    }
  ];

  // Actions configuration
  const actions: ActionConfig<Institution>[] = [
    {
      key: 'view',
      label: 'Bax',
      icon: '👁️',
      onClick: (institution) => {
        setViewingInstitutionId(institution.id);
        setShowDetailsForm(true);
      },
      condition: () => canView,
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Redaktə et',
      icon: '✏️',
      onClick: (institution) => {
        setEditingInstitutionId(institution.id);
        setShowEditForm(true);
      },
      condition: () => canEdit,
      variant: 'primary'
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: '🗑️',
      onClick: (institution) => {
        if (confirm(`"${institution.name}" təşkilatını silmək istədiyinizə əminsiniz?`)) {
          crud.deleteItem(institution.id);
        }
      },
      condition: () => canDelete,
      variant: 'danger'
    }
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'type',
      label: 'Növ',
      type: 'select',
      options: [
        { value: 'ministry', label: 'Nazirlik' },
        { value: 'region', label: 'Regional İdarə' },
        { value: 'sektor', label: 'Sektor' },
        { value: 'school', label: 'Məktəb' },
        { value: 'vocational', label: 'Peşə Məktəbi' },
        { value: 'university', label: 'Universitet' }
      ]
    },
    {
      key: 'level',
      label: 'Səviyyə',
      type: 'select',
      options: [
        { value: '1', label: 'Səviyyə 1' },
        { value: '2', label: 'Səviyyə 2' },
        { value: '3', label: 'Səviyyə 3' },
        { value: '4', label: 'Səviyyə 4' },
        { value: '5', label: 'Səviyyə 5' }
      ]
    },
    {
      key: 'region_code',
      label: 'Region Kodu',
      type: 'text',
      placeholder: 'Region kodunu daxil edin'
    }
  ];

  // View modes
  const viewModes = [
    { key: 'table', label: 'Cədvəl', icon: '📋' },
    { key: 'hierarchy', label: 'Iyerarxiya', icon: '🌳' }
  ];

  // Event handlers
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    crud.refreshData();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingInstitutionId(null);
    crud.refreshData();
  };

  const handleDetailsClose = () => {
    setShowDetailsForm(false);
    setViewingInstitutionId(null);
  };

  return (
    <>
      <BaseListComponent<Institution>
        // Data props
        data={crud.state.data}
        loading={crud.state.loading}
        error={crud.state.error}
        meta={crud.state.meta}
        onRefetch={crud.refreshData}
        
        // Configuration
        title="Təşkilatlar"
        columns={columns}
        actions={actions}
        filters={filters}
        
        // Permissions
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canView={canView}
        
        // Events
        onCreateClick={() => setShowCreateForm(true)}
        onSearchChange={(search) => crud.setFilters({ search })}
        onFilterChange={(key, value) => crud.setFilters({ [key]: value })}
        onPageChange={crud.setPage}
        onSortChange={crud.setSort}
        
        // UI customization
        viewModes={viewModes}
        currentViewMode="table"
        bulkActions={true}
        searchPlaceholder="Təşkilat adı, kod və ya növü axtarın..."
        emptyStateMessage="Heç bir təşkilat tapılmadı"
        
        // Modal components
        createFormComponent={
          showCreateForm && (
            <InstitutionCreateForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
            />
          )
        }
        
        editFormComponent={
          showEditForm && editingInstitutionId && (
            <InstitutionEditForm
              institutionId={editingInstitutionId}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          )
        }
        
        detailsComponent={
          showDetailsForm && viewingInstitutionId && (
            <InstitutionDetails
              institutionId={viewingInstitutionId}
              onClose={handleDetailsClose}
            />
          )
        }
      />
    </>
  );
};

export default InstitutionsListRefactored;