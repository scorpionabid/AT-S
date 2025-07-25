// ====================
// ATİS Task Dashboard Header
// Header with controls, filters and view toggles
// ====================

import React from 'react';
import { 
  Plus,
  RefreshCw,
  Filter,
  Grid,
  List
} from 'lucide-react';

interface TaskDashboardHeaderProps {
  viewMode: 'grid' | 'list' | 'kanban';
  showFilters: boolean;
  filterCount: number;
  selectedTasksCount: number;
  loading: boolean;
  onViewModeChange: (mode: 'grid' | 'list' | 'kanban') => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
  onCreateTask: () => void;
  onMyTasks: () => void;
  onBulkActions: () => void;
}

export const TaskDashboardHeader: React.FC<TaskDashboardHeaderProps> = ({
  viewMode,
  showFilters,
  filterCount,
  selectedTasksCount,
  loading,
  onViewModeChange,
  onToggleFilters,
  onRefresh,
  onCreateTask,
  onMyTasks,
  onBulkActions
}) => {
  return (
    <div className="dashboard-header mb-6">
      {/* Title Section */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tapşırıq İdarəetmə</h1>
          <p className="text-gray-600">Hierarchik tapşırıqları təyin edin və izləyin</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Quick actions */}
          <button
            onClick={onMyTasks}
            className="btn-base btn-sm btn-outline"
          >
            Mənim tapşırıqlarım
          </button>
          
          <button
            onClick={onRefresh}
            className="btn-base btn-sm btn-ghost"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onCreateTask}
            className="btn-base btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni tapşırıq
          </button>
        </div>
      </div>

      {/* View controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Filter toggle */}
          <button
            onClick={onToggleFilters}
            className={`btn-base btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtrlər
            {filterCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {/* Bulk actions */}
        {selectedTasksCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedTasksCount} tapşırıq seçildi
            </span>
            <button
              onClick={onBulkActions}
              className="btn-base btn-sm btn-primary"
            >
              Toplu əməliyyatlar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};