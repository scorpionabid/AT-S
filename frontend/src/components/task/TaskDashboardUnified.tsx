// ====================
// ATİS Unified Task Dashboard
// Main orchestrator component for task management
// ====================

import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/ModalUnified';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

// Dashboard components
import { TaskDashboardHeader } from './dashboard/TaskDashboardHeader';
import { TaskDashboardContent } from './dashboard/TaskDashboardContent';
import { TaskDashboardPagination } from './dashboard/TaskDashboardPagination';

// Task components
import TaskStats from './TaskStats';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import BulkActions from './BulkActions';

// Hooks
import { useTaskManagement } from '../../hooks/useTaskManagement';
import { useTaskFilters } from '../../hooks/useTaskFilters';

// Types
import { 
  TaskWithRelations, 
  TaskStatus, 
  CreateTaskData,
  UpdateTaskData
} from '../../types/shared';

interface TaskDashboardUnifiedProps {
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'kanban';

const TaskDashboardUnified: React.FC<TaskDashboardUnifiedProps> = ({
  className = ''
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Task management hook
  const {
    tasks, stats, selectedTask, loading, statsLoading, actionLoading, error,
    currentPage, totalPages, totalItems, loadTasks, createTask, updateTask,
    deleteTask, getTask, updateTaskStatus, bulkOperation, selectTask,
    setPage, refresh, getMyTasks
  } = useTaskManagement({
    autoLoad: true,
    initialFilters: { per_page: viewMode === 'grid' ? 12 : 20 },
    enableRealTimeUpdates: true,
    pollingInterval: 30000
  });

  // Filter management hook
  const {
    filters, updateFilters, hasActiveFilters, filterCount, clearAllFilters
  } = useTaskFilters({
    onFiltersChange: (newFilters) => loadTasks(newFilters)
  });

  // Event handlers
  const handleCreateTask = useCallback(async (data: CreateTaskData): Promise<void> => {
    try {
      await createTask(data);
      setShowForm(false);
      addToast('Tapşırıq uğurla yaradıldı', { variant: 'success' });
    } catch (error) {
      console.error('Task creation error:', error);
    }
  }, [createTask, addToast]);

  const handleUpdateTask = useCallback(async (id: number, data: UpdateTaskData): Promise<void> => {
    try {
      await updateTask(id, data);
      setEditingTask(null);
      setShowForm(false);
      addToast('Tapşırıq yeniləndi', { variant: 'success' });
    } catch (error) {
      console.error('Task update error:', error);
    }
  }, [updateTask, addToast]);

  const handleViewTask = useCallback(async (task: TaskWithRelations): Promise<void> => {
    try {
      await getTask(task.id);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Task fetch error:', error);
    }
  }, [getTask]);

  const handleEditTask = useCallback((task: TaskWithRelations): void => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleStatusChange = useCallback(async (task: TaskWithRelations, status: TaskStatus): Promise<void> => {
    try {
      await updateTaskStatus(task.id, { 
        action: status === 'completed' ? 'complete' : 
               status === 'in_progress' ? 'start' : 
               status === 'cancelled' ? 'cancel' : 'pause'
      });
    } catch (error) {
      console.error('Status change error:', error);
    }
  }, [updateTaskStatus]);

  const handleDeleteTask = useCallback(async (task: TaskWithRelations): Promise<void> => {
    if (window.confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) {
      try {
        await deleteTask(task.id);
        addToast('Tapşırıq silindi', { variant: 'success' });
      } catch (error) {
        console.error('Task deletion error:', error);
      }
    }
  }, [deleteTask, addToast]);

  const handleViewModeChange = useCallback((mode: ViewMode): void => {
    setViewMode(mode);
    const perPage = mode === 'grid' ? 12 : mode === 'list' ? 20 : 10;
    updateFilters({ per_page: perPage, page: 1 });
  }, [updateFilters]);

  const handleTaskSelection = useCallback((taskId: number, selected: boolean): void => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean): void => {
    if (selected) {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  }, [tasks]);

  const handleBulkOperation = useCallback(async (operation: string, data?: any): Promise<void> => {
    if (selectedTasks.size === 0) {
      addToast('Heç bir tapşırıq seçilməyib', { variant: 'warning' });
      return;
    }

    try {
      await bulkOperation({
        task_ids: Array.from(selectedTasks),
        operation: operation as any,
        data
      });
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk operation error:', error);
    }
  }, [selectedTasks, bulkOperation, addToast]);

  return (
    <div className={`task-dashboard-unified ${className}`}>
      {/* Header */}
      <TaskDashboardHeader
        viewMode={viewMode}
        showFilters={showFilters}
        filterCount={filterCount}
        selectedTasksCount={selectedTasks.size}
        loading={loading}
        onViewModeChange={handleViewModeChange}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onRefresh={refresh}
        onCreateTask={() => setShowForm(true)}
        onMyTasks={getMyTasks}
        onBulkActions={() => setShowBulkActions(true)}
      />

      {/* Statistics */}
      <TaskStats 
        stats={stats} 
        loading={statsLoading}
        className="mb-6"
      />

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <TaskFilters
            onFiltersChange={updateFilters}
            initialFilters={filters}
            availableAssignees={[]}
            availableInstitutions={[]}
          />
        </div>
      )}

      {/* Content */}
      <TaskDashboardContent
        tasks={tasks}
        viewMode={viewMode}
        loading={loading}
        error={error}
        hasActiveFilters={hasActiveFilters}
        selectedTasks={selectedTasks}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        onTaskSelection={handleTaskSelection}
        onSelectAll={handleSelectAll}
        onRefresh={refresh}
        onCreateTask={() => setShowForm(true)}
        onClearFilters={clearAllFilters}
      />

      {/* Pagination */}
      <TaskDashboardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={filters.per_page || 10}
        onPageChange={setPage}
      />

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Tapşırığı redaktə et' : 'Yeni tapşırıq yarat'}
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onSubmit={editingTask 
            ? (data) => handleUpdateTask(editingTask.id, data)
            : handleCreateTask
          }
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          loading={actionLoading}
        />
      </Modal>

      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          selectTask(null);
        }}
        task={selectedTask}
        onEdit={handleEditTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
      />

      <BulkActions
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        selectedTasks={Array.from(selectedTasks)}
        onBulkOperation={handleBulkOperation}
        loading={actionLoading}
      />
    </div>
  );
};

export default TaskDashboardUnified;