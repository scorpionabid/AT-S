// ====================
// ATİS Task Data Hook
// Data fetching and state management for tasks
// ====================

import { useState, useCallback, useRef } from 'react';
import { taskService } from '../../services/taskServiceUnified';
import { TaskWithRelations, TaskStats } from '../../types/shared';
import { TaskFilters } from '../../types/taskTypes';

export interface UseTaskDataOptions {
  autoLoad?: boolean;
  initialFilters?: Partial<TaskFilters>;
  enableRealTimeUpdates?: boolean;
  pollingInterval?: number;
}

export interface UseTaskDataReturn {
  tasks: TaskWithRelations[];
  stats: TaskStats | null;
  selectedTask: TaskWithRelations | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loadTasks: (filters?: TaskFilters) => Promise<void>;
  loadTaskStats: (filters?: Omit<TaskFilters, 'page' | 'per_page'>) => Promise<void>;
  getTask: (id: number) => Promise<void>;
  selectTask: (task: TaskWithRelations | null) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  getMyTasks: () => Promise<void>;
  getTasksAssignedByMe: () => Promise<void>;
}

export const useTaskData = (options: UseTaskDataOptions = {}): UseTaskDataReturn => {
  const { 
    autoLoad = false, 
    initialFilters = {}, 
    enableRealTimeUpdates = false, 
    pollingInterval = 30000 
  } = options;

  // State
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<TaskFilters>({ ...initialFilters });

  // Refs for cleanup
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadTasks = useCallback(async (filters: TaskFilters = currentFilters): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasks(filters);
      
      if (response.data) {
        setTasks(response.data);
        setCurrentPage(response.meta?.current_page || 1);
        setTotalPages(response.meta?.last_page || 1);
        setTotalItems(response.meta?.total || 0);
        setCurrentFilters(filters);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tapşırıqlar yüklənə bilmədi';
      setError(errorMessage);
      console.error('Load tasks error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const loadTaskStats = useCallback(async (filters: Omit<TaskFilters, 'page' | 'per_page'> = {}): Promise<void> => {
    setStatsLoading(true);
    try {
      const statsData = await taskService.getTaskStats(filters);
      setStats(statsData);
    } catch (err) {
      console.error('Load stats error:', err);
      // Don't set error for stats, as it's not critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const getTask = useCallback(async (id: number): Promise<void> => {
    try {
      const task = await taskService.getTaskWithRelations(id);
      setSelectedTask(task);
    } catch (err) {
      console.error('Get task error:', err);
      throw err;
    }
  }, []);

  const selectTask = useCallback((task: TaskWithRelations | null): void => {
    setSelectedTask(task);
  }, []);

  const setPage = useCallback((page: number): void => {
    const newFilters = { ...currentFilters, page };
    loadTasks(newFilters);
  }, [currentFilters, loadTasks]);

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadTasks(currentFilters),
      loadTaskStats()
    ]);
  }, [currentFilters, loadTasks, loadTaskStats]);

  const getMyTasks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getMyTasks(currentFilters);
      setTasks(response.data);
      setCurrentPage(response.meta?.current_page || 1);
      setTotalPages(response.meta?.last_page || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mənim tapşırıqlarım yüklənə bilmədi';
      setError(errorMessage);
      console.error('Get my tasks error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const getTasksAssignedByMe = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasksAssignedByMe(currentFilters);
      setTasks(response.data);
      setCurrentPage(response.meta?.current_page || 1);
      setTotalPages(response.meta?.last_page || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Təyin etdiyim tapşırıqlar yüklənə bilmədi';
      setError(errorMessage);
      console.error('Get tasks assigned by me error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  return {
    tasks,
    stats,
    selectedTask,
    loading,
    statsLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    loadTasks,
    loadTaskStats,
    getTask,
    selectTask,
    setPage,
    refresh,
    getMyTasks,
    getTasksAssignedByMe
  };
};