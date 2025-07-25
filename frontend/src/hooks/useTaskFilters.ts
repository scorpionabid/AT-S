// ====================
// ATİS Task Filters Hook
// Advanced filtering and search functionality for tasks
// ====================

import { useState, useCallback, useMemo } from 'react';
import { 
  TaskFilters,
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskWithRelations 
} from '../types/shared';

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface UseTaskFiltersOptions {
  initialFilters?: Partial<TaskFilters>;
  onFiltersChange?: (filters: TaskFilters) => void;
}

export interface UseTaskFiltersReturn {
  // Current filters
  filters: TaskFilters;
  
  // Quick filters
  activeStatusFilters: TaskStatus[];
  activePriorityFilters: TaskPriority[];
  activeTypeFilters: TaskType[];
  
  // Search
  searchQuery: string;
  
  // Date ranges
  dueDateRange: DateRange;
  createdDateRange: DateRange;
  
  // Filter options
  statusOptions: FilterOption[];
  priorityOptions: FilterOption[];
  typeOptions: FilterOption[];
  
  // Filter actions
  updateFilters: (filters: Partial<TaskFilters>) => void;
  setStatusFilter: (statuses: TaskStatus[]) => void;
  setPriorityFilter: (priorities: TaskPriority[]) => void;
  setTypeFilter: (types: TaskType[]) => void;
  setAssigneeFilter: (assigneeIds: number[]) => void;
  setInstitutionFilter: (institutionId: number | null) => void;
  setSearchQuery: (query: string) => void;
  setDueDateRange: (range: DateRange) => void;
  setCreatedDateRange: (range: DateRange) => void;
  setSorting: (sortBy: string, direction: 'asc' | 'desc') => void;
  
  // Quick filters
  addQuickFilter: (key: string, value: any) => void;
  removeQuickFilter: (key: string) => void;
  toggleQuickFilter: (key: string, value: any) => void;
  clearAllFilters: () => void;
  
  // Preset filters
  applyPreset: (preset: 'my_tasks' | 'overdue' | 'urgent' | 'this_week' | 'completed') => void;
  
  // Local filtering (for client-side filtering)
  filterTasks: (tasks: TaskWithRelations[]) => TaskWithRelations[];
  
  // Filter state
  hasActiveFilters: boolean;
  filterCount: number;
  
  // URL management
  getURLParams: () => URLSearchParams;
  setFiltersFromURL: (params: URLSearchParams) => void;
  
  // Export/Import
  exportFilters: () => string;
  importFilters: (filtersJson: string) => void;
}

const DEFAULT_FILTERS: TaskFilters = {
  page: 1,
  per_page: 10,
  sort_by: 'created_at',
  sort_direction: 'desc',
  include_completed: true,
  include_overdue: true
};

