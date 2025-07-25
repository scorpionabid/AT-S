// ====================
// ATİS Task Form Component
// Create and edit task form with validation
// ====================

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Building, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { useForm } from '../../hooks/useForm';
import { 
  TaskWithRelations,
  TaskType,
  TaskPriority,
  CreateTaskData,
  UpdateTaskData
} from '../../types/shared';
import { taskUtils } from '../../services/taskServiceUnified';

interface TaskFormProps {
  task?: TaskWithRelations | null;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  availableAssignees?: Array<{ id: number; name: string; username: string }>;
  availableInstitutions?: Array<{ id: number; name: string }>;
}

interface FormData {
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  assigned_to: number | '';
  institution_id: number | '';
  due_date: string;
  estimated_hours: number | '';
  requires_approval: boolean;
  approval_level: string;
  checklist_items: Array<{ item: string; completed?: boolean }>;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false,
  availableAssignees = [],
  availableInstitutions = []
}) => {
  const isEditing = !!task;
  
  // Initialize form data
  const initialData: FormData = {
    title: task?.title || '',
    description: task?.description || '',
    task_type: task?.task_type || 'document_approval',
    priority: task?.priority || 'medium',
    assigned_to: task?.assigned_to || '',
    institution_id: task?.institution_id || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    estimated_hours: task?.estimated_hours || '',
    requires_approval: task?.task_metadata?.requires_approval || false,
    approval_level: task?.task_metadata?.approval_level || 'standard',
    checklist_items: task?.task_metadata?.checklist_items?.map(item => ({
      item: item.item,
      completed: item.completed
    })) || []
  };

  // Form validation rules
  const validationRules = {
    title: (value: string) => {
      if (!value || value.trim().length === 0) return 'Başlıq tələb olunur';
      if (value.length < 3) return 'Başlıq ən azı 3 simvol olmalıdır';
      if (value.length > 200) return 'Başlıq 200 simvoldan çox ola bilməz';
      return null;
    },
    description: (value: string) => {
      if (!value || value.trim().length === 0) return 'Təsvir tələb olunur';
      if (value.length < 10) return 'Təsvir ən azı 10 simvol olmalıdır';
      if (value.length > 1000) return 'Təsvir 1000 simvoldan çox ola bilməz';
      return null;
    },
    task_type: (value: TaskType) => {
      if (!value) return 'Tapşırıq növü seçilməlidir';
      return null;
    },
    priority: (value: TaskPriority) => {
      if (!value) return 'Prioritet seçilməlidir';
      return null;
    },
    assigned_to: (value: number | '') => {
      if (!value) return 'İcraçı seçilməlidir';
      return null;
    },
    institution_id: (value: number | '') => {
      if (!value) return 'Müəssisə seçilməlidir';
      return null;
    },
    due_date: (value: string) => {
      if (!value) return 'Son təslim tarixi tələb olunur';
      const dueDate = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (dueDate < now) {
        return 'Son təslim tarixi bu gündən sonra olmalıdır';
      }
      return null;
    },
    estimated_hours: (value: number | '') => {
      if (value !== '' && (value <= 0 || value > 1000)) {
        return 'Təxmini saat 1-1000 arasında olmalıdır';
      }
      return null;
    }
  };

  const {
    formData: data,
    errors,
    loading: isSubmitting,
    handleChange: updateField,
    validateField,
    handleSubmit,
    resetForm: reset
  } = useForm<FormData>({
    initialData,
    validationRules,
    onSubmit: async (formData) => {
      const submitData = {
        ...formData,
        assigned_to: Number(formData.assigned_to),
        institution_id: Number(formData.institution_id),
        estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : undefined,
        task_metadata: {
          requires_approval: formData.requires_approval,
          approval_level: formData.approval_level,
          related_documents: [],
          checklist_items: formData.checklist_items.map((item, index) => ({
            id: `item-${index}`,
            item: item.item,
            completed: item.completed || false
          }))
        }
      };

      await onSubmit(submitData);
    }
  });

  // Checklist management
  const addChecklistItem = () => {
    updateField('checklist_items', [
      ...(data?.checklist_items || []),
      { item: '', completed: false }
    ]);
  };

  const updateChecklistItem = (index: number, item: string) => {
    const updatedItems = [...(data?.checklist_items || [])];
    updatedItems[index] = { ...updatedItems[index], item };
    updateField('checklist_items', updatedItems);
  };

  const removeChecklistItem = (index: number) => {
    const updatedItems = (data?.checklist_items || []).filter((_, i) => i !== index);
    updateField('checklist_items', updatedItems);
  };

  // Form sections
  const BasicInfoSection = () => (
    <Card className="card-base card-md mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        Əsas Məlumat
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tapşırıq başlığı *
          </label>
          <input
            type="text"
            value={data?.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            onBlur={() => validateField('title')}
            className={`input-base ${errors?.title ? 'border-red-500' : ''}`}
            placeholder="Tapşırığın qısa və aydın başlığı"
            disabled={loading}
          />
          {errors?.title && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors?.title}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Təfərrüatlı təsvir *
          </label>
          <textarea
            value={data?.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            onBlur={() => validateField('description')}
            className={`input-base ${errors?.description ? 'border-red-500' : ''}`}
            rows={4}
            placeholder="Tapşırığın ətraflı təsviri, məqsədi və gözlənilən nəticə"
            disabled={loading}
          />
          {errors?.description && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors?.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tapşırıq növü *
          </label>
          <select
            value={data?.task_type || 'document_approval'}
            onChange={(e) => updateField('task_type', e.target.value as TaskType)}
            className={`input-base ${errors?.task_type ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            <option value="attendance_report">Davamiyyət Hesabatı</option>
            <option value="schedule_review">Cədvəl Baxışı</option>
            <option value="document_approval">Sənəd Təsdiqi</option>
            <option value="survey_response">Sorğu Cavabı</option>
            <option value="inspection">Yoxlama</option>
            <option value="meeting">Görüş</option>
          </select>
          {errors?.task_type && (
            <p className="text-red-600 text-sm mt-1">{errors?.task_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioritet *
          </label>
          <select
            value={data?.priority || 'medium'}
            onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
            className={`input-base ${errors?.priority ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            <option value="low">Aşağı</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksək</option>
            <option value="urgent">Təcili</option>
          </select>
          {errors?.priority && (
            <p className="text-red-600 text-sm mt-1">{errors?.priority}</p>
          )}
        </div>
      </div>
    </Card>
  );

  const AssignmentSection = () => (
    <Card className="card-base card-md mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <User className="w-5 h-5 mr-2" />
        Təyinat və Vaxt
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İcraçı *
          </label>
          <select
            value={data?.assigned_to || ''}
            onChange={(e) => updateField('assigned_to', Number(e.target.value) || '')}
            className={`input-base ${errors?.assigned_to ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            <option value="">İcraçı seçin</option>
            {availableAssignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} (@{assignee.username})
              </option>
            ))}
          </select>
          {errors?.assigned_to && (
            <p className="text-red-600 text-sm mt-1">{errors?.assigned_to}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Təşkilat *
          </label>
          <select
            value={data?.institution_id || ''}
            onChange={(e) => updateField('institution_id', Number(e.target.value) || '')}
            className={`input-base ${errors?.institution_id ? 'border-red-500' : ''}`}
            disabled={loading}
          >
            <option value="">Təşkilat seçin</option>
            {availableInstitutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          {errors?.institution_id && (
            <p className="text-red-600 text-sm mt-1">{errors?.institution_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Son təslim tarixi *
          </label>
          <input
            type="date"
            value={data?.due_date || ''}
            onChange={(e) => updateField('due_date', e.target.value)}
            onBlur={() => validateField('due_date')}
            className={`input-base ${errors?.due_date ? 'border-red-500' : ''}`}
            min={new Date().toISOString().split('T')[0]}
            disabled={loading}
          />
          {errors?.due_date && (
            <p className="text-red-600 text-sm mt-1">{errors?.due_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Təxmini müddət (saat)
          </label>
          <input
            type="number"
            value={data?.estimated_hours || ''}
            onChange={(e) => updateField('estimated_hours', Number(e.target.value) || '')}
            onBlur={() => validateField('estimated_hours')}
            className={`input-base ${errors?.estimated_hours ? 'border-red-500' : ''}`}
            min="1"
            max="1000"
            placeholder="Saat"
            disabled={loading}
          />
          {errors?.estimated_hours && (
            <p className="text-red-600 text-sm mt-1">{errors?.estimated_hours}</p>
          )}
        </div>
      </div>
    </Card>
  );

  const ApprovalSection = () => (
    <Card className="card-base card-md mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2" />
        Təsdiq Parametrləri
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requires_approval"
            checked={data?.requires_approval || false}
            onChange={(e) => updateField('requires_approval', e.target.checked)}
            className="input-base w-4 h-4 mr-3"
            disabled={loading}
          />
          <label htmlFor="requires_approval" className="text-sm font-medium text-gray-700">
            Bu tapşırıq təsdiq tələb edir
          </label>
        </div>

        {data?.requires_approval && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Təsdiq səviyyəsi
            </label>
            <select
              value={data?.approval_level || 'standard'}
              onChange={(e) => updateField('approval_level', e.target.value)}
              className="input-base"
              disabled={loading}
            >
              <option value="standard">Standart</option>
              <option value="elevated">Yüksək</option>
              <option value="critical">Kritik</option>
            </select>
          </div>
        )}
      </div>
    </Card>
  );

  const ChecklistSection = () => (
    <Card className="card-base card-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Tapşırıq Siyahısı
        </h3>
        <button
          type="button"
          onClick={addChecklistItem}
          className="btn-base btn-sm btn-outline"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-1" />
          Element əlavə et
        </button>
      </div>

      <div className="space-y-3">
        {(data?.checklist_items || []).map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <input
              type="text"
              value={item.item}
              onChange={(e) => updateChecklistItem(index, e.target.value)}
              className="input-base flex-1"
              placeholder="Checklist elementi"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => removeChecklistItem(index)}
              className="btn-base btn-icon btn-sm btn-ghost text-red-600"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {(data?.checklist_items || []).length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            Hələ heç bir checklist elementi əlavə edilməyib
          </p>
        )}
      </div>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <BasicInfoSection />
      <AssignmentSection />
      <ApprovalSection />
      <ChecklistSection />

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={reset}
            className="btn-base btn-sm btn-ghost"
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Sıfırla
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-base btn-secondary"
            disabled={loading}
          >
            Ləğv et
          </button>
          
          <button
            type="submit"
            className="btn-base btn-primary"
            disabled={loading || !isValid || isSubmitting}
          >
            {loading ? (
              <div className="loading-spinner mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Yenilə' : 'Yarat'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;