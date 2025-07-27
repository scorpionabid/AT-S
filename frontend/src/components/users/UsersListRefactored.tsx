import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BaseListComponent, { 
  ColumnConfig, 
  ActionConfig, 
  FilterConfig,
  BaseEntity 
} from '../common/BaseListComponent';
import useCRUD from '../../hooks/useCRUD';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import UserViewModal from './UserViewModal';
import UserDeleteConfirm from './UserDeleteConfirm';
import UserStatusConfirm from './UserStatusConfirm';
import { useRegionalData } from '../../hooks/useRoleBasedData';

// User interface extending BaseEntity
interface User extends BaseEntity {
  username: string;
  email: string;
  role: {
    id: number | null;
    name: string | null;
    display_name: string | null;
    level: number | null;
  } | null;
  role_display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  institution: {
    id: number | null;
    name: string | null;
  };
}

const UsersListRefactored: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [statusChangingUser, setStatusChangingUser] = useState<User | null>(null);
  
  // Institutions for filter
  const [institutions, setInstitutions] = useState<{id: number, name: string, type: string}[]>([]);

  // CRUD operations using our new hook
  const crud = useCRUD<User>({
    endpoint: '/users',
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

  // Fetch institutions for filter
  const {
    data: institutionsData
  } = useRegionalData<{institutions?: {id: number, name: string, type: string}[]} | {id: number, name: string, type: string}[]>('institutions');

  // Set institutions from role-based data
  useEffect(() => {
    if (institutionsData) {
      let institutionsArray: {id: number, name: string, type: string}[] = [];
      
      try {
        if (Array.isArray(institutionsData)) {
          institutionsArray = institutionsData;
        } else if (institutionsData && typeof institutionsData === 'object') {
          if ('institutions' in institutionsData && Array.isArray(institutionsData.institutions)) {
            institutionsArray = institutionsData.institutions;
          } else if ('data' in institutionsData && Array.isArray(institutionsData.data)) {
            institutionsArray = institutionsData.data;
          } else if ('id' in institutionsData && 'name' in institutionsData) {
            institutionsArray = [institutionsData as any];
          }
        }
        
        setInstitutions(Array.isArray(institutionsArray) ? institutionsArray : []);
      } catch (error) {
        console.error('❌ Error processing institutions data:', error);
        setInstitutions([]);
      }
    } else {
      setInstitutions([]);
    }
  }, [institutionsData]);

  // Check permissions
  const canCreate = currentUser?.role === 'superadmin' || currentUser?.role === 'regionadmin';
  const canEdit = currentUser?.role === 'superadmin' || currentUser?.role === 'regionadmin';
  const canDelete = currentUser?.role === 'superadmin';
  const canView = true;

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Heç vaxt';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Column configuration
  const columns: ColumnConfig<User>[] = [
    {
      key: 'username',
      label: 'İstifadəçi Adı',
      sortable: true,
      render: (user) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {user.username}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {user.email}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (user) => {
        const roleColors: Record<string, string> = {
          'superadmin': '#dc2626',
          'regionadmin': '#059669', 
          'schooladmin': '#7c3aed',
          'müəllim': '#2563eb',
          'regionoperator': '#ea580c'
        };
        
        const roleName = user.role?.name || 'N/A';
        const displayName = user.role?.display_name || user.role_display_name || roleName;

        return (
          <span style={{
            background: roleColors[roleName] || '#6b7280',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {displayName}
          </span>
        );
      }
    },
    {
      key: 'institution',
      label: 'Təşkilat',
      render: (user) => (
        <div style={{ fontSize: '13px', color: '#374151' }}>
          {user.institution?.name || 'Təyin edilməyib'}
        </div>
      )
    },
    {
      key: 'last_login_at',
      label: 'Son Giriş',
      sortable: true,
      width: '140px',
      render: (user) => (
        <div style={{ 
          fontSize: '12px', 
          color: user.last_login_at ? '#374151' : '#9ca3af' 
        }}>
          {formatDate(user.last_login_at)}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: (user) => (
        <span style={{
          background: user.is_active ? '#dcfce7' : '#fee2e2',
          color: user.is_active ? '#166534' : '#991b1b',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {user.is_active ? 'Aktiv' : 'Deaktiv'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Yaradılma Tarixi',
      sortable: true,
      width: '120px',
      render: (user) => (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {formatDate(user.created_at)}
        </div>
      )
    }
  ];

  // Actions configuration
  const actions: ActionConfig<User>[] = [
    {
      key: 'view',
      label: 'Bax',
      icon: '👁️',
      onClick: (user) => {
        setViewingUser(user);
        setShowViewModal(true);
      },
      condition: () => canView,
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Redaktə et',
      icon: '✏️',
      onClick: (user) => {
        setEditingUserId(user.id);
        setShowEditForm(true);
      },
      condition: () => canEdit,
      variant: 'primary'
    },
    {
      key: 'status',
      label: user => user.is_active ? 'Deaktiv et' : 'Aktiv et',
      icon: user => user.is_active ? '🔴' : '🟢',
      onClick: (user) => {
        setStatusChangingUser(user);
        setShowStatusConfirm(true);
      },
      condition: () => canEdit,
      variant: 'secondary'
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: '🗑️',
      onClick: (user) => {
        setDeletingUser(user);
        setShowDeleteConfirm(true);
      },
      condition: () => canDelete,
      variant: 'danger'
    }
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: 'superadmin', label: 'Super Admin' },
        { value: 'regionadmin', label: 'Regional Admin' },
        { value: 'schooladmin', label: 'Məktəb Admin' },
        { value: 'müəllim', label: 'Müəllim' },
        { value: 'regionoperator', label: 'Regional Operator' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Aktiv' },
        { value: 'inactive', label: 'Deaktiv' }
      ]
    },
    {
      key: 'institution_id',
      label: 'Təşkilat',
      type: 'select',
      options: institutions.map(inst => ({
        value: inst.id.toString(),
        label: inst.name
      }))
    },
    {
      key: 'created_from',
      label: 'Yaradılma (Başlanğıc)',
      type: 'date'
    },
    {
      key: 'created_to',
      label: 'Yaradılma (Son)',
      type: 'date'
    }
  ];

  // Event handlers
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    crud.refreshData();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingUserId(null);
    crud.refreshData();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
    crud.refreshData();
  };

  const handleStatusSuccess = () => {
    setShowStatusConfirm(false);
    setStatusChangingUser(null);
    crud.refreshData();
  };

  return (
    <>
      <BaseListComponent<User>
        // Data props
        data={crud.state.data}
        loading={crud.state.loading}
        error={crud.state.error}
        meta={crud.state.meta}
        onRefetch={crud.refreshData}
        
        // Configuration
        title="İstifadəçilər"
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
        bulkActions={true}
        searchPlaceholder="İstifadəçi adı, email və ya rol axtarın..."
        emptyStateMessage="Heç bir istifadəçi tapılmadı"
        
        // Modal components
        createFormComponent={
          showCreateForm && (
            <UserCreateForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
            />
          )
        }
        
        editFormComponent={
          showEditForm && editingUserId && (
            <UserEditForm
              userId={editingUserId}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          )
        }
        
        detailsComponent={
          <>
            {showViewModal && viewingUser && (
              <UserViewModal
                user={viewingUser}
                onClose={() => {
                  setShowViewModal(false);
                  setViewingUser(null);
                }}
              />
            )}
            
            {showDeleteConfirm && deletingUser && (
              <UserDeleteConfirm
                user={deletingUser}
                onClose={() => {
                  setShowDeleteConfirm(false);
                  setDeletingUser(null);
                }}
                onSuccess={handleDeleteSuccess}
              />
            )}
            
            {showStatusConfirm && statusChangingUser && (
              <UserStatusConfirm
                user={statusChangingUser}
                onClose={() => {
                  setShowStatusConfirm(false);
                  setStatusChangingUser(null);
                }}
                onSuccess={handleStatusSuccess}
              />
            )}
          </>
        }
      />
    </>
  );
};

export default UsersListRefactored;