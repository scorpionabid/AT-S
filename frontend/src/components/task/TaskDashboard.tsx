import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  FileText, 
  Filter,
  ChevronDown,
  Plus,
  Eye,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

interface TaskData {
  id: number;
  title: string;
  description: string;
  task_type: 'attendance_report' | 'schedule_review' | 'document_approval' | 'survey_response' | 'inspection' | 'meeting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assigned_to: number;
  assigned_by: number;
  institution_id: number;
  due_date: string;
  created_at: string;
  completed_at?: string;
  assignee: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  assigner: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  institution: {
    id: number;
    name: string;
    type: string;
  };
  progress_percentage?: number;
  estimated_hours?: number;
  actual_hours?: number;
  task_metadata?: {
    requires_approval: boolean;
    approval_level: string;
    related_documents: string[];
    checklist_items: Array<{
      item: string;
      completed: boolean;
      notes?: string;
    }>;
  };
}

interface TaskFormData {
  title: string;
  description: string;
  task_type: string;
  priority: string;
  assigned_to: number;
  institution_id: number;
  due_date: string;
  estimated_hours: number;
  requires_approval: boolean;
  approval_level: string;
}

interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  urgent_tasks: number;
  avg_completion_time: number;
  by_type: Record<string, number>;
}

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    task_type: 'attendance_report',
    priority: 'medium',
    assigned_to: 0,
    institution_id: 0,
    due_date: '',
    estimated_hours: 1,
    requires_approval: false,
    approval_level: 'director'
  });

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [filterStatus, filterType, filterPriority, filterAssignee, sortBy, sortOrder]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Mock data until API is properly configured
      console.log('Using mock task data - API calls disabled to prevent redirect issues');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock tasks based on filters
      const mockTasks = generateMockTasks(filterStatus, filterType, filterPriority);
      setTasks(mockTasks);
      
    } catch (error) {
      console.warn('Error generating mock tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate mock tasks
  const generateMockTasks = (status: string, type: string, priority: string) => {
    const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'];
    const types = ['attendance_report', 'schedule_review', 'document_approval', 'survey_response', 'inspection', 'meeting'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    const mockData = [];
    for (let i = 1; i <= 10; i++) {
      const taskStatus = status !== 'all' ? status : statuses[Math.floor(Math.random() * statuses.length)];
      const taskType = type !== 'all' ? type : types[Math.floor(Math.random() * types.length)];
      const taskPriority = priority !== 'all' ? priority : priorities[Math.floor(Math.random() * priorities.length)];
      
      mockData.push({
        id: i,
        title: `Tapşırıq ${i}`,
        description: `Bu ${i}-ci tapşırığın təsviridir`,
        task_type: taskType,
        priority: taskPriority,
        status: taskStatus,
        assigned_to: i,
        assigned_by: 1,
        institution_id: 1,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        completed_at: taskStatus === 'completed' ? new Date().toISOString() : undefined,
        assignee: {
          id: i,
          first_name: `Təyin${i}`,
          last_name: `Şəxs`,
          username: `user${i}`
        },
        assigner: {
          id: 1,
          first_name: 'Admin',
          last_name: 'İstifadəçi',
          username: 'admin'
        },
        institution: {
          id: 1,
          name: 'Test Təhsil Müəssisəsi',
          type: 'məktəb'
        }
      });
    }
    
    return mockData;
  };

  const fetchTaskStats = async () => {
    try {
      // Mock stats data until API is properly configured
      console.log('Using mock task stats - API calls disabled to prevent redirect issues');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock statistics
      const mockStats = {
        total: 45,
        pending: 12,
        in_progress: 18,
        completed: 10,
        overdue: 5
      };
      
      setStats(mockStats);
    } catch (error) {
      console.warn('Error generating mock task stats:', error);
      setStats({
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0
      });
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock task creation/update until API is properly configured
      console.log('Mock task operation:', editingTask ? 'update' : 'create', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate success
      toast.success(editingTask ? 'Tapşırıq yeniləndi (Mock)' : 'Tapşırıq yaradıldı (Mock)');
      setShowForm(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.warn('Mock task creation error:', error);
      toast.error('Mock xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskAction = async (taskId: number, action: 'start' | 'complete' | 'cancel') => {
    try {
      // Mock task action until API is properly configured
      console.log(`Mock task action: ${action} for task ${taskId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate success
      toast.success(`Tapşırıq ${getActionText(action)} (Mock)`);
      fetchTasks();
      fetchTaskStats();
    } catch (error) {
      console.warn('Mock task action error:', error);
      toast.error('Mock əməliyyat xətası');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      task_type: 'attendance_report',
      priority: 'medium',
      assigned_to: 0,
      institution_id: 0,
      due_date: '',
      estimated_hours: 1,
      requires_approval: false,
      approval_level: 'director'
    });
  };

  const getActionText = (action: string) => {
    const actions = {
      start: 'başladıldı',
      complete: 'tamamlandı',
      cancel: 'ləğv edildi'
    };
    return actions[action as keyof typeof actions] || action;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { color: 'blue', text: 'Aşağı' },
      medium: { color: 'yellow', text: 'Orta' },
      high: { color: 'orange', text: 'Yüksək' },
      urgent: { color: 'red', text: 'Təcili' }
    };
    
    const badge = badges[priority as keyof typeof badges] || badges.medium;
    
    return (
      <span className={`priority-badge priority-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'gray', icon: Clock, text: 'Gözləyir' },
      in_progress: { color: 'blue', icon: AlertTriangle, text: 'Prosesdə' },
      completed: { color: 'green', icon: CheckSquare, text: 'Tamamlandı' },
      cancelled: { color: 'red', icon: X, text: 'Ləğv edildi' },
      overdue: { color: 'red', icon: AlertTriangle, text: 'Vaxtı keçib' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const IconComponent = badge.icon;
    
    return (
      <span className={`status-badge status-${badge.color}`}>
        <IconComponent size={14} />
        {badge.text}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      attendance_report: 'Davamiyyət hesabatı',
      schedule_review: 'Cədvəl baxışı',
      document_approval: 'Sənəd təsdiqi',
      survey_response: 'Sorğu cavabı',
      inspection: 'Yoxlama',
      meeting: 'Toplantı'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterType !== 'all' && task.task_type !== filterType) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterAssignee !== 'all' && task.assigned_to.toString() !== filterAssignee) return false;
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'due_date':
          aValue = new Date(a.due_date).getTime();
          bValue = new Date(b.due_date).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, filterStatus, filterType, filterPriority, filterAssignee, sortBy, sortOrder]);

  return (
    <div className="task-dashboard">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="dashboard-header">
        <h1>Tapşırıq İdarəetməsi</h1>
        <p>Məktəb tapşırıqlarının izlənməsi və idarə edilməsi</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <Card className="stat-card total">
            <div className="stat-content">
              <CheckSquare className="stat-icon" />
              <div>
                <span className="stat-number">{stats.total_tasks}</span>
                <span className="stat-label">Ümumi Tapşırıq</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card pending">
            <div className="stat-content">
              <Clock className="stat-icon" />
              <div>
                <span className="stat-number">{stats.pending_tasks}</span>
                <span className="stat-label">Gözləyən</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card progress">
            <div className="stat-content">
              <AlertTriangle className="stat-icon" />
              <div>
                <span className="stat-number">{stats.in_progress_tasks}</span>
                <span className="stat-label">Prosesdə</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card overdue">
            <div className="stat-content">
              <Calendar className="stat-icon" />
              <div>
                <span className="stat-number">{stats.overdue_tasks}</span>
                <span className="stat-label">Vaxtı Keçmiş</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card urgent">
            <div className="stat-content">
              <AlertTriangle className="stat-icon" />
              <div>
                <span className="stat-number">{stats.urgent_tasks}</span>
                <span className="stat-label">Təcili</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Hamısı</option>
              <option value="pending">Gözləyir</option>
              <option value="in_progress">Prosesdə</option>
              <option value="completed">Tamamlandı</option>
              <option value="overdue">Vaxtı keçib</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Növ</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Hamısı</option>
              <option value="attendance_report">Davamiyyət</option>
              <option value="schedule_review">Cədvəl</option>
              <option value="document_approval">Sənəd</option>
              <option value="survey_response">Sorğu</option>
              <option value="inspection">Yoxlama</option>
              <option value="meeting">Toplantı</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioritet</label>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">Hamısı</option>
              <option value="low">Aşağı</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksək</option>
              <option value="urgent">Təcili</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sıralama</label>
            <select 
              value={`${sortBy}_${sortOrder}`} 
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="filter-select"
            >
              <option value="due_date_asc">Son tarix (yaxın)</option>
              <option value="due_date_desc">Son tarix (uzaq)</option>
              <option value="priority_desc">Prioritet (yüksək)</option>
              <option value="priority_asc">Prioritet (aşağı)</option>
              <option value="created_at_desc">Yaradılma (yeni)</option>
              <option value="created_at_asc">Yaradılma (köhnə)</option>
            </select>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="add-button"
          >
            <Plus size={16} />
            Tapşırıq Əlavə Et
          </Button>
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredAndSortedTasks.length} nəticə tapıldı
          </span>
        </div>
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card className="tasks-card">
          <h3>Tapşırıqlar</h3>
          
          {filteredAndSortedTasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={48} />
              <p>Seçilmiş kriterlərə uyğun tapşırıq tapılmadı</p>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredAndSortedTasks.map(task => {
                const overdue = isOverdue(task.due_date) && task.status !== 'completed';
                
                return (
                  <div 
                    key={task.id} 
                    className={`task-item ${overdue ? 'overdue' : ''} ${task.priority === 'urgent' ? 'urgent' : ''}`}
                  >
                    <div className="task-header">
                      <div className="task-title-section">
                        <h4>{task.title}</h4>
                        <div className="task-meta">
                          <span className="task-type">{getTypeLabel(task.task_type)}</span>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      <div className="task-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} />
                          Ətraflı
                        </Button>
                        {task.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'start')}
                          >
                            Başla
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'complete')}
                          >
                            <Check size={16} />
                            Tamamla
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="task-content">
                      <p className="task-description">{task.description}</p>
                      
                      <div className="task-details">
                        <div className="detail-item">
                          <User size={16} />
                          <span>
                            <strong>Təyin edən:</strong> {task.assigner?.first_name || 'N/A'} {task.assigner?.last_name || ''}
                          </span>
                        </div>
                        <div className="detail-item">
                          <User size={16} />
                          <span>
                            <strong>Məsul:</strong> {task.assignee?.first_name || 'N/A'} {task.assignee?.last_name || ''}
                          </span>
                        </div>
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span className={overdue ? 'overdue-text' : ''}>
                            <strong>Son tarix:</strong> {formatDate(task.due_date)}
                          </span>
                        </div>
                        {task.estimated_hours && (
                          <div className="detail-item">
                            <Clock size={16} />
                            <span>
                              <strong>Təxmini vaxt:</strong> {task.estimated_hours}h
                            </span>
                          </div>
                        )}
                      </div>

                      {task.progress_percentage !== undefined && (
                        <div className="progress-bar">
                          <div className="progress-label">
                            <span>İrəliləyiş</span>
                            <span>{task.progress_percentage}%</span>
                          </div>
                          <div className="progress-track">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${task.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content task-modal">
            <div className="modal-header">
              <h3>{editingTask ? 'Tapşırıq Düzəlt' : 'Yeni Tapşırıq'}</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleTaskSubmit} className="task-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Başlıq</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Tapşırıq başlığı"
                  />
                </div>

                <div className="form-group">
                  <label>Tapşırıq Növü</label>
                  <select
                    value={formData.task_type}
                    onChange={(e) => setFormData({...formData, task_type: e.target.value})}
                    required
                  >
                    <option value="attendance_report">Davamiyyət hesabatı</option>
                    <option value="schedule_review">Cədvəl baxışı</option>
                    <option value="document_approval">Sənəd təsdiqi</option>
                    <option value="survey_response">Sorğu cavabı</option>
                    <option value="inspection">Yoxlama</option>
                    <option value="meeting">Toplantı</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Təsvir</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                  placeholder="Tapşırıq təsviri və tələbləri"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prioritet</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    <option value="low">Aşağı</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksək</option>
                    <option value="urgent">Təcili</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Son Tarix</label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Təxmini Saat</label>
                  <input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({...formData, estimated_hours: Number(e.target.value)})}
                    min="0.5"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saxlanılır...' : 'Saxla'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                >
                  Ləğv et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content task-detail-modal">
            <div className="modal-header">
              <h3>{selectedTask.title}</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTask(null);
                }}
              >
                ×
              </Button>
            </div>

            <div className="modal-body">
              <div className="task-detail-content">
                <div className="detail-section">
                  <h4>Tapşırıq Məlumatları</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Növ:</span>
                      <span>{getTypeLabel(selectedTask.task_type)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Prioritet:</span>
                      {getPriorityBadge(selectedTask.priority)}
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      {getStatusBadge(selectedTask.status)}
                    </div>
                    <div className="detail-item">
                      <span className="label">Son tarix:</span>
                      <span className={isOverdue(selectedTask.due_date) ? 'overdue-text' : ''}>
                        {formatDateTime(selectedTask.due_date)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Yaradılma:</span>
                      <span>{formatDateTime(selectedTask.created_at)}</span>
                    </div>
                    {selectedTask.completed_at && (
                      <div className="detail-item">
                        <span className="label">Tamamlanma:</span>
                        <span>{formatDateTime(selectedTask.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Təsvir</h4>
                  <p>{selectedTask.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Məsuliyyətlilər</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Təyin edən:</span>
                      <span>{selectedTask.assigner?.first_name || 'N/A'} {selectedTask.assigner?.last_name || ''}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Məsul:</span>
                      <span>{selectedTask.assignee?.first_name || 'N/A'} {selectedTask.assignee?.last_name || ''}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Təşkilat:</span>
                      <span>{selectedTask.institution?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedTask.task_metadata?.checklist_items && (
                  <div className="detail-section">
                    <h4>Yoxlama siyahısı</h4>
                    <div className="checklist">
                      {selectedTask.task_metadata.checklist_items.map((item, index) => (
                        <div key={index} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                          <CheckSquare size={16} className={item.completed ? 'checked' : 'unchecked'} />
                          <span>{item.item}</span>
                          {item.notes && <span className="item-notes">({item.notes})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;