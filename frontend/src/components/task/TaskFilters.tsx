// ====================
// ATİS Task Filters Component
// Advanced filtering interface for tasks
// ====================

import React, { useState } from 'react';
import { 
  Filter,
  Search,
  Calendar,
  User,
  Building,
  ChevronDown,
  X,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/ModalUnified';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { TaskType, TaskPriority, TaskStatus } from '../../types/shared';

interface TaskFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
  availableAssignees?: Array<{ id: number; name: string; username: string }>;
  availableInstitutions?: Array<{ id: number; name: string }>;
  className?: string;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  availableAssignees = [],
  availableInstitutions = [],
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const {
    filters,
    searchQuery,
    activeStatusFilters,
    activePriorityFilters,
    activeTypeFilters,
    dueDateRange,
    createdDateRange,
    statusOptions,
    priorityOptions,
    typeOptions,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setAssigneeFilter,
    setInstitutionFilter,
    setDueDateRange,
    setCreatedDateRange,
    setSorting,
    clearAllFilters,
    applyPreset,
    hasActiveFilters,
    filterCount,
    getURLParams,
    exportFilters,
    importFilters
  } = useTaskFilters({
    initialFilters,
    onFiltersChange
  });

  // Quick filter buttons
  const QuickFilters = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => applyPreset('overdue')}
        className="btn-base btn-sm btn-outline text-red-600 border-red-300 hover:bg-red-50"
      >
        Gecikmiş
      </button>
      <button
        onClick={() => applyPreset('urgent')}
        className="btn-base btn-sm btn-outline text-orange-600 border-orange-300 hover:bg-orange-50"
      >
        Təcili
      </button>
      <button
        onClick={() => applyPreset('this_week')}
        className="btn-base btn-sm btn-outline text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        Bu həftə
      </button>
      <button
        onClick={() => applyPreset('completed')}
        className="btn-base btn-sm btn-outline text-green-600 border-green-300 hover:bg-green-50"
      >
        Tamamlanmış
      </button>
    </div>
  );

  // Status filter checkboxes
  const StatusFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <div className="space-y-2">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={activeStatusFilters.includes(option.value as TaskStatus)}
              onChange={(e) => {
                const newStatuses = e.target.checked
                  ? [...activeStatusFilters, option.value as TaskStatus]
                  : activeStatusFilters.filter(s => s !== option.value);
                setStatusFilter(newStatuses);
              }}
              className="input-base w-4 h-4 mr-2"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Priority filter checkboxes
  const PriorityFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Prioritet
      </label>
      <div className="space-y-2">
        {priorityOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={activePriorityFilters.includes(option.value as TaskPriority)}
              onChange={(e) => {
                const newPriorities = e.target.checked
                  ? [...activePriorityFilters, option.value as TaskPriority]
                  : activePriorityFilters.filter(p => p !== option.value);
                setPriorityFilter(newPriorities);
              }}
              className="input-base w-4 h-4 mr-2"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Type filter checkboxes
  const TypeFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tapşırıq Növü
      </label>
      <div className="space-y-2">
        {typeOptions.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={activeTypeFilters.includes(option.value as TaskType)}
              onChange={(e) => {
                const newTypes = e.target.checked
                  ? [...activeTypeFilters, option.value as TaskType]
                  : activeTypeFilters.filter(t => t !== option.value);
                setTypeFilter(newTypes);
              }}
              className="input-base w-4 h-4 mr-2"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Date range filter
  const DateRangeFilter = ({ 
    label, 
    range, 
    onChange 
  }: { 
    label: string; 
    range: { start_date?: string; end_date?: string }; 
    onChange: (range: { start_date?: string; end_date?: string }) => void;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={range.start_date || ''}
          onChange={(e) => onChange({ ...range, start_date: e.target.value || undefined })}
          className="input-base input-sm"
          placeholder="Başlanğıc"
        />
        <input
          type="date"
          value={range.end_date || ''}
          onChange={(e) => onChange({ ...range, end_date: e.target.value || undefined })}
          className="input-base input-sm"
          placeholder="Son"
        />
      </div>
    </div>
  );

  // Assignee filter
  const AssigneeFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        İcraçı
      </label>
      <select
        multiple
        value={Array.isArray(filters.assigned_to) ? filters.assigned_to.map(String) : filters.assigned_to ? [String(filters.assigned_to)] : []}
        onChange={(e) => {
          const selectedValues = Array.from(e.target.selectedOptions, option => Number(option.value));
          setAssigneeFilter(selectedValues);
        }}
        className="input-base"
        size={4}
      >
        {availableAssignees.map((assignee) => (
          <option key={assignee.id} value={assignee.id}>
            {assignee.name} (@{assignee.username})
          </option>
        ))}
      </select>
    </div>
  );

  // Institution filter
  const InstitutionFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Təşkilat
      </label>
      <select
        value={filters.institution_id || ''}
        onChange={(e) => setInstitutionFilter(e.target.value ? Number(e.target.value) : null)}
        className="input-base"
      >
        <option value="">Bütün təşkilatlar</option>
        {availableInstitutions.map((institution) => (
          <option key={institution.id} value={institution.id}>
            {institution.name}
          </option>
        ))}
      </select>
    </div>
  );

  // Sorting options
  const SortingFilter = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sıralama
      </label>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={filters.sort_by || 'created_at'}
          onChange={(e) => setSorting(e.target.value, filters.sort_direction || 'desc')}
          className="input-base input-sm"
        >
          <option value="created_at">Yaradılma tarixi</option>
          <option value="due_date">Son təslim tarixi</option>
          <option value="priority">Prioritet</option>
          <option value="status">Status</option>
          <option value="title">Başlıq</option>
        </select>
        <select
          value={filters.sort_direction || 'desc'}
          onChange={(e) => setSorting(filters.sort_by || 'created_at', e.target.value as 'asc' | 'desc')}
          className="input-base input-sm"
        >
          <option value="desc">Azalan</option>
          <option value="asc">Artan</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className={`task-filters ${className}`}>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Tapşırıqları axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {/* Quick filters */}
      <QuickFilters />

      {/* Filter summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-600">
            {filterCount} filter aktiv
          </span>
          <button
            onClick={clearAllFilters}
            className="btn-base btn-sm btn-ghost text-blue-600 hover:bg-blue-100"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Təmizlə
          </button>
        </div>
      )}

      {/* Main filters */}
      <Card className="card-base card-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusFilter />
          <PriorityFilter />
          <TypeFilter />
        </div>
      </Card>

      {/* Advanced filters toggle */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="btn-base btn-sm btn-ghost w-full justify-center mb-4"
      >
        <Filter className="w-4 h-4 mr-2" />
        Ətraflı filtrlər
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <Card className="card-base card-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DateRangeFilter
                label="Son təslim tarixi"
                range={dueDateRange}
                onChange={setDueDateRange}
              />
              <DateRangeFilter
                label="Yaradılma tarixi"
                range={createdDateRange}
                onChange={setCreatedDateRange}
              />
            </div>
            <div>
              {availableAssignees.length > 0 && <AssigneeFilter />}
              {availableInstitutions.length > 0 && <InstitutionFilter />}
              <SortingFilter />
            </div>
          </div>
        </Card>
      )}

      {/* Filter actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPresets(true)}
            className="btn-base btn-sm btn-outline"
          >
            Hazır filtrlər
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.search = getURLParams().toString();
              navigator.clipboard.writeText(url.toString());
            }}
            className="btn-base btn-sm btn-ghost"
            title="URL-ni kopyala"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              const filtersJson = exportFilters();
              const blob = new Blob([filtersJson], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'task-filters.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="btn-base btn-sm btn-ghost"
            title="Filtrləri export et"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Presets modal */}
      <Modal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        title="Hazır Filtrlər"
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              applyPreset('my_tasks');
              setShowPresets(false);
            }}
            className="btn-base btn-outline w-full justify-start"
          >
            <User className="w-4 h-4 mr-2" />
            Mənim tapşırıqlarım
          </button>
          
          <button
            onClick={() => {
              applyPreset('overdue');
              setShowPresets(false);
            }}
            className="btn-base btn-outline w-full justify-start text-red-600 border-red-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Gecikmiş tapşırıqlar
          </button>
          
          <button
            onClick={() => {
              applyPreset('urgent');
              setShowPresets(false);
            }}
            className="btn-base btn-outline w-full justify-start text-orange-600 border-orange-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Təcili tapşırıqlar
          </button>
          
          <button
            onClick={() => {
              applyPreset('this_week');
              setShowPresets(false);
            }}
            className="btn-base btn-outline w-full justify-start text-blue-600 border-blue-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Bu həftənin tapşırıqları
          </button>
          
          <button
            onClick={() => {
              applyPreset('completed');
              setShowPresets(false);
            }}
            className="btn-base btn-outline w-full justify-start text-green-600 border-green-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Tamamlanmış tapşırıqlar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskFilters;