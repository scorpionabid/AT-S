// ====================
// ATİS Task Detail Modal Component
// Comprehensive task information display
// ====================

import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Edit3,
  MessageSquare,
  Paperclip,
  Flag,
  PlayCircle,
  PauseCircle,
  XCircle,
  BarChart3,
  FileText,
  Users,
  MapPin
} from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/ModalUnified';
import { Card } from '../ui/Card';
import { TaskWithRelations, TaskStatus } from '../../types/shared';
import { taskUtils } from '../../services/taskServiceUnified';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithRelations | null;
  onEdit?: (task: TaskWithRelations) => void;
  onStatusChange?: (task: TaskWithRelations, status: TaskStatus) => void;
  onDelete?: (task: TaskWithRelations) => void;
  loading?: boolean;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onStatusChange,
  onDelete,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'comments' | 'attachments'>('overview');

  if (!task) return null;

  const isOverdue = taskUtils.isOverdue(task);
  const daysUntilDue = taskUtils.getDaysUntilDue(task);
  const priorityColor = taskUtils.getPriorityColor(task.priority);
  const statusColor = taskUtils.getStatusColor(task.status);

  // Header section with key info
  const TaskHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
          <span 
            className="badge-base"
            style={{ 
              backgroundColor: `${priorityColor}20`, 
              color: priorityColor,
              borderColor: priorityColor 
            }}
          >
            <Flag className="w-3 h-3 mr-1" />
            {taskUtils.getPriorityLabel(task.priority)}
          </span>
          <span 
            className="badge-base"
            style={{ 
              backgroundColor: `${statusColor}20`, 
              color: statusColor 
            }}
          >
            {taskUtils.getStatusLabel(isOverdue ? 'overdue' : task.status)}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{task.description}</p>
        
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {task.progress_percentage || 0}%
            </div>
            <div className="text-xs text-gray-600">İrəliləyiş</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {Math.abs(daysUntilDue)}
            </div>
            <div className="text-xs text-gray-600">
              {isOverdue ? 'Gün gecikib' : 'Gün qalıb'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {task.comments?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Şərh</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {task.attachments?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Fayl</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Progress bar component
  const ProgressBar = () => {
    const progress = task.progress_percentage || 0;
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">İrəliləyiş</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Overview tab content
  const OverviewTab = () => (
    <div className="space-y-6">
      <ProgressBar />
      
      {/* Basic information */}
      <Card className="card-base card-sm">
        <h3 className="font-semibold mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Əsas Məlumat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Tapşırıq növü</div>
              <div className="text-sm text-gray-600">
                {taskUtils.getTaskTypeLabel(task.task_type)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Son təslim tarixi</div>
              <div className="text-sm text-gray-600">
                {new Date(task.due_date).toLocaleDateString('az-AZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <User className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">İcraçı</div>
              <div className="text-sm text-gray-600">
                {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Təyin edilməyib'}
                {task.assignee && <span className="text-gray-400"> (@{task.assignee.username})</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Təşkilat</div>
              <div className="text-sm text-gray-600">{task.institution?.name || 'Müəssisə məlumu yoxdur'}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Təyin edən</div>
              <div className="text-sm text-gray-600">
                {task.assigner ? `${task.assigner.first_name} ${task.assigner.last_name}` : 'Məlum deyil'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Təxmini/Aktual saat</div>
              <div className="text-sm text-gray-600">
                {task.estimated_hours || 'N/A'} / {task.actual_hours || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Timestamps */}
      <Card className="card-base card-sm">
        <h3 className="font-semibold mb-4">Vaxt məlumatları</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Yaradılıb:</span>
            <span className="text-sm">
              {new Date(task.created_at).toLocaleDateString('az-AZ')} {new Date(task.created_at).toLocaleTimeString('az-AZ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Son yenilənmə:</span>
            <span className="text-sm">
              {new Date(task.updated_at).toLocaleDateString('az-AZ')} {new Date(task.updated_at).toLocaleTimeString('az-AZ')}
            </span>
          </div>
          {task.completed_at && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tamamlanıb:</span>
              <span className="text-sm">
                {new Date(task.completed_at).toLocaleDateString('az-AZ')} {new Date(task.completed_at).toLocaleTimeString('az-AZ')}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Checklist tab content
  const ChecklistTab = () => {
    const checklist = task.task_metadata?.checklist_items || [];
    const completedCount = checklist.filter(item => item.completed).length;
    
    return (
      <div className="space-y-4">
        {checklist.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              {completedCount} / {checklist.length} tamamlanıb
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((completedCount / checklist.length) * 100)}%
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <div key={item.id || index} className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                item.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
              }`}>
                {item.completed && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${
                  item.completed 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900'
                }`}>
                  {item.item}
                </div>
                {item.notes && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.notes}
                  </div>
                )}
                {item.completed_at && (
                  <div className="text-xs text-gray-400 mt-1">
                    Tamamlanıb: {new Date(item.completed_at).toLocaleDateString('az-AZ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {checklist.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Bu tapşırıq üçün checklist yoxdur</p>
          </div>
        )}
      </div>
    );
  };

  // Comments tab content  
  const CommentsTab = () => {
    const comments = task.comments || [];
    
    return (
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="card-base card-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">
                    {comment.user.first_name} {comment.user.last_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('az-AZ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            </div>
          </Card>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Hələ heç bir şərh yoxdur</p>
          </div>
        )}
      </div>
    );
  };

  // Attachments tab content
  const AttachmentsTab = () => {
    const attachments = task.attachments || [];
    
    return (
      <div className="space-y-4">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="card-base card-sm">
            <div className="flex items-center space-x-3">
              <Paperclip className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-medium">{attachment.original_name}</div>
                <div className="text-xs text-gray-500">
                  {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • 
                  {new Date(attachment.uploaded_at).toLocaleDateString('az-AZ')}
                </div>
              </div>
              <a
                href={attachment.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-sm btn-outline"
              >
                Yüklə
              </a>
            </div>
          </Card>
        ))}
        
        {attachments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Heç bir fayl əlavə edilməyib</p>
          </div>
        )}
      </div>
    );
  };

  // Status action buttons
  const getStatusActions = () => {
    const actions = [];
    
    if (task.status === 'pending' && onStatusChange) {
      actions.push({
        label: 'Başla',
        icon: PlayCircle,
        color: 'btn-primary',
        action: () => onStatusChange(task, 'in_progress')
      });
    }
    
    if (task.status === 'in_progress' && onStatusChange) {
      actions.push(
        {
          label: 'Durdur',
          icon: PauseCircle,
          color: 'btn-secondary',
          action: () => onStatusChange(task, 'pending')
        },
        {
          label: 'Tamamla',
          icon: CheckCircle,
          color: 'btn-success',
          action: () => onStatusChange(task, 'completed')
        }
      );
    }
    
    if ((task.status === 'pending' || task.status === 'in_progress') && onStatusChange) {
      actions.push({
        label: 'Ləğv et',
        icon: XCircle,
        color: 'btn-danger',
        action: () => onStatusChange(task, 'cancelled')
      });
    }
    
    return actions;
  };

  const statusActions = getStatusActions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      className="task-detail-modal"
    >
      <ModalBody className="p-0">
        <div className="p-6">
          <TaskHeader />
          
          {/* Warning for overdue tasks */}
          {isOverdue && (
            <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertTriangle className="w-5 h-5 mr-3" />
              <div>
                <div className="font-medium">Bu tapşırıq müddətini keçib!</div>
                <div className="text-sm">
                  {Math.abs(daysUntilDue)} gün gecikib. Zəhmət olmasa dərhal əlaqə saxlayın.
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Ümumi', icon: FileText },
                { key: 'checklist', label: 'Checklist', icon: CheckCircle, count: task.task_metadata?.checklist_items?.length },
                { key: 'comments', label: 'Şərhlər', icon: MessageSquare, count: task.comments?.length },
                { key: 'attachments', label: 'Fayllar', icon: Paperclip, count: task.attachments?.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="min-h-64">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'checklist' && <ChecklistTab />}
            {activeTab === 'comments' && <CommentsTab />}
            {activeTab === 'attachments' && <AttachmentsTab />}
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {statusActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`btn-base btn-sm ${action.color}`}
                disabled={loading}
              >
                <action.icon className="w-4 h-4 mr-1" />
                {action.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="btn-base btn-outline"
                disabled={loading}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Redaktə et
              </button>
            )}
            
            <button
              onClick={onClose}
              className="btn-base btn-secondary"
            >
              Bağla
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default TaskDetailModal;