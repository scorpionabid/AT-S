// ====================
// ATİS Task List Component
// Table view for tasks with bulk selection
// ====================

import React from 'react';
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
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card } from '../ui/Card';
import { TaskWithRelations, TaskStatus } from '../../types/shared';
import { taskUtils } from '../../services/taskServiceUnified';

interface TaskListProps {
  tasks: TaskWithRelations[];
  selectedTasks: Set<number>;
  onView?: (task: TaskWithRelations) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onStatusChange?: (task: TaskWithRelations, status: TaskStatus) => void;
  onDelete?: (task: TaskWithRelations) => void;
  onTaskSelection?: (taskId: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  loading?: boolean;
  className?: string;
}

interface SortableHeaderProps {
  field: string;
  label: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  sortBy,
  sortDirection,
  onSort
}) => {
  const isActive = sortBy === field;
  
  return (
    <button
      onClick={() => onSort?.(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-gray-900"
    >
      <span>{label}</span>
      {isActive && (
        sortDirection === 'asc' ? 
          <ChevronUp className="w-4 h-4" /> : 
          <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTasks,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
  onTaskSelection,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
  loading = false,
  className = ''
}) => {
  const allSelected = tasks.length > 0 && tasks.every(task => selectedTasks.has(task.id));
  const someSelected = tasks.some(task => selectedTasks.has(task.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(e.target.checked);
  };

  const handleTaskSelect = (taskId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onTaskSelection?.(taskId, e.target.checked);
  };

  const getRowClassName = (task: TaskWithRelations) => {
    const baseClasses = "border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";
    const isOverdue = taskUtils.isOverdue(task);
    const isSelected = selectedTasks.has(task.id);
    
    if (isSelected) return `${baseClasses} bg-blue-50 border-blue-200`;
    if (isOverdue) return `${baseClasses} bg-red-50`;
    return baseClasses;
  };

  const PriorityBadge = ({ priority }: { priority: string }) => (
    <span 
      className="badge-base badge-sm"
      style={{ 
        backgroundColor: `${taskUtils.getPriorityColor(priority as any)}20`, 
        color: taskUtils.getPriorityColor(priority as any) 
      }}
    >
      {taskUtils.getPriorityLabel(priority as any)}
    </span>
  );

  const StatusBadge = ({ status }: { status: TaskStatus }) => (
    <span 
      className="badge-base badge-sm"
      style={{ 
        backgroundColor: `${taskUtils.getStatusColor(status)}20`, 
        color: taskUtils.getStatusColor(status) 
      }}
    >
      {taskUtils.getStatusLabel(status)}
    </span>
  );

  const ProgressBar = ({ progress }: { progress?: number }) => {
    if (progress === undefined) return null;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const ActionButtons = ({ task }: { task: TaskWithRelations }) => (
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {onView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(task);
          }}
          className="btn-base btn-icon btn-sm btn-ghost"
          title="Ətraflı bax"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="btn-base btn-icon btn-sm btn-ghost"
          title="Redaktə et"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className={`card-base ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`card-base card-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={handleSelectAll}
                  className="input-base w-4 h-4"
                />
              </th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  field="title"
                  label="Tapşırıq"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  field="priority"
                  label="Prioritet"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  field="status"
                  label="Status"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="text-left px-4 py-3">İcraçı</th>
              <th className="text-left px-4 py-3">Təşkilat</th>
              <th className="text-left px-4 py-3">İrəliləyiş</th>
              <th className="text-left px-4 py-3">
                <SortableHeader
                  field="due_date"
                  label="Son tarix"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="text-left px-4 py-3">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isOverdue = taskUtils.isOverdue(task);
              const daysUntilDue = taskUtils.getDaysUntilDue(task);
              
              return (
                <tr 
                  key={task.id}
                  className={`group ${getRowClassName(task)}`}
                  onClick={() => onView?.(task)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id)}
                      onChange={(e) => handleTaskSelect(task.id, e)}
                      className="input-base w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  
                  <td className="px-4 py-3 max-w-xs">
                    <div>
                      <div className="font-medium text-gray-900 truncate">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {task.description}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {taskUtils.getTaskTypeLabel(task.task_type)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  
                  <td className="px-4 py-3">
                    <StatusBadge status={isOverdue ? 'overdue' : task.status} />
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Təyin edilməyib'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.assignee ? `@${task.assignee.username}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <div className="text-sm text-gray-900 truncate max-w-32">
                        {task.institution?.name || 'Müəssisə məlumu yoxdur'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    {task.progress_percentage !== undefined ? (
                      <div className="w-24">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">
                            {task.progress_percentage}%
                          </span>
                        </div>
                        <ProgressBar progress={task.progress_percentage} />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(task.due_date).toLocaleDateString('az-AZ')}
                        </div>
                        <div className={`text-xs ${
                          isOverdue ? 'text-red-600' : 
                          daysUntilDue <= 1 ? 'text-orange-600' : 
                          'text-gray-500'
                        }`}>
                          {isOverdue ? 
                            `${Math.abs(daysUntilDue)} gün gecikib` :
                            daysUntilDue === 0 ? 'Bu gün' :
                            daysUntilDue === 1 ? 'Sabah' :
                            `${daysUntilDue} gün qalıb`
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <ActionButtons task={task} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Tapşırıq tapılmadı</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskList;