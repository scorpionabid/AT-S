// ====================
// ATİS Task Utilities
// Helper functions for task operations and formatting
// ====================

import { 
  BaseTask,
  TaskType,
  TaskPriority, 
  TaskStatus,
  TaskMetadata
} from '../types/shared';

export const taskUtils = {
  /**
   * Get task priority color
   */
  getPriorityColor(priority: TaskPriority): string {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b', 
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority];
  },

  /**
   * Get task status color
   */
  getStatusColor(status: TaskStatus): string {
    const colors = {
      pending: '#6b7280',
      in_progress: '#3b82f6',
      completed: '#22c55e',
      cancelled: '#ef4444',
      overdue: '#dc2626'
    };
    return colors[status];
  },

  /**
   * Check if task is overdue
   */
  isOverdue(task: BaseTask): boolean {
    if (task.status === 'completed' || task.status === 'cancelled') {
      return false;
    }
    return new Date(task.due_date) < new Date();
  },

  /**
   * Calculate days until due
   */
  getDaysUntilDue(task: BaseTask): number {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Format task type display name
   */
  getTaskTypeLabel(taskType: TaskType): string {
    const labels = {
      attendance_report: 'Davamiyyət Hesabatı',
      schedule_review: 'Cədvəl Baxışı',
      document_approval: 'Sənəd Təsdiqi',
      survey_response: 'Sorğu Cavabı',
      inspection: 'Yoxlama',
      meeting: 'Görüş'
    };
    return labels[taskType];
  },

  /**
   * Format priority display name
   */
  getPriorityLabel(priority: TaskPriority): string {
    const labels = {
      low: 'Aşağı',
      medium: 'Orta',
      high: 'Yüksək',
      urgent: 'Təcili'
    };
    return labels[priority];
  },

  /**
   * Format status display name
   */
  getStatusLabel(status: TaskStatus): string {
    const labels = {
      pending: 'Gözləmədə',
      in_progress: 'İcrada',
      completed: 'Tamamlanıb',
      cancelled: 'Ləğv edilib',
      overdue: 'Gecikib'
    };
    return labels[status];
  },

  /**
   * Calculate completion percentage for checklist
   */
  getChecklistProgress(checklist: TaskMetadata['checklist_items']): number {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  },

  /**
   * Sort tasks by priority
   */
  sortByPriority(tasks: BaseTask[]): BaseTask[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return [...tasks].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  },

  /**
   * Group tasks by status
   */
  groupByStatus(tasks: BaseTask[]): Record<TaskStatus, BaseTask[]> {
    return tasks.reduce((groups, task) => {
      if (!groups[task.status]) {
        groups[task.status] = [];
      }
      groups[task.status].push(task);
      return groups;
    }, {} as Record<TaskStatus, BaseTask[]>);
  },

  /**
   * Get task urgency score (for sorting)
   */
  getUrgencyScore(task: BaseTask): number {
    const priorityScores = { urgent: 10, high: 7, medium: 4, low: 1 };
    const daysUntilDue = this.getDaysUntilDue(task);
    const priorityScore = priorityScores[task.priority];
    
    // Closer due date = higher urgency
    const dueDateScore = Math.max(0, 10 - daysUntilDue);
    
    return priorityScore + dueDateScore;
  },

  /**
   * Format duration in hours to human readable
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} dəq`;
    } else if (hours < 24) {
      return `${hours} saat`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 
        ? `${days} gün ${remainingHours} saat`
        : `${days} gün`;
    }
  },

  /**
   * Get task progress percentage based on metadata
   */
  getTaskProgress(task: BaseTask): number {
    if (task.progress_percentage !== undefined) {
      return task.progress_percentage;
    }
    
    // Calculate from checklist if available
    if (task.task_metadata?.checklist_items) {
      return this.getChecklistProgress(task.task_metadata.checklist_items);
    }
    
    // Default progress based on status
    const statusProgress = {
      pending: 0,
      in_progress: 50,
      completed: 100,
      cancelled: 0,
      overdue: 25
    };
    
    return statusProgress[task.status];
  }
};