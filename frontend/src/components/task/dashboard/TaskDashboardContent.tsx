// ====================
// ATİS Task Dashboard Content
// Content rendering logic for different view modes
// ====================

import React from 'react';
import { 
  Search,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { LoadingSpinner } from '../../ui/Loading';
import TaskCard from '../TaskCard';
import TaskList from '../TaskList';
import { TaskWithRelations, TaskStatus } from '../../../types/shared';

type ViewMode = 'grid' | 'list' | 'kanban';

interface TaskDashboardContentProps {
  tasks: TaskWithRelations[];
  viewMode: ViewMode;
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  selectedTasks: Set<number>;
  onViewTask: (task: TaskWithRelations) => void;
  onEditTask: (task: TaskWithRelations) => void;
  onStatusChange: (task: TaskWithRelations, status: TaskStatus) => void;
  onDeleteTask: (task: TaskWithRelations) => void;
  onTaskSelection: (taskId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRefresh: () => void;
  onCreateTask: () => void;
  onClearFilters: () => void;
}

export const TaskDashboardContent: React.FC<TaskDashboardContentProps> = ({
  tasks,
  viewMode,
  loading,
  error,
  hasActiveFilters,
  selectedTasks,
  onViewTask,
  onEditTask,
  onStatusChange,
  onDeleteTask,
  onTaskSelection,
  onSelectAll,
  onRefresh,
  onCreateTask,
  onClearFilters
}) => {
  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <Card className="card-base card-lg text-center">
        <div className="text-red-600 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Xəta baş verdi</p>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={onRefresh}
          className="btn-base btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenidən cəhd et
        </button>
      </Card>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <Card className="card-base card-lg text-center">
        <div className="text-gray-400 mb-4">
          <Search className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Tapşırıq tapılmadı</p>
        </div>
        <p className="text-gray-600 mb-4">
          {hasActiveFilters 
            ? 'Filtrlərə uyğun tapşırıq yoxdur. Filtrləri dəyişin və ya təmizləyin.'
            : 'Hələ heç bir tapşırıq yaradılmayıb. İlk tapşırığı yaradın.'
          }
        </p>
        <div className="flex justify-center space-x-3">
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="btn-base btn-outline"
            >
              Filtrləri təmizlə
            </button>
          )}
          <button 
            onClick={onCreateTask}
            className="btn-base btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tapşırıq yarat
          </button>
        </div>
      </Card>
    );
  }

  // Content based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={onViewTask}
                onEdit={onEditTask}
                onStatusChange={onStatusChange}
                onDelete={onDeleteTask}
                selected={selectedTasks.has(task.id)}
              />
            ))}
          </div>
        );
      case 'list':
        return (
          <TaskList
            tasks={tasks}
            onView={onViewTask}
            onEdit={onEditTask}
            onStatusChange={onStatusChange}
            onDelete={onDeleteTask}
            selectedTasks={selectedTasks}
            onTaskSelection={onTaskSelection}
            onSelectAll={onSelectAll}
          />
        );
      case 'kanban':
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Kanban görünüşü tezliklə əlavə ediləcək</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {loading && tasks.length > 0 && (
        <div className="absolute top-0 right-0 z-10">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {renderContent()}
    </div>
  );
};