export const useTaskFilters = (options: UseTaskFiltersOptions = {}): UseTaskFiltersReturn => {
  const { initialFilters = {}, onFiltersChange } = options;

  const [filters, setFilters] = useState<TaskFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  // Filter options with labels
  const statusOptions: FilterOption[] = useMemo(() => [
    { value: 'pending', label: 'Gözləmədə' },
    { value: 'in_progress', label: 'İcrada' },
    { value: 'completed', label: 'Tamamlanıb' },
    { value: 'cancelled', label: 'Ləğv edilib' },
    { value: 'overdue', label: 'Gecikib' }
  ], []);

  const priorityOptions: FilterOption[] = useMemo(() => [
    { value: 'urgent', label: 'Təcili' },
    { value: 'high', label: 'Yüksək' },
    { value: 'medium', label: 'Orta' },
    { value: 'low', label: 'Aşağı' }
  ], []);

  const typeOptions: FilterOption[] = useMemo(() => [
    { value: 'attendance_report', label: 'Davamiyyət Hesabatı' },
    { value: 'schedule_review', label: 'Cədvəl Baxışı' },
    { value: 'document_approval', label: 'Sənəd Təsdiqi' },
    { value: 'survey_response', label: 'Sorğu Cavabı' },
    { value: 'inspection', label: 'Yoxlama' },
    { value: 'meeting', label: 'Görüş' }
  ], []);

  // Derived state
  const activeStatusFilters = useMemo(() => {
    if (Array.isArray(filters.status)) return filters.status;
    return filters.status ? [filters.status] : [];
  }, [filters.status]);

  const activePriorityFilters = useMemo(() => {
    if (Array.isArray(filters.priority)) return filters.priority;
    return filters.priority ? [filters.priority] : [];
  }, [filters.priority]);

  const activeTypeFilters = useMemo(() => {
    if (Array.isArray(filters.task_type)) return filters.task_type;
    return filters.task_type ? [filters.task_type] : [];
  }, [filters.task_type]);

  const searchQuery = filters.search || '';
  
  const dueDateRange: DateRange = useMemo(() => ({
    start_date: filters.due_date_from,
    end_date: filters.due_date_to
  }), [filters.due_date_from, filters.due_date_to]);

  const createdDateRange: DateRange = useMemo(() => ({
    start_date: filters.created_from,
    end_date: filters.created_to
  }), [filters.created_from, filters.created_to]);

  // Update filters helper
  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);

  // Filter actions
  const setStatusFilter = useCallback((statuses: TaskStatus[]) => {
    updateFilters({ 
      status: statuses.length === 0 ? undefined : 
              statuses.length === 1 ? statuses[0] : statuses,
      page: 1 
    });
  }, [updateFilters]);

  const setPriorityFilter = useCallback((priorities: TaskPriority[]) => {
    updateFilters({ 
      priority: priorities.length === 0 ? undefined : 
                priorities.length === 1 ? priorities[0] : priorities,
      page: 1 
    });
  }, [updateFilters]);

  const setTypeFilter = useCallback((types: TaskType[]) => {
    updateFilters({ 
      task_type: types.length === 0 ? undefined : 
                 types.length === 1 ? types[0] : types,
      page: 1 
    });
  }, [updateFilters]);

  const setAssigneeFilter = useCallback((assigneeIds: number[]) => {
    updateFilters({ 
      assigned_to: assigneeIds.length === 0 ? undefined : 
                   assigneeIds.length === 1 ? assigneeIds[0] : assigneeIds,
      page: 1 
    });
  }, [updateFilters]);

  const setInstitutionFilter = useCallback((institutionId: number | null) => {
    updateFilters({ 
      institution_id: institutionId || undefined,
      page: 1 
    });
  }, [updateFilters]);

  const setSearchQuery = useCallback((query: string) => {
    updateFilters({ 
      search: query.trim() || undefined,
      page: 1 
    });
  }, [updateFilters]);

  const setDueDateRange = useCallback((range: DateRange) => {
    updateFilters({
      due_date_from: range.start_date || undefined,
      due_date_to: range.end_date || undefined,
      page: 1
    });
  }, [updateFilters]);

  const setCreatedDateRange = useCallback((range: DateRange) => {
    updateFilters({
      created_from: range.start_date || undefined,
      created_to: range.end_date || undefined,
      page: 1
    });
  }, [updateFilters]);

  const setSorting = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    updateFilters({
      sort_by: sortBy as any,
      sort_direction: direction
    });
  }, [updateFilters]);

  // Quick filter actions
  const addQuickFilter = useCallback((key: string, value: any) => {
    updateFilters({ [key]: value, page: 1 });
  }, [updateFilters]);

  const removeQuickFilter = useCallback((key: string) => {
    updateFilters({ [key]: undefined, page: 1 });
  }, [updateFilters]);

  const toggleQuickFilter = useCallback((key: string, value: any) => {
    const currentValue = filters[key as keyof TaskFilters];
    if (Array.isArray(currentValue)) {
      const newValues = currentValue.includes(value) 
        ? currentValue.filter(v => v !== value)
        : [...currentValue, value];
      updateFilters({ [key]: newValues.length === 0 ? undefined : newValues, page: 1 });
    } else {
      updateFilters({ [key]: currentValue === value ? undefined : value, page: 1 });
    }
  }, [filters, updateFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    onFiltersChange?.(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  // Preset filters
  const applyPreset = useCallback((preset: 'my_tasks' | 'overdue' | 'urgent' | 'this_week' | 'completed') => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    switch (preset) {
      case 'my_tasks':
        // Will be set by parent component with current user ID
        break;
      case 'overdue':
        updateFilters({
          status: ['pending', 'in_progress'],
          due_date_to: now.toISOString().split('T')[0],
          page: 1
        });
        break;
      case 'urgent':
        updateFilters({
          priority: 'urgent',
          status: ['pending', 'in_progress'],
          page: 1
        });
        break;
      case 'this_week':
        updateFilters({
          due_date_from: now.toISOString().split('T')[0],
          due_date_to: weekFromNow.toISOString().split('T')[0],
          status: ['pending', 'in_progress'],
          page: 1
        });
        break;
      case 'completed':
        updateFilters({
          status: 'completed',
          page: 1
        });
        break;
    }
  }, [updateFilters]);

  // Local filtering for client-side
  const filterTasks = useCallback((tasks: TaskWithRelations[]): TaskWithRelations[] => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignee.first_name.toLowerCase().includes(searchLower) ||
          task.assignee.last_name.toLowerCase().includes(searchLower) ||
          task.institution.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status) {
        const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (!statusArray.includes(task.status)) return false;
      }

      // Priority filter
      if (filters.priority) {
        const priorityArray = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
        if (!priorityArray.includes(task.priority)) return false;
      }

      // Type filter
      if (filters.task_type) {
        const typeArray = Array.isArray(filters.task_type) ? filters.task_type : [filters.task_type];
        if (!typeArray.includes(task.task_type)) return false;
      }

      // Assignee filter
      if (filters.assigned_to) {
        const assigneeArray = Array.isArray(filters.assigned_to) ? filters.assigned_to : [filters.assigned_to];
        if (!assigneeArray.includes(task.assigned_to)) return false;
      }

      // Institution filter
      if (filters.institution_id && task.institution_id !== filters.institution_id) {
        return false;
      }

      // Date filters
      if (filters.due_date_from && task.due_date < filters.due_date_from) {
        return false;
      }
      if (filters.due_date_to && task.due_date > filters.due_date_to) {
        return false;
      }
      if (filters.created_from && task.created_at < filters.created_from) {
        return false;
      }
      if (filters.created_to && task.created_at > filters.created_to) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Filter state
  const hasActiveFilters = useMemo(() => {
    const defaultKeys = Object.keys(DEFAULT_FILTERS);
    return Object.keys(filters).some(key => {
      if (!defaultKeys.includes(key)) return true;
      return filters[key as keyof TaskFilters] !== DEFAULT_FILTERS[key as keyof TaskFilters];
    });
  }, [filters]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.task_type) count++;
    if (filters.assigned_to) count++;
    if (filters.institution_id) count++;
    if (filters.due_date_from || filters.due_date_to) count++;
    if (filters.created_from || filters.created_to) count++;
    return count;
  }, [filters]);

  // URL management
  const getURLParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    return params;
  }, [filters]);

  const setFiltersFromURL = useCallback((params: URLSearchParams) => {
    const newFilters: Partial<TaskFilters> = {};
    
    for (const [key, value] of params.entries()) {
      if (key === 'status' || key === 'priority' || key === 'task_type') {
        const values = value.split(',');
        newFilters[key] = values.length === 1 ? values[0] : values;
      } else if (key === 'assigned_to') {
        const values = value.split(',').map(Number);
        newFilters[key] = values.length === 1 ? values[0] : values;
      } else if (key === 'page' || key === 'per_page' || key === 'institution_id') {
        newFilters[key] = Number(value);
      } else {
        newFilters[key as keyof TaskFilters] = value;
      }
    }
    
    updateFilters(newFilters);
  }, [updateFilters]);

  // Export/Import
  const exportFilters = useCallback((): string => {
    return JSON.stringify(filters, null, 2);
  }, [filters]);

  const importFilters = useCallback((filtersJson: string) => {
    try {
      const importedFilters = JSON.parse(filtersJson);
      updateFilters(importedFilters);
    } catch (error) {
      console.error('Failed to import filters:', error);
    }
  }, [updateFilters]);

  return {
    // Current filters
    filters,
    
    // Quick filters
    activeStatusFilters,
    activePriorityFilters,
    activeTypeFilters,
    
    // Search
    searchQuery,
    
    // Date ranges
    dueDateRange,
    createdDateRange,
    
    // Filter options
    statusOptions,
    priorityOptions,
    typeOptions,
    
    // Filter actions
    updateFilters,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setAssigneeFilter,
    setInstitutionFilter,
    setSearchQuery,
    setDueDateRange,
    setCreatedDateRange,
    setSorting,
    
    // Quick filters
    addQuickFilter,
    removeQuickFilter,
    toggleQuickFilter,
    clearAllFilters,
    
    // Preset filters
    applyPreset,
    
    // Local filtering
    filterTasks,
    
    // Filter state
    hasActiveFilters,
    filterCount,
    
    // URL management
    getURLParams,
    setFiltersFromURL,
    
    // Export/Import
    exportFilters,
    importFilters
  };
};