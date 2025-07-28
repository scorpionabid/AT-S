/**
 * ATİS Institutions List - Migrated to BaseListComponent
 * Köhnə 400+ sətirlik komponent → 100 sətir
 */

import React from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';
import { useAuth } from '../../contexts/AuthContext';
import BaseListComponent, { ListColumn, ListAction, BulkAction, ListFilter } from '../base/BaseListComponent';
import BaseModal, { useModal } from '../base/BaseModal';
import { GenericCrudService } from '../../services/base/GenericCrudService';
import { Icon, StatusIcon, InstitutionTypeIcon } from '../common/IconSystem';
import InstitutionCreateForm from './InstitutionCreateForm';
import InstitutionEditForm from './InstitutionEditForm';
import InstitutionDetails from './InstitutionDetails';
import InstitutionDepartments from './InstitutionDepartments';

// Institution interface (reused from original)
interface Institution {
  id: number;
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
  created_at: string;
  updated_at: string;
}

// Institution service
const institutionService = new GenericCrudService<Institution>('/institutions');

// Institution types mapping
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

const InstitutionsList: React.FC = () => {
  const { user } = useAuth();
  
  // Modal states using BaseModal hooks
  const createModal = useModal();
  const editModal = useModal();
  const detailsModal = useModal();
  const departmentsModal = useModal();
  
  // Current item states
  const [currentInstitution, setCurrentInstitution] = React.useState<Institution | null>(null);

  // Check permissions
  const canManageInstitutions = () => {
    const roles = user?.roles || [];
    return roles.includes('superadmin') || roles.includes('regionadmin');
  };

  // Utility functions
  const getTypeDisplayName = (type: string) => {
    const typeObj = institutionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getLevelDisplayName = (level: number) => {
    const levelObj = levelOptions.find(l => l.value === level);
    return levelObj ? levelObj.label : `Səviyyə ${level}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  // Column configuration for BaseListComponent
  const columns: ListColumn<Institution>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
      align: 'center'
    },
    {
      key: 'name',
      label: 'Təşkilat Adı',
      sortable: true,
      render: (value, item) => (
        <div style={styles.flex('column', 'start', '1')}>
          <div style={styles.flex('row', 'center', '2')}>
            <InstitutionTypeIcon type={item.type} />
            <span style={styles.text('sm', 'semibold')}>{value}</span>
          </div>
          {item.short_name && (
            <span style={styles.text('xs', 'normal', StyleSystem.tokens.colors.gray[600])}>
              {item.short_name}
            </span>
          )}
          <span style={styles.text('xs', 'normal', StyleSystem.tokens.colors.gray[500])}>
            Kod: {item.institution_code}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Tip',
      width: '140px',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={StyleSystem.badge('primary')}>
          {getTypeDisplayName(value)}
        </span>
      )
    },
    {
      key: 'level',
      label: 'Səviyyə',
      width: '120px',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span style={StyleSystem.badge('gray')}>
          {value}
        </span>
      )
    },
    {
      key: 'parent',
      label: 'Əsas Təşkilat',
      width: '180px',
      render: (value) => value ? (
        <div style={styles.flex('column', 'start', '1')}>
          <span style={styles.text('xs', 'medium')}>{value.name}</span>
          <span style={styles.text('xs', 'normal', StyleSystem.tokens.colors.gray[600])}>
            {getTypeDisplayName(value.type)}
          </span>
        </div>
      ) : (
        <span style={styles.text('xs', 'normal', StyleSystem.tokens.colors.gray[500])}>
          Əsas təşkilat yoxdur
        </span>
      )
    },
    {
      key: 'children_count',
      label: 'Alt Təşkilat',
      width: '100px',
      align: 'center',
      render: (value) => (
        <span style={StyleSystem.badge(value > 0 ? 'success' : 'gray')}>
          {value}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      align: 'center',
      render: (value) => (
        <div style={styles.flex('row', 'center', '2')}>
          <StatusIcon active={value} />
          <span style={StyleSystem.badge(value ? 'success' : 'danger')}>
            {value ? 'Aktiv' : 'Deaktiv'}
          </span>
        </div>
      )
    },
    {
      key: 'established_date',
      label: 'Təsis Tarixi',
      width: '120px',
      sortable: true,
      render: (value) => value ? formatDate(value) : '—'
    }
  ];

  // Action configuration
  const actions: ListAction<Institution>[] = [
    {
      key: 'details',
      label: 'Təfərrüatlar',
      icon: <Icon type="VIEW" />,
      variant: 'secondary',
      onClick: (institution) => {
        setCurrentInstitution(institution);
        detailsModal.open();
      }
    },
    {
      key: 'departments',
      label: 'Şöbələr',
      icon: <Icon type="DEPARTMENT" />,
      variant: 'secondary',
      show: (institution) => institution.children_count > 0,
      onClick: (institution) => {
        setCurrentInstitution(institution);
        departmentsModal.open();
      }
    },
    {
      key: 'edit',
      label: 'Redaktə et',
      icon: <Icon type="EDIT" />,
      variant: 'secondary',
      show: () => canManageInstitutions(),
      onClick: (institution) => {
        setCurrentInstitution(institution);
        editModal.open();
      }
    },
    {
      key: 'toggle-status',
      label: 'Status dəyişdir',
      icon: <Icon type="TOGGLE" />,
      variant: 'warning',
      show: () => canManageInstitutions(),
      onClick: async (institution) => {
        try {
          await institutionService.update(institution.id, {
            is_active: !institution.is_active
          });
        } catch (error) {
          console.error('Status update failed:', error);
        }
      }
    }
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction<Institution>[] = canManageInstitutions() ? [
    {
      key: 'bulk-activate',
      label: 'Aktivləşdir',
      icon: <Icon type="ACTIVE" />,
      variant: 'success',
      confirmMessage: 'Seçilmiş təşkilatları aktivləşdirmək istədiyinizə əminsiniz?',
      onClick: async (institutions) => {
        try {
          await institutionService.bulkActivate(institutions.map(i => Number(i.id)));
        } catch (error) {
          console.error('Bulk activate failed:', error);
        }
      }
    },
    {
      key: 'bulk-deactivate',
      label: 'Deaktivləşdir',
      icon: <Icon type="INACTIVE" />,
      variant: 'warning',
      confirmMessage: 'Seçilmiş təşkilatları deaktivləşdirmək istədiyinizə əminsiniz?',
      onClick: async (institutions) => {
        try {
          await institutionService.bulkDeactivate(institutions.map(i => Number(i.id)));
        } catch (error) {
          console.error('Bulk deactivate failed:', error);
        }
      }
    },
    {
      key: 'bulk-export',
      label: 'İxrac et',
      icon: <Icon type="EXPORT" />,
      variant: 'secondary',
      onClick: async (institutions) => {
        try {
          const blob = await institutionService.export('json', {
            ids: institutions.map(i => i.id)
          });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `institutions_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Export failed:', error);
        }
      }
    },
    {
      key: 'bulk-delete',
      label: 'Sil',
      icon: <Icon type="DELETE" />,
      variant: 'danger',
      confirmMessage: 'Seçilmiş təşkilatları silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.',
      onClick: async (institutions) => {
        try {
          await institutionService.bulkDelete(institutions.map(i => Number(i.id)));
        } catch (error) {
          console.error('Bulk delete failed:', error);
        }
      }
    }
  ] : [];

  // Filter configuration
  const filters: ListFilter[] = [
    {
      key: 'type',
      label: 'Tip',
      type: 'select',
      options: institutionTypes,
      placeholder: 'Tip seçin'
    },
    {
      key: 'level',
      label: 'Səviyyə',
      type: 'select',
      options: levelOptions,
      placeholder: 'Səviyyə seçin'
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Aktiv' },
        { value: 'false', label: 'Deaktiv' }
      ],
      placeholder: 'Status seçin'
    },
    {
      key: 'established_date',
      label: 'Təsis tarixi',
      type: 'date'
    }
  ];

  // Stats header component
  const renderStatsHeader = () => {
    const totalCount = '---'; // Will be provided by BaseListComponent
    const activeCount = '---';
    const inactiveCount = '---';
    const typesCount = institutionTypes.length;

    return (
      <div style={{
        ...styles.flex('row', 'center', 'between'),
        ...styles.mb('6'),
        ...styles.p('6'),
        ...StyleSystem.card()
      }}>
        <div>
          <h1 style={styles.text('2xl', 'bold')}>
            <Icon type="INSTITUTION" /> Təşkilat İdarəetməsi
          </h1>
          <p style={styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600])}>
            Təhsil təşkilatlarının idarə edilməsi və strukturu
          </p>
        </div>
        
        <div style={styles.flex('row', 'center', '4')}>
          <div style={{ ...styles.center(), ...styles.p('4'), ...StyleSystem.card('default', '4') }}>
            <Icon type="INSTITUTION" />
            <span style={styles.text('2xl', 'bold')}>{totalCount}</span>
            <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>Ümumi</span>
          </div>
          
          <div style={{ ...styles.center(), ...styles.p('4'), ...StyleSystem.card('default', '4') }}>
            <Icon type="ACTIVE" />
            <span style={styles.text('2xl', 'bold', StyleSystem.tokens.colors.success[600])}>{activeCount}</span>
            <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>Aktiv</span>
          </div>
          
          <div style={{ ...styles.center(), ...styles.p('4'), ...StyleSystem.card('default', '4') }}>
            <Icon type="INACTIVE" />
            <span style={styles.text('2xl', 'bold', StyleSystem.tokens.colors.danger[600])}>{inactiveCount}</span>
            <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>Deaktiv</span>
          </div>
          
          <div style={{ ...styles.center(), ...styles.p('4'), ...StyleSystem.card('default', '4') }}>
            <Icon type="HIERARCHY" />
            <span style={styles.text('2xl', 'bold')}>{typesCount}</span>
            <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>Tip</span>
          </div>
        </div>
      </div>
    );
  };

  // Action buttons
  const renderActionButtons = () => {
    if (!canManageInstitutions()) return null;

    return (
      <div style={styles.flex('row', 'center', '3')}>
        <button
          onClick={createModal.open}
          style={StyleSystem.button('primary')}
        >
          <Icon type="PLUS" /> Yeni Təşkilat
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Stats Header */}
      {renderStatsHeader()}

      {/* Main List */}
      <BaseListComponent<Institution>
        service={institutionService}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        filters={filters}
        searchable
        searchPlaceholder="Təşkilat adı, kod və ya qısa ad ilə axtarın..."
        selectable={canManageInstitutions()}
        pagination
        pageSize={20}
        sortable
        variant="default"
        size="md"
        emptyTitle="Təşkilat tapılmadı"
        emptyDescription="Həmin kriterlərə uyğun təşkilat mövcud deyil"
        emptyAction={renderActionButtons()}
        renderHeader={renderActionButtons}
        onItemClick={(institution) => {
          setCurrentInstitution(institution);
          detailsModal.open();
        }}
      />

      {/* Create Modal */}
      <BaseModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Yeni Təşkilat"
        size="lg"
      >
        <InstitutionCreateForm 
          onSuccess={() => {
            createModal.close();
            // BaseListComponent will auto-refresh
          }}
          onCancel={createModal.close}
        />
      </BaseModal>

      {/* Edit Modal */}
      <BaseModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Təşkilatı Redaktə et"
        size="lg"
      >
        {currentInstitution && (
          <InstitutionEditForm
            institutionId={currentInstitution.id}
            onSuccess={() => {
              editModal.close();
              setCurrentInstitution(null);
              // BaseListComponent will auto-refresh
            }}
            onCancel={() => {
              editModal.close();
              setCurrentInstitution(null);
            }}
          />
        )}
      </BaseModal>

      {/* Details Modal */}
      <BaseModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="Təşkilat Təfərrüatları"
        size="lg"
      >
        {currentInstitution && (
          <InstitutionDetails
            institutionId={currentInstitution.id}
            onClose={detailsModal.close}
          />
        )}
      </BaseModal>

      {/* Departments Modal */}
      <BaseModal
        isOpen={departmentsModal.isOpen}
        onClose={departmentsModal.close}
        title="Şöbələr"
        size="xl"
      >
        {currentInstitution && (
          <InstitutionDepartments
            institutionId={currentInstitution.id}
            onClose={departmentsModal.close}
          />
        )}
      </BaseModal>
    </div>
  );
};

export default InstitutionsList;