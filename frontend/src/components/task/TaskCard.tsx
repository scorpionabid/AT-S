// ====================
// ATİS Task Card Component
// Individual task display card with actions
// ====================

import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Edit3,
  MoreVertical,
  PlayCircle,
  PauseCircle,
  XCircle,
  MessageSquare,
  Paperclip,
  Flag
} from 'lucide-react';
import { Card } from '../ui/Card';
import { TaskWithRelations, TaskStatus, TaskPriority } from '../../types/shared';
import { taskUtils } from '../../services';

interface TaskCardProps {
  task: TaskWithRelations;
  onView?: (task: TaskWithRelations) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onStatusChange?: (task: TaskWithRelations, status: TaskStatus) => void;
  onDelete?: (task: TaskWithRelations) => void;
  selected?: boolean;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
  selected = false,
  compact = false,
  showActions = true,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const isOverdue = taskUtils.isOverdue(task);
  const daysUntilDue = taskUtils.getDaysUntilDue(task);
  const priorityColor = taskUtils.getPriorityColor(task.priority);
  const statusColor = taskUtils.getStatusColor(task.status);
  
  // Get appropriate status for display
  const displayStatus = isOverdue && task.status !== 'completed' && task.status !== 'cancelled' 
    ? 'overdue' 
    : task.status;

  // Priority badge
  const PriorityBadge = () => (
    <span 
      className={`badge-base badge-sm inline-flex items-center`}
      style={{ 
        backgroundColor: `${priorityColor}20`, 
        color: priorityColor,
        borderColor: priorityColor 
      }}
    >
      <Flag className="w-3 h-3 mr-1" />
      {taskUtils.getPriorityLabel(task.priority)}
    </span>
  );

  // Status badge
  const StatusBadge = () => (
    <span 
      className={`badge-base badge-sm`}
      style={{ 
        backgroundColor: `${statusColor}20`, 
        color: statusColor 
      }}
    >
      {taskUtils.getStatusLabel(displayStatus as TaskStatus)}
    </span>
  );

  // Due date indicator
  const DueDateIndicator = () => {
    const getDueDateColor = () => {
      if (isOverdue) return 'text-red-600 bg-red-50 border-red-200';
      if (daysUntilDue <= 1) return 'text-orange-600 bg-orange-50 border-orange-200';
      if (daysUntilDue <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getDueDateText = () => {
      if (isOverdue) return `${Math.abs(daysUntilDue)} gün gecikib`;
      if (daysUntilDue === 0) return 'Bu gün';
      if (daysUntilDue === 1) return 'Sabah';
      return `${daysUntilDue} gün qalıb`;
    };

    return (
      <div className={`inline-flex items-center text-xs px-2 py-1 rounded border ${getDueDateColor()}`}>
        <Calendar className="w-3 h-3 mr-1" />
        {getDueDateText()}
      </div>
    );
  };

  // Progress bar
  const ProgressBar = () => {
    const progress = task.progress_percentage || 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  // Action menu
  const ActionMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-base btn-icon btn-sm btn-ghost"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-48">
          <div className="py-1">
            {onView && (
              <button
                onClick={() => {
                  onView(task);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ətraflı bax
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Redaktə et
              </button>
            )}

            {/* Status change actions */}
            {task.status === 'pending' && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(task, 'in_progress');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-blue-600"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Başla
              </button>
            )}

            {task.status === 'in_progress' && onStatusChange && (
              <>
                <button
                  onClick={() => {
                    onStatusChange(task, 'pending');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-orange-600"
                >
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Durdur
                </button>
                <button
                  onClick={() => {
                    onStatusChange(task, 'completed');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tamamla
                </button>
              </>
            )}

            {(task.status === 'pending' || task.status === 'in_progress') && onStatusChange && (
              <button
                onClick={() => {
                  onStatusChange(task, 'cancelled');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Ləğv et
              </button>
            )}

            {onDelete && (
              <>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete(task);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Sil
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Compact view
  if (compact) {
    return (
      <Card 
        className={`card-base card-sm cursor-pointer transition-all hover:shadow-md ${
          selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${className}`}
        onClick={() => onView?.(task)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
              <PriorityBadge />
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {task.assignee?.username || 'N/A'}
              </span>
              <DueDateIndicator />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge />
            {showActions && <ActionMenu />}
          </div>
        </div>
      </Card>
    );
  }

  // Full view
  return (
    <Card 
      className={`card-base card-md cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${className}`}
      onClick={() => onView?.(task)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{task.title}</h3>
            <PriorityBadge />
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
        </div>
        {showActions && (
          <div className="ml-4 flex-shrink-0">
            <ActionMenu />
          </div>
        )}
      </div>

      {/* Progress */}
      {task.progress_percentage !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">İrəliləyiş</span>
            <span className="text-xs font-medium">{task.progress_percentage}%</span>
          </div>
          <ProgressBar />
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span className="truncate">
            {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Təyin edilməyib'}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Building className="w-4 h-4 mr-2" />
          <span className="truncate">{task.institution?.name || 'Müəssisə məlumu yoxdur'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{taskUtils.getTaskTypeLabel(task.task_type)}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-gray-600">
            {new Date(task.due_date).toLocaleDateString('az-AZ')}
          </span>
        </div>
      </div>

      {/* Due date and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusBadge />
          <DueDateIndicator />
        </div>
        
        <div className="flex items-center space-x-3 text-gray-500">
          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              {task.comments.length}
            </div>
          )}
          
          {/* Attachments count */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              {task.attachments.length}
            </div>
          )}

          {/* Estimated vs actual hours */}
          {task.estimated_hours && (
            <div className="text-xs">
              {task.actual_hours ? 
                `${task.actual_hours}/${task.estimated_hours}s` : 
                `${task.estimated_hours}s`
              }
            </div>
          )}
        </div>
      </div>

      {/* Warning for overdue tasks */}
      {isOverdue && (
        <div className="mt-3 flex items-center p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Bu tapşırıq müddətini keçib
        </div>
      )}
    </Card>
  );
};

export default TaskCard;