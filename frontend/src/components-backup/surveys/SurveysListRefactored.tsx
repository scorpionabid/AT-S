import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BaseListComponent, { 
  ColumnConfig, 
  ActionConfig, 
  FilterConfig,
  BaseEntity 
} from '../common/BaseListComponent';
import useCRUD from '../../hooks/useCRUD';
import SurveyCreateForm from './SurveyCreateForm';
import SurveyEditForm from './SurveyEditForm';

// Survey interface extending BaseEntity
interface Survey extends BaseEntity {
  title: string;
  description: string;
  status: string;
  survey_type: string;
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  start_date: string | null;
  end_date: string | null;
  published_at: string | null;
  response_count: number;
  completion_percentage: number;
  is_active: boolean;
  is_open_for_responses: boolean;
  has_expired: boolean;
  creator: {
    id: number;
    username: string;
    name: string;
  };
}

interface SurveysListProps {
  showCreateModal?: boolean;
  onCreateModalClose?: () => void;
}

const SurveysListRefactored: React.FC<SurveysListProps> = ({ 
  showCreateModal = false, 
  onCreateModalClose 
}) => {
  const { user } = useAuth();
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(showCreateModal);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // CRUD operations using our new hook
  const crud = useCRUD<Survey>({
    endpoint: '/surveys',
    initialFilters: {
      page: 1,
      per_page: 12
    },
    onSuccess: (message) => {
      console.log('✅ Success:', message);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    }
  });

  // Check permissions
  const canCreate = user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'schooladmin';
  const canEdit = (survey: Survey) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'regionadmin') return true;
    return survey.creator.id === user?.id;
  };
  const canDelete = (survey: Survey) => {
    if (user?.role === 'superadmin') return true;
    return survey.creator.id === user?.id;
  };
  const canView = true;

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Təyin edilməyib';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': '#6b7280',
      'published': '#059669',
      'closed': '#dc2626',
      'archived': '#7c3aed'
    };
    return colors[status] || '#6b7280';
  };

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Layihə',
      'published': 'Dərc edilib',
      'closed': 'Bağlı',
      'archived': 'Arxiv'
    };
    return labels[status] || status;
  };

  // Column configuration
  const columns: ColumnConfig<Survey>[] = [
    {
      key: 'title',
      label: 'Sorğu Adı',
      sortable: true,
      render: (survey) => (
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            <Link 
              to={`/surveys/${survey.id}`}
              style={{ 
                textDecoration: 'none', 
                color: '#2563eb',
                fontSize: '14px'
              }}
            >
              {survey.title}
            </Link>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {survey.description}
          </div>
        </div>
      )
    },
    {
      key: 'survey_type',
      label: 'Növ',
      render: (survey) => {
        const typeColors: Record<string, string> = {
          'teacher_evaluation': '#7c3aed',
          'student_feedback': '#2563eb',
          'institutional': '#059669',
          'custom': '#ea580c'
        };
        
        const typeLabels: Record<string, string> = {
          'teacher_evaluation': 'Müəllim Qiymətləndirmə',
          'student_feedback': 'Şagird Rəyi',
          'institutional': 'Institusional',
          'custom': 'Xüsusi'
        };

        return (
          <span style={{
            background: typeColors[survey.survey_type] || '#6b7280',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {typeLabels[survey.survey_type] || survey.survey_type}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (survey) => (
        <span style={{
          background: getStatusColor(survey.status),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {getStatusLabel(survey.status)}
        </span>
      )
    },
    {
      key: 'response_count',
      label: 'Cavab Sayı',
      width: '100px',
      render: (survey) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>
            {survey.response_count}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            %{survey.completion_percentage}
          </div>
        </div>
      )
    },
    {
      key: 'start_date',
      label: 'Başlama / Bitiş',
      width: '140px',
      render: (survey) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#374151' }}>
            {formatDate(survey.start_date)}
          </div>
          <div style={{ color: '#6b7280' }}>
            {formatDate(survey.end_date)}
          </div>
        </div>
      )
    },
    {
      key: 'creator',
      label: 'Yaradan',
      render: (survey) => (
        <div style={{ fontSize: '13px', color: '#374151' }}>
          {survey.creator.name || survey.creator.username}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Aktiv',
      width: '80px',
      render: (survey) => (
        <span style={{
          background: survey.is_active ? '#dcfce7' : '#fee2e2',
          color: survey.is_active ? '#166534' : '#991b1b',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {survey.is_active ? 'Bəli' : 'Xeyr'}
        </span>
      )
    }
  ];

  // Actions configuration
  const actions: ActionConfig<Survey>[] = [
    {
      key: 'view',
      label: 'Bax',
      icon: '👁️',
      onClick: (survey) => {
        window.open(`/surveys/${survey.id}`, '_blank');
      },
      condition: () => canView,
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Redaktə et',
      icon: '✏️',
      onClick: (survey) => {
        setEditingSurveyId(survey.id);
        setShowEditForm(true);
      },
      condition: (survey) => canEdit(survey),
      variant: 'primary'
    },
    {
      key: 'responses',
      label: 'Cavablar',
      icon: '📊',
      onClick: (survey) => {
        window.open(`/surveys/${survey.id}/responses`, '_blank');
      },
      condition: (survey) => survey.response_count > 0,
      variant: 'secondary'
    },
    {
      key: 'publish',
      label: 'Dərc et',
      icon: '🚀',
      onClick: (survey) => {
        if (confirm(`"${survey.title}" sorğusunu dərc etmək istədiyinizə əminsiniz?`)) {
          // Handle publish action
          console.log('Publishing survey:', survey.id);
        }
      },
      condition: (survey) => survey.status === 'draft' && canEdit(survey),
      variant: 'success'
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: '🗑️',
      onClick: (survey) => {
        if (confirm(`"${survey.title}" sorğusunu silmək istədiyinizə əminsiniz?`)) {
          crud.deleteItem(survey.id);
        }
      },
      condition: (survey) => canDelete(survey),
      variant: 'danger'
    }
  ];

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Layihə' },
        { value: 'published', label: 'Dərc edilib' },
        { value: 'closed', label: 'Bağlı' },
        { value: 'archived', label: 'Arxiv' }
      ]
    },
    {
      key: 'survey_type',
      label: 'Növ',
      type: 'select',
      options: [
        { value: 'teacher_evaluation', label: 'Müəllim Qiymətləndirmə' },
        { value: 'student_feedback', label: 'Şagird Rəyi' },
        { value: 'institutional', label: 'Institusional' },
        { value: 'custom', label: 'Xüsusi' }
      ]
    },
    {
      key: 'creator_id',
      label: 'Yaradan',
      type: 'select',
      options: [
        { value: user?.id?.toString() || '', label: 'Mənim sorğularım' }
      ]
    },
    {
      key: 'start_date',
      label: 'Başlama tarixi',
      type: 'date'
    },
    {
      key: 'end_date',
      label: 'Bitiş tarixi',
      type: 'date'
    }
  ];

  // View modes
  const viewModes = [
    { key: 'list', label: 'Siyahı', icon: '📋' },
    { key: 'grid', label: 'Şəbəkə', icon: '▦' }
  ];

  // Event handlers
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    onCreateModalClose?.();
    crud.refreshData();
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingSurveyId(null);
    crud.refreshData();
  };

  React.useEffect(() => {
    setShowCreateForm(showCreateModal);
  }, [showCreateModal]);

  return (
    <>
      <BaseListComponent<Survey>
        // Data props
        data={crud.state.data}
        loading={crud.state.loading}
        error={crud.state.error}
        meta={crud.state.meta}
        onRefetch={crud.refreshData}
        
        // Configuration
        title="Sorğular"
        columns={columns}
        actions={actions}
        filters={filters}
        
        // Permissions
        canCreate={canCreate}
        canEdit={true}
        canDelete={true}
        canView={canView}
        
        // Events
        onCreateClick={() => setShowCreateForm(true)}
        onSearchChange={(search) => crud.setFilters({ search })}
        onFilterChange={(key, value) => crud.setFilters({ [key]: value })}
        onPageChange={crud.setPage}
        onSortChange={crud.setSort}
        
        // UI customization
        viewModes={viewModes}
        currentViewMode={viewMode}
        onViewModeChange={setViewMode}
        bulkActions={true}
        searchPlaceholder="Sorğu adı, açıqlama və ya yaradan axtarın..."
        emptyStateMessage="Heç bir sorğu tapılmadı"
        
        // Modal components
        createFormComponent={
          showCreateForm && (
            <SurveyCreateForm
              onClose={() => {
                setShowCreateForm(false);
                onCreateModalClose?.();
              }}
              onSuccess={handleCreateSuccess}
            />
          )
        }
        
        editFormComponent={
          showEditForm && editingSurveyId && (
            <SurveyEditForm
              surveyId={editingSurveyId}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          )
        }
      />
    </>
  );
};

export default SurveysListRefactored;