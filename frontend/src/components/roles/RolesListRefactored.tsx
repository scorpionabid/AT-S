import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BaseListComponent, { 
  ColumnConfig, 
  ActionConfig, 
  FilterConfig,
  BaseEntity 
} from '../common/BaseListComponent';
import useCRUD from '../../hooks/useCRUD';
import RoleCreateForm from './RoleCreateForm';
import RoleEditForm from './RoleEditForm';

// Role interface extending BaseEntity
interface Role extends BaseEntity {
  name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: string[];
  users_count: number;
  is_system_role: boolean;
}

const RolesListRefactored: React.FC = () => {
  const { user } = useAuth();
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  // CRUD operations using our new hook
  const crud = useCRUD<Role>({
    endpoint: '/roles',
    initialFilters: {
      page: 1,
      per_page: 10
    },
    onSuccess: (message) => {
      console.log('✅ Success:', message);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    }
  });

  // Check permissions - only superadmin can manage roles
  const canCreate = user?.role === 'superadmin';
  const canEdit = user?.role === 'superadmin';
  const canDelete = (role: Role) => user?.role === 'superadmin' && !role.is_system_role;
  const canView = true;

  // Helper function to get level color
  const getLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      1: '#dc2626', // Red for highest level
      2: '#ea580c', // Orange
      3: '#7c3aed', // Purple
      4: '#2563eb', // Blue
      5: '#059669'  // Green for lowest level
    };
    return colors[level] || '#6b7280';
  };

  // Column configuration
  const columns: ColumnConfig<Role>[] = [
    {
      key: 'display_name',
      label: 'Rol Adı',
      sortable: true,
      render: (role) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {role.display_name}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {role.name}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Açıqlama',
      render: (role) => (
        <div style={{ 
          fontSize: '13px', 
          color: '#374151',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {role.description}
        </div>
      )
    },
    {
      key: 'level',
      label: 'Səviyyə',
      sortable: true,
      width: '100px',
      render: (role) => (
        <span style={{
          background: getLevelColor(role.level),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Səviyyə {role.level}
        </span>
      )
    },
    {
      key: 'permissions',
      label: 'İcazələr',
      width: '120px',
      render: (role) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {role.permissions.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            icazə
          </div>
        </div>
      )
    },
    {
      key: 'users_count',
      label: 'İstifadəçi Sayı',
      width: '120px',
      render: (role) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: '#059669' }}>
            {role.users_count}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            istifadəçi
          </div>
        </div>
      )
    },
    {
      key: 'is_system_role',
      label: 'Növ',
      width: '100px',
      render: (role) => (
        <span style={{
          background: role.is_system_role ? '#fef3c7' : '#dbeafe',
          color: role.is_system_role ? '#92400e' : '#1e40af',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {role.is_system_role ? 'Sistem' : 'Xüsusi'}
        </span>
      )
    }
  ];

  // Actions configuration
  const actions: ActionConfig<Role>[] = [
    {
      key: 'view',
      label: 'Bax',
      icon: '👁️',
      onClick: (role) => {
        // Navigate to role details or show modal
        console.log('Viewing role:', role.id);
      },
      condition: () => canView,
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Redaktə et',
      icon: '✏️',
      onClick: (role) => {
        setEditingRoleId(role.id);
        setShowEditForm(true);
      },
      condition: () => canEdit,
      variant: 'primary'
    },
    {
      key: 'permissions',
      label: 'İcazələr',
      icon: '🔐',
      onClick: (role) => {
        // Navigate to permissions management
        window.open(`/roles/${role.id}/permissions`, '_blank');
      },
      condition: () => canEdit,
      variant: 'secondary'
    },
    {
      key: 'users',
      label: 'İstifadəçilər',
      icon: '👥',
      onClick: (role) => {
        // Navigate to users with this role
        window.open(`/users?role=${role.name}`, '_blank');
      },
      condition: (role) => role.users_count > 0,
      variant: 'secondary'
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: '🗑️',
      onClick: (role) => {
        if (role.users_count > 0) {
          alert('Bu rolda istifadəçilər var. Əvvəlcə istifadəçiləri başqa rola köçürün.');
          return;
        }
        if (confirm(`"${role.display_name}" rolunu silmək istədiyinizə əminsiniz?`)) {
          crud.deleteItem(role.id);
        }
      },
      condition: (role) => canDelete(role),
      variant: 'danger'
    }
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'level',
      label: 'Səviyyə',
      type: 'select',
      options: [
        { value: '1', label: 'Səviyyə 1 (Ən yüksək)' },
        { value: '2', label: 'Səviyyə 2' },
        { value: '3', label: 'Səviyyə 3' },
        { value: '4', label: 'Səviyyə 4' },
        { value: '5', label: 'Səviyyə 5 (Ən aşağı)' }
      ]
    },
    {
      key: 'is_system_role',
      label: 'Rol Növü',
      type: 'select',
      options: [
        { value: 'true', label: 'Sistem Rolları' },
        { value: 'false', label: 'Xüsusi Rollar' }
      ]
    },
    {
      key: 'has_users',
      label: 'İstifadəçi Statusu',
      type: 'select',
      options: [
        { value: 'true', label: 'İstifadəçiləri var' },
        { value: 'false', label: 'İstifadəçiləri yox' }
      ]
    }
  ];

  // Event handlers
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    crud.refreshData();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingRoleId(null);
    crud.refreshData();
  };

  return (
    <>
      <BaseListComponent<Role>
        // Data props
        data={crud.state.data}
        loading={crud.state.loading}
        error={crud.state.error}
        meta={crud.state.meta}
        onRefetch={crud.refreshData}
        
        // Configuration
        title="Rollər və İcazələr"
        columns={columns}
        actions={actions}
        filters={filters}
        
        // Permissions
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={true}
        canView={canView}
        
        // Events
        onCreateClick={() => setShowCreateForm(true)}
        onSearchChange={(search) => crud.setFilters({ search })}
        onFilterChange={(key, value) => crud.setFilters({ [key]: value })}
        onPageChange={crud.setPage}
        onSortChange={crud.setSort}
        
        // UI customization
        bulkActions={false} // Roles don't need bulk operations
        searchPlaceholder="Rol adı, açıqlama və ya icazə axtarın..."
        emptyStateMessage="Heç bir rol tapılmadı"
        
        // Modal components
        createFormComponent={
          showCreateForm && (
            <RoleCreateForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
            />
          )
        }
        
        editFormComponent={
          showEditForm && editingRoleId && (
            <RoleEditForm
              roleId={editingRoleId}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          )
        }
      />
    </>
  );
};

export default RolesListRefactored;