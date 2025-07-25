import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Users, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';
import '../../styles/approval/approval-dashboard.css';

interface ApprovalRequest {
  id: number;
  workflow_id: number;
  institution_id: number;
  approvalable_type: string;
  approvalable_id: number;
  submitted_by: number;
  submitted_at: string;
  current_status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  current_approval_level: number;
  submission_notes?: string;
  deadline?: string;
  workflow: {
    id: number;
    name: string;
    workflow_type: string;
    approval_chain: Array<{level: number, role: string, required: boolean}>;
  };
  submitter: {
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
  approvalable_data?: any; // The actual data being approved (attendance, schedule, etc.)
}

interface ApprovalAction {
  action: 'approved' | 'rejected' | 'returned' | 'delegated';
  comments: string;
  delegated_to?: number;
}

interface ApprovalStats {
  total_pending: number;
  overdue_requests: number;
  approved_today: number;
  avg_approval_time: number;
  by_type: Record<string, number>;
}

const ApprovalDashboard: React.FC = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionForm, setActionForm] = useState<ApprovalAction>({
    action: 'approved',
    comments: '',
    delegated_to: undefined
  });
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchApprovalRequests();
    fetchApprovalStats();
  }, [filterStatus, filterType]);

  const fetchApprovalRequests = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/approval-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApprovalRequests(data.data || []);
      }
    } catch (error) {
      toast.error('Təsdiq tələbləri yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovalStats = async () => {
    try {
      const response = await fetch('/api/approval-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats yüklənə bilmədi:', error);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/approval-requests/${selectedRequest.id}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionForm)
      });

      if (response.ok) {
        toast.success(`Tələb ${actionForm.action === 'approved' ? 'təsdiqləndi' : 'rədd edildi'}`);
        setShowModal(false);
        setSelectedRequest(null);
        setActionForm({ action: 'approved', comments: '', delegated_to: undefined });
        fetchApprovalRequests();
        fetchApprovalStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Əməliyyat uğursuz oldu');
      }
    } catch (error) {
      toast.error('Əməliyyat yerinə yetirilərkən xəta baş verdi');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'orange', icon: Clock, text: 'Gözləyir' },
      in_progress: { color: 'blue', icon: AlertTriangle, text: 'Prosesdə' },
      approved: { color: 'green', icon: CheckCircle, text: 'Təsdiqləndi' },
      rejected: { color: 'red', icon: XCircle, text: 'Rədd edildi' },
      cancelled: { color: 'gray', icon: XCircle, text: 'Ləğv edildi' }
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

  const getTypeIcon = (type: string) => {
    const icons = {
      attendance: Users,
      schedule: Calendar,
      document: FileText,
      survey: FileText,
      task: CheckCircle
    };
    
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      attendance: 'Davamiyyət',
      schedule: 'Cədvəl',
      document: 'Sənəd',
      survey: 'Sorğu',
      task: 'Tapşırıq'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = useMemo(() => {
    return approvalRequests.filter(request => {
      if (filterStatus !== 'all' && request.current_status !== filterStatus) return false;
      if (filterType !== 'all' && request.workflow.workflow_type !== filterType) return false;
      return true;
    });
  }, [approvalRequests, filterStatus, filterType]);

  return (
    <div className="approval-dashboard">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="dashboard-header">
        <h1>Təsdiq Paneli</h1>
        <p>Director və əmiri üçün məlumat təsdiq sistemi</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <Card className="stat-card pending">
            <div className="stat-content">
              <Clock className="stat-icon" />
              <div>
                <span className="stat-number">{stats.total_pending}</span>
                <span className="stat-label">Gözləyən Tələblər</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card overdue">
            <div className="stat-content">
              <AlertTriangle className="stat-icon" />
              <div>
                <span className="stat-number">{stats.overdue_requests}</span>
                <span className="stat-label">Vaxtı Keçmiş</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card approved">
            <div className="stat-content">
              <CheckCircle className="stat-icon" />
              <div>
                <span className="stat-number">{stats.approved_today}</span>
                <span className="stat-label">Bu gün təsdiqlənən</span>
              </div>
            </div>
          </Card>

          <Card className="stat-card time">
            <div className="stat-content">
              <UserCheck className="stat-icon" />
              <div>
                <span className="stat-number">{stats.avg_approval_time.toFixed(1)}h</span>
                <span className="stat-label">Orta Təsdiq Vaxtı</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
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
              <option value="approved">Təsdiqləndi</option>
              <option value="rejected">Rədd edildi</option>
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
              <option value="attendance">Davamiyyət</option>
              <option value="schedule">Cədvəl</option>
              <option value="document">Sənəd</option>
              <option value="survey">Sorğu</option>
              <option value="task">Tapşırıq</option>
            </select>
          </div>

          <div className="filter-actions">
            <span className="results-count">
              {filteredRequests.length} nəticə tapıldı
            </span>
          </div>
        </div>
      </Card>

      {/* Approval Requests */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card className="requests-card">
          <h3>Təsdiq Tələbləri</h3>
          
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} />
              <p>Seçilmiş kriterlərə uyğun təsdiq tələbi tapılmadı</p>
            </div>
          ) : (
            <div className="requests-list">
              {filteredRequests.map(request => {
                const TypeIcon = getTypeIcon(request.workflow.workflow_type);
                const overdue = isOverdue(request.deadline);
                
                return (
                  <div 
                    key={request.id} 
                    className={`request-item ${overdue ? 'overdue' : ''}`}
                  >
                    <div className="request-header">
                      <div className="request-type">
                        <TypeIcon size={20} />
                        <span>{getTypeLabel(request.workflow.workflow_type)}</span>
                      </div>
                      <div className="request-status">
                        {getStatusBadge(request.current_status)}
                        {overdue && (
                          <span className="overdue-badge">
                            <AlertTriangle size={14} />
                            Vaxtı keçib
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="request-content">
                      <h4>{request.workflow.name}</h4>
                      <div className="request-details">
                        <span>
                          <strong>Təqdim edən:</strong> {request.submitter.first_name} {request.submitter.last_name}
                        </span>
                        <span>
                          <strong>Təşkilat:</strong> {request.institution.name}
                        </span>
                        <span>
                          <strong>Tarix:</strong> {formatDate(request.submitted_at)}
                        </span>
                        {request.deadline && (
                          <span>
                            <strong>Son tarix:</strong> {formatDate(request.deadline)}
                          </span>
                        )}
                      </div>
                      
                      {request.submission_notes && (
                        <div className="request-notes">
                          <strong>Qeydlər:</strong> {request.submission_notes}
                        </div>
                      )}
                    </div>

                    <div className="request-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        disabled={request.current_status !== 'pending' && request.current_status !== 'in_progress'}
                      >
                        <Eye size={16} />
                        Bax & Təsdiq et
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content approval-modal">
            <div className="modal-header">
              <h3>Təsdiq Tələbi</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
              >
                ×
              </Button>
            </div>

            <div className="modal-body">
              <div className="request-summary">
                <h4>{selectedRequest.workflow.name}</h4>
                <div className="summary-details">
                  <div className="detail-item">
                    <span className="label">Növ:</span>
                    <span>{getTypeLabel(selectedRequest.workflow.workflow_type)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Təqdim edən:</span>
                    <span>{selectedRequest.submitter.first_name} {selectedRequest.submitter.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Təşkilat:</span>
                    <span>{selectedRequest.institution.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Təqdim tarixi:</span>
                    <span>{formatDate(selectedRequest.submitted_at)}</span>
                  </div>
                  {selectedRequest.deadline && (
                    <div className="detail-item">
                      <span className="label">Son tarix:</span>
                      <span className={isOverdue(selectedRequest.deadline) ? 'overdue-text' : ''}>
                        {formatDate(selectedRequest.deadline)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedRequest.submission_notes && (
                  <div className="submission-notes">
                    <strong>Təqdim qeydləri:</strong>
                    <p>{selectedRequest.submission_notes}</p>
                  </div>
                )}
              </div>

              <div className="approval-form">
                <h4>Təsdiq Qərarı</h4>
                
                <div className="action-buttons">
                  <Button
                    variant={actionForm.action === 'approved' ? 'primary' : 'outline'}
                    onClick={() => setActionForm({...actionForm, action: 'approved'})}
                    className="action-btn approve-btn"
                  >
                    <ThumbsUp size={16} />
                    Təsdiq et
                  </Button>
                  
                  <Button
                    variant={actionForm.action === 'rejected' ? 'primary' : 'outline'}
                    onClick={() => setActionForm({...actionForm, action: 'rejected'})}
                    className="action-btn reject-btn"
                  >
                    <ThumbsDown size={16} />
                    Rədd et
                  </Button>
                  
                  <Button
                    variant={actionForm.action === 'returned' ? 'primary' : 'outline'}
                    onClick={() => setActionForm({...actionForm, action: 'returned'})}
                    className="action-btn return-btn"
                  >
                    <RotateCcw size={16} />
                    Geri göndər
                  </Button>
                </div>

                <div className="form-group">
                  <label>Şərhlər</label>
                  <textarea
                    value={actionForm.comments}
                    onChange={(e) => setActionForm({...actionForm, comments: e.target.value})}
                    rows={4}
                    placeholder={
                      actionForm.action === 'approved' 
                        ? 'Təsdiq qeydləri...' 
                        : actionForm.action === 'rejected'
                        ? 'Rədd səbəbləri...'
                        : 'Düzəliş tələbləri...'
                    }
                    required={actionForm.action !== 'approved'}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                onClick={handleApprovalAction}
                disabled={actionForm.action !== 'approved' && !actionForm.comments.trim()}
                className="confirm-btn"
              >
                {actionForm.action === 'approved' && 'Təsdiqlə'}
                {actionForm.action === 'rejected' && 'Rədd et'}
                {actionForm.action === 'returned' && 'Geri göndər'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
              >
                Ləğv et
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;