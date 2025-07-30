// ====================
// ATİS Bulk Actions Component
// Bulk operations for multiple tasks
// ====================

import React, { useState } from 'react';
import { 
  Users,
  CheckCircle,
  XCircle,
  Flag,
  Calendar,
  Building,
  Trash2,
  Copy,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { Card } from '../ui/Card';
import { TaskStatus, TaskPriority } from '../../types/shared';
import { taskUtils } from '../../services/taskServiceUnified';

interface BulkActionsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTasks: number[];
  onBulkOperation: (operation: string, data?: any) => Promise<void>;
  loading?: boolean;
  availableAssignees?: Array<{ id: number; name: string; username: string }>;
  availableInstitutions?: Array<{ id: number; name: string }>;
}

type BulkOperationType = 'assign' | 'update_status' | 'update_priority' | 'delete' | 'duplicate' | 'export';

const BulkActions: React.FC<BulkActionsProps> = ({
  isOpen,
  onClose,
  selectedTasks,
  onBulkOperation,
  loading = false,
  availableAssignees = [],
  availableInstitutions = []
}) => {
  const [activeOperation, setActiveOperation] = useState<BulkOperationType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const resetForm = () => {
    setActiveOperation(null);
    setFormData({});
    setConfirmDelete(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleOperation = async () => {
    if (!activeOperation) return;

    try {
      await onBulkOperation(activeOperation, formData);
      handleClose();
    } catch (error) {
      console.error('Bulk operation error:', error);
    }
  };

  // Operation cards
  const operations = [
    {
      id: 'assign' as BulkOperationType,
      title: 'İcraçı dəyişdir',
      description: 'Seçilmiş tapşırıqların icraçısını dəyişdir',
      icon: Users,
      color: 'bg-blue-50 border-blue-200 text-blue-600'
    },
    {
      id: 'update_status' as BulkOperationType,
      title: 'Status yenilə',
      description: 'Tapşırıqların statusunu toplu şəkildə dəyişdir',
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200 text-green-600'
    },
    {
      id: 'update_priority' as BulkOperationType,
      title: 'Prioritet dəyişdir',
      description: 'Tapşırıqların prioritetini yenilə',
      icon: Flag,
      color: 'bg-orange-50 border-orange-200 text-orange-600'
    },
    {
      id: 'duplicate' as BulkOperationType,
      title: 'Kopyala',
      description: 'Seçilmiş tapşırıqların kopyasını yarat',
      icon: Copy,
      color: 'bg-purple-50 border-purple-200 text-purple-600'
    },
    {
      id: 'export' as BulkOperationType,
      title: 'Export et',
      description: 'Tapşırıqları CSV/Excel formatında yüklə',
      icon: Download,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600'
    },
    {
      id: 'delete' as BulkOperationType,
      title: 'Sil',
      description: 'Seçilmiş tapşırıqları sistem daxilindən sil',
      icon: Trash2,
      color: 'bg-red-50 border-red-200 text-red-600',
      dangerous: true
    }
  ];

  // Assign form
  const AssignForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yeni icraçı seçin
        </label>
        <select
          value={formData.assigned_to || ''}
          onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) })}
          className="input-base"
          required
        >
          <option value="">İcraçı seçin</option>
          {availableAssignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name} (@{assignee.username})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Şərh (ixtiyari)
        </label>
        <textarea
          value={formData.comment || ''}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="input-base"
          rows={3}
          placeholder="Tapşırıq təyinatı haqqında əlavə məlumat"
        />
      </div>
    </div>
  );

  // Status update form
  const StatusForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yeni status seçin
        </label>
        <select
          value={formData.status || ''}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="input-base"
          required
        >
          <option value="">Status seçin</option>
          <option value="pending">Gözləmədə</option>
          <option value="in_progress">İcrada</option>
          <option value="completed">Tamamlanıb</option>
          <option value="cancelled">Ləğv edilib</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Şərh (ixtiyari)
        </label>
        <textarea
          value={formData.comment || ''}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="input-base"
          rows={3}
          placeholder="Status dəyişikliyi haqqında qeyd"
        />
      </div>
    </div>
  );

  // Priority update form
  const PriorityForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yeni prioritet seçin
        </label>
        <select
          value={formData.priority || ''}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="input-base"
          required
        >
          <option value="">Prioritet seçin</option>
          <option value="low">Aşağı</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksək</option>
          <option value="urgent">Təcili</option>
        </select>
      </div>
    </div>
  );

  // Export form
  const ExportForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format seçin
        </label>
        <select
          value={formData.format || 'csv'}
          onChange={(e) => setFormData({ ...formData, format: e.target.value })}
          className="input-base"
        >
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Daxil ediləcək məlumatlar
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.include_comments || false}
            onChange={(e) => setFormData({ ...formData, include_comments: e.target.checked })}
            className="input-base w-4 h-4 mr-2"
          />
          <span className="text-sm">Şərhlər</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.include_attachments || false}
            onChange={(e) => setFormData({ ...formData, include_attachments: e.target.checked })}
            className="input-base w-4 h-4 mr-2"
          />
          <span className="text-sm">Fayl adları</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.include_metadata || false}
            onChange={(e) => setFormData({ ...formData, include_metadata: e.target.checked })}
            className="input-base w-4 h-4 mr-2"
          />
          <span className="text-sm">Əlavə məlumatlar</span>
        </label>
      </div>
    </div>
  );

  // Delete confirmation
  const DeleteForm = () => (
    <div className="space-y-4">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800 mb-1">
              Xəbərdarlıq: Bu əməliyyat geri alına bilməz!
            </h4>
            <p className="text-sm text-red-700">
              {selectedTasks.length} tapşırıq silinəcək. Bu əməliyyat geri alına bilməz.
              Əgər tapşırıqlar başqa yerlərdə istifadə olunursa, məlumat itkisi yaşana bilər.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="confirm-delete"
          checked={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.checked)}
          className="input-base w-4 h-4 mr-3"
        />
        <label htmlFor="confirm-delete" className="text-sm font-medium text-gray-700">
          Bəli, bu tapşırıqları silmək istəyirəm
        </label>
      </div>
    </div>
  );

  // Duplicate form
  const DuplicateForm = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          Seçilmiş tapşırıqların kopyaları yaradılacaq. Kopyalar "Gözləmədə" statusunda olacaq.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yeni son təslim tarixi (ixtiyari)
        </label>
        <input
          type="date"
          value={formData.due_date || ''}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="input-base"
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-gray-500 mt-1">
          Boş buraxılsa, orijinal tarix istifadə olunacaq
        </p>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (activeOperation) {
      case 'assign':
        return <AssignForm />;
      case 'update_status':
        return <StatusForm />;
      case 'update_priority':
        return <PriorityForm />;
      case 'export':
        return <ExportForm />;
      case 'delete':
        return <DeleteForm />;
      case 'duplicate':
        return <DuplicateForm />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeOperation) {
      case 'assign':
        return formData.assigned_to;
      case 'update_status':
        return formData.status;
      case 'update_priority':
        return formData.priority;
      case 'delete':
        return confirmDelete;
      default:
        return true;
    }
  };

  const getOperationTitle = () => {
    const operation = operations.find(op => op.id === activeOperation);
    return operation ? operation.title : '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={activeOperation ? getOperationTitle() : 'Toplu əməliyyatlar'}
      size="md"
    >
      <ModalBody>
        {/* Selection summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              {selectedTasks.length} tapşırıq seçildi
            </span>
          </div>
        </div>

        {!activeOperation ? (
          /* Operation selection */
          <div className="grid grid-cols-1 gap-4">
            {operations.map((operation) => (
              <Card
                key={operation.id}
                className={`card-base card-sm cursor-pointer transition-all hover:shadow-md border-2 ${operation.color}`}
                onClick={() => setActiveOperation(operation.id)}
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    <operation.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{operation.title}</h3>
                    <p className="text-sm opacity-75">{operation.description}</p>
                  </div>
                  {operation.dangerous && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Operation form */
          <div>
            <div className="mb-4">
              <button
                onClick={() => setActiveOperation(null)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Geri qayıt
              </button>
            </div>
            {renderForm()}
          </div>
        )}
      </ModalBody>

      {activeOperation && (
        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setActiveOperation(null)}
              className="btn-base btn-secondary"
              disabled={loading}
            >
              Geri
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                className="btn-base btn-secondary"
                disabled={loading}
              >
                Ləğv et
              </button>
              
              <button
                onClick={handleOperation}
                className={`btn-base ${
                  activeOperation === 'delete' ? 'btn-danger' : 'btn-primary'
                }`}
                disabled={loading || !canProceed()}
              >
                {loading ? (
                  <div className="loading-spinner mr-2" />
                ) : null}
                {activeOperation === 'delete' ? 'Sil' : 
                 activeOperation === 'export' ? 'Yüklə' :
                 activeOperation === 'duplicate' ? 'Kopyala' : 'Tətbiq et'}
              </button>
            </div>
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default BulkActions